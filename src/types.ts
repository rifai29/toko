export interface Product {
  name: string;
  barcode: string;
  price: string;
  image: string;
  rating?: string;
  reviews?: number;
  likes?: number;
  baseRH: number;
  shelving: number;
  baris: number;
  plu: string;
  description: string;
}

export interface RHHistory {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface Rack {
  id: string;
  status: 'full' | 'ok' | 'warn' | 'danger';
  color: string;
  label: string;
  category: string;
  slots: number;
  filled: number;
  rapi: boolean;
  harga: boolean;
  shelfData: number[];
  products: Product[];
  rhHistory?: RHHistory;
  lastUpdate: string;
}

export interface Task {
  time: string;
  title: string;
  status: 'done' | 'active' | 'todo';
}
