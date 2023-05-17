% Definitions
deduces(B, H) :- rule(H, B), assumption(B).
deduces(X, Z) :- deduces(X, Y), deduces(Y, Z).

attacks(X, Y) :- deduces(X, CY), contraryOf(Y, CY).

defeats(Y, X) :- attacks(Y, X).
defeats(Y, X) :- deduces(X, Z), attacks(Y, Z).
defeated(X) :- defeats(Y, X), in(Y).

not_defended(X) :- attacks(Y, X), not defeated(Y).

% Guess a subset of the intersection of the preferred extensions
in(X) :- not out(X), choice(X).
out(X) :- not in(X), assumption(X).

% Test for admissibility
:- in(X), out(Y), deduces(X, Y).
:- in(X), in(Y), attacks(X, Y).
:- in(X), not_defended(X).

% Ordering
lt(X,Y) :- assumption(X), assumption(Y), X < Y.
nsucc(X,Z) :- lt(X,Y), lt(Y,Z).
succ(X,Y) :- lt(X,Y), not nsucc(X,Y).
ninf(X) :- lt(Y,X).
nsup(X) :- lt(X,Y).
inf(X) :- not ninf(X), assumption(X).
sup(X) :- not nsup(X), assumption(X).

% Check that the guess is subset-maximal
inN(X) | outN(X) :- out(X), choice(X).
outN(X) :- out(X), not choice(X).
inN(X) :- in(X).

eq_upto(Y) :- inf(Y), in(Y), inN(Y).
eq_upto(Y) :- inf(Y), out(Y), outN(Y).
eq_upto(Y) :- succ(Z,Y), in(Y), inN(Y), eq_upto(Z).
eq_upto(Y) :- succ(Z,Y), out(Y), outN(Y), eq_upto(Z).
eq :- sup(Y), eq_upto(Y).

undefeated_upto(X,Y) :- inf(Y), outN(X), outN(Y).
undefeated_upto(X,Y) :- inf(Y), outN(X), not defeats(Y,X).
undefeated_upto(X,Y) :- succ(Z,Y), undefeated_upto(X,Z), outN(Y).
undefeated_upto(X,Y) :- succ(Z,Y), undefeated_upto(X,Z), not defeats(Y, X).
undefeated(X) :- sup(Y), undefeated_upto(X,Y).

spoil :- eq.
spoil :- inN(X), inN(Y), attacks(X,Y).
spoil :- inN(X), outN(Y), deduces(X, Y).
spoil :- inN(X), outN(Y), attacks(Y, X), undefeated(Y).

inN(X) :- spoil, assumption(X).
outN(X) :- spoil, assumption(X).

:- not spoil.

