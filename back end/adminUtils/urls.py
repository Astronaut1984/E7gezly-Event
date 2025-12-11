from django.urls import path
from . import views
urlpatterns = [
    path("getorganizers/", views.getOrganizers, name="getorganizers"),
    path("deleteorganizer/", views.deleteOrganizer, name="deleteorganizer"),
    path("getperformers/", views.getPerformers, name="getperformers"),
]