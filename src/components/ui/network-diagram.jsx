// src/ui/enhanced-network-diagram.jsx
import React, { useState } from 'react';

export const NetworkDiagram = () => {
  const [selectedNode, setSelectedNode] = useState(null);

  const dataFlows = [
    {
      id: 1,
      from: { name: 'EU Headquarters', region: 'EU', type: 'source' },
      to: { name: 'US Cloud Provider', region: 'US', type: 'cloud' },
      dataType: 'Customer Data',
      legalBasis: 'SCC + TIA',
      volume: '45%',
      risk: 'Medium',
      status: 'Active',
      dataVolume: '2.4 TB'
    },
    {
      id: 2,
      from: { name: 'EU Headquarters', region: 'EU', type: 'source' },
      to: { name: 'Asia Office', region: 'Asia', type: 'office' },
      dataType: 'HR Records',
      legalBasis: 'Adequacy',
      volume: '32%',
      risk: 'Low',
      status: 'Active',
      dataVolume: '1.7 TB'
    },
    {
      id: 3,
      from: { name: 'US Cloud Provider', region: 'US', type: 'cloud' },
      to: { name: 'Analytics Vendor', region: 'US', type: 'vendor' },
      dataType: 'Analytics Data',
      legalBasis: 'SCC',
      volume: '28%',
      risk: 'High',
      status: 'Review Required',
      dataVolume: '1.5 TB'
    },
    {
      id: 4,
      from: { name: 'EU Headquarters', region: 'EU', type: 'source' },
      to: { name: 'UK Data Center', region: 'UK', type: 'datacenter' },
      dataType: 'Backup Data',
      legalBasis: 'Adequacy',
      volume: '18%',
      risk: 'Low',
      status: 'Active',
      dataVolume: '980 GB'
    }
  ];

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'Medium': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'High': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'Review Required': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'Monitoring': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  const getLegalBasisColor = (basis) => {
    switch (basis) {
      case 'SCC': return 'border-blue-500 text-blue-700 dark:text-blue-300';
      case 'SCC + TIA': return 'border-purple-500 text-purple-700 dark:text-purple-300';
      case 'Adequacy': return 'border-green-500 text-green-700 dark:text-green-300';
      default: return 'border-gray-500 text-gray-700 dark:text-gray-300';
    }
  };

  // Calculate stats
  const totalTransfers = dataFlows.length;
  const highRiskTransfers = dataFlows.filter(flow => flow.risk === 'High').length;
  const activeTransfers = dataFlows.filter(flow => flow.status === 'Active').length;
  const totalVolume = dataFlows.reduce((sum, flow) => {
    const volume = parseFloat(flow.dataVolume);
    return sum + (isNaN(volume) ? 0 : volume);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalTransfers}</div>
          <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Total Transfers</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{highRiskTransfers}</div>
          <div className="text-xs text-red-700 dark:text-red-300 font-medium">High Risk</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeTransfers}</div>
          <div className="text-xs text-green-700 dark:text-green-300 font-medium">Active</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalVolume} TB</div>
          <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">Total Volume</div>
        </div>
      </div>
    </div>
  );
};