import React from 'react';
import { ProductionItem } from '../types';
import StatusBadge from './StatusBadge';

interface OrderTableProps {
  orders: ProductionItem[];
  updatedItemIds: Set<number>;
  loading: boolean;
}

const TableSkeleton: React.FC = () => (
    <div className="w-full animate-pulse p-4">
        <div className="h-8 bg-gray-700 rounded-md w-full mb-4"></div>
        {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-3 border-b border-gray-700/50">
                <div className="h-4 bg-gray-600/50 rounded w-16"></div>
                <div className="h-4 bg-gray-600/50 rounded w-24"></div>
                <div className="h-4 bg-gray-600/50 rounded w-32"></div>
                <div className="flex-1 h-4 bg-gray-600/50 rounded"></div>
                <div className="h-4 bg-gray-600/50 rounded w-12"></div>
                <div className="h-8 bg-gray-600/50 rounded-full w-28"></div>
            </div>
        ))}
    </div>
);


const OrderTable: React.FC<OrderTableProps> = ({ orders, updatedItemIds, loading }) => {
    if (loading) {
        return <TableSkeleton />;
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-16 px-4">
                <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-lg font-semibold text-white">Tidak ada data produksi</h3>
                <p className="mt-1 text-gray-400">Saat ini tidak ada item yang sedang dalam proses produksi.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-900/70 text-xs text-gray-400 uppercase tracking-wider">
                    <tr>
                        <th scope="col" className="px-6 py-3">Time</th>
                        <th scope="col" className="px-6 py-3">Nota</th>
                        <th scope="col" className="px-6 py-3">Customer</th>
                        <th scope="col" className="px-6 py-3">Description</th>
                        <th scope="col" className="px-6 py-3 text-center">Qty</th>
                        <th scope="col" className="px-6 py-3 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {orders.map(item => {
                        const description = [
                            item.deskripsi,
                            item.bahan_name,
                            (item.panjang && item.lebar) ? `${item.panjang}x${item.lebar}m` : null
                        ].filter(Boolean).join(' | ');

                        return (
                            <tr key={item.id} className={`transition-colors duration-300 hover:bg-gray-800/60 ${updatedItemIds.has(item.id) ? 'item-updated' : ''}`}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{new Date(item.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-300 font-mono">{item.no_nota}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{item.customer_name}</td>
                                <td className="px-6 py-4 text-gray-300">{description}</td>
                                <td className="px-6 py-4 text-center whitespace-nowrap text-gray-300">{item.qty}</td>
                                <td className="px-6 py-4 text-center"><StatusBadge status={item.status} /></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default OrderTable;
