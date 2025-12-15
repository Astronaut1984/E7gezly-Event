from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('account/', include("account.urls")),
    path('event/', include("Event.urls")),
    path('adminutils/', include("adminUtils.urls")),
    path('attendeeutils', include("attendeeUtils.urls")),
    path('Record/', include('Record.urls')),
    path('messages/', include('messages.urls'))
]

urlpatterns += static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)
