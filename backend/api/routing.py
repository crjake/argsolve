from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r"room/(?P<room_id>\d+)/(?P<username>\w+)$", consumers.RoomConsumer.as_asgi()),
    re_path(r"^.*$", consumers.ErrorConsumer.as_asgi()),
]
