from django.urls import path
from . import views
urlpatterns = [
    #inputs in request json: name, description, category, status, start_date, end_date, owner, location, banner, performers, busses
    path("addevent/", views.addEvent, name="addevent"),
    path("getvenues/", views.getVenues, name="getvenues"),
    path("getevents/", views.getEvents, name="getevents"),
    path("getorganizerevents/", views.getOrganizerEvents, name="getorganizerevents"),
    path("getcategories/", views.getCategories, name="getcategories"),
    path("addvenue/", views.addVenue, name="addvenue"),
    path("getperformers/", views.getPerformers, name="getperformers"),
    path("getCapacityofBuses/", views.getCapacityofBuses, name="getCapacityofBuses"),
    path("getBusesWithCapacity/", views.getBusesWithCapacity, name="getBusesWithCapacity"),
    path("getavailablebuscapacities/", views.getAvailableBusCapacities, name="getavailablebuscapacities"),
    path("addtickettype/", views.addTicketType, name="addtickettype"),
    path("deleteevent/", views.deleteEvent, name="deleteevent")
]