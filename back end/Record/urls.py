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
    path("busesindb/", views.countBuses, name="busesindb"),
    path('venueusagereport/', views.venueUsageReport, name='venueusagereport'),
    path('orgleaderboard/', views.organizerLeaderboard, name='venueusagereport'),
    path('categorydata/', views.getCategoryData, name='categorydata'),
    path("maxcapbuses/",views.maxCapBuses,name="maxcapbuses"),
    path("mincapbuses/",views.minCapBuses,name="mincapbuses"),
    path("avgcapbuses/",views.avgCapBuses,name="avgcapbuses"),
    path("maxcapvenues/",views.maxCapVenues,name="maxcapvenues"),
    path("mincapvenues/",views.minCapVenues,name="mincapvenues"),
    path("avgcapvenues/",views.avgCapVenues,name="avgcapvenues")
]