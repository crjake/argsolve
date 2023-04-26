% Definitions
deduces(B, H) :- rule(H, B), assumption(B). % The head may be a contrary
deduces(X, Z) :- deduces(X, Y), deduces(Y, Z).

attacks(X, Y) :- deduces(X, CY), contraryOf(Y, CY).

attacked(X) :- in(Y), attacks(Y, X). % An assumption is attacked if it is attacked by a member of the guessed extension

not_defended(X) :- attacks(Y, X), not attacked(Y). % Remember that 'attacked' means attacked by the guessed extension

% Guess
in(X) :- not out(X), assumption(X).
out(X) :- not in(X), assumption(X).

% Test
:- in(X), out(Y), deduces(X, Y). % Fail if not closed

:- in(X), in(Y), attacks(X, Y). % All semantics involve conflict-freeness at the least

:- in(X), not_defended(X). % Requirement for admissible


% Ordering
lt(X,Y) :- assumption(X),assumption(Y), X<Y.
nsucc(X,Z) :- lt(X,Y), lt(Y,Z).
succ(X,Y) :- lt(X,Y), not nsucc(X,Y).
ninf(X) :- lt(Y,X).
nsup(X) :- lt(X,Y).
inf(X) :- not ninf(X), assumption(X).
sup(X) :- not nsup(X), assumption(X).


% Magic sauce (saturation):
% for the currently guessed admissible extension (we know it's admissible because it's made it so far without failing the above tests)
% define a search space over all the supersets of the extension
inN(X) | outN(X) :- out(X).
inN(X) :- in(X).

% eq represents if the currently guessed superset is equal to the guessed admissible extension
eq_upto(Y) :- inf(Y), in(Y), inN(Y).
eq_upto(Y) :- inf(Y), out(Y), outN(Y).

eq_upto(Y) :- succ(Z,Y), in(Y), inN(Y), eq_upto(Z).
eq_upto(Y) :- succ(Z,Y), out(Y), outN(Y), eq_upto(Z).

eq :- sup(Y), eq_upto(Y).

% Find all the assumptions that are not attacked by the currently guessed superset
% We consider assumptions Y as potential attackers of X in order.
unattacked_upto(X,Y) :- inf(Y), outN(X), outN(Y). % If Y isn't in the guessed superset, then trivially X is unattacked wrt to Y
unattacked_upto(X,Y) :- inf(Y), outN(X), not attacks(Y,X). % If Y is in the guessed superset, but doesn't attack X, then it is unattacked wrt to Y again.

unattacked_upto(X,Y) :- succ(Z,Y), unattacked_upto(X,Z), outN(Y). % Same as above, but we iteratively consider other assumptions.
unattacked_upto(X,Y) :- succ(Z,Y), unattacked_upto(X,Z), not attacks(Y,X).

unattacked(X) :- sup(Y), unattacked_upto(X,Y). % We've reached the final assumption, and X is unattacked wrt to the final assumption.


% If the guessed superset doesn't meet the requirements of admissiblity, it gets spoiled.
% When a guess gets spoiled, it gets 'saturated' to the answer set which = inN(X), outN(X) for all X
% As :- not spoil. is a rule, any potential answer set J (if it exists) must contain spoil.
% But if we take the reduct with respect to spoil (at the least), we note that it's just the whole program except the :- not spoil. rule.
% In order for J to be an answer set (and therefore preferred), it must be one of the minimal models. For J to be one of the minimal models, we must
% at least have that spoil is in one of the minimal models. So if fail is not in the minimal model, J can't be an answer set. Since J is arbitrary, there are no answer sets in this scenario.
% If we find an admissible superset, we get that the minimal model is one without spoil.
% If there is no admissible superset, all answer sets will have spoil.
% Thus if the guessed extension is preferred, we will get an answer set (as all admissible supersets are spoiled because they are invalid)
% If it isn't preferred, it's because we got an answer set that wasn't spoiled, thus there was a minimal model without spoil.
% Thus it's a good thing if every superset is spoiled - it means we found a preferred set
spoil :- eq. % If we find that the superset is equal to the guessed set, we don't want to rule it out as non-preferred, because that superset is the guessed set.
spoil :- inN(X), inN(Y), attacks(X,Y). % conflict-freeness
spoil :- inN(X), outN(Y), deduces(X, Y). % closedness
spoil :- inN(X), outN(Y), attacks(Y, X), unattacked(Y). % member is not defended

% If spoiled, saturate
inN(X) :- spoil, assumption(X).
outN(X) :- spoil, assumption(X).

% Required for the saturation technique (see explanation above).
:- not spoil.
