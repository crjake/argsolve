% Data
% assumption(a; b; c; d; e).
% contraryOf(X, contrary(X)) :- assumption(X). % For simplicity, we say that the contrary of each assumption is a specially designated one

% rule(contrary(a), b).
% rule(contrary(c), a).
% rule(contrary(d), c).
% rule(contrary(b), d).
% rule(e, c).
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% assumption(f; g; d).
% contraryOf(X, contrary(X)) :- assumption(X). % For simplicity, we say that the contrary of each assumption is a specially designated one

% rule(contrary(f), d).
% rule(contrary(d), g).
% rule(g, f).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
assumption(f; g; d).
contraryOf(X, contrary(X)) :- assumption(X). % For simplicity, we say that the contrary of each assumption is a specially designated one

rule(contrary(d), g).
rule(contrary(f), d).
rule(f, g).
