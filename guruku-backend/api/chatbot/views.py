from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .gemini_service import ask_gemini

class ChatbotView(APIView):
    def post(self, request):
        message = request.data.get("message")

        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        reply = ask_gemini(message)

        return Response({
            "message": message,
            "reply": reply
        })
