from django.urls import path
from . import views
urlpatterns = [
    path("login/", views.login, name="login"),
    path("signup/", views.signup, name="signup"),
    path("checkemail/", views.checkEmail, name="checkemail"), #bool: emailExists
    path("checkusername/", views.checkUsername, name="checkusername"), #bool: usernameExists
    path("authuser/", views.login_view, name="authuser"), #User login credentials
    path("me/", views.me, name="me"), #User reload
    path("logout/", views.logout, name="logout"),
    path("getuserfriends", views.getUserFriends, name="getuserfriends"),
    path("getfollowedorganizers", views.getFollowedOrganizers, name="getfollowedorganizers"),
    path("getfollowers", views.getFollowers, name="getfollowers"),
    path("addfriend", views.addFriend, name="addfriend"),
    path("blockunblockuser", views.blockUnblockUser, name="blockunblockuser"),
    path("getsentfriendrequests", views.getSentFriendRequests, name="getsentfriendrequests"),
    path("getreceivedfriendrequests", views.getReceivedFriendRequests, name="getreceivedfriendrequests"),
    path("getblockedusers", views.getBlockedUsers, name="getblockedusers"),
    path("respondtofriendrequest", views.respondToFriendRequest, name="respondtofriendrequest")
]