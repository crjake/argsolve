import { createContext } from 'react';

export const GameState = Object.freeze({
  ERROR: 'ERROR',
  WAITING: 'WAITING',
  ARGUMENT_PROPOSAL: 'ARGUMENT_PROPOSAL',
  ARGUMENT_VALIDATION: 'ARGUMENT_VALIDATION',
  RELATION_PROPOSAL: 'RELATION_PROPOSAL',
  RE_ITERATION_PROMPT: 'RE_ITERATION_PROMPT',
  SUMMARY: 'SUMMARY',
  ABANDONED: 'ABANDONED',
});

export const GameContext = createContext(null);
export const GameStateDispatchContext = createContext(null);
export const ActionHandlerContext = createContext(null);
export const WebSocketStateContext = createContext(null);
