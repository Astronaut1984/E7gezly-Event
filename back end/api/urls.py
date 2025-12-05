from django.urls import path
from . import views

urlpatterns = [
    path("test/", views.test),
    path("getvenue/", views.getvenue, name="getvenue"),
]