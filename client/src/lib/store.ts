// A simple local-first datastore using localStorage
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ShopSettings {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram: string;
  paymentMethods: string[];
  logo?: string;
}

export interface Customer {
  id: string;
  name: string;
  document: string; // CPF/RG
  address: string;
  whatsapp: string;
  phone?: string;
  email?: string;
  createdAt: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  type: 'peca' | 'servico';
  defaultPrice: number;
}

export interface OrderItem {
  id: string;
  serviceId?: string;
  name: string;
  type: 'peca' | 'servico';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerId: string;
  vehicle: {
    type: 'carro' | 'moto';
    brand: string;
    model: string;
    year: string;
    color: string;
    chassis: string;
    plate: string;
  };
  details: {
    entryDate: number;
    exitDate?: number;
    driver?: string;
    fuelLevel: 'reserva' | '1/4' | '1/2' | '3/4' | 'cheio';
    tires: 'novos' | 'bons' | 'ruins';
  };
  items: OrderItem[];
  payment: {
    method: string;
    type: 'vista' | 'prazo';
    total: number;
    notes?: string;
  };
  status: 'orcamento' | 'aprovado' | 'execucao' | 'finalizado' | 'entregue';
  validityDays: number;
  createdAt: number;
}

interface AppState {
  settings: ShopSettings;
  customers: Customer[];
  services: ServiceItem[];
  orders: Order[];
  nextOrderNumber: number;
  
  updateSettings: (settings: Partial<ShopSettings>) => void;
  
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => string;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  
  addService: (service: Omit<ServiceItem, 'id'>) => void;
  updateService: (id: string, service: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;
  
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'orderNumber'>) => string;
  updateOrder: (id: string, order: Partial<Order>) => void;
}

const defaultSettings: ShopSettings = {
  name: 'Sua Oficina',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  instagram: '',
  paymentMethods: ['Dinheiro', 'PIX', 'Cartão de Crédito', 'Cartão de Débito'],
};

const defaultServices: ServiceItem[] = [
  { id: '1', name: 'Pintura Para-choque Dianteiro', type: 'servico', defaultPrice: 350 },
  { id: '2', name: 'Polimento Cristalizado', type: 'servico', defaultPrice: 400 },
  { id: '3', name: 'Tinta Automotiva 1L', type: 'peca', defaultPrice: 120 },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      customers: [],
      services: defaultServices,
      orders: [],
      nextOrderNumber: 1,

      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),

      addCustomer: (customerData) => {
        const id = crypto.randomUUID();
        set((state) => ({
          customers: [...state.customers, { ...customerData, id, createdAt: Date.now() }],
        }));
        return id;
      },

      updateCustomer: (id, data) =>
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      addService: (serviceData) =>
        set((state) => ({
          services: [...state.services, { ...serviceData, id: crypto.randomUUID() }],
        })),

      updateService: (id, data) =>
        set((state) => ({
          services: state.services.map((s) => (s.id === id ? { ...s, ...data } : s)),
        })),

      deleteService: (id) =>
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
        })),

      addOrder: (orderData) => {
        const id = crypto.randomUUID();
        const orderNumber = get().nextOrderNumber;
        set((state) => ({
          orders: [...state.orders, { ...orderData, id, orderNumber, createdAt: Date.now() }],
          nextOrderNumber: state.nextOrderNumber + 1,
        }));
        return id;
      },

      updateOrder: (id, data) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
        })),
    }),
    {
      name: 'oficina-storage',
    }
  )
);
