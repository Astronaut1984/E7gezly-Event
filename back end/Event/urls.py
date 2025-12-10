from django.urls import path
from . import views
urlpatterns = [
    #inputs in request json: name, description, category, status, start_date, end_date, owner, location, banner, performers, busses
    path("addevent/", views.addEvent, name="addevent"),
    path("getvenues/", views.getVenues, name="getvenues"),
    path("getevents/", views.getEvents, name="getevents"),
    path("getcategories/", views.getCategories, name="getcategories"),
    
]