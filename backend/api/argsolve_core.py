from rest_framework import serializers


class ArgSolve:

    def __init__(self) -> None:
        self.users = []
        self.next_unused_room_id = 0
        self.rooms = {}

    def create_user(self, username) -> None:
        self.users.append(username)

    def create_room(self, topic, host) -> int:
        room_id = self.next_unused_room_id
        self.rooms[room_id] = Room(topic, host, room_id)
        self.next_unused_room_id += 1
        return room_id


class Room:
    state_transitions = {
        "WAITING": {"START": "ASSUMPTION_PROPOSAL"},
        "ASSUMPTION_PROPOSAL": {"NEXT": "ASSUMPTION_VALIDATION"},
        "ASSUMPTION_VALIDATION": {"NEXT": "RULE_PROPOSAL"},
        "RULE_PROPOSAL": {"NEXT": "RE_ITERATION_PROMPT"},
        "RE_ITERATION_PROMPT": {"END": "SUMMARY", "RESTART": "ASSUMPTION_PROPOSAL"},
    }

    def __init__(self, topic: str, host: str, id: int) -> None:
        self.topic = topic
        self.host = host
        self.id = id
        self.state = "WAITING"


class RoomSerializer(serializers.Serializer):
    topic = serializers.CharField()
    host = serializers.CharField()
    id = serializers.IntegerField()
