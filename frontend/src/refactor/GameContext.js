import { createContext } from 'react';

export const GameStage = Object.freeze({
  ERROR: 'ERROR',
  WAITING: 'WAITING',
  ASSUMPTION_PROPOSAL: 'ASSUMPTION_PROPOSAL',
  ASSUMPTION_VALIDATION: 'ASSUMPTION_VALIDATION',
  RULE_PROPOSAL: 'RULE_PROPOSAL',
  RE_ITERATION_PROMPT: 'RE_ITERATION_PROMPT',
  SUMMARY: 'SUMMARY',
  ABANDONED: 'ABANDONED',
});

export const GameStateContext = createContext(null);
export const GameStateDispatchContext = createContext(null);
export const ActionHandlerContext = createContext(null);
