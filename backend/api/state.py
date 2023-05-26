from rest_framework import serializers
from argtools.bipolar_aba import BipolarABAFramework, Symbol, QuotaRule, OligarchicRule
from argtools.baf import lookup_support_notion
from argtools.converters import cytoscape_to_baf, baf_to_bipolar_aba
import math
import json

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
        "RELATION_PROPOSAL": {"NEXT": "PROCEDURE_SELECTION"},
        "PROCEDURE_SELECTION": {"NEXT": "RE_ITERATION_PROMPT"},
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

        self.aggregation_procedure = None

        # Argument Proposal and Validation
        self.pending_arguments = []
        self.waiting_for = []
        self.argument_pool = {}

        # Relation Proposal
        self.pending_frameworks = {}

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
                self.argument_pool = {}
            case "ARGUMENT_VALIDATION":
                self.pending_arguments = [] # Clear the list
            case "RELATION_PROPOSAL":
                self.waiting_for = []
            case "PROCEDURE_SELECTION":
                pass

        # Setup new state:
        match new_state:
            case "ARGUMENT_PROPOSAL":
                self.pending_arguments = []
                self.waiting_for = self.users.copy()
                self.argument_pool = {}
            case "ARGUMENT_VALIDATION":
                pass
            case "RELATION_PROPOSAL":
                self.pending_frameworks = {}
                self.waiting_for = self.users.copy()


        self.state = new_state

    def aggregate_frameworks(self):
        # Aggregate the pending frameworks
        if not self.aggregation_procedure:
            print("Something is wrong - there was no aggregation procedure set")
        else:
            match self.aggregation_procedure["type"]:
                case 'quota':
                    quota = self.aggregation_procedure["quota"]
                    assert 1 <= quota and quota <= len(self.users)
                    self.aggregated_framework = QuotaRule.aggregate(quota, list(self.pending_frameworks.values()))
                case 'oligarchy':
                    selected_users: dict[str, bool] = self.aggregation_procedure["selected_users"]
                    if not any([has_veto_powers for _, has_veto_powers in selected_users.items()]):
                        print("There were no oligarchs!")
                    else:
                        oligarchic_frameworks = []
                        for user, framework in self.pending_frameworks.items():
                            if selected_users[user]:
                                oligarchic_frameworks.append(framework)
                        self.aggregated_framework = OligarchicRule.aggregate(oligarchic_frameworks)
                case _:
                    print("Unrecognised aggregation procedure", self.aggregation_procedure["type"])

    def add_user(self, username: str) -> None:
        self.users.add(username)
        self.support_notions[username] = 'deductive' # by default deductive support

    def remove_user(self, username: str) -> None:
        self.users.remove(username)
        del self.support_notions[username]

    def set_framework(self, data: str) -> bool: # success flag
        try:
            baf = cytoscape_to_baf(data["elements"], lookup_support_notion[data["supportNotion"]])
            bipolar_aba = baf_to_bipolar_aba(baf)
            self.aggregated_framework = bipolar_aba
            self.topic = data["topic"]
            return True
        except KeyError:
            return False



class RoomSerializer(serializers.Serializer):
    topic = serializers.CharField()
    host = serializers.CharField()
    id = serializers.IntegerField()
    state = serializers.CharField()
    users = serializers.ListField(child=serializers.CharField())

    pending_arguments = serializers.ListField(child=serializers.CharField())
    waiting_for = serializers.ListField(child=serializers.CharField())
