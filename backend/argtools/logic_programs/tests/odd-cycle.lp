assumption(a; b; c).
contraryOf(X, contrary(X)) :- assumption(X).

rule(contrary(b), a).
rule(contrary(c), b).
rule(contrary(a), c).

% Should be no extensions.
