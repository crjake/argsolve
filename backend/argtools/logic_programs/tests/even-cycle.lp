assumption(a; b; c; d).
contraryOf(X, contrary(X)) :- assumption(X).

rule(contrary(b), a).
rule(contrary(c), b).
rule(contrary(d), c).
rule(contrary(a), d).

% preferred.
