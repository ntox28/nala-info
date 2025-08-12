import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ProductionItem, ProductionStatus, Order as FetchedOrder } from '../types';
import OrderTable from './OrderTable';
import CompressIcon from './icons/CompressIcon';
import ExpandIcon from './icons/ExpandIcon';
import SpeakerLoudIcon from './icons/SpeakerLoudIcon';
import SpeakerMutedIcon from './icons/SpeakerMutedIcon';
import AIAssistant from './AIAssistant';
import BoxArrowOutIcon from './icons/BoxArrowOutIcon';
import DeliveredItemsModal from './DeliveredItemsModal';
import DeliveredItemsPanel from './DeliveredItemsPanel';
import SwitchHorizontalIcon from './icons/SwitchHorizontalIcon';
import AIAssistantIcon from './icons/AIAssistantIcon';


// --- SVG Icons for Stat Cards ---
const InboxIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
);

const ProcessingIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M4 12h16M4 20h16m-5-8a3 3 0 10-6 0 3 3 0 006 0z" />
    </svg>
);

const CompletedIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
// --- End Icons ---


const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    return (
        <div className="text-right">
            <p className="text-3xl font-bold text-white">{time.toLocaleTimeString('en-GB')}</p>
            <p className="text-sm text-gray-400 tracking-wide">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const extractYoutubeVideoId = (url: string): string => {
    if (!url) {
        return ""; // Return empty for invalid urls
    }

    let videoId = '';
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtu.be')) {
            videoId = urlObj.pathname.slice(1).split('/')[0];
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v') || '';
            if (!videoId && urlObj.pathname.startsWith('/embed/')) {
                videoId = urlObj.pathname.slice(7).split('/')[0];
            }
        }
    } catch (e) {
        // This catch block is intentionally silent for invalid URLs.
    }
    
    if (!videoId) {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        if (match && match[1]) {
            videoId = match[1];
        } else if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
            videoId = url;
        }
    }
    
    return videoId;
};


const Dashboard: React.FC = () => {
    const [items, setItems] = useState<ProductionItem[]>([]);
    const [deliveredItemsToday, setDeliveredItemsToday] = useState<ProductionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [updatedItemIds, setUpdatedItemIds] = useState(new Set<number>());
    const [playlist, setPlaylist] = useState<string[]>(['mKq7nk8pQFs']);
    const [isMuted, setIsMuted] = useState<boolean>(true);
    const [videoTitle, setVideoTitle] = useState<string>('Memuat Judul...');
    const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
    const [isDeliveredModalOpen, setIsDeliveredModalOpen] = useState(false);
    const [sidePanelContent, setSidePanelContent] = useState<'youtube' | 'delivered'>('youtube');


    const stats = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysItems = items.filter(item => new Date(item.created_at).toISOString().split('T')[0] === todayStr);
        return {
            totalOrders: new Set(todaysItems.map(item => item.no_nota)).size,
            processing: todaysItems.filter(item => item.status === 'Proses').length,
            completed: todaysItems.filter(item => item.status === 'Ready').length,
        };
    }, [items]);
    
    const fetchProductionData = useCallback(async () => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                no_nota, created_at, tanggal, 
                customers ( name ), 
                order_items ( id, deskripsi_pesanan, qty, status_produksi, created_at, panjang, lebar, bahan ( name ) )
            `)
            .in('status_pesanan', ['Pending', 'Waiting', 'Proses', 'Ready'])
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching production data:", error.message || error);
            if (loading) setLoading(false);
            return;
        }

        const ordersData = data as FetchedOrder[] | null;

        if (ordersData) {
            const newItems: ProductionItem[] = (ordersData || [])
                .flatMap(order => (order.order_items || []).map(item => ({
                    id: item.id,
                    no_nota: order.no_nota,
                    customer_name: order.customers?.name || 'N/A',
                    deskripsi: item.deskripsi_pesanan || 'Tanpa deskripsi',
                    bahan_name: item.bahan?.name || 'N/A',
                    panjang: item.panjang,
                    lebar: item.lebar,
                    qty: item.qty,
                    status: item.status_produksi, // Map from the correct DB column name
                    created_at: item.created_at,
                })));
            
            setItems(currentItems => {
                if (!loading && currentItems.length > 0) {
                    const updatedIds = new Set<number>();
                    newItems.forEach(newItem => {
                        const oldItem = currentItems.find(p => p.id === newItem.id);
                        if (!oldItem || oldItem.status !== newItem.status) {
                            updatedIds.add(newItem.id);
                        }
                    });

                    if (updatedIds.size > 0) {
                        setUpdatedItemIds(updatedIds);
                        setTimeout(() => setUpdatedItemIds(new Set()), 1600);
                    }
                }
                return newItems;
            });
        }
        
        if (loading) setLoading(false);
    }, [loading]);

    const fetchDeliveredData = useCallback(async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data, error } = await supabase
            .from('orders')
            .select(`
                no_nota, created_at, tanggal, 
                customers ( name ), 
                order_items ( id, deskripsi_pesanan, qty, status_produksi, created_at, panjang, lebar, bahan ( name ) )
            `)
            .eq('status_pesanan', 'Delivered')
            .gte('created_at', today.toISOString())
            .lt('created_at', tomorrow.toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching delivered data:", error.message || error);
            return;
        }

        const ordersData = data as FetchedOrder[] | null;
        if (ordersData) {
            const deliveredItems: ProductionItem[] = (ordersData || [])
                .flatMap(order => (order.order_items || []).map(item => ({
                    id: item.id,
                    no_nota: order.no_nota,
                    customer_name: order.customers?.name || 'N/A',
                    deskripsi: item.deskripsi_pesanan || 'Tanpa deskripsi',
                    bahan_name: item.bahan?.name || 'N/A',
                    panjang: item.panjang,
                    lebar: item.lebar,
                    qty: item.qty,
                    status: item.status_produksi,
                    created_at: item.created_at,
                })));
            setDeliveredItemsToday(deliveredItems);
        }
    }, []);

    const fetchDisplaySettings = useCallback(async () => {
        const { data, error } = await supabase
            .from('display_settings')
            .select('youtube_url')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.error('Error fetching display settings:', error.message);
            setPlaylist(['mKq7nk8pQFs']); // Default fallback
        } else if (data && Array.isArray(data.youtube_url) && data.youtube_url.length > 0) {
            setPlaylist(data.youtube_url);
        } else {
            setPlaylist(['mKq7nk8pQFs']); // Default fallback
        }
    }, []);

    useEffect(() => {
        const handleDataChange = () => {
            fetchProductionData();
            fetchDeliveredData();
        };

        handleDataChange(); // Initial fetch
        fetchDisplaySettings();
        
        const channel = supabase.channel('public-data-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, handleDataChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, handleDataChange)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'display_settings' }, fetchDisplaySettings)
            .subscribe();
            
        return () => { supabase.removeChannel(channel); };
    }, [fetchProductionData, fetchDisplaySettings, fetchDeliveredData]);

    useEffect(() => {
        const handleFullScreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => alert(`Gagal: ${err.message}`));
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };
    
    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
             const statusPriority: Record<ProductionStatus, number> = {
                'Proses': 1,
                'Waiting': 2,
                'Pending': 3,
                'Ready': 4,
                'Delivered': 5
            };
            if (statusPriority[a.status] !== statusPriority[b.status]) {
                return statusPriority[a.status] - statusPriority[b.status];
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }).slice(0, 10);
    }, [items]);

    const videoIds = useMemo(() => 
        playlist.map(extractYoutubeVideoId).filter(Boolean), 
        [playlist]
    );

    const firstVideoId = videoIds[0] || 'mKq7nk8pQFs';
    const playlistString = videoIds.join(',');
    
    useEffect(() => {
        if (!firstVideoId) {
            setVideoTitle('Playlist Kosong');
            return;
        }

        const fetchVideoTitle = async () => {
            try {
                const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${firstVideoId}&format=json`);
                if (!response.ok) {
                    throw new Error('Video title not found');
                }
                const data = await response.json();
                setVideoTitle(data.title || 'Judul Tidak Tersedia');
            } catch (error) {
                console.error("Error fetching YouTube video title:", error);
                setVideoTitle('Sedang Mendengarkan...'); // Fallback on error
            }
        };

        setVideoTitle('Memuat Judul...');
        fetchVideoTitle();
    }, [firstVideoId]);


    return (
        <>
            <main className="min-h-screen bg-gray-900 text-gray-300 p-4 lg:p-6 flex flex-col">
                <header className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                        <img src="https://xkvgflhjcnkythytbkuj.supabase.co/storage/v1/object/public/publik/Nala%20Logo.png" alt="Nala Logo" className="h-14" />
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Nala Media Digital Printing</h1>
                            <p className="text-gray-400">Pantauan Data Real Time Produksi</p>
                        </div>
                    </div>
                    <Clock />
                </header>

                {/* Stats & Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <StatCard title="Total Order Hari Ini" value={stats.totalOrders} icon={<InboxIcon className="w-6 h-6 text-white"/>} color="bg-sky-500/80" />
                    <StatCard title="Sedang Dikerjakan" value={stats.processing} icon={<ProcessingIcon className="w-6 h-6 text-white"/>} color="bg-blue-500/80" />
                    <StatCard title="Siap Diambil Hari Ini" value={stats.completed} icon={<CompletedIcon className="w-6 h-6 text-white"/>} color="bg-green-500/80" />
                    
                    {/* Controls Card */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setIsAIAssistantOpen(true)} className="p-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/40 transition-colors" aria-label="Buka Asisten AI">
                                    <AIAssistantIcon className="h-5 w-5" />
                                </button>
                                <div>
                                    <p className="text-sm font-medium text-white">Nala AI</p>
                                    <p className="text-xs text-gray-400">Siap Membantu</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button onClick={() => setSidePanelContent(prev => prev === 'youtube' ? 'delivered' : 'youtube')} className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/80 transition-colors" aria-label="Tukar Panel">
                                    <SwitchHorizontalIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => setIsDeliveredModalOpen(true)} className="relative p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/80 transition-colors" aria-label="Lihat Barang Diambil">
                                    <BoxArrowOutIcon className="h-5 w-5" />
                                    {deliveredItemsToday.length > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white ring-2 ring-gray-800">
                                            {deliveredItemsToday.length}
                                        </span>
                                    )}
                                </button>
                                <button onClick={() => setIsMuted(!isMuted)} className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/80 transition-colors" aria-label={isMuted ? 'Bunyikan' : 'Matikan Suara'}>
                                    {isMuted ? <SpeakerMutedIcon className="h-5 w-5" /> : <SpeakerLoudIcon className="h-5 w-5" />}
                                </button>
                                <button onClick={toggleFullScreen} className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/80 transition-colors" aria-label={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}>
                                    {isFullscreen ? <CompressIcon className="h-5 w-5" /> : <ExpandIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="relative w-full h-10 bg-black/20 rounded-md mt-2 overflow-hidden">
                             <div className="absolute inset-0 flex items-center">
                                <div className="relative flex w-max items-center overflow-hidden">
                                    <div className="flex animate-marquee whitespace-nowrap items-center">
                                        <p className="mx-4 text-sm text-gray-300">{videoTitle}</p>
                                        <span className="text-gray-500">•</span>
                                        <p className="mx-4 text-sm text-gray-300">{videoTitle}</p>
                                        <span className="text-gray-500">•</span>
                                    </div>
                                    <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap items-center">
                                         <p className="mx-4 text-sm text-gray-300">{videoTitle}</p>
                                         <span className="text-gray-500">•</span>
                                         <p className="mx-4 text-sm text-gray-300">{videoTitle}</p>
                                         <span className="text-gray-500">•</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Table and Video */}
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/80 rounded-xl flex flex-col overflow-y-auto">
                        <OrderTable orders={sortedItems} updatedItemIds={updatedItemIds} loading={loading} />
                    </div>
                    <div className="perspective">
                        <div className={`relative w-full h-full transform-style-3d transition-transform duration-700 ${sidePanelContent === 'delivered' ? 'rotate-y-180' : ''}`}>
                            {/* Front Side: YouTube Player */}
                            <div className="absolute w-full h-full backface-hidden bg-black rounded-xl overflow-hidden shadow-lg border border-gray-700/80">
                                {videoIds.length > 0 ? (
                                    <iframe
                                        key={playlistString + (isMuted ? '-muted' : '-unmuted')}
                                        className="w-full h-full"
                                        src={`https://www.youtube.com/embed/${firstVideoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${playlistString}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                    <p className="text-gray-500">Video tidak tersedia.</p>
                                    </div>
                                )}
                            </div>
                            {/* Back Side: Delivered Items Panel */}
                            <div className="absolute w-full h-full backface-hidden rotate-y-180">
                                <DeliveredItemsPanel items={deliveredItemsToday} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <AIAssistant 
                isOpen={isAIAssistantOpen} 
                onClose={() => setIsAIAssistantOpen(false)} 
                productionItems={items}
            />
            <DeliveredItemsModal
                isOpen={isDeliveredModalOpen}
                onClose={() => setIsDeliveredModalOpen(false)}
                items={deliveredItemsToday}
            />
        </>
    );
};

export default Dashboard;