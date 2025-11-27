from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('E7gezly/', include("E7gezly.urls"))
]
