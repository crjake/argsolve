from api.aggregator.bipolar_aba import BipolarABAFramework, Symbol, Rule
from api.aggregator.baf import BipolarArgumentationFramework, SupportNotion, Argument

import json


def bipolar_aba_to_baf(framework: BipolarABAFramework, support_notion: SupportNotion) -> BipolarArgumentationFramework:
    arguments = set()
    for assumption in framework.assumptions:
        arguments.add(Argument(assumption.value))

    attacks = set()
    supports = set()

    for rule in framework.rules:
        head, body = rule.head, rule.body

        if head.negated:
            attacks.add((Argument(body.value), Argument(head.value)))
        else:
            supports.add(support_notion.from_rule(rule))

    return BipolarArgumentationFramework(arguments, attacks, supports, support_notion)


def baf_to_bipolar_aba(framework: BipolarArgumentationFramework) -> BipolarABAFramework:

    rules: set[Rule] = set()

    for attack in framework.attacks:
        source, target = attack
        rules.add(Rule(Symbol(target.description, True), Symbol(source.description)))

    for support in framework.supports:
        source, target = support
        rules.add(framework.support_notion.to_rule(source, target))

    assumptions: set[Symbol] = set()
    for argument in framework.arguments:
        assumptions.add(Symbol(argument.description))
        # assumptions.add(Symbol(argument.description, True))  # negated WE DON"T NEED TO ADD THIS

    return BipolarABAFramework(rules, assumptions)


# TODO Find out cytoscape
def baf_to_cytoscape(framework: BipolarArgumentationFramework) -> str:

    nodes: list[dict] = []
    for argument in framework.arguments:
        nodes.append({
            # 'group': 'nodes',
            'data': {
                'id': argument.description
            }
        })

    edges: list[dict] = []

    for attack in framework.attacks:
        arg1, arg2 = attack
        edges.append({
            # 'group': 'edges',
            'data': {
                'id': f'{arg1.description}_attacks_{arg2.description}',
                'source': arg1.description,
                'target': arg2.description,
                'type': 'attack',
            }
        })

    for support in framework.supports:
        arg1, arg2 = support
        edges.append({
            # 'group': 'edges',
            'data': {
                'id': f'{arg1.description}_supports_{arg2.description}',
                'source': arg1.description,
                'target': arg2.description,
                'type': 'support',
            }
        })

    return json.dumps({
        'nodes': nodes,
        'edges': edges,
    }, indent=4)


def cytoscape_to_baf(elements: dict, support_notion: SupportNotion) -> BipolarArgumentationFramework:
    arguments = set()
    supports = set()
    attacks = set()

    if 'edges' in elements:
        for edge in elements['edges']:
            source = edge['data']['source']
            target = edge['data']['target']
            match edge['data']['type']:
                case 'attack':
                    attacks.add((Argument(source), Argument(target)))
                case 'support':
                    supports.add((Argument(source), Argument(target)))

    for node in elements['nodes']:
        arguments.add(Argument(node['data']['id']))

    return BipolarArgumentationFramework(arguments, attacks, supports, support_notion)
