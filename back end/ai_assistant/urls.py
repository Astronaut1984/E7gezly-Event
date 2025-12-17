from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.ai_chat, name='ai-chat'),
    path('health/', views.health_check, name='ai-health'),
]