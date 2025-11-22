
export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface CartItem extends InventoryItem {
  quantity: number;
}

export interface Promotion {
  id: string;
  title: string;
  isActive: boolean;
  code: string;
  description: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userID: string;
  action: string;
  details?: string;
}

export enum ViewState {
  POS = 'POS',
  DASHBOARD = 'DASHBOARD',
  SETTINGS = 'SETTINGS'
}
