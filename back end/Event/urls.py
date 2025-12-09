from django.urls import path
from . import views
urlpatterns = [
    #inputs in request json: name, description, category, status, start_date, end_date, owner, location, banner, performers, busses
    path("addevent/", views.addEvent, name="addevent"),
    path("getvenue/", views.getVenue, name="getvenue"),
    path("getevent/", views.getVenue, name="getevent"),
    path("getcategory/", views.getVenue, name="getcategory"),
    
]