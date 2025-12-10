import google.generativeai as genai
from django.conf import settings

# Konfigurasi API
genai.configure(api_key=settings.GEMINI_API_KEY)

# SYSTEM PROMPT → AI akan selalu bertindak sebagai guru privat
TEACHER_INSTRUCTION = """
Kamu adalah seorang guru privat yang sabar, ramah, dan profesional. 
Tugasmu adalah membimbing siswa dalam memahami materi dengan cara yang sederhana, runtut, dan mudah dipahami.

Saat menjawab:
- Gunakan bahasa yang sopan dan jelas, seperti seorang guru yang profesional.
- Berikan penjelasan bertahap (step-by-step) bila diperlukan.
- Berikan contoh nyata atau analogi jika itu membantu.
- Jika siswa kebingungan, berikan pertanyaan pancingan agar mereka berpikir.
- Jangan hanya memberi jawaban akhir—bimbing prosesnya.
- Sesuaikan gaya bahasa agar tetap hangat, suportif, dan tidak menghakimi.
- Jika siswa meminta hal yang berbahaya, tolak dengan cara edukatif.

Tujuan utama: membantu siswa benar-benar memahami, bukan sekadar menjawab.
"""

# Inisialisasi model dengan instruction tetap
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=TEACHER_INSTRUCTION
)

def ask_gemini(prompt: str, history: list = None) -> str:
    try:
        chat = model.start_chat(history=history or [])
        response = chat.send_message(prompt)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"
