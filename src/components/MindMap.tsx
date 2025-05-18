'use client';

import { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface MindMapProps {
  data: {
    nodes: Node[];
    edges: Edge[];
  };
}

export function MindMap({ data }: MindMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges);

  const onInit = useCallback((reactFlowInstance: any) => {
    reactFlowInstance.fitView();
  }, []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-900"
      >
        <Background color="#374151" gap={16} />
        <Controls className="bg-gray-800 border-gray-700 fill-gray-400 [&>button:hover]:bg-gray-700" />
        <MiniMap
          nodeColor="#4B5563"
          maskColor="rgba(17, 24, 39, 0.7)"
          className="bg-gray-800 border-gray-700"
        />
      </ReactFlow>
    </div>
  );
} 