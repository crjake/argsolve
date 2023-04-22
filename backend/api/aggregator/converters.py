from bipolar_aba import BipolarABAFramework, Symbol, Rule
from baf import BipolarArgumentationFramework, SupportNotion, Argument

import json


def bipolar_aba_to_baf(framework: BipolarABAFramework, support_notion: SupportNotion) -> BipolarArgumentationFramework:
    arguments = framework.assumptions
    attacks = set()
    supports = set()

    for rule in framework.rules:
        head, body = rule.head, rule.body

        if head.negated:
            attacks.add((Argument(body.value), Argument(head.value)))
        else:
            supports.add(support_notion.from_rule(rule))

    return BipolarArgumentationFramework(arguments, attacks, supports, support_notion)


def baf_to_bipolar_aba(framework: BipolarArgumentationFramework, support_notion: SupportNotion) -> BipolarABAFramework:

    rules: set[Rule] = set()

    for attack in framework.attacks:
        source, target = attack
        rules.add(Rule(Symbol(target.description, True), Symbol(source.description)))

    for support in framework.supports:
        source, target = support
        rules.add(support_notion.to_rule(source, target))

    assumptions: set[Symbol] = set()
    for argument in framework.arguments:
        assumptions.add(Symbol(argument.description))
        assumptions.add(Symbol(argument.description, True))  # negated

    return BipolarABAFramework(rules, assumptions)


# TODO Find out cytoscape
def baf_to_json(framework: BipolarArgumentationFramework) -> str:

    nodes: list[dict] = []
    for argument in framework.arguments:
        nodes.append({
            'group': 'nodes',
            'data': {
                'id': argument.description
            }
        })

    edges: list[dict] = []

    for attack in framework.attacks:
        arg1, arg2 = attack
        edges.append({
            'group': 'edges',
            'data': {
                id: f'{arg1.description}${arg2.description}',
                'source': arg1.description,
                'target': arg2.description,
                'type': 'attack,'
            }
        })

    for support in framework.supports:
        arg1, arg2 = support
        edges.append({
            'group': 'edges',
            'data': {
                id: f'{arg1.description}${arg2.description}',
                'source': arg1.description,
                'target': arg2.description,
                'type': 'support,'
            }
        })

    # elements key of cy dictionary
    return json.dumps([
        *nodes,
        *edges,
    ])


def json_to_baf(json: str, support_notion: SupportNotion) -> BipolarArgumentationFramework:
    arguments = set()
    supports = set()
    attacks = set()

    elements = json.loads(json)
    for element in elements:
        match element['group']:
            case 'nodes':
                arguments.add(Argument(element['data']['id']))
            case 'edges':
                source = element['data']['source']
                target = element['data']['target']
                match element['data']['type']:
                    case 'attack':
                        attacks.add((Argument(source), Argument(target)))
                    case 'support':
                        supports.add((Argument(source), Argument(target)))
    return BipolarArgumentationFramework(arguments, attacks, supports, support_notion)
