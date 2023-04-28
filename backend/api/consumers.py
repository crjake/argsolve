from channels.generic.websocket import AsyncWebsocketConsumer
import json

from .views import argsolve

from argtools.converters import bipolar_aba_to_baf, baf_to_bipolar_aba, cytoscape_to_baf, baf_to_cytoscape
from argtools.baf import DeductiveSupport, NecessarySupport, lookup_support_notion
from argtools.bipolar_aba import Symbol
from argtools.asp import compute_extensions


class ErrorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send(text_data=json.dumps({'type': 'disconnect', 'data': 'room not found'}))
        await self.close(code=1000)


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
            await self.send(text_data=json.dumps({'type': 'connection_refused', 'reason': 'room_not_found'}))
            await self.close(code=1000)
            return

        if self.room.state != "WAITING":
            # Deny connection as we can't join a debate midway
            await self.send(text_data=json.dumps({'type': 'connection_refused', 'reason': 'room_in_progress'}))
            await self.close(code=1000)
            return

        self.room.add_user(self.username)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'fetch'
            }
        )

    async def disconnect(self, close_code):
        if self.room and self.username in self.room.users:
            shutdown = False
            if self.username == self.room.host:
                # The host is about to leave the room. The debate can't continue no matter what
                await self.channel_layer.group_send(self.room_group_name, {'type': 'shutdown', 'reason': 'host_disconnect', 'perpetrator': self.username})
                shutdown = True
            else:
                if not (self.room.state == "WAITING" or self.room.state == "SUMMARY"):
                    # A user has left whilst the debate is in progress (not in lobby or at the summary screen)
                    # We should notify the participants to end the debate
                    await self.channel_layer.group_send(self.room_group_name, {'type': 'shutdown', 'reason': 'user_disconnect', 'perpetrator': self.username})
                    shutdown = True
                else:
                    # It's okay to leave at these stages, just notify the room so they can refresh their user lists
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'fetch'
                        }
                    )
            self.room.remove_user(self.username)
            if shutdown:
                if self.room_id in argsolve.rooms:
                    del argsolve.rooms[self.room_id]

        # Make this specific channel leave the group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # try:
        print("Incoming message:", text_data)
        request = json.loads(text_data)

        # If you want to handle more messages, deal with it here.
        if request["type"] == "state_transition":
            argsolve.rooms[self.room_id].transition(request["command"])

            # A transition has occurred. Tell everyone to fetch the room.
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'fetch'
                }
            )
            return

        if request["type"] == "state_action":
            match request["state"]:
                case "WAITING":
                    await self.handle_waiting(request["action"])
                case "ARGUMENT_PROPOSAL":
                    await self.handle_argument_proposal(request["action"])
                case "ARGUMENT_VALIDATION":
                    await self.handle_argument_validation(request["action"])
                case "RELATION_PROPOSAL":
                    await self.handle_relation_proposal(request["action"])
                case _:
                    print("Unknown state", request["state"])
            return

        if request["type"] == "fetch_aggregated_framework":
            support_notion = lookup_support_notion[self.room.support_notions[self.username]]
            baf_aggregate = bipolar_aba_to_baf(self.room.aggregated_framework, support_notion)
            json_aggregate = baf_to_cytoscape(baf_aggregate)
            await self.send(text_data=json.dumps({
                'type': 'fetched_aggregated_framework',
                'aggregated_framework': json_aggregate,
            }))
            return

        if request["type"] == 'compute_extensions':
            elements = request["framework"]
            support_notion = lookup_support_notion[self.room.support_notions[self.username]]
            baf = cytoscape_to_baf(elements, support_notion)
            bipolar_aba = baf_to_bipolar_aba(baf)
            extensions = {}
            for semantics in ['preferred', 'complete', 'set_stable', 'well_founded', 'ideal']:
                extensions[semantics] = compute_extensions(bipolar_aba, semantics)
            await self.send(text_data=json.dumps({
                'type': 'computed_extensions',
                'extensions': extensions
            }))
            return


        print("Unrecognised request type", request["type"])
        # except KeyError as e:
        #     await self.channel_layer.group_send(self.room_group_name, {'type': 'shutdown', 'reason': 'bug'})
        #     print(e)

    async def handle_waiting(self, action):
            match action["type"]:
                case 'changed_support_notion':
                    support_notion = action['support_notion']
                    self.room.support_notions[self.username] = support_notion
                    # Don't need to request fetch as participants will eventually fetch on state transition

    async def handle_argument_proposal(self, action):
        match action["type"]:
            case 'added_arguments':
                for argument in action["arguments"]:
                    self.room.pending_arguments.append(argument)
                self.room.waiting_for.remove(self.username)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'fetch'
                    }
                )

    async def handle_argument_validation(self, action):
        match action["type"]:
            case 'validated_arguments':
                # Enter these arguments into internal representation of graph...
                arguments_to_add = action['validated_arguments']
                for argument in arguments_to_add:
                    assumption = Symbol(argument)
                    self.room.aggregated_framework.assumptions.add(assumption)

    async def handle_relation_proposal(self, action):
        match action["type"]:
            case 'added_relations':

                # Add framework to pending frameworks
                cytoscape_json = action["cytoscape_json"]
                support_notion = lookup_support_notion[self.room.support_notions[self.username]]
                baf = cytoscape_to_baf(cytoscape_json, support_notion)
                bipolar_aba = baf_to_bipolar_aba(baf)
                self.room.pending_frameworks.append(bipolar_aba)

                # Mark user as submitted
                self.room.waiting_for.remove(self.username)
                # Let everyone else know that they have submitted
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'fetch'
                    }
                )


    async def send_to_user(self, event):
        message = event['message']
        user = event['user']
        print("Attempting to send to user", user)
        if user == self.username:  # Only send the message to the specified member
            print("Sending to user", user)
            await self.send(json.dumps(message))

    async def shutdown(self, event):
        await self.send(text_data=json.dumps(event))
        await self.close(code=1000)

    async def fetch(self, event):
        await self.send(text_data=json.dumps({
            'type': 'fetch_required',
        }))
