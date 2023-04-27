assumption(f; g; d).
contraryOf(X, contrary(X)) :- assumption(X).

rule(contrary(d), g).
rule(contrary(f), d).
rule(f, g).

% admissible: [g, f], [d]
% admissible.

% preferred: [g, f], [d]
preferred.

% complete: [g, f], [d]
% complete.

% set-stable: [g, f], [d]
% set_stable.

