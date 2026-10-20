from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "status": "online",
        "message": "Guruku.AI Backend API is running",
        "available_endpoints": [
            "/api/users/",
            "/api/classes/",
            "/api/materials/",
            "/api/quizzes/",
            "/api/chatbot/",
            "/api/admin/"
        ]
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('users/', include('api.users.urls')),
    path('classes/', include('api.classes.urls')),
    path('materials/', include('api.materials.urls')),
    path('quizzes/', include('api.quizzes.urls')),

    path('chatbot/', include('api.chatbot.urls')),
    path('admin/', include('api.admin_panel.urls')),
]
