from django.urls import path
from . import views

urlpatterns = [
    path("getuserfriends", views.getUserFriends, name="getuserfriends"),
    path("getfollowedorganizers", views.getFollowedOrganizers, name="getfollowedorganizers"),
    path("getfollowers", views.getFollowers, name="getfollowers"),
    path("addfriend", views.addFriend, name="addfriend"),
    path("blockunblockuser", views.blockUnblockUser, name="blockunblockuser"),
    path("getsentfriendrequests", views.getSentFriendRequests, name="getsentfriendrequests"),
    path("getreceivedfriendrequests", views.getReceivedFriendRequests, name="getreceivedfriendrequests"),
    path("getblockedusers", views.getBlockedUsers, name="getblockedusers"),
    path("respondtofriendrequest", views.respondToFriendRequest, name="respondtofriendrequest"),
    path("getunblockedusers", views.getUnblockedUsers, name="getunblockedusers"),
    path("removefriend", views.removeFriend, name="removefriend"),
    path("cancelfriendrequests", views.cancelFriendRequest, name="cancelfriendrequests"),
    path('getfriendscounts', views.getFriendsCounts, name='getfriendscounts'),
    path('getrelationshipstatus', views.getRelationshipStatus, name='getrelationshipstatus'),
    path('getuserfriendswithprivacy', views.getUserFriendsWithPrivacy, name='getuserfriendswithprivacy'),
    path('getuserfollowerswithprivacy', views.getUserFollowersWithPrivacy, name='getuserfollowerswithprivacy'),
    path('getuserfollowedorganizerswithprivacy', views.getUserFollowedOrganizersWithPrivacy, name='getuserfollowedorganizerswithprivacy'),  # NEW
    path('getuserview', views.getUserView, name='getuserview'),
    
    # NEW Follow endpoints
    path('followorganizer', views.followOrganizer, name='followorganizer'),
    path('unfolloworganizer', views.unfollowOrganizer, name='unfolloworganizer'),
    path('getunblockedorganizers', views.getUnblockedOrganizers, name='getunblockedorganizers'),
    path('getfollowcounts', views.getFollowCounts, name='getfollowcounts'),
    path('getfollowercounts', views.getFollowerCounts, name='getfollowercounts'),
    path('getwishlistedevents', views.getWishlistedEvents, name='getwishlistedevents'),
    path('togglewishlist', views.toggleWishlist, name='togglewishlist'),
    path('gettickets', views.getTickets, name='gettickets')
]