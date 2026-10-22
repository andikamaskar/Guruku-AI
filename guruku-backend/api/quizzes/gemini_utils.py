import google.generativeai as genai
from django.conf import settings
import json
import logging
import os
import re
import zipfile
import xml.etree.ElementTree as ET
import typing_extensions as typing

from pypdf import PdfReader

logger = logging.getLogger(__name__)


class QuizGenerationError(Exception):
    """Raised when Gemini cannot generate a valid quiz."""

# Re-configure if needed, or rely on settings.GEMINI_API_KEY
genai.configure(api_key=settings.GEMINI_API_KEY)

# Define the schema for the response
class Option(typing.TypedDict):
    text: str

class Question(typing.TypedDict):
    text: str
    options: list[str]
    answer: str
    points: int
    order: int

class QuizAndQuestions(typing.TypedDict):
    questions: list[Question]

def extract_document_text(file_path: str, mime_type: str | None = None) -> str:
    """Extract readable text locally so Gemini Files API is not required."""
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
            raise QuizGenerationError("Format dokumen belum didukung untuk ekstraksi teks.")
    except QuizGenerationError:
        raise
    except Exception as exc:
        logger.error("Quiz document extraction failed: %s", type(exc).__name__)
        raise QuizGenerationError("Dokumen tidak dapat dibaca.") from exc

    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        raise QuizGenerationError("Dokumen tidak berisi teks yang dapat dibaca.")
    return text


def generate_quiz_from_file(file_path: str, mime_type: str, num_questions: int = 5) -> list[Question]:
    """Generate quiz questions from locally extracted document text."""
    document_text = extract_document_text(file_path, mime_type)
    prompt_text = f"""
You are an educational assistant.
TASK: Extract or create multiple-choice questions from the document text below, up to a maximum of {num_questions}.

RULES:
1. If the document has existing questions, USE THEM.
2. If it has an Answer Key (Kunci Jawaban), USE IT for the answer field.
3. If no key is found, deduce the correct answer.
4. Return ONLY a valid JSON List. No markdown formatting.

JSON SCHEMA:
[{{"text":"Question text","options":["Option A","Option B","Option C","Option D"],"answer":"Exact string of correct option","points":10,"order":1}}]

DOCUMENT TEXT:
{document_text}
"""
    try:
        model = genai.GenerativeModel(
            model_name="gemini-3.5-flash-lite",
            generation_config={
                "temperature": 0.1,
                "response_mime_type": "application/json",
                "max_output_tokens": 8192,
            },
        )
        response = model.generate_content(
            prompt_text,
            request_options={"timeout": settings.GEMINI_REQUEST_TIMEOUT},
        )
        questions_json = json.loads(response.text)
        if not isinstance(questions_json, list):
            raise QuizGenerationError("Gemini returned an invalid quiz structure.")
        return questions_json
    except QuizGenerationError:
        raise
    except json.JSONDecodeError as exc:
        logger.error("Quiz generation returned invalid JSON: %s", type(exc).__name__)
        raise QuizGenerationError("Gemini returned invalid quiz data.") from exc
    except Exception as exc:
        logger.error("Quiz generation provider request failed: %s", type(exc).__name__)
        raise QuizGenerationError("Quiz generation provider failed.") from exc
