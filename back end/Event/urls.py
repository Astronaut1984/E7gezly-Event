from django.urls import path
from . import views
urlpatterns = [
    path("addevent/", views.addEvent, name="addevent"),
    path("getvenue/", views.getVenue, name="getvenue"),
]