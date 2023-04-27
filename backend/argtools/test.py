from bipolar_aba import Symbol, ContraryMap, BipolarABAFramework, Rule
from asp import generate_symbols_from_framework, compute_preferred_extensions

a = Symbol("a")
n_a = Symbol("a", True)

b = Symbol("b")
n_b = Symbol("b", True)

c = Symbol("c")
n_c = Symbol("c", True)

d = Symbol("d")
n_d = Symbol("d", True)

e = Symbol("e")
n_e = Symbol("e", True)

assumptions = set([a, b, c, d, e])
contrary_map = ContraryMap({a: n_a, b: n_b, c: n_c, d:n_d, e:n_e})

rules = set([
    Rule(n_b, a),
    Rule(n_d, b),
    Rule(n_c, d),
    Rule(n_a, c),
    # Rule(c, e),
])

framework = BipolarABAFramework(rules, assumptions, contrary_map)

symbols = generate_symbols_from_framework(framework)
# output = ""
# for symbol in symbols:
# 	output += str(symbol) + '\n'
# print(output)

results = compute_preferred_extensions(framework)

for result in results:
    print('[ ' + ", ".join(result) + ' ]')
