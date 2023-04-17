# from channels.generic.websocket import AsyncWebsocketConsumer
from channels.generic.websocket import AsyncWebsocketConsumer
import json

from .views import argsolve


class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = int(self.scope['url_route']['kwargs']['room_id'])
        self.room_group_name = f'room_{self.room_id}'

        # Join room group
        # await self.channel_layer.group_add(
        #     self.room_group_name,
        #     self.channel_name
        # )

        # Check if room already started (then deny request in that case)


        await self.accept()

        # await self.chat_message({'message': 'scran ur ma ur bum'})

    async def disconnect(self, close_code):
        # Leave room group
        # await self.channel_layer.group_discard(
        #     self.room_group_name,
        #     self.channel_name
        # )
        pass

    async def receive(self, text_data):
        # data = json.loads(text_data)
        # message = data['message']
        # Perhaps need different types of websocket messages?
        # if (text_data == "NEXT"):
            # argsolve.rooms[self.room_id].next_state()
        print(text_data)
        try:
            argsolve.rooms[self.room_id].transition(text_data)
            await self.send(text_data=json.dumps({'notification': 'fetch'}))
        except ValueError:
            await self.send(text_data=json.dumps({'notification': 'failure'}))


        # # Send message to room group
        # await self.channel_layer.group_send(
        #     self.room_group_name,
        #     {
        #         'type': 'chat_message',
        #         'message': message
        #     }
        # )

    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
