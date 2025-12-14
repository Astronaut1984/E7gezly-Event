from django.urls import path
from . import views
urlpatterns = [
    path("usersindb/", views.countUsers, name="usersindb"),
    path("eventsindb/",views.countEvents, name="eventsindb"),
]