import React, { useEffect, useRef } from 'react';
import { ProductionItem } from '../types';
import BoxArrowOutIcon from './icons/BoxArrowOutIcon';

interface DeliveredItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: ProductionItem[];
}

const DeliveredItemsModal: React.FC<DeliveredItemsModalProps> = ({ isOpen, onClose, items }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
            document.body.style.overflow = 'hidden';
        } else {
            // Check if dialog is open before trying to close it
            if (dialogRef.current?.open) {
                dialogRef.current?.close();
            }
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

    const handleAnimationClose = () => {
        if (!dialogRef.current) return;
        
        dialogRef.current.classList.add('animate-fade-out');
        dialogRef.current.addEventListener('animationend', () => {
            dialogRef.current?.classList.remove('animate-fade-out');
            onClose();
        }, { once: true });
    };
    
    // This is to handle the ESC key press correctly
    useEffect(() => {
        const dialogNode = dialogRef.current;
        const handleCancel = (e: Event) => {
            e.preventDefault(); // Prevent default closing
            handleAnimationClose();
        };

        if (dialogNode) {
            dialogNode.addEventListener('cancel', handleCancel);
        }

        return () => {
            if (dialogNode) {
                dialogNode.removeEventListener('cancel', handleCancel);
            }
        };
    }, []);


    return (
        <dialog
            ref={dialogRef}
            onClick={(e) => {
                if (e.target === dialogRef.current) {
                    handleAnimationClose();
                }
            }}
            className="w-full max-w-4xl h-auto max-h-[85vh] bg-gray-900/80 backdrop-blur-xl rounded-2xl p-0 text-gray-200 shadow-2xl border border-green-500/20 open:animate-fade-in"
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-gray-700/50 flex-shrink-0 sticky top-0 bg-gray-900/80 z-10">
                    <div className="flex items-center space-x-3">
                        <BoxArrowOutIcon className="w-6 h-6 text-green-400"/>
                        <h2 className="text-lg font-bold text-white">Barang Diambil Hari Ini ({items.length})</h2>
                    </div>
                    <button onClick={handleAnimationClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="Tutup">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                {/* Content Body */}
                <div className="flex-grow p-6 overflow-y-auto">
                    {items.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-gray-900/70 text-xs text-gray-400 uppercase tracking-wider">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Time</th>
                                        <th scope="col" className="px-4 py-3">Nota</th>
                                        <th scope="col" className="px-4 py-3">Customer</th>
                                        <th scope="col" className="px-4 py-3">Description</th>
                                        <th scope="col" className="px-4 py-3 text-center">Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {[...items].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(item => {
                                        const description = [
                                            item.deskripsi,
                                            item.bahan_name,
                                            (item.panjang && item.lebar) ? `${item.panjang}x${item.lebar}m` : null
                                        ].filter(Boolean).join(' | ');

                                        return (
                                            <tr key={item.id} className="transition-colors duration-300 hover:bg-gray-800/60">
                                                <td className="px-4 py-3 whitespace-nowrap font-medium text-white">{new Date(item.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-gray-300 font-mono">{item.no_nota}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-gray-300">{item.customer_name}</td>
                                                <td className="px-4 py-3 text-gray-300">{description}</td>
                                                <td className="px-4 py-3 text-center whitespace-nowrap text-gray-300">{item.qty}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16 px-4">
                            <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-lg font-semibold text-white">Belum Ada Barang Diambil</h3>
                            <p className="mt-1 text-gray-400">Belum ada pesanan yang ditandai sebagai 'Delivered' hari ini.</p>
                        </div>
                    )}
                </div>
            </div>
        </dialog>
    );
};

export default DeliveredItemsModal;