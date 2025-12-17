from django.urls import path
from . import views
urlpatterns = [
    path("getorganizers/", views.getOrganizers, name="getorganizers"),
    path("deleteorganizer/", views.deleteOrganizer, name="deleteorganizer"),
    path("getperformers/", views.getPerformers, name="getperformers"),
    path("addperformer/", views.addPerformer, name="addperformer"),
    path("getreports/", views.getReports, name="getreports"),
    path("deleteperformer/", views.deletePerformer, name="deleteperformer"),
    path("getvenues/", views.getVenues, name="getvenues"),
    path("deletevenue/", views.deleteVenue, name="deletevenue"),
    path("resolvereport/", views.resolveReport, name="resolvereport"),
    path("getcategories/",views.getCategories,name="getcategories"),
    path("deletecategories/",views.deleteCategories,name="deletecategories"),
    path("addcategories/", views.addCategories, name="addcategories"),
    path("updatecategories/", views.updateCategories, name="updatecategories"),
    path("getvehicle/", views.getVehicle, name="getvehicle"),
    path("addvehicle/", views.addVehicle, name="addvehicle"),
    path("updatevehicle/", views.updateVehicle, name="updatevehicle"),
    path("deletevehicle/", views.deleteVehicle, name="deletevehicle"),
    path("addvenues/", views.addVenues, name="addvenues"),
    path("updatevenues/", views.updateVenues, name="updatevenues"),
    path("updateperformer/", views.updatePerformer, name="updateperformer"),
    path("createadmin/",views.createAdmin,name="createadmin"),
    path("getevents/",views.getEvents,name="getevents"),
    path("deleteevents/",views.deleteEvents,name="deleteevents")

]