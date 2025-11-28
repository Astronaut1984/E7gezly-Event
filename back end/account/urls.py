from django.urls import path
from . import views
urlpatterns = [
    path("login/", views.login, name="login"),
    path("signup/", views.signup, name="signup"),
    path("checkemail/", views.checkEmail, name="checkemail"),
    path("checkusername/", views.checkUsername, name="checkusername"),
    path("authuser", views.login_view, name="authuser") #User login credentials
]