// import cytoscape from 'cytoscape';
// import CytoscapeComponent from 'react-cytoscapejs';
import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';

const Game = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!/\d+/.test(id)) {
      navigate(-1);
    }
  }, [id, navigate]);

  // Check state of game
  // Check if user is host, and then give elevated permissions

  return (
    <div className="flex flex-col grow mx-auto mt-8 max-w-lg">
      <div>FILL ME IN WITH TEXT</div>
    </div>
  );
};

// function Graph() {
//   const elements = [
//     { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
//     { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
//     { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } },
//   ];
//   return (
//     <div className="flex justify-center">
//       <CytoscapeComponent elements={elements} style={{ width: '600px', height: '600px' }} />
//     </div>
//   );
// }

export default Game;
