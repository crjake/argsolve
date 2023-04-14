from django.urls import path

from . import views

urlpatterns = [
    # path('', views.api_home),
    path('create-user', views.create_user),
    path('rooms', views.get_rooms)
]
