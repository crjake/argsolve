# interpret type hints as strings so that we can forward reference, e.g. Set[Symbol] mentioned here before Symbol is defined
from __future__ import annotations

import functools
import json
from abc import ABC, abstractmethod
from functools import total_ordering
from itertools import combinations
from typing import Any, Dict, List, Set


class Aggregator(ABC):

    @staticmethod
    @abstractmethod
    def aggregate(frameworks: List[BipolarABAFramework]) -> BipolarABAFramework:
        pass


class QuotaRule(Aggregator):

    @staticmethod
    def aggregate(q: int, frameworks: List[BipolarABAFramework]) -> BipolarABAFramework:
        # pre-condition: each framework has the same language, assumptions and contrary map

        N = len(frameworks)
        assert 1 <= q and q <= N

        rules: List[Set[Rule]] = [f.rules for f in frameworks]

        aggregate_rules: Set[Rule] = set()
        for i in range(q, N):
            for agent_rules_combination in combinations(rules, i):
                aggregate_rules = aggregate_rules.union(intersection(*agent_rules_combination))

        arbitrary_framework = frameworks[0]
        return BipolarABAFramework(aggregate_rules, arbitrary_framework.assumptions, arbitrary_framework.contrary_map,
                                   arbitrary_framework.language)


class BipolarABAFramework:
    def __init__(
            self, rules: Set[Rule],
            assumptions: Set[Symbol],
            contrary_map: ContraryMap = None, language: Set[Symbol] = None) -> None:
        if not assumptions:
            raise ValueError("There were no assumptions given")

        if not contrary_map:
            temporary_map = {}
            for symbol in assumptions:
                temporary_map[symbol] = Symbol(symbol.value, negated=True)
            contrary_map = ContraryMap(temporary_map)

        if not language:
            # infer the language from the contrary map (which is a total map, so it contains all assumptions)
            # language = self.
            language = set()
            for symbol in list(contrary_map.mmap.keys()) + list(contrary_map.mmap.values()):
                language.add(symbol)

        if not contrary_map.is_valid(assumptions, language):
            raise ValueError("Contrary map, assumptions and language are not consistent")

        for symbol in assumptions:
            if symbol not in language:
                raise ValueError("Assumptions must be a subset of the language")

        for rule in rules:
            if not rule.is_valid(assumptions, contrary_map):
                raise ValueError("The rules, assumptions and contrary map are not consistent")

        self.language: Set[Symbol] = language
        self.rules: Set[Rule] = rules
        self.assumptions: Set[Symbol] = assumptions
        self.contrary_map: ContraryMap = contrary_map

    class Encoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, set):
                return list(obj)

            if isinstance(obj, Symbol):
                return str(obj)

            if isinstance(obj, Rule):
                return str(obj)

            if isinstance(obj, ContraryMap):
                return str(obj)

            return json.JSONEncoder.default(self, obj)

    def __str__(self):
        return f"L = {str_set(self.language)}\n" \
            + f"R = {str_set(self.rules)}\n" \
            + f"A = {str_set(self.assumptions)}\n" \
            + f"- = {str(self.contrary_map)}"

    def old__str__(self):
        temporary_dict = {
            "L": self.language,
            "R": self.rules,
            "A": self.assumptions,
            "-": self.contrary_map,
        }
        return json.dumps(temporary_dict, indent=4, cls=BipolarABAFramework.Encoder)

    def __repr__(self) -> str:
        return self.__str__()


class Rule:
    def __init__(self, head: Symbol, body: Symbol):
        if not head or not body:
            raise ValueError("Invalid rule")
        self.head = head
        self.body = body

    def is_valid(self, assumptions: Set[Symbol], contrary_map: ContraryMap) -> bool:
        return (self.head in assumptions or self.head in contrary_map.mmap.values()) and self.body in assumptions

    def __str__(self) -> str:
        return str(self.head) + " ← " + str(self.body)

    def __eq__(self, obj):
        return self.head == obj.head and self.body == obj.body

    def __key(self):
        return (self.head, self.body)

    def __hash__(self):
        return hash(self.__key())

    def __repr__(self) -> str:
        return self.__str__()


@total_ordering
class Symbol:
    def __init__(self, value, negated: bool = False) -> None:
        self.value = value
        self.negated = negated

    def get_literal_negation(self):
        return Symbol(self.value, not self.negated)

    def __str__(self) -> str:
        if self.negated:
            return "~" + self.value
        else:
            return self.value

    def __lt__(self, obj):
        # aa | ab | ~aa | a~a
        if self == obj:
            return False

        # ab | ~aa | a~a
        if self.value != obj.value:
            return self.value < obj.value

        # ~aa | a~a
        return obj.negated

    def __gt__(self, obj):
        return not (self.__lt__(obj)) and self != obj

    def __le__(self, obj):
        return self < obj or self == obj

    def __ge__(self, obj):
        return self > obj or self == obj

    def __eq__(self, obj):
        return self.negated == obj.negated and self.value == obj.value

    def __key(self):
        return (self.value, self.negated)

    def __hash__(self):
        return hash(self.__key())

    def __repr__(self) -> str:
        return self.__str__()


class ContraryMap:
    def __init__(self, mmap: Dict[Symbol, Symbol]) -> None:
        self.mmap = mmap

    def is_valid(self, assumptions: Set[Symbol], language: Set[Symbol]) -> bool:
        for symbol in assumptions:
            if symbol not in self.mmap:
                return False

        for key, value in self.mmap.items():
            if key not in language or value not in language:
                return False

        return True

    def __str__(self) -> str:
        result = "["
        sep = ""
        for assumption, contrary in self.mmap.items():
            result += sep + str(assumption) + ": " + str(contrary)
            sep = ", "
        return result + "]"

    def __repr__(self) -> str:
        return self.__str__()

    def old__str__(self) -> str:
        temporary_dictionary = {}
        for key, value in self.mmap.items():
            temporary_dictionary[str(key)] = value
        return json.dumps(temporary_dictionary, cls=BipolarABAFramework.Encoder)

############### Utils ###############


def intersection(*d):
    return set(d[0]).intersection(*d)


def is_sortable(obj):
    cls = obj.__class__
    return cls.__lt__ != object.__lt__ or \
        cls.__gt__ != object.__gt__


def str_set(set: Set) -> str:
    temporary_list = list(set)
    if temporary_list:
        arbitrary_item = temporary_list[0]
        if is_sortable(arbitrary_item):
            temporary_list.sort()
    result = '['
    sep = ''
    for item in temporary_list:
        result += sep + str(item)
        sep = ", "
    return result + "]"
