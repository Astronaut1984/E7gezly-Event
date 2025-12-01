from django.urls import path
from . import views
urlpatterns = [
    path("login/", views.login, name="login"),
    path("signup/", views.signup, name="signup"),
    path("checkemail/", views.checkEmail, name="checkemail"), #bool: emailExists
    path("checkusername/", views.checkUsername, name="checkusername"), #bool: usernameExists
    path("authuser", views.login_view, name="authuser") #User login credentials
]