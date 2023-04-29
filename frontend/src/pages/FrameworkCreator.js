import { Frame } from '../components/Frame';
import PlaygroundGraphView from '../components/PlaygroundGraphView';
import { ArgumentViewPanel } from '../game/stages/components/ArgumentViewPanel';
import { useContext, useReducer, useRef } from 'react';
import { produce } from 'immer';

const FrameworkCreator = () => {
  return (
    <Frame>
      <p className="text-2xl mb-4 border-b-2 mt-4">Framework Creator</p>
      <div className="w-full mb-2"></div>
      <div className="mb-2 h-full">
        <PlaygroundGraphView isEditable sendMessage={() => {}} />
      </div>
    </Frame>
  );
};

export default FrameworkCreator;
