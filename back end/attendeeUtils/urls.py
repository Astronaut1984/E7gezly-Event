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
    path("getunblockedusers", views.getUnblockedUsers, name="getunblockedusers")
]