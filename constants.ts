import { InventoryItem, Promotion } from './types';

export const SAMPLE_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Beer', price: 15.0, category: 'Beverage' },
  { id: '2', name: 'Water', price: 8.0, category: 'Beverage' },
  { id: '3', name: 'Soda', price: 10.0, category: 'Beverage' },
  { id: '4', name: 'Burger', price: 25.0, category: 'Food' },
  { id: '5', name: 'Fries', price: 12.0, category: 'Food' },
  { id: '6', name: 'Salad', price: 18.0, category: 'Food' },
];

export const INITIAL_PROMOTIONS: Promotion[] = [
  { id: 'p1', title: 'Happy Hour', isActive: true, code: 'HH2024', description: '50% off drinks' },
  { id: 'p2', title: 'Lunch Special', isActive: false, code: 'LUNCH20', description: '20% off food' },
  { id: 'p3', title: 'Employee Disc.', isActive: true, code: 'STAFF', description: '15% off total' },
];

export const CURRENCY_SYMBOL = '₵';