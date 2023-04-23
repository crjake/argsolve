import GraphView from './components/GraphView';

const RuleProposal = ({ gameState, sendMessage }) => {
  return (
    <>
      <p className="text-2xl mb-4 border-b-2 mt-4">Rule Proposal</p>
      <div className="w-full h-[36em]">
        <GraphView gameState={gameState} sendMessage={sendMessage} isEditable />
      </div>
    </>
  );
};

export default RuleProposal;
