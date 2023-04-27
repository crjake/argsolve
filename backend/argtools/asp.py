import clingo
import bipolar_aba
import os
from enum import Enum


class Semantics(Enum):
    ADMISSIBLE = 1
    PREFERRED = 2
    COMPLETE = 3
    SET_STABLE = 4
    WELL_FOUNDED = 5
    IDEAL = 6


def generate_symbol(symbol: bipolar_aba.Symbol) -> clingo.Symbol:
    if symbol.negated:
        return clingo.Function('contrary', [clingo.String(symbol.value)])
    else:
        return clingo.String(symbol.value)


def generate_symbols_from_framework(framework: bipolar_aba.BipolarABAFramework) -> list[clingo.Symbol]:
    # We need to convert the framework into the correct format (atomic formulaes: assumptions; rule, contraryOf)
    rule_symbols = []
    for rule in framework.rules:
        head_symbol = generate_symbol(rule.head)
        body_symbol = generate_symbol(rule.body)
        rule_symbol = clingo.Function('rule', [head_symbol, body_symbol])
        rule_symbols.append(rule_symbol)

    assumption_symbols = []
    for assumption in framework.assumptions:
        assumption_symbol = clingo.Function('assumption', [generate_symbol(assumption)])
        assumption_symbols.append(assumption_symbol)

    contrary_map_symbols = []
    for key, value in framework.contrary_map.mmap.items():
        input_symbol = generate_symbol(key)
        output_symbol = generate_symbol(value)
        contrary_map_symbol = clingo.Function('contraryOf', [input_symbol, output_symbol])
        contrary_map_symbols.append(contrary_map_symbol)

    symbols = rule_symbols + assumption_symbols + contrary_map_symbols
    return symbols


def compute_admissible_extensions(framework: bipolar_aba.BipolarABAFramework):
    pass


def clingo_solve(framework: bipolar_aba.BipolarABAFramework, semantics: str) -> list[list[str]]:
    package_dir = os.path.dirname(__file__) or '.'
    file_path = os.path.join(package_dir, 'logic_programs/bipolar_aba.lp')

    ctl = clingo.Control(arguments=["--models=0"])
    ctl.load(file_path)

    symbols: list[clingo.Symbol] = generate_symbols_from_framework(framework)

    for symbol in symbols:
        ctl.add('base', [], str(symbol) + '.')
    ctl.add('base', [], semantics + '.')

    ctl.ground([('base', [])])

    results: list[list[str]] = []
    with ctl.solve(yield_=True) as handle:
        for model in handle:
            result = []
            for symbol in model.symbols(shown=True):
                if symbol.name == "in":
                    for assumption in symbol.arguments:
                        result.append(assumption.string)
            results.append(sorted(result))

    return results




def compute_preferred_extensions(framework: bipolar_aba.BipolarABAFramework) -> list[list[str]]:
    # Redirect output to a null device
    results = clingo_solve(framework, 'preferred')
    return results


def compute_extensions(framework: bipolar_aba.BipolarABAFramework, semantics: Semantics) -> None:  # What's the return type?
    match semantics:
        case Semantics.ADMISSIBLE:
            compute_admissible_extensions(framework)
        case Semantics.PREFERRED:
            compute_preferred_extensions(framework)
        case _:
            raise ValueError(f"Unknown semantics: {semantics}")
