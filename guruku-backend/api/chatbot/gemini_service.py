import json
import logging
import os
import re
import zipfile
import xml.etree.ElementTree as ET

import google.generativeai as genai
from django.conf import settings
from pypdf import PdfReader

logger = logging.getLogger(__name__)

CHATBOT_ERROR_MESSAGE = "Maaf, tutor AI sedang mengalami gangguan. Silakan coba lagi nanti."
CONTENT_GENERATION_ERROR_MESSAGE = "Materi belum dapat dibuat karena layanan AI sedang mengalami gangguan."

# Konfigurasi API
genai.configure(api_key=settings.GEMINI_API_KEY)

# Instruction khusus chatbot tutor.
CHATBOT_INSTRUCTION = """
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

SCOPE_CLASSIFIER_INSTRUCTION = """
Anda adalah classifier untuk chatbot pendidikan Guruku AI.
Klasifikasikan pertanyaan pengguna ke tepat satu kategori berikut:
- educational: materi semua mata pelajaran SMP/SMA atau pertanyaan umum yang berkaitan dengan pendidikan.
- study_support: motivasi belajar, manajemen waktu, strategi belajar, atau persiapan ujian.
- out_of_scope: tidak berkaitan dengan pendidikan atau pengembangan diri pelajar.
- unsafe: berbahaya, ilegal, atau melanggar etika.
- ambiguous: belum cukup jelas, tetapi masih mungkin berkaitan dengan pendidikan.

Kembalikan JSON saja dengan format:
{"category":"educational|study_support|out_of_scope|unsafe|ambiguous"}
"""

CONTENT_GENERATOR_INSTRUCTION = """
Anda adalah penyusun modul pembelajaran untuk siswa SMP dan SMA.

Buat materi pembelajaran yang terstruktur, akurat, dan mudah dipahami berdasarkan
isi dokumen yang diberikan. Hasilkan Markdown yang berisi ringkasan, konsep utama,
rumus LaTeX jika relevan, contoh, dan tiga latihan.

Gunakan hanya informasi yang didukung dokumen. Hasilkan isi modul secara langsung,
bukan respons percakapan kepada siswa.
"""


# Model dipisahkan agar aturan chatbot tidak memengaruhi generator materi.
chatbot_model = genai.GenerativeModel(
    model_name="gemini-3.5-flash-lite",
    system_instruction=CHATBOT_INSTRUCTION,
)

content_model = genai.GenerativeModel(
    model_name="gemini-3.5-flash-lite",
    system_instruction=CONTENT_GENERATOR_INSTRUCTION,
)

scope_classifier_model = genai.GenerativeModel(
    model_name="gemini-3.5-flash-lite",
    generation_config={"response_mime_type": "application/json"},
    system_instruction=SCOPE_CLASSIFIER_INSTRUCTION,
)


def classify_question_scope(prompt: str) -> str:
    """Return a validated scope category; fail closed to ambiguous."""
    try:
        response = scope_classifier_model.generate_content(
            prompt,
            request_options={"timeout": settings.GEMINI_REQUEST_TIMEOUT},
        )
        result = json.loads(response.text)
        category = result.get("category")
        allowed_categories = {
            "educational", "study_support", "out_of_scope", "unsafe", "ambiguous"
        }
        return category if category in allowed_categories else "ambiguous"
    except Exception:
        logger.exception("Gemini scope classifier failed")
        return "ambiguous"


def upload_to_gemini(path, mime_type=None):
    """Uploads the given file to Gemini."""
    file = genai.upload_file(path, mime_type=mime_type)
    return file

def extract_document_text(file_path, mime_type=None):
    """Extract readable document text locally for Gemini content generation."""
    extension = os.path.splitext(file_path)[1].lower()
    try:
        if extension == ".pdf" or mime_type == "application/pdf":
            text = "\n".join(page.extract_text() or "" for page in PdfReader(file_path).pages)
        elif extension == ".txt" or mime_type == "text/plain":
            with open(file_path, "r", encoding="utf-8") as document:
                text = document.read()
        elif extension == ".docx" or mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            with zipfile.ZipFile(file_path) as archive:
                xml_content = archive.read("word/document.xml")
            root = ET.fromstring(xml_content)
            text = " ".join(node.text or "" for node in root.iter() if node.tag.endswith("}t"))
        else:
            raise ValueError("Unsupported document format")
    except Exception as exc:
        logger.error("Material document extraction failed: %s", type(exc).__name__)
        raise ValueError("Document cannot be read") from exc

    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        raise ValueError("Document has no readable text")
    return text


def generate_material_content(file_path, mime_type):
    """Generates educational content from locally extracted document text."""
    try:
        document_text = extract_document_text(file_path, mime_type)
        prompt = f"""
Analyze this educational document.
Create a comprehensive lesson module in Markdown format based strictly on the content below.

Requirements:
1. Summary: Brief summary of the topic.
2. Key Concepts: Explain main concepts clearly.
3. Equations: Convert mathematical formulas to LaTeX where relevant.
4. Examples: Provide examples if available in the text.
5. Quiz/Practice: Create 3 simple practice questions based on the content.

Format the output as clean Markdown.

DOCUMENT TEXT:
{document_text}
"""
        response = content_model.generate_content(
            prompt,
            request_options={"timeout": settings.GEMINI_REQUEST_TIMEOUT},
        )
        return response.text
    except Exception as exc:
        logger.error("Gemini material generation failed: %s", type(exc).__name__)
        return CONTENT_GENERATION_ERROR_MESSAGE

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
        chat = chatbot_model.start_chat(history=history or [])
        contextual_prompt = prompt
        if user_context:
            contextual_prompt = (
                f"{user_context}\n\n"
                "Gunakan konteks ini hanya untuk menyesuaikan tingkat dan gaya "
                f"penjelasan.\n\nPertanyaan pengguna:\n{prompt}"
            )
        response = chat.send_message(
            contextual_prompt,
            request_options={"timeout": settings.GEMINI_REQUEST_TIMEOUT},
        )
        return response.text
    except Exception:
        logger.exception("Gemini chatbot request failed")
        return CHATBOT_ERROR_MESSAGE
