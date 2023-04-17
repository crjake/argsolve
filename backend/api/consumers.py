# from channels.generic.websocket import AsyncWebsocketConsumer
from channels.generic.websocket import AsyncWebsocketConsumer
import json

from .views import argsolve


class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = int(self.scope['url_route']['kwargs']['room_id'])
        self.username = self.scope['url_route']['kwargs']['username']
        # Room is valid and is in WAITING state
        self.room_group_name = f'room_{self.room_id}'

        self.room = argsolve.rooms.get(self.room_id, None)

        if not self.room:
            self.close()
            return

        if self.room.state != "WAITING":
            # Deny connection as we can't join a debate midway
            self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        self.room.users.add(self.username)
        await self.accept()

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'notify_client'
            }
        )

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        if self.room and self.username in self.room.users:
            if self.username == self.room.host:
                self.room.state = "ABANDONED"
            self.room.users.remove(self.username)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'notify_client'
            }
        )

    async def receive(self, text_data):
        print(text_data)
        try:
            argsolve.rooms[self.room_id].transition(text_data)
            await self.send(text_data=json.dumps({'notification': 'fetch'}))
        except ValueError:
            await self.send(text_data=json.dumps({'notification': 'failure'}))


        # We've been notified, tell the gang
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'notify_client'
            }
        )

    async def notify_client(self, event):
        # message = event['message']
        # type = event['type']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'notification': 'fetch'
        }))
