import cytoscape from 'cytoscape';
import React, { useEffect, useRef } from "react";
import CytoscapeComponent from 'react-cytoscapejs';

function Game() {
	const elements = [
		{ data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
		{ data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
		{ data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } }
	 ];
	return (
		<div className="flex justify-center">
			<CytoscapeComponent elements={elements} style={ { width: '600px', height: '600px' } } />
		</div>
	);
}

export default Game;
