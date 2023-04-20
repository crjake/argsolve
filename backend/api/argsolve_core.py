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
        "WAITING": {"START": "ARGUMENT_PROPOSAL"},
        "ARGUMENT_PROPOSAL": {"NEXT": "ARGUMENT_VALIDATION"},
        "ARGUMENT_VALIDATION": {"NEXT": "RELATION_PROPOSAL"},
        "RELATION_PROPOSAL": {"NEXT": "RE_ITERATION_PROMPT"},
        "RE_ITERATION_PROMPT": {"END": "SUMMARY", "RESTART": "ARGUMENT_PROPOSAL"},
    }

    def __init__(self, topic: str, host: str, id: int) -> None:
        self.topic = topic
        self.host = host
        self.id = id
        self.state = "WAITING"
        self.users = set([])

        # Argument Proposal and Validation
        self.pending_arguments = []
        self.waiting_for = []

        # Relation Proposal
        self.pending_relations = []

    def transition(self, command: str) -> None:
        if self.state not in self.state_transitions:
            # Console.log that there is no transition??
            return

        transitions = self.state_transitions[self.state]
        new_state = transitions.get(command, None)
        if not new_state:
            raise ValueError("Invalid transition command", command)

        #  Clean up after leaving state:
        match self.state:
            case "ARGUMENT_PROPOSAL":
                self.waiting_for = []
            case "ARGUMENT_VALIDATION":
                # Add pending arguments to graph here?
                self.pending_arguments = [] # Clear the list
            case "RELATION_PROPOSAL":
                pass

        # Setup new state:
        match new_state:
            case "ARGUMENT_PROPOSAL":
                self.pending_arguments = []
                self.waiting_for = self.users
            case "ARGUMENT_VALIDATION":
                pass
            case "RELATION_PROPOSAL":
                pass


        self.state = new_state


class RoomSerializer(serializers.Serializer):
    topic = serializers.CharField()
    host = serializers.CharField()
    id = serializers.IntegerField()
    state = serializers.CharField()
    users = serializers.ListField(child=serializers.CharField())

    pending_arguments = serializers.ListField(child=serializers.CharField())
    waiting_for = serializers.ListField(child=serializers.CharField())

