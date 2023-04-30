from django.urls import path

from . import views

urlpatterns = [
    path('create-user', views.create_user),
    path('rooms', views.get_rooms),
    path('create-room', views.create_room),
    path('get-room/<int:room_id>', views.get_room),
    path('get-examples', views.get_examples),
]
