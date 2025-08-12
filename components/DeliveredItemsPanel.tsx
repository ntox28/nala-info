import React from 'react';
import { ProductionItem } from '../types';
import BoxArrowOutIcon from './icons/BoxArrowOutIcon';

interface DeliveredItemsPanelProps {
    items: ProductionItem[];
}

const DeliveredItemsPanel: React.FC<DeliveredItemsPanelProps> = ({ items }) => {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/80 rounded-xl overflow-hidden flex flex-col h-full">
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-700/50">
                <div className="flex items-center space-x-3">
                    <BoxArrowOutIcon className="w-6 h-6 text-green-400" />
                    <h3 className="font-bold text-white">Barang Diambil Hari Ini</h3>
                </div>
                <span className="px-3 py-1 text-sm font-semibold text-green-300 bg-green-500/20 rounded-full">
                    {items.length} Item
                </span>
            </header>
            <div className="flex-grow p-4 overflow-y-auto">
                {items.length > 0 ? (
                    <ul className="space-y-3">
                        {[...items].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(item => {
                             const description = [
                                item.deskripsi,
                                item.bahan_name,
                                (item.panjang && item.lebar) ? `${item.panjang}x${item.lebar}m` : null
                            ].filter(Boolean).join(' | ');

                            return (
                                <li key={item.id} className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/60">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-white">{item.customer_name}</p>
                                            <p className="text-xs text-gray-400 font-mono">{item.no_nota}</p>
                                        </div>
                                        <p className="text-xs font-mono text-gray-300">{new Date(item.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-300">{description}</p>
                                    <p className="mt-1 text-right text-sm font-bold text-white">{item.qty} pcs</p>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="mt-2 font-semibold text-gray-400">Belum Ada Barang Diambil</h4>
                        <p className="text-xs mt-1">Item yang sudah diantar akan muncul di sini.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveredItemsPanel;
