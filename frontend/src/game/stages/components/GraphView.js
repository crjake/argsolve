import { Button, Radio, RadioGroup } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import { GameState } from '../../ArgSolveContext';

import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import popper from 'cytoscape-popper'; // you have to install it
import CytoscapeComponent from 'react-cytoscapejs';
import './stylesheets/popper.css';
import './stylesheets/safari.css';

cytoscape.use(popper);
cytoscape.use(edgehandles);

const GraphView = ({ gameState, isEditable, sendMessage, setIsWaiting = () => {}, graphHeight = 'h-[24em]' }) => {
  const cy = useRef();
  const initialElements = gameState?.aggregated_framework;
  const [mode, setMode] = useState('view');

  const [relationMode, setRelationMode] = useState('attack');
  const edgeHandles = useRef(null);

  const [selectedEdge, setSelectedEdge] = useState(null);
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [extensionsHidden, setExtensionsHidden] = useState(true);

  // Trigger fetch of aggregated framework on mount
  useEffect(() => {
    sendMessage({
      type: 'fetch_aggregated_framework',
    });
  }, []);

  // Enable editing of graph
  useEffect(() => {
    if (cy.current && isEditable) {
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
        hoverDelay: 150,
        snap: false,
        snapThreshold: 50,
        snapFrequency: 15,
        noEdgeEventsInDraw: true,
        disableBrowserGestures: true,
      });

      if (mode === 'edit') {
        edgeHandles.current.enableDrawMode();
      } else {
        edgeHandles.current.disableDrawMode();
      }

      const edgeClickHandler = (event) => {
        const edge = event.target;
        setSelectedEdge(edge);
        setShowDeleteButton(true);

        // Deselect previously selected edge
        cy.current.edges().difference(edge).removeClass('selected');

        // Add a 'selected' class to the clicked edge
        edge.addClass('selected');
      };

      const backgroundClickHandler = (event) => {
        if (event.target === cy.current) {
          setSelectedEdge(null);
          setShowDeleteButton(false);
          cy.current.edges().removeClass('selected');
        }
      };

      if (mode === 'edit') {
        cy.current.on('click', 'edge', edgeClickHandler);
        cy.current.on('click', backgroundClickHandler);
      }

      return () => {
        edgeHandles.current.disableDrawMode();
        edgeHandles.current.destroy();
        cy.current.removeListener('click', edgeClickHandler);
        cy.current.removeListener('click', backgroundClickHandler);
        setSelectedEdge(null);
        setShowDeleteButton(false);
        cy.current.edges().removeClass('selected');
      };
    }
  }, [relationMode, mode, gameState?.aggregated_framework]);

  // Enable popper
  useEffect(() => {
    if (cy.current && cy.current.nodes()) {
      const updates = [];
      cy.current.nodes().forEach((node) => {
        node.unbind('mouseover touchstart');
        node.bind('mouseover touchstart', (event) => {
          event.target.popperRefObj = event.target.popper({
            content: () => {
              let content = document.createElement('div');
              content.classList.add('popper-div');

              let nestedDiv = document.createElement('div');
              nestedDiv.innerHTML = event.target.id();
              nestedDiv.classList.add('max-w-prose');
              nestedDiv.classList.add('whitespace-pre-wrap');
              content.appendChild(nestedDiv);

              document.body.appendChild(content);
              return content;
            },
          });
          const update = () => {
            node.popperRefObj.update();
          };
          updates.push(update);
          event.target.on('position', update);
        });

        node.unbind('mouseout touchend');
        node.bind('mouseout touchend', (event) => {
          if (event.target.popperRefObj && event.target.popper) {
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
  }, [gameState?.aggregated_framework]); // Don't need to re-run on adding new relations, as assumptions (i.e. the nodes) are unaffected

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
  }, [gameState?.aggregated_framework]);

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
  }, [gameState?.aggregated_framework]);

  if (gameState?.aggregated_framework === undefined) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[90%] border-2">
        <div>Framework unavailable at this time.</div>
      </div>
    );
  }

  const handleRecomputeLayout = () => {
    cy.current.zoom(1);
    const layout = cy.current.elements().layout(initialLayout);
    layout.run();
  };

  const handleDeleteEdge = () => {
    if (selectedEdge) {
      selectedEdge.remove();
      setSelectedEdge(null);
      setShowDeleteButton(false);
    }
  };

  const handleReset = () => {
    cy.current.remove('edge');
    initialElements.edges.forEach((edge) => {
      cy.current.add(edge);
    });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setMode('view');
    sendMessage({
      type: 'state_action',
      state: GameState.RELATION_PROPOSAL,
      action: {
        type: 'added_relations',
        cytoscape_json: cy.current.json().elements,
      },
    });
    setIsWaiting(true);
  };

  const extensions = gameState?.extensions;
  const handleCompute = () => {
    if (cy.current?.json().elements) {
      sendMessage({
        type: 'compute_extensions',
        framework: cy.current?.json().elements,
      });
    }
    setExtensionsHidden(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className={`w-full ${graphHeight} border-1 no-select`}>
        <CytoscapeComponent
          elements={CytoscapeComponent.normalizeElements(initialElements)}
          style={{ width: '100%', height: '100%' }}
          className="border-2"
          cy={(cyInstance) => (cy.current = cyInstance)}
          layout={initialLayout}
          stylesheet={stylesheet}
          minZoom={0.75}
          maxZoom={1.5}
          zoom={0.5}
          boxSelectionEnabled={false}
        />
      </div>
      <div className="w-full h-full">
        {isEditable && (
          <div className="grid grid-cols-1 md:grid-cols-2 justify-start w-full gap-x-2 mt-2 gap-y-2">
            <ModeRadio mode={mode} setMode={setMode} isDisabled={isSubmitted} />
            {mode === 'edit' && <RelationTypeRadio relationMode={relationMode} setRelationMode={setRelationMode} />}
            <Button
              onClick={handleDeleteEdge}
              className=""
              hidden={!showDeleteButton || isSubmitted}
              fontSize={{ base: '10px', md: '14px' }}
            >
              Delete Edge
            </Button>
          </div>
        )}
        <div className="flex space-x-2 justify-start w-full mt-2">
          <Button onClick={handleRecomputeLayout} className="" fontSize={{ base: '10px', md: '14px' }}>
            Recompute layout
          </Button>
          {isEditable && (
            <Button onClick={handleReset} isDisabled={isSubmitted} fontSize={{ base: '10px', md: '14px' }}>
              Reset to aggregate
            </Button>
          )}
          {isEditable && (
            <Button
              onClick={handleSubmit}
              className=""
              isDisabled={isSubmitted}
              fontSize={{ base: '10px', md: '14px' }}
            >
              Submit relations
            </Button>
          )}
        </div>
        <div className="flex items-center justify-center mt-2 space-x-2">
          <Button onClick={handleCompute} fontSize={{ base: '10px', md: '14px' }} className=" w-[90%]">
            Compute Extensions
          </Button>
          <Button
            fontSize={{ base: '10px', md: '14px' }}
            onClick={() =>
              setExtensionsHidden((s) => {
                return !s;
              })
            }
            className="w-[10%]"
          >
            {extensionsHidden ? 'Show' : 'Hide'}
          </Button>
        </div>
        {extensions && !extensionsHidden && (
          <div className="whitespace-pre-wrap text-xs border-2 font-mono overflow-y-scroll mt-2 max-h-[24em] w-full">
            {JSON.stringify(extensions, null, 4)}
          </div>
        )}
      </div>
    </div>
  );
};

const initialLayout = {
  name: 'cose',
  animate: false,
  idealEdgeLength: function (edge) {
    return 64;
  },

  // Divisor to compute edge forces
  edgeElasticity: function (edge) {
    return 32;
  },
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
  {
    selector: 'edge.selected',
    css: {
      'line-color': 'blue',
      'target-arrow-color': 'blue',
      'line-style': 'dashed',
    },
  },
];

const RelationTypeRadio = ({ relationMode, setRelationMode }) => {
  return (
    <RadioGroup onChange={setRelationMode} value={relationMode}>
      <div className="flex items-center space-x-2 p-1.5 border-2 px-4 rounded">
        <div className="text-xs md:text-base flex items-center">Relation:</div>
        <Radio value="attack">
          <div className="text-xs md:text-base flex items-center">Attack</div>
        </Radio>
        <Radio value="support">
          <div className="text-xs md:text-base flex items-center">Support</div>
        </Radio>
      </div>
    </RadioGroup>
  );
};

const ModeRadio = ({ mode, setMode, isDisabled }) => {
  return (
    <RadioGroup onChange={setMode} value={mode} isDisabled={isDisabled}>
      <div className="flex items-center space-x-2 p-1.5 border-2 px-4 rounded">
        <div className="text-xs md:text-base flex items-center">Mode:</div>
        <Radio value="view">
          <div className="text-xs md:text-base flex items-center">View</div>
        </Radio>
        <Radio value="edit">
          <div className="text-xs md:text-base flex items-center">Edit</div>
        </Radio>
      </div>
    </RadioGroup>
  );
};

export default GraphView;
