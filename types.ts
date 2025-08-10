export type ProductionStatus = 'Belum Dikerjakan' | 'Proses' | 'Selesai';

export interface ProductionItem {
    id: number;
    no_nota: string;
    customer_name: string;
    deskripsi: string;
    bahan_name: string;
    panjang: number | null;
    lebar: number | null;
    qty: number;
    status: ProductionStatus;
    created_at: string;
}

// This type is based on the Supabase schema from the user's code for fetching
export interface Order {
    no_nota: string;
    created_at: string;
    tanggal: string;
    customers: { name: string } | null;
    order_items: {
        id: number;
        deskripsi_pesanan: string | null;
        qty: number;
        status_produksi: ProductionStatus;
        created_at: string;
        panjang: number | null;
        lebar: number | null;
        bahan: { name: string } | null;
    }[];
}

export interface Customer {
    name: string;
}

export interface Bahan {
    name: string;
}
