from channels.generic.websocket import AsyncWebsocketConsumer
import json

from .views import argsolve


class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = int(self.scope['url_route']['kwargs']['room_id'])
        self.username = self.scope['url_route']['kwargs']['username']
        self.room_group_name = f'room_{self.room_id}'

        self.room = argsolve.rooms.get(self.room_id, None)

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        if not self.room:
            await self.send(text_data=json.dumps({'type': 'disconnect', 'data':'room not found'}))
            await self.close(code=1000)
            return

        if self.room.state != "WAITING":
            # Deny connection as we can't join a debate midway
            await self.send(text_data=json.dumps({'type': 'disconnect', 'data':'room in progress'}))
            await self.close(code=1000)
            return

        self.room.users.add(self.username)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'notify_client'
            }
        )

    async def disconnect(self, close_code):
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

        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        request = json.loads(text_data)

        if request["type"] == "transition":
            argsolve.rooms[self.room_id].transition(request["data"]["command"])

            # We've been notified, tell the gang
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'notify_client'
                }
            )

    async def notify_client(self, event):
        # We can get params like so: message = event['message'], type = event['type']
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'data': 'fetch'
        }))
