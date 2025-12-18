from django.urls import path
from . import views
urlpatterns = [
    #inputs in request json: name, description, category, status, start_date, end_date, owner, location, banner, performers, busses
    path("addevent/", views.addEvent, name="addevent"),
    path("editevent/", views.editEvent, name="editevent"),
    path("getvenues/", views.getVenues, name="getvenues"),
    path("getevents/", views.getEvents, name="getevents"),
    path("getcategories/", views.getCategories, name="getcategories"),
    path("addvenue/", views.addVenue, name="addvenue"),
    path("getperformers/", views.getPerformers, name="getperformers"),
    path("getCapacityofBuses/", views.getCapacityofBuses, name="getCapacityofBuses"),
    path("getBusesWithCapacity/", views.getBusesWithCapacity, name="getBusesWithCapacity"),
    path("getavailablebuscapacities/", views.getAvailableBusCapacities, name="getavailablebuscapacities"),
    path("addtickettype/", views.addTicketType, name="addtickettype"),
    path("deleteevent/", views.deleteEvent, name="deleteevent"),
    path("getcategorieswithbanners/", views.getCategoriesWithBanners, name="getcategorieswithbanners"),
    path("geteventbyid/<int:event_id>/", views.getEventById, name="geteventbyid"),
    path("edittickettype/", views.editTicketType, name="edittickettype"),
    path("deletetickettype/", views.deleteTicketType, name="deletetickettype"),
    path("buyticket/", views.buyTicket, name="buyticket"),
    path("addfeedback/",views.addFeedback, name="addfeedback"),
    path("addlostitem/",views.addLostitem, name="addlostitem"),
    path("updatelostitem/",views.updateLostitem, name="updatelostitem"),
    path("getavailablelocation/",views.getavailablelocation,name="getavailablelocation"),
    path("bookbus/",views.bookBus,name="bookbus")
]