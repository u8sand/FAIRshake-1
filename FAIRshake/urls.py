"""FAIR URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import include, path
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from ajax_select import urls as ajax_select_urls
from des import urls as des_urls

if not settings.DEBUG:
    handler400 = 'FAIRshakeHub.views.handler400'
    handler403 = 'FAIRshakeHub.views.handler403'
    handler404 = 'FAIRshakeHub.views.handler404'
    handler500 = 'FAIRshakeHub.views.handler500'

urlpatterns = [
    path(settings.BASE_URL + '', include('FAIRshakeHub.urls')),
    path(settings.BASE_URL + '', include('FAIRshakeAPI.urls')),
    path(settings.BASE_URL + 'admin/', admin.site.urls),
    path(settings.BASE_URL + 'accounts/', include('extensions.allauth_ex.urls')),
    path(settings.BASE_URL + 'auth/', include('extensions.rest_auth_ex.urls')),
    path(settings.BASE_URL + 'swagger/', include('extensions.drf_yasg_ex.urls')),
    path(settings.BASE_URL + 'internal/django-des/', include(des_urls)),
    path(settings.BASE_URL + 'internal/ajax_select/', include(ajax_select_urls)),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
