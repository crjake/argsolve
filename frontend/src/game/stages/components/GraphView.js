import { useEffect, useState, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import popper from 'cytoscape-popper'; // you have to install it
import './stylesheets/popper.css';

cytoscape.use(popper);

const GraphView = () => {
  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-center">
        <Graph />
      </div>
    </div>
  );
};

const Graph = () => {
  const cy = useRef();

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
  }, [cy.current]);

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
  }, [cy.current]);

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
  }, [cy.current]);

  const elements = JSON.parse(`[
    {
        "group": "nodes",
        "data": {
            "id": "Banning cars hurts people with accessibility issues"
        }
    },
    {
        "group": "nodes",
        "data": {
            "id": "Cars pollute the environment"
        }
    },
    {
        "group": "nodes",
        "data": {
            "id": "Cars should be banned"
        }
    },
    {
        "group": "edges",
        "data": {
            "id": "Banning cars hurts people with accessibility issues_attacks_Cars should be banned",
            "source": "Banning cars hurts people with accessibility issues",
            "target": "Cars should be banned",
            "type": "attack"
        }
    },
    {
        "group": "edges",
        "data": {
            "id": "Cars pollute the environment_supports_Cars should be banned",
            "source": "Cars pollute the environment",
            "target": "Cars should be banned",
            "type": "support"
        }
    }
]`);

  const layout = {
    name: 'cose',
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

  return (
    <div className="flex justify-center">
      <CytoscapeComponent
        elements={elements}
        style={{ width: '800px', height: '600px' }}
        className="border-4"
        cy={(cyInstance) => (cy.current = cyInstance)}
        layout={layout}
        stylesheet={stylesheet}
        minZoom={0.75}
        maxZoom={1.5}
        boxSelectionEnabled={false}
      />
    </div>
  );
};

export default GraphView;
