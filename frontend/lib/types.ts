export type UserRole = 'ADMIN' | 'MANAGER' | 'CUSTOMER';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  sku: string;
  title: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category_id?: number;
  category?: Category;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  total_amount: number;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  product_id: number;
  unit_price: number;
  quantity: number;
  product?: Product;
}

export interface PaymentLog {
  id: number;
  amount: number;
  status: string;
  transaction_id: string;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  celery_task_id?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  payments: PaymentLog[];
}

export interface DashboardStats {
  total_orders: number;
  total_revenue: number;
  total_products: number;
  low_stock_products_count: number;
  pending_orders_count: number;
  completed_orders_count: number;
}
