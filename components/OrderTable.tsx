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
        {/* Desktop Skeleton */}
        <div className="hidden lg:block">
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
        {/* Mobile Skeleton */}
        <div className="lg:hidden space-y-4">
           {[...Array(5)].map((_, i) => (
             <div key={i} className="p-4 rounded-lg bg-gray-800/60 border border-gray-700">
               <div className="flex justify-between items-start">
                 <div>
                   <div className="h-5 bg-gray-600/50 rounded w-32 mb-1"></div>
                   <div className="h-4 bg-gray-600/50 rounded w-24"></div>
                 </div>
                 <div className="h-8 bg-gray-600/50 rounded-full w-28"></div>
               </div>
               <div className="mt-2 h-4 bg-gray-600/50 rounded w-full"></div>
               <div className="mt-1 h-4 bg-gray-600/50 rounded w-3/4"></div>
               <div className="mt-3 flex justify-between items-center">
                 <div className="h-4 bg-gray-600/50 rounded w-16"></div>
                 <div className="h-4 bg-gray-600/50 rounded w-12"></div>
               </div>
             </div>
           ))}
        </div>
    </div>
);


const OrderTable: React.FC<OrderTableProps> = ({ orders, updatedItemIds, loading }) => {
    if (loading) {
        return <TableSkeleton />;
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-16 px-4 flex-grow flex flex-col items-center justify-center">
                <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-lg font-semibold text-white">Tidak ada data produksi</h3>
                <p className="mt-1 text-gray-400">Saat ini tidak ada item yang sedang dalam proses produksi.</p>
            </div>
        );
    }

    return (
        <div className="h-full">
            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {orders.map(item => {
                const description = [
                    item.deskripsi,
                    item.bahan_name,
                    (item.panjang && item.lebar) ? `${item.panjang}x${item.lebar}m` : null
                ].filter(Boolean).join(' | ');
                return (
                  <div key={item.id} className={`p-4 rounded-lg bg-gray-900/40 border border-gray-700/80 shadow-md transition-colors duration-300 ${updatedItemIds.has(item.id) ? 'item-updated' : ''}`}>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-bold text-base text-white">{item.customer_name}</p>
                        <p className="text-sm text-gray-400 font-mono">{item.no_nota}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <StatusBadge status={item.status} isUpdated={updatedItemIds.has(item.id)} />
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-300">{description}</p>
                    <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-between items-center text-sm">
                      <p className="text-gray-400">Qty: <span className="font-semibold text-white">{item.qty}</span></p>
                      <p className="text-gray-400 font-medium">{new Date(item.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
        
            {/* Desktop Table View */}
            <table className="hidden lg:table min-w-full text-sm text-left">
                <thead className="bg-gray-900/70 text-xs text-gray-400 uppercase tracking-wider sticky top-0 z-10">
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
                                <td className="px-6 py-4 text-center">
                                    <StatusBadge status={item.status} isUpdated={updatedItemIds.has(item.id)} />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default OrderTable;