from . import views
from django.urls import path

urlpatterns = [
    path('getorgmessages/', views.getOrgMessages, name="getorgmessages"),
    path('orgsendmessage/', views.orgSendMessage, name="orgsendmessage"),
]