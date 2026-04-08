import { Rack, Task } from './types';

const generateRHHistory = (baseRH: number) => ({
  daily: Math.floor(baseRH * (0.8 + Math.random() * 0.6)),
  weekly: Math.floor(baseRH * (5 + Math.random() * 3)),
  monthly: Math.floor(baseRH * (20 + Math.random() * 15)),
});

const generateRack = (id: string): Rack => {
  let category: Rack['category'] = 'Makanan';
  let color = '#3FC76A'; // Green default
  let label = 'Lengkap';
  let status: Rack['status'] = 'ok';

  // Categorize based on ID prefixes to match image colors
  if (['LA', 'IB', 'OB', 'NA', 'LC', 'OA', 'LD', 'LE', 'LF'].some(p => id.startsWith(p))) {
    category = 'Chiller';
    color = '#76D7C4'; // Blue-ish
  } else if (['ZI', 'ZL', 'ZK', 'ZM', 'YA', 'YN', 'YH', 'YI', 'YJ', 'YL', 'YM', 'YO'].some(p => id.startsWith(p))) {
    category = 'Gondola';
    color = '#F9E79F'; // Orange-ish
  } else if (['BA', 'FB'].some(p => id.startsWith(p))) {
    category = 'Makanan';
    color = '#F1948A'; // Red-ish
    status = 'danger';
    label = 'Prioritas';
  } else if (['IA', 'HA', 'HB', 'VJ', 'VL', 'ZH', 'VI', 'VF', 'VD', 'VB', 'YB', 'YG'].some(p => id.startsWith(p))) {
    category = 'Dinding';
    color = '#D5D8DC'; // Gray
  }

  const baseRH = 10 + Math.floor(Math.random() * 40);
  const slots = 12 + Math.floor(Math.random() * 12);
  const filled = Math.floor(slots * (0.5 + Math.random() * 0.5));

  const productNames = [
    'Susu Ultra 250ml', 'Indomie Goreng', 'Chitato BBQ', 'Coca Cola 1.5L', 
    'Pringles Sour Cream', 'Silverqueen Almond', 'Aqua 600ml', 'Kopi Kapal Api',
    'Beras Pandan Wangi', 'Minyak Goreng Bimoli', 'Gula Pasir Gulaku', 'Teh Celup Sariwangi',
    'Sabun Lifebuoy', 'Shampoo Pantene', 'Pasta Gigi Pepsodent', 'Deterjen Rinso'
  ];

  const productImages = [
    'https://picsum.photos/seed/milk/400/400',
    'https://picsum.photos/seed/noodle/400/400',
    'https://picsum.photos/seed/snack/400/400',
    'https://picsum.photos/seed/soda/400/400',
    'https://picsum.photos/seed/coffee/400/400',
    'https://picsum.photos/seed/rice/400/400',
    'https://picsum.photos/seed/soap/400/400',
    'https://picsum.photos/seed/shampoo/400/400'
  ];

  const products: Rack['products'] = Array.from({ length: 2 + Math.floor(Math.random() * 3) }, (_, i) => ({
    name: i === 0 ? `Produk ${id}` : productNames[Math.floor(Math.random() * productNames.length)],
    barcode: `899${Math.floor(Math.random() * 1000000000)}`,
    price: `Rp ${(5 + Math.floor(Math.random() * 45)) * 1000}`,
    image: productImages[Math.floor(Math.random() * productImages.length)],
    rating: (4 + Math.random()).toFixed(1),
    reviews: Math.floor(Math.random() * 500) + 50,
    likes: Math.floor(Math.random() * 200) + 10,
    baseRH,
  }));

  return {
    id,
    status,
    color,
    label,
    category,
    slots,
    filled,
    rapi: Math.random() > 0.2,
    harga: Math.random() > 0.1,
    shelfData: Array.from({ length: 3 + Math.floor(Math.random() * 2) }, () => Math.floor(filled / 3)),
    products,
    rhHistory: generateRHHistory(baseRH),
    lastUpdate: `${Math.floor(Math.random() * 5) + 1}j lalu`
  };
};

const allIds = [
  "IA5", "HA1", "HA2", "HA3", "HA4", "HA5", "HA6", "HA7", "HA8", "HB1", "VJT", "VLT", "ZHH",
  "IA4", "LA1", "IB1", "OB1", "NA3", "NA2", "NA1", "LA2", "LA3", "LE1", "LF2", "VJ1",
  "IA3", "LF1", "LB2", "LB1", "LD1", "LD2", "LC1", "LC2", "LC3", "OA1", "OA2", "VI1",
  "IA2", "JD3", "JD2", "JD1", "KA2", "KA1", "UAI", "MA1", "VF2",
  "IA1", "JC1", "JC2", "JB1", "JB2", "JB3", "UA2", "PA1", "VF1",
  "JA1", "ZI4", "ZI1", "ZI3", "ZI2", "ZL1", "ZK1", "ZK2", "VD1",
  "SA3", "EA1", "IC2", "IC1", "RA1", "OD2", "OD1", "TA2", "TA1", "ID1", "ZM1", "VB4",
  "SA2", "EA2", "EA3", "EA4", "EA5", "GA3", "GA2", "GA1", "VB3",
  "SA1", "BA3", "BA2", "BA1", "FB1", "FA3", "FA2", "FA1", "FC1", "VB2",
  "AA5", "DA1", "DA2", "DA3", "CB1", "CA1", "CA2", "CA3", "VB1",
  "AA4", "AKA", "AK0", "AK9", "AK8", "AK7", "AK6", "AK5", "AK4", "YB1",
  "AA3", "AK3", "AK2", "AK1", "YA4", "YA3", "YA2", "YA1", "YN1", "YB2",
  "AA2", "YH1", "YI1", "YJ1", "YL1", "YL2", "YL3", "YL4", "YG1",
  "AA1", "YL5", "YL6", "YM1", "YN2", "YO1", "YO2", "YG2"
];

export const RACKS_DATA: Rack[] = allIds.map(id => generateRack(id));

export const JADWAL: Task[] = [
  {
    time: "08:00",
    title: "Cek stok Rak AK4 — Susu Ultra (Prioritas)",
    status: "done",
  },
  {
    time: "09:30",
    title: "Update label harga Rak AK3 & CA3",
    status: "done",
  },
  { time: "11:00", title: "Rapikan Rak EA3 & HA1", status: "active" },
  { time: "13:00", title: "Isi ulang Rak YL6 & ZI1", status: "todo" },
  { time: "15:00", title: "Laporan sore harian", status: "todo" },
];
