import React from 'react';
import { ProductionStatus } from '../types';

interface StatusBadgeProps {
  status: ProductionStatus;
}

const statusColorMap: Record<ProductionStatus, { dot: string; text: string; bg: string; }> = {
  'Belum Dikerjakan': {
    dot: 'bg-yellow-400',
    text: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
  'Proses': {
    dot: 'bg-blue-400',
    text: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  'Selesai': {
    dot: 'bg-green-400',
    text: 'text-green-400',
    bg: 'bg-green-400/10',
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colors = statusColorMap[status] || { dot: 'bg-gray-400', text: 'text-gray-400', bg: 'bg-gray-400/10' };

  return (
    <div
      className={`inline-flex items-center gap-x-2 rounded-full px-3 py-1 text-sm font-medium ${colors.bg}`}
    >
      <div className={`h-2 w-2 rounded-full ${colors.dot}`}></div>
      <span className={colors.text}>{status}</span>
    </div>
  );
};

export default StatusBadge;
