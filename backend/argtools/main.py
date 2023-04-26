from utils import Symbol, Rule, ContraryMap, Framework, QuotaRule

def print_framework(f: Framework):
	print(str(f))
	print("")

# a = Symbol("a")
# n_a = Symbol("a", True)
# b = Symbol("b")
# n_b = Symbol("b", True)
# c = Symbol("c")
# n_c = Symbol("c", True)

# assumptions = set([a, b, c])
# contrary_map = ContraryMap({a: n_a, b: n_b, c: n_c})

# # F1
# r1 = Rule(n_a, b)
# f1 = Framework(set([r1]), assumptions, contrary_map)
# # print(str(f1) + "\n")
# print_framework(f1)

# # F2
# r2 = Rule(b, c)
# f2 = Framework(set([r2]), assumptions, contrary_map)
# # print(str(f2) + "\n")
# print_framework(f2)

# f = QuotaRule.aggregate(1, [f1, f2])
# # print(f)
# print_framework(f)

# ff = QuotaRule.aggregate(1, [f1, f1])
# print_framework(ff)

# Example 1
A = Symbol("A")
n_A = Symbol("A", True)
B = Symbol("B")
C = Symbol("C")
D = Symbol("D")

R_1 = Rule(n_A, B)

R_2 = Rule(A, C)

R_3a = Rule(n_A, B)
R_3b = Rule(A, D)

Assumptions = set([A, B, C, D])
f1 = Framework(set([R_1]), Assumptions)
f2 = Framework(set([R_2]), Assumptions)
f3 = Framework(set([R_3a, R_3b]), Assumptions)

F = QuotaRule.aggregate(3, [f1, f2, f3])
print_framework(F)
