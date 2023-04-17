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
            await self.send(text_data=json.dumps({'type': 'disconnect', 'data': 'room not found'}))
            await self.close(code=1000)
            return

        if self.room.state != "WAITING":
            # Deny connection as we can't join a debate midway
            await self.send(text_data=json.dumps({'type': 'disconnect', 'data': 'room in progress'}))
            await self.close(code=1000)
            return

        self.room.users.add(self.username)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'trigger_fetch'
            }
        )

    async def disconnect(self, close_code):
        # Case abandonment (user has left whilst in progress)
        # Case abandonment (host has left in lobby/waiting)
        # Case rejection due to
        # Room not found: then no one needs to be notified trivially
        # Room in progress: no one is affected by this, they haven't even joined room as user

        if self.room and self.username in self.room.users:
            shutdown = False
            if self.username == self.room.host:
                # The host is about to leave the room. The debate can't continue no matter what
                await self.channel_layer.group_send(self.room_group_name, {'type': 'trigger_shutdown', 'reason': 'host_disconnect', 'perpetrator': self.username})
                shutdown = True
            else:
                if not (self.room.state == "WAITING" or self.room.state == "SUMMARY"):
                    # A user has left whilst the debate is in progress (not in lobby or at the summary screen)
                    # We should notify the participants to end the debate
                    await self.channel_layer.group_send(self.room_group_name, {'type': 'trigger_shutdown', 'reason': 'user_disconnect', 'perpetrator': self.username})
                    shutdown = True
                else:
                    # It's okay to leave at these stages, just notify the room so they can refresh their user lists
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'trigger_fetch'
                        }
                    )

            self.room.users.remove(self.username)
            if shutdown:
                del argsolve.rooms[self.room_id]

        # Make this specific channel leave the group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        request = json.loads(text_data)

        # If you want to handle more messages, deal with it here.
        if request["type"] == "transition":
            argsolve.rooms[self.room_id].transition(request["data"]["command"])

            # A transition has occurred. Tell everyone to fetch the room.
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'trigger_fetch'
                }
            )

    async def trigger_shutdown(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'data': {'type': 'shutdown', 'reason': event['reason'], 'perpetrator': event['perpetrator']}
        }))
        await self.close(code=1000)

    async def trigger_fetch(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'data': {'type': 'fetch'}
        }))
