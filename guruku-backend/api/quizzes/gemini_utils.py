import google.generativeai as genai
from django.conf import settings
import json
import typing_extensions as typing

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

def generate_quiz_from_file(file_path: str, mime_type: str, num_questions: int = 5) -> list[Question]:
    """
    Generates quiz questions from a file using Gemini, returning structured JSON.
    """
    try:
        # 1. Upload File
        print(f"Uploading file: {file_path}")
        uploaded_file = genai.upload_file(file_path, mime_type=mime_type)
        print(f"File uploaded: {uploaded_file.uri}")

        # 2. Configure Model
        # We use a specific system instruction for JSON generation
        generation_config = {
            "temperature": 0.4,
            "response_mime_type": "application/json",
            "response_schema": list[Question]
        }
        
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash-lite",
            generation_config=generation_config,
            system_instruction="""
            You are an expert educational content creator.
            Your task is to analyze the provided document and extract/generate high-quality multiple-choice quiz questions.
            
            Rules:
            1. Generate substantially correct and relevant questions based on the text.
            2. For each question, provide 4 options (strings).
            3. Specify the correct answer (must match one of the options exactly).
            4. Assign 'order' starting from 1.
            5. Default points to 10.
            6. Return PURE JSON list.
            """
        )

        # 3. Generate Content
        prompt = f"Create {num_questions} multiple-choice questions based on this document."
        
        response = model.generate_content([uploaded_file, prompt])
        
        # 4. Parse Response
        try:
            questions_json = json.loads(response.text)
            return questions_json
        except json.JSONDecodeError:
            print("Failed to decode JSON:", response.text)
            return []

    except Exception as e:
        print(f"Error in generate_quiz_from_file: {e}")
        return []
