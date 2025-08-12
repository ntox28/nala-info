import React from 'react';
import { ProductionStatus } from '../types';

interface StatusBadgeProps {
  status: ProductionStatus;
  isUpdated?: boolean;
}

const statusColorMap: Record<ProductionStatus, { dot: string; text: string; bg: string; ping: string; }> = {
  'Pending': {
    dot: 'bg-yellow-400',
    text: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    ping: 'ring-yellow-400/70'
  },
  'Waiting': {
    dot: 'bg-orange-400',
    text: 'text-orange-400',
    bg: 'bg-orange-400/10',
    ping: 'ring-orange-400/70'
  },
  'Proses': {
    dot: 'bg-blue-400',
    text: 'text-blue-400',
    bg: 'bg-blue-400/10',
    ping: 'ring-blue-400/70'
  },
  'Ready': {
    dot: 'bg-green-400',
    text: 'text-green-400',
    bg: 'bg-green-400/10',
    ping: 'ring-green-400/70'
  },
  'Delivered': {
    dot: 'bg-gray-500',
    text: 'text-gray-500',
    bg: 'bg-gray-500/10',
    ping: 'ring-gray-500/70'
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isUpdated = false }) => {
  const colors = statusColorMap[status] || { dot: 'bg-gray-400', text: 'text-gray-400', bg: 'bg-gray-400/10', ping: 'ring-gray-400/70' };

  return (
    <div className="relative inline-flex items-center justify-center">
      {isUpdated && (
        <div
          className={`absolute inset-0 h-full w-full rounded-full ring-2 ${colors.ping} animate-status-ping`}
          aria-hidden="true"
        ></div>
      )}
      <div
        className={`relative inline-flex items-center gap-x-2 rounded-full px-3 py-1 text-sm font-medium ${colors.bg}`}
      >
        <div className={`h-2 w-2 rounded-full ${colors.dot}`}></div>
        <span className={colors.text}>{status}</span>
      </div>
    </div>
  );
};

export default StatusBadge;