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
    def __init__(self, topic: str, host: str, room_id: int) -> None:
        self.topic = topic
        self.host = host
        self.room_id = room_id


class RoomSerializer(serializers.Serializer):
    topic = serializers.CharField()
    host = serializers.CharField()
    room_id = serializers.IntegerField()
