import { useEffect, useRef, useContext, useState } from 'react';
import { Button } from '@chakra-ui/react';
import { Radio, RadioGroup, Stack } from '@chakra-ui/react';

import UsernameContext from '../../../components/UsernameContext';

import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import popper from 'cytoscape-popper'; // you have to install it
import './stylesheets/popper.css';

cytoscape.use(popper);
cytoscape.use(edgehandles);

const GraphView = ({ gameState, isEditable }) => {
  const cy = useRef();
  const initialElements = gameState.roomData.current_framework;
  const [mode, setMode] = useState('view');
  const username = useContext(UsernameContext); // TODO Lookup username in gamestate and check support type preference

  const [relationMode, setRelationMode] = useState('attack');
  const edgeHandles = useRef(null);

  // Deal with view and rule proposal modes
  useEffect(() => {
    if (edgeHandles.current) {
      if (mode === 'view') {
        edgeHandles.current.disableDrawMode();
      } else {
        edgeHandles.current.enableDrawMode();
      }
    }
  }, [mode]);

  // Enable editing of graph
  useEffect(() => {
    if (cy.current) {
      edgeHandles.current = cy.current.edgehandles({
        canConnect: (sourceNode, targetNode) => {
          if (sourceNode.data('id') === targetNode.data('id')) {
            return false;
          }

          const edgeExists = (cy, sourceId, targetId) => {
            const edge = cy.edges(`[source = "${sourceId}"][target = "${targetId}"]`);
            return edge.length > 0;
          };

          if (edgeExists(cy.current, sourceNode.data('id'), targetNode.data('id'))) {
            return false;
          }

          return true;
        },
        edgeParams: (sourceNode, targetNode) => {
          console.log(relationMode);
          const sourceId = sourceNode.data('id');
          const targetId = targetNode.data('id');
          return {
            group: 'edges',
            data: {
              id: `${sourceId}_${relationMode}_${targetId}`,
              source: sourceId,
              target: targetId,
              type: relationMode,
            },
          };
        },
        hoverDelay: 150, // time spent hovering over a target node before it is considered selected
        snap: false, // when enabled, the edge can be drawn by just moving close to a target node (can be confusing on compound graphs)
        snapThreshold: 50, // the target node must be less than or equal to this many pixels away from the cursor/finger
        snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
        noEdgeEventsInDraw: true, // set events:no to edges during draws, prevents mouseouts on compounds
        disableBrowserGestures: true, // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
      });

      // edgeHandles.current.enableDrawMode(); TODO moving this to button

      // Add this event listener
      cy.current.on('ehcomplete', (event, sourceNode, targetNode, addedEles) => {
        const arrow = relationMode === 'attack' ? '->' : '=>';
        console.log('Added edge:', addedEles[0].data('source'), arrow, addedEles[0].data('target'));
      });
      // cy.on('ehcomplete')
      return () => {
        cy.current.removeListener('ehcomplete');
      };
    }
  }, [relationMode]);

  // Enable popper
  useEffect(() => {
    if (cy.current && cy.current.nodes()) {
      const updates = [];
      cy.current.nodes().forEach((node) => {
        node.unbind('mouseover');
        node.bind('mouseover', (event) => {
          event.target.popperRefObj = event.target.popper({
            content: () => {
              let content = document.createElement('div');
              content.classList.add('popper-div');

              let nestedDiv = document.createElement('div');
              nestedDiv.innerHTML = event.target.id();
              // nestedDiv.classList.add('text-red-600');
              content.appendChild(nestedDiv);

              document.body.appendChild(content);
              return content;
              return content;
            },
          });
          const update = () => {
            node.popperRefObj.update();
          };
          updates.push(update);
          event.target.on('position', update);
        });

        node.unbind('mouseout');
        node.bind('mouseout', (event) => {
          if (event.target.popper) {
            event.target.popperRefObj.state.elements.popper.remove();
            event.target.popperRefObj.destroy();
          }
        });
      });

      cy.current.on('pan zoom resize', () => {
        updates.forEach((update) => {
          update();
        });
      });
    }
  }, []); // Don't need to re-run on adding new relations, as assumptions (i.e. the nodes) are unaffected

  // Prevent nodes from being dragged off the canvas
  useEffect(() => {
    if (cy.current) {
      const padding = 10;

      cy.current.nodes().on('drag', (event) => {
        const node = event.target;
        const { x, y } = node.position();
        const { width, height } = cy.current.container().getBoundingClientRect();
        const { x: panX, y: panY } = cy.current.pan();
        const zoom = cy.current.zoom();

        const effectivePanX = panX / zoom;
        const effectivePanY = panY / zoom;

        const newPosition = {
          x: Math.min(Math.max(padding - effectivePanX, x), width / zoom - padding - effectivePanX),
          y: Math.min(Math.max(padding - effectivePanY, y), height / zoom - padding - effectivePanY),
        };

        node.position(newPosition);
      });
    }
  }, []);

  // Prevent the graph from being panned offscreen
  useEffect(() => {
    if (cy.current) {
      cy.current.on('viewport', () => {
        const padding = 10;
        const { width, height } = cy.current.container().getBoundingClientRect();
        const zoom = cy.current.zoom();
        const pan = cy.current.pan();
        const nodesBB = cy.current.nodes().boundingBox();

        const minPan = {
          x: padding - (nodesBB.x1 + nodesBB.w / 2) * zoom,
          y: padding - (nodesBB.y1 + nodesBB.h / 2) * zoom,
        };

        const maxPan = {
          x: width - padding - (nodesBB.x2 - nodesBB.w / 2) * zoom,
          y: height - padding - (nodesBB.y2 - nodesBB.h / 2) * zoom,
        };

        const newPan = {
          x: Math.min(Math.max(minPan.x, pan.x), maxPan.x),
          y: Math.min(Math.max(minPan.y, pan.y), maxPan.y),
        };

        if (newPan.x !== pan.x || newPan.y !== pan.y) {
          cy.current.pan(newPan);
        }
      });
    }
  }, []);

  const handleRecomputeLayout = () => {
    cy.current.zoom(1);
    const layout = cy.current.elements().layout(initialLayout);
    layout.run();
  };

  return (
    <div className="flex flex-col items-center w-full h-full">
      <CytoscapeComponent
        elements={initialElements}
        style={{ width: '100%', height: '90%' }}
        className="border-2"
        cy={(cyInstance) => (cy.current = cyInstance)}
        layout={initialLayout}
        stylesheet={stylesheet}
        minZoom={0.75}
        maxZoom={1.5}
        zoom={0.5}
        boxSelectionEnabled={false}
      />
      <div className="flex items-center justify-start space-x-4 mt-4 w-full">
        <Button onClick={handleRecomputeLayout} className="">
          Recompute layout
        </Button>
        {isEditable && <ModeRadio mode={mode} setMode={setMode} />}
        {isEditable && mode === 'rule proposal' && (
          <RelationTypeRadio relationMode={relationMode} setRelationMode={setRelationMode} />
        )}
      </div>
    </div>
  );
};

const initialLayout = {
  name: 'cose',
  animate: false,
};

const stylesheet = [
  {
    selector: 'node',
    css: {
      // label: 'data(id)',
      label: '',
    },
  },
  {
    selector: 'edge[type = "attack"]',
    css: {
      'curve-style': 'bezier',
      'control-point-step-size': 40,
      'target-arrow-shape': 'triangle',
      'line-color': 'red',
      'target-arrow-color': 'red',
    },
  },
  {
    selector: 'edge[type = "support"]',
    css: {
      'curve-style': 'bezier',
      'control-point-step-size': 40,
      'target-arrow-shape': 'triangle',
      'line-color': 'green',
      'target-arrow-color': 'green',
    },
  },
];

const RelationTypeRadio = ({ relationMode, setRelationMode }) => {
  return (
    <RadioGroup onChange={setRelationMode} value={relationMode}>
      {/* <Stack direction="row"> */}
      <div className="flex items-center space-x-2 p-1.5">
        <div>New rule type:</div>
        <Radio value="attack">attack</Radio>
        <Radio value="support">support</Radio>
      </div>
      {/* </Stack> */}
    </RadioGroup>
  );
};

const ModeRadio = ({ mode, setMode }) => {
  return (
    <RadioGroup onChange={setMode} value={mode}>
      <div className="flex items-center space-x-2 p-1.5">
        <div>Mode:</div>
        <Radio value="view">view</Radio>
        <Radio value="rule proposal">rule proposal</Radio>
      </div>
    </RadioGroup>
  );
};

export default GraphView;
