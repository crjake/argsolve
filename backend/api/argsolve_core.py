from rest_framework import serializers
from api.aggregator.bipolar_aba import BipolarABAFramework, Symbol, QuotaRule
import math

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
        self.support_notions = {}

        self.aggregated_framework = BipolarABAFramework(set([]), set([Symbol(topic)]))

        # Argument Proposal and Validation
        self.pending_arguments = []
        self.waiting_for = []

        # Relation Proposal
        self.pending_frameworks = []

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
                self.pending_arguments = [] # Clear the list
            case "RELATION_PROPOSAL":
                self.waiting_for = []
                # Aggregate the pending frameworks
                self.aggregated_framework = QuotaRule.aggregate(math.ceil(len(self.users)/2), self.pending_frameworks)

        # Setup new state:
        match new_state:
            case "ARGUMENT_PROPOSAL":
                self.pending_arguments = []
                self.waiting_for = self.users.copy()
            case "ARGUMENT_VALIDATION":
                pass
            case "RELATION_PROPOSAL":
                self.pending_frameworks = []
                self.waiting_for = self.users.copy()


        self.state = new_state

    def add_user(self, username: str) -> None:
        self.users.add(username)
        self.support_notions[username] = 'deductive' # by default deductive support

    def remove_user(self, username: str) -> None:
        self.users.remove(username)
        del self.support_notions[username]



class RoomSerializer(serializers.Serializer):
    topic = serializers.CharField()
    host = serializers.CharField()
    id = serializers.IntegerField()
    state = serializers.CharField()
    users = serializers.ListField(child=serializers.CharField())

    pending_arguments = serializers.ListField(child=serializers.CharField())
    waiting_for = serializers.ListField(child=serializers.CharField())
