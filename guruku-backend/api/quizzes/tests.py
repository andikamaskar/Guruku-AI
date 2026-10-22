import json
import tempfile
import zipfile
from pathlib import Path
from unittest.mock import Mock, patch

from django.test import SimpleTestCase

from .gemini_utils import QuizGenerationError, extract_document_text, generate_quiz_from_file


class QuizDocumentExtractionTests(SimpleTestCase):
    def test_extracts_txt(self):
        with tempfile.NamedTemporaryFile(suffix=".txt", mode="w", encoding="utf-8", delete=False) as document:
            document.write("Materi gaya dan gerak")
            path = document.name
        try:
            self.assertEqual(extract_document_text(path, "text/plain"), "Materi gaya dan gerak")
        finally:
            Path(path).unlink(missing_ok=True)

    def test_extracts_pdf(self):
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as document:
            document.write(b"%PDF-1.4")
            path = document.name
        try:
            with patch("api.quizzes.gemini_utils.PdfReader") as reader:
                reader.return_value.pages = [Mock(extract_text=Mock(return_value="Materi energi"))]
                self.assertEqual(extract_document_text(path, "application/pdf"), "Materi energi")
        finally:
            Path(path).unlink(missing_ok=True)

    def test_extracts_docx(self):
        with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as document:
            path = document.name
        try:
            with zipfile.ZipFile(path, "w") as archive:
                archive.writestr("word/document.xml", '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Materi cahaya</w:t></w:r></w:p></w:body></w:document>')
            self.assertEqual(extract_document_text(path, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"), "Materi cahaya")
        finally:
            Path(path).unlink(missing_ok=True)

    @patch("api.quizzes.gemini_utils.genai.upload_file")
    @patch("api.quizzes.gemini_utils.genai.GenerativeModel")
    def test_generator_sends_extracted_text_not_file_upload(self, model_factory, upload_file):
        with tempfile.NamedTemporaryFile(suffix=".txt", mode="w", encoding="utf-8", delete=False) as document:
            document.write("Materi hukum Newton")
            path = document.name
        try:
            model = model_factory.return_value
            model.generate_content.return_value.text = json.dumps([{"text": "Apa itu gaya?", "options": ["A", "B"], "answer": "A", "points": 10, "order": 1}])
            result = generate_quiz_from_file(path, "text/plain", 1)
            self.assertEqual(len(result), 1)
            upload_file.assert_not_called()
            self.assertIn("Materi hukum Newton", model.generate_content.call_args.args[0])
        finally:
            Path(path).unlink(missing_ok=True)

    @patch("api.quizzes.gemini_utils.genai.GenerativeModel")
    def test_provider_failure_returns_safe_quiz_error(self, model_factory):
        with tempfile.NamedTemporaryFile(suffix=".txt", mode="w", encoding="utf-8", delete=False) as document:
            document.write("Materi matematika")
            path = document.name
        try:
            model_factory.return_value.generate_content.side_effect = RuntimeError("provider detail")
            with self.assertRaises(QuizGenerationError) as raised:
                generate_quiz_from_file(path, "text/plain")
            self.assertEqual(str(raised.exception), "Quiz generation provider failed.")
        finally:
            Path(path).unlink(missing_ok=True)

