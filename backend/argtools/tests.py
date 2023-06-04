import unittest

from .bipolar_aba import Symbol, ContraryMap, BipolarABAFramework, Rule
from .baf import Argument, DeductiveSupport, NecessarySupport, BipolarArgumentationFramework
from .asp import compute_extensions
from . import converters


class TestSymbolOrdering(unittest.TestCase):

    def test_less_than(self):
        a = Symbol("a")
        c_a = Symbol("a", True)
        b = Symbol("b")

        self.assertTrue(a < b)
        self.assertFalse(b < a)
        self.assertTrue(a < c_a)
        self.assertTrue(a < c_a)
        self.assertFalse(c_a < a)


class TestConversionMethods(unittest.TestCase):

    def test_bipolar_aba_to_baf(self):
        a = Symbol("a")
        n_a = Symbol("a", True)

        b = Symbol("b")
        n_b = Symbol("b", True)

        c = Symbol("c")
        n_c = Symbol("c", True)

        assumptions = set([a, b, c])
        contrary_map = ContraryMap({a: n_a, b: n_b, c: n_c})

        r1 = Rule(n_a, b)
        r2 = Rule(b, c)
        r3 = Rule(n_c, a)
        framework = BipolarABAFramework(set([r1, r2, r3]), assumptions, contrary_map)

        ##############################
        converted_framework = converters.bipolar_aba_to_baf(framework, DeductiveSupport())

        a1 = (Argument('b'), Argument('a'))
        a2 = (Argument('a'), Argument('c'))
        s1 = (Argument('c'), Argument('b'))

        self.assertTrue(a1 in converted_framework.attacks)
        self.assertTrue(a2 in converted_framework.attacks)
        self.assertTrue(s1 in converted_framework.supports)

        ##############################
        converted_framework = converters.bipolar_aba_to_baf(framework, NecessarySupport())

        a1 = (Argument('b'), Argument('a'))
        a2 = (Argument('a'), Argument('c'))
        s1 = (Argument('b'), Argument('c'))

        self.assertTrue(a1 in converted_framework.attacks)
        self.assertTrue(a2 in converted_framework.attacks)
        self.assertTrue(s1 in converted_framework.supports)

    def test_baf_to_bipolar_aba(self):
        a = Argument('Cars should be banned')
        b = Argument('Cars pollute the environment')
        c = Argument('Banning cars hurts people with accessibility issues')

        a1 = (c, a)
        s1 = (b, a)

        framework = BipolarArgumentationFramework(set([a, b, c]), set([a1]), set([s1]), DeductiveSupport())
        # print(framework)
        converted_framework = converters.baf_to_bipolar_aba(framework)
        # print(converted_framework)

    def test_baf_to_json(self):
        a = Argument('Cars should be banned')
        b = Argument('Cars pollute the environment')
        c = Argument('Banning cars hurts people with accessibility issues')

        a1 = (c, a)
        s1 = (b, a)

        framework = BipolarArgumentationFramework(set([a, b, c]), set([a1]), set([s1]), DeductiveSupport())
        json = converters.baf_to_cytoscape(framework)
        # print(json)


class TestExtensionFinder(unittest.TestCase):

    def assertExpectedExtensions(self, expected: list[list[str]], actual: list[list[str]]) -> None:
        expected_sets = [frozenset(extension) for extension in expected]
        actual_sets = [frozenset(extension) for extension in actual]
        self.assertTrue(
            set(expected_sets) == set(actual_sets),
            msg=f'expected: {sorted(expected)} actual: {sorted(actual)}')

    def test_odd_cycle(self):
        A = Argument("A")
        B = Argument("B")
        C = Argument("C")

        attacks = set([
            (A, B),
            (B, C),
            (C, A),
        ])

        framework = BipolarArgumentationFramework(set([A, B, C]), attacks, set(), DeductiveSupport())
        bipolar_aba = converters.baf_to_bipolar_aba(framework)

        self.assertTrue(compute_extensions(bipolar_aba, 'admissible') == [])
        self.assertTrue(compute_extensions(bipolar_aba, 'preferred') == [])
        self.assertTrue(compute_extensions(bipolar_aba, 'complete') == [])
        self.assertTrue(compute_extensions(bipolar_aba, 'set_stable') == [])
        self.assertTrue(compute_extensions(bipolar_aba, 'well_founded') == [])
        self.assertTrue(compute_extensions(bipolar_aba, 'ideal') == [])

    def test_1(self):
        A = Argument("A")
        B = Argument("B")
        C = Argument("C")
        arguments = set([A, B, C])

        attacks = set([
            (A, C),
            (C, B),
        ])

        supports = set([
            (A, B),
        ])

        framework = BipolarArgumentationFramework(arguments, attacks, supports, DeductiveSupport())
        converted_framework = converters.baf_to_bipolar_aba(framework)

        self.assertExpectedExtensions([['A', 'B'], ['C']], compute_extensions(converted_framework, 'admissible'))
        self.assertExpectedExtensions([['A', 'B'], ['C']], compute_extensions(converted_framework, 'preferred'))
        self.assertExpectedExtensions([['A', 'B'], ['C']], compute_extensions(converted_framework, 'complete'))
        self.assertExpectedExtensions([['A', 'B'], ['C']], compute_extensions(converted_framework, 'set_stable'))
        self.assertExpectedExtensions([], compute_extensions(converted_framework, 'well_founded'))
        self.assertExpectedExtensions([], compute_extensions(converted_framework, 'ideal'))

    def test_2(self):
        # Like remote vs hybrid with a slight twist
        A = Argument("A")
        B = Argument("B")
        C = Argument("C")
        D = Argument("D")
        E = Argument("E")
        arguments = set([A, B, C, D, E])

        attacks = set([
            (A, B),
            (B, A),
            (A, C),
            (B, C),
            (C, D),
            (D, C),
            (C, E),
            (E, C),
        ])

        supports = set([
        ])

        framework = BipolarArgumentationFramework(arguments, attacks, supports, DeductiveSupport())
        converted_framework = converters.baf_to_bipolar_aba(framework)

        self.assertExpectedExtensions([['A', 'D', 'E'], ['B', 'D', 'E']],
                                      compute_extensions(converted_framework, 'preferred'))
        self.assertExpectedExtensions([['A', 'D', 'E'], ['B', 'D', 'E'], ['D', 'E']],
                                      compute_extensions(converted_framework, 'complete'))
        self.assertExpectedExtensions([['A', 'D', 'E'], ['B', 'D', 'E']],
                                      compute_extensions(converted_framework, 'set_stable'))
        self.assertExpectedExtensions([['D', 'E']], compute_extensions(converted_framework, 'well_founded'))
        self.assertExpectedExtensions([['D', 'E']], compute_extensions(converted_framework, 'ideal'))


if __name__ == '__main__':
    unittest.main()
