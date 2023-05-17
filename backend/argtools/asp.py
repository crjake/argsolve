import os

from . import bipolar_aba
import clingo


def generate_symbol(symbol: bipolar_aba.Symbol) -> clingo.Symbol:
    if symbol.negated:
        return clingo.Function('contrary', [clingo.String(symbol.value)])
    else:
        return clingo.String(symbol.value)


def generate_symbols_from_framework(framework: bipolar_aba.BipolarABAFramework) -> list[clingo.Symbol]:
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


def intersection(*d):
    return set(d[0]).intersection(*d)


def compute_well_founded_extension(framework: bipolar_aba.BipolarABAFramework) -> list[str] | None:
    complete_extensions = compute_extensions(framework, 'complete')
    if not complete_extensions:
        return None
    # We can assume there is at least one complete extension:
    return list(intersection(*complete_extensions))  # unique so just return one


def compute_ideal_extension(framework: bipolar_aba.BipolarABAFramework) -> list[str] | None:
    preferred_extensions = compute_extensions(framework, 'preferred')
    if not preferred_extensions:
        return None
    candidate = intersection(*preferred_extensions)  # intersection is unique, so there is just one candidate

    admissible_extensions = compute_extensions(framework, 'admissible')
    candidate_is_admissible = False
    for extension in admissible_extensions:
        if set(candidate) == set(extension):
            candidate_is_admissible = True
            break

    return list(candidate) if candidate_is_admissible else []

def compute_ideal_extension_new(framework: bipolar_aba.BipolarABAFramework) -> list[str] | None:
    preferred_extensions = compute_extensions(framework, 'preferred')
    if not preferred_extensions:
        return None
    candidate = intersection(*preferred_extensions)  # intersection is unique, so there is just one candidate

    #######
    package_dir = os.path.dirname(__file__) or '.'
    file_path = os.path.join(package_dir, 'logic_programs/ideal.lp')

    ctl = clingo.Control(arguments=["--models=0"])
    ctl.load(file_path)

    symbols: list[clingo.Symbol] = generate_symbols_from_framework(framework)

    for symbol in symbols:
        ctl.add('base', [], str(symbol) + '.')

    for assumption in candidate:
        choice_symbol = clingo.Function('choice', [clingo.String(assumption)])
        ctl.add('base', [], str(choice_symbol) + '.')

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
    #######

    # Actually, should have at most one result as ideal is unique
    return results[0] if results else None


def compute_extensions(framework: bipolar_aba.BipolarABAFramework, semantics: str) -> list[list[str]]:
    match semantics:
        case 'admissible' | 'preferred' | 'complete' | 'set_stable':
            return clingo_solve(framework, semantics)
        case 'well_founded':
            well_founded_extension = compute_well_founded_extension(framework)
            if well_founded_extension:
                return [well_founded_extension]
            else:
                return []
        case 'ideal':
            ideal_extension = compute_ideal_extension_new(framework)
            if ideal_extension:
                return [ideal_extension]
            else:
                return []
        case _:
            raise ValueError(f"Unknown semantics: {semantics}")
