from . import views
from django.urls import path

urlpatterns = [
    path('getorgmessages/', views.getOrgMessages, name="getorgmessages"),
    path('sendmessage/', views.sendMessage, name="sendmessage"),
    path('getattendeemessages/', views.getAttendeeMessages, name="getattendeemessages"),
]