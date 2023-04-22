from bipolar_aba import Rule, Symbol


class Argument:
    def __init__(self, description: str) -> None:
        self.description = description

    def __eq__(self, obj):
        return self.description == obj.description

    def __key(self):
        return self.description

    def __hash__(self):
        return hash(self.__key())


class SupportNotion:
    pass


class DeductiveSupport(SupportNotion):

    def to_rule(self, source: Argument, target: Argument) -> Rule:
        # S => T : T <- S
        return Rule(Symbol(target.description), Symbol(source.description))

    def from_rule(self, rule: Rule) -> tuple[Argument, Argument]:
        if rule.head.negated:
            raise ValueError("Expecting a support for rule", rule)
        # head <- body : body => head
        return (Argument(rule.body.value), Argument(rule.head.value))


class NecessarySupport(SupportNotion):

    def to_rule(self, source: Argument, target: Argument) -> Rule:
        # S => T : S <- T
        return Rule(Symbol(source.description), Symbol(target.description))

    def from_rule(self, rule: Rule) -> tuple[Argument, Argument]:
        if rule.head.negated:
            raise ValueError("Expecting a support for rule", rule)
        # head <- body : head => body
        return (Argument(rule.head.value), Argument(rule.body.value))


class BipolarArgumentationFramework:

    def __init__(self, arguments: set[Argument],
                 attacks: set[tuple[Argument, Argument]],
                 supports: set[tuple[Argument, Argument]],
                 support_notion: SupportNotion):
        self.arguments = arguments
        self.supports = supports
        self.attacks = attacks
        self.support_notion = support_notion
