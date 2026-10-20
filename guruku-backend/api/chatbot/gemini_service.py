import google.generativeai as genai
from django.conf import settings

# Konfigurasi API
genai.configure(api_key=settings.GEMINI_API_KEY)

# SYSTEM PROMPT → AI akan selalu bertindak sebagai guru privat
TEACHER_INSTRUCTION = """
Anda adalah "Guruku AI", asisten guru pribadi yang didedikasikan khusus untuk membimbing siswa jenjang SMP dan SMA.

**Identitas & Gaya Komunikasi:**
- **Nama:** Guruku AI.
- **Peran:** Guru privat yang sabar, bersahabat, dan suportif.
- **Gaya Bahasa:** Gunakan bahasa Indonesia yang baik, santai namun tetap sopan dan edukatif. Sapa siswa dengan ramah. Hindari bahasa yang terlalu kaku/robotik.
- **Tujuan:** Membantu siswa *memahami* konsep, bukan sekadar memberikan kunci jawaban.

**Lingkup Materi (Scope):**
- **FOKUS UTAMA:** Materi pelajaran sekolah tingkat SMP dan SMA (Matematika, IPA, IPS, Bahasa, dll).
- **DIPERBOLEHKAN:** Tips belajar, manajemen waktu, motivasi, dan persiapan ujian sekolah/UTBK.
- **DILARANG:** Menjawab pertanyaan yang sama sekali tidak berhubungan dengan dunia pendidikan atau pengembangan diri pelajar (misal: gosip artis, cheat game, politik praktis, saran hubungan romantis).

**Protokol Interaksi:**
1.  **Handling Out-of-Scope:** Jika siswa bertanya di luar lingkup pendidikan SMP/SMA:
    - Tolak dengan halus dan humoris jika perlu.
    - Arahkan kembali ke topik belajar.
    - *Contoh:* "Waduh, kalau soal gosip artis, Guruku AI kurang update nih. Tapi kalau soal Rumus Pythagoras atau Hukum Newton, aku jagonya! Yuk bahas pelajaran aja."

2.  **Metode Pengajaran (Socratic Method):**
    - Jangan langsung memberi jawaban akhir untuk soal hitungan/latihan.
    - Berikan langkah-langkah pengerjaan (step-by-step).
    - Berikan petunjuk (clue) atau analogi sederhana.
    - Pancing siswa untuk berpikir sendiri.

3.  **Format Penulisan Matematika (PENTING):**
    - **GUNAKAN LaTeX** untuk rumus matematika yang kompleks.
    - Untuk rumus block (terpisah dari teks), gunakan format: `$$ rumus $$`.
    - Untuk rumus inline (di dalam kalimat), gunakan format teks biasa jika sederhana (misal `2^3`), atau LaTeX tetapi tampilan mungkin terbatas.
    - **Prioritaskan penggunaan `$$...$$` untuk rumus utama** agar dapat dirender dengan indah oleh aplikasi.
    - Contoh: "Rumus pythagoras adalah $$ a^2 + b^2 = c^2 $$".

4.  **Keamanan:**
    - Jangan berikan jawaban untuk pertanyaan yang berbahaya, ilegal, atau melanggar etika.

Ingat: Kamu adalah teman belajar mereka. Buat suasana belajar jadi asik dan tidak membosankan!
"""

# Inisialisasi model dengan instruction tetap
model = genai.GenerativeModel(
    model_name="gemini-3.5-flash-lite",
    system_instruction=TEACHER_INSTRUCTION
)

def upload_to_gemini(path, mime_type=None):
    """Uploads the given file to Gemini."""
    file = genai.upload_file(path, mime_type=mime_type)
    return file

def generate_material_content(file_path, mime_type):
    """Generates educational content from a file using Gemini."""
    try:
        # Upload file
        uploaded_file = upload_to_gemini(file_path, mime_type=mime_type)
        
        # Create prompt
        prompt = """
        Analyze this educational document.
        Create a comprehensive lesson module in Markdown format based strictly on the content of this file.
        
        Requirements:
        1. **Summary**: Brief summary of the topic.
        2. **Key Concepts**: Explain main concepts clearly.
        3. **Equations**: If there are mathematical formulas, convert them to LaTeX format enclosed in $$ (block) or $ (inline).
        4. **Examples**: Provide examples if available in the text.
        5. **Quiz/Practice**: Create 3 simple practice questions based on the content.
        
        Format the output as clean Markdown.
        """
        
        chat = model.start_chat(history=[
            {"role": "user", "parts": [uploaded_file, prompt]}
        ])
        
        response = chat.send_message("Generate the content now.")
        return response.text
    except Exception as e:
        return f"Error generating content: {str(e)}"

def build_user_context(user) -> str:
    """Build adaptive educational context without exposing unnecessary user data."""
    role = getattr(user, "role", None)

    if role == "student":
        grade = getattr(getattr(user, "student_profile", None), "grade", None)
        grade = str(grade).strip() if grade else None

        if grade in {"7", "8", "9"}:
            education_level = "SMP"
        elif grade in {"10", "11", "12"}:
            education_level = "SMA"
        else:
            education_level = "SMP atau SMA (tingkat belum diketahui)"

        grade_text = grade or "belum diketahui"
        return (
            "Konteks pengguna:\n"
            "- Peran: siswa\n"
            f"- Jenjang pendidikan: {education_level}\n"
            f"- Kelas: {grade_text}\n"
            "- Semua mata pelajaran SMP dan SMA diperbolehkan; "
            "jangan mengasumsikan mata pelajaran tertentu."
        )

    if role == "teacher":
        subject = getattr(getattr(user, "teacher_profile", None), "subject", None)
        subject = str(subject).strip() if subject else None
        subject_text = subject or "belum diketahui"
        return (
            "Konteks pengguna:\n"
            "- Peran: guru\n"
            f"- Mata pelajaran yang diampu: {subject_text}\n"
            "- Guru tetap dapat bertanya tentang semua mata pelajaran SMP dan SMA."
        )

    return "Konteks pengguna: tidak tersedia. Gunakan tingkat penjelasan umum SMP/SMA."


def ask_gemini(prompt: str, history: list = None, user_context: str = None) -> str:
    try:
        chat = model.start_chat(history=history or [])
        contextual_prompt = prompt
        if user_context:
            contextual_prompt = (
                f"{user_context}\n\n"
                "Gunakan konteks ini hanya untuk menyesuaikan tingkat dan gaya "
                f"penjelasan.\n\nPertanyaan pengguna:\n{prompt}"
            )
        response = chat.send_message(contextual_prompt)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"
