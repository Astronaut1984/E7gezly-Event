from django.urls import path
from . import views
urlpatterns = [
    path("usersindb/", views.countUsers, name="usersindb"),
    path("eventsindb/",views.countEvents, name="eventsindb"),
    path("eventsofcatindb/",views.countEventsOfCategory, name="eventsofcatindb"),
    path("mostfollowedorg/",views.mostFollowedOrganizers,name="mostfollowedorg"),
    path("categoryindb/",views.countCategories,name="categoryindb"),
    path("organizersindb/", views.countOrganizers, name="organizersindb"),
    path("attendeesindb/", views.countAttendees, name="attendeesindb"),
    path("performersindb/",views.countPerformers,name="performersindb"),
    path("venuesindb/", views.countVenues, name="venuesindb"),
    path("eventsindb/", views.countEvents, name="eventsindb"),
    path("busesindb/", views.countBuses, name="busesindb")
]