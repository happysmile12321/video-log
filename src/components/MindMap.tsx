'use client';

import ReactFlow, { Node, Edge, Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

interface MindMapProps {
  data: {
    nodes: Node[];
    edges: Edge[];
  };
}

export function MindMap({ data }: MindMapProps) {
  return (
    <div className="h-full">
      <ReactFlow
        nodes={data.nodes}
        edges={data.edges}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
} 