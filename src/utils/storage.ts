import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

// Define our storage schema
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled';
  totalAmount: number;
  depositAmount?: number;
  dueDate: number;
  pickupDate?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  email?: string;
  taxRate: number;
  businessHours?: {
    [day: string]: { open: string; close: string } | { closed: boolean };
  };
}

// Storage keys
const STORAGE_KEYS = {
  CUSTOMERS: 'dryclean_customers',
  ORDERS: 'dryclean_orders',
  SETTINGS: 'dryclean_settings',
};

// Customer storage functions
export const customerStorage = {
  async getAll(): Promise<Customer[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error reading customers from storage:', e);
      return [];
    }
  },

  async getById(id: string): Promise<Customer | null> {
    try {
      const customers = await this.getAll();
      return customers.find(customer => customer.id === id) || null;
    } catch (e) {
      console.error('Error reading customer from storage:', e);
      return null;
    }
  },

  async save(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    try {
      const customers = await this.getAll();
      const timestamp = Date.now();
      
      const newCustomer: Customer = {
        ...customer,
        id: uuidv4(),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.CUSTOMERS,
        JSON.stringify([...customers, newCustomer])
      );
      
      return newCustomer;
    } catch (e) {
      console.error('Error saving customer to storage:', e);
      throw e;
    }
  },

  async update(customer: Customer): Promise<Customer> {
    try {
      const customers = await this.getAll();
      const index = customers.findIndex(c => c.id === customer.id);
      
      if (index === -1) {
        throw new Error(`Customer with id ${customer.id} not found`);
      }
      
      const updatedCustomer = {
        ...customer,
        updatedAt: Date.now(),
      };
      
      customers[index] = updatedCustomer;
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.CUSTOMERS,
        JSON.stringify(customers)
      );
      
      return updatedCustomer;
    } catch (e) {
      console.error('Error updating customer in storage:', e);
      throw e;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const customers = await this.getAll();
      const filteredCustomers = customers.filter(customer => customer.id !== id);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.CUSTOMERS,
        JSON.stringify(filteredCustomers)
      );
    } catch (e) {
      console.error('Error deleting customer from storage:', e);
      throw e;
    }
  },

  async search(query: string): Promise<Customer[]> {
    try {
      const customers = await this.getAll();
      const lowerQuery = query.toLowerCase();
      
      return customers.filter(
        customer =>
          customer.name.toLowerCase().includes(lowerQuery) ||
          customer.phone.includes(query) ||
          (customer.email && customer.email.toLowerCase().includes(lowerQuery))
      );
    } catch (e) {
      console.error('Error searching customers in storage:', e);
      return [];
    }
  },
};

// Order storage functions
export const orderStorage = {
  async getAll(): Promise<Order[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error reading orders from storage:', e);
      return [];
    }
  },

  async getById(id: string): Promise<Order | null> {
    try {
      const orders = await this.getAll();
      return orders.find(order => order.id === id) || null;
    } catch (e) {
      console.error('Error reading order from storage:', e);
      return null;
    }
  },

  async getByCustomerId(customerId: string): Promise<Order[]> {
    try {
      const orders = await this.getAll();
      return orders.filter(order => order.customerId === customerId);
    } catch (e) {
      console.error('Error reading customer orders from storage:', e);
      return [];
    }
  },

  async save(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    try {
      const orders = await this.getAll();
      const timestamp = Date.now();
      
      const newOrder: Order = {
        ...order,
        id: uuidv4(),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.ORDERS,
        JSON.stringify([...orders, newOrder])
      );
      
      return newOrder;
    } catch (e) {
      console.error('Error saving order to storage:', e);
      throw e;
    }
  },

  async update(order: Order): Promise<Order> {
    try {
      const orders = await this.getAll();
      const index = orders.findIndex(o => o.id === order.id);
      
      if (index === -1) {
        throw new Error(`Order with id ${order.id} not found`);
      }
      
      const updatedOrder = {
        ...order,
        updatedAt: Date.now(),
      };
      
      orders[index] = updatedOrder;
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.ORDERS,
        JSON.stringify(orders)
      );
      
      return updatedOrder;
    } catch (e) {
      console.error('Error updating order in storage:', e);
      throw e;
    }
  },

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    try {
      const orders = await this.getAll();
      const index = orders.findIndex(o => o.id === id);
      
      if (index === -1) {
        throw new Error(`Order with id ${id} not found`);
      }
      
      const updatedOrder = {
        ...orders[index],
        status,
        updatedAt: Date.now(),
      };
      
      orders[index] = updatedOrder;
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.ORDERS,
        JSON.stringify(orders)
      );
      
      return updatedOrder;
    } catch (e) {
      console.error('Error updating order status in storage:', e);
      throw e;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const orders = await this.getAll();
      const filteredOrders = orders.filter(order => order.id !== id);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.ORDERS,
        JSON.stringify(filteredOrders)
      );
    } catch (e) {
      console.error('Error deleting order from storage:', e);
      throw e;
    }
  },

  async getByStatus(status: Order['status']): Promise<Order[]> {
    try {
      const orders = await this.getAll();
      return orders.filter(order => order.status === status);
    } catch (e) {
      console.error(`Error getting orders with status ${status} from storage:`, e);
      return [];
    }
  },
};

// Settings storage functions
export const settingsStorage = {
  async get(): Promise<StoreSettings | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Error reading settings from storage:', e);
      return null;
    }
  },

  async save(settings: StoreSettings): Promise<StoreSettings> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(settings)
      );
      
      return settings;
    } catch (e) {
      console.error('Error saving settings to storage:', e);
      throw e;
    }
  },
};

// Utility function to clear all data (use with caution!)
export const clearAllData = async (): Promise<void> => {
  try {
    const keys = [
      STORAGE_KEYS.CUSTOMERS,
      STORAGE_KEYS.ORDERS,
      STORAGE_KEYS.SETTINGS,
    ];
    await AsyncStorage.multiRemove(keys);
  } catch (e) {
    console.error('Error clearing all data from storage:', e);
    throw e;
  }
};

// Utility to export all data as a JSON object
export const exportData = async (): Promise<{
  customers: Customer[];
  orders: Order[];
  settings: StoreSettings | null;
}> => {
  try {
    const customers = await customerStorage.getAll();
    const orders = await orderStorage.getAll();
    const settings = await settingsStorage.get();
    
    return {
      customers,
      orders,
      settings,
    };
  } catch (e) {
    console.error('Error exporting data from storage:', e);
    throw e;
  }
};

// Utility to import data
export const importData = async (data: {
  customers?: Customer[];
  orders?: Order[];
  settings?: StoreSettings;
}): Promise<void> => {
  try {
    if (data.customers) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CUSTOMERS,
        JSON.stringify(data.customers)
      );
    }
    
    if (data.orders) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ORDERS,
        JSON.stringify(data.orders)
      );
    }
    
    if (data.settings) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(data.settings)
      );
    }
  } catch (e) {
    console.error('Error importing data to storage:', e);
    throw e;
  }
};