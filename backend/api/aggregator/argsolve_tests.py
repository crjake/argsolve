import unittest

from bipolar_aba import Symbol, ContraryMap, BipolarABAFramework, Rule
from baf import Argument, DeductiveSupport, NecessarySupport, BipolarArgumentationFramework
import converters


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



if __name__ == '__main__':
    unittest.main()