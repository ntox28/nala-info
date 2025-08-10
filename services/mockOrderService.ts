
import { ProductionItem, ProductionStatus } from '../types';

const customerNames = [
  'Andi Wijaya', 'Budi Santoso', 'Citra Lestari', 'Dewi Anggraini', 'Eko Prasetyo',
  'Fajar Nugroho', 'Gita Permata', 'Hendra Gunawan', 'Indah Sari', 'Joko Susilo'
];
const itemDescriptions = [
  'Perbaikan AC Split', 'Servis Rutin Mobil', 'Cetak Spanduk 5x2m', 'Instalasi Jaringan Kantor',
  'Desain Logo Perusahaan', 'Pemasangan Kanopi', 'Katering Acara Pernikahan', 'Servis Laptop (Mati Total)',
  'Pembuatan Website E-commerce', 'Jahit Seragam Karyawan'
];
const bahanNames = ['Flexi 280g', 'Vinyl', 'Art Paper 260g', 'Albatros', 'Sticker Chromo'];


const generateRandomInvoice = (): string => `INV-${Math.floor(100000 + Math.random() * 900000)}`;
const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

let nextId = 11;

const createMockItem = (): ProductionItem => ({
    id: nextId++,
    no_nota: generateRandomInvoice(),
    customer_name: getRandomElement(customerNames),
    deskripsi: getRandomElement(itemDescriptions),
    bahan_name: getRandomElement(bahanNames),
    panjang: Math.random() > 0.3 ? +(Math.random() * 5 + 1).toFixed(1) : null,
    lebar: Math.random() > 0.3 ? +(Math.random() * 2 + 1).toFixed(1) : null,
    qty: Math.floor(Math.random() * 50) + 1,
    status: 'Belum Dikerjakan',
    created_at: new Date().toISOString(),
});


const initialOrders: ProductionItem[] = Array.from({ length: 10 }, (_, i) => {
    const item = createMockItem();
    item.id = i + 1;
    const statuses: ProductionStatus[] = ['Belum Dikerjakan', 'Proses', 'Selesai'];
    item.status = getRandomElement(statuses);
    // Stagger creation times for more realistic sorting
    item.created_at = new Date(Date.now() - i * 1000 * 60).toISOString();
    return item;
});
nextId = 11;


export const getInitialOrders = (): ProductionItem[] => {
  return [...initialOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const updateOrders = (currentOrders: ProductionItem[]): ProductionItem[] => {
  let orders = [...currentOrders];
  const chance = Math.random();

  // 70% chance to update an existing order
  if (chance < 0.7 && orders.length > 0) {
    const orderToUpdateIndex = Math.floor(Math.random() * orders.length);
    const orderToUpdate = { ...orders[orderToUpdateIndex] };

    let itemWasUpdated = false;
    switch (orderToUpdate.status) {
      case 'Belum Dikerjakan':
        orderToUpdate.status = 'Proses';
        itemWasUpdated = true;
        break;
      case 'Proses':
        orderToUpdate.status = 'Selesai';
        itemWasUpdated = true;
        break;
      case 'Selesai':
         // If an order is finished, remove it and add a new one to keep the list fresh
         orders.splice(orderToUpdateIndex, 1);
         orders.push(createMockItem());
        break;
    }

    if (itemWasUpdated) {
        orderToUpdate.created_at = new Date().toISOString();
        orders[orderToUpdateIndex] = orderToUpdate;
    }
  } 
  // 10% chance to add a new order if list is not too long
  else if (chance >= 0.7 && chance < 0.8 && orders.length < 15) {
    orders.push(createMockItem());
  }
  // 20% chance do nothing, to make updates feel more natural
  
  return orders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .sort((a, b) => {
        // Sort by status priority then by time
        const statusPriority: Record<ProductionStatus, number> = {
            'Proses': 1,
            'Belum Dikerjakan': 2,
            'Selesai': 3,
        };
        if (statusPriority[a.status] !== statusPriority[b.status]) {
            return statusPriority[a.status] - statusPriority[b.status];
        }
        // Newest items first within the same status group
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
};
