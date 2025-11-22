import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import { Plus, Minus } from 'lucide-react';

interface Props {
  item: InventoryItem;
  onAdd: (item: InventoryItem, quantity: number) => void;
}

export const InventoryCard: React.FC<Props> = ({ item, onAdd }) => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => setQuantity(prev => prev + 1);
  
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAdd = () => {
    onAdd(item, quantity);
    setQuantity(1); // Reset to 1 after adding
  };

  return (
    <div className="flex flex-col justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 w-full h-full group">
      <div className="flex-1 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1 block">
          {item.category}
        </span>
        <h3 className="font-bold text-gray-800 text-lg leading-tight mb-2 line-clamp-1" title={item.name}>
          {item.name}
        </h3>
        <div className="font-mono font-medium text-gray-600 text-lg">
          {CURRENCY_SYMBOL}{item.price.toFixed(2)}
        </div>
      </div>
      
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-auto">
        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 h-10">
            <button 
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="h-full px-3 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-l-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all focus:outline-none flex items-center justify-center"
                aria-label="Decrease quantity"
            >
                <Minus size={16} />
            </button>
            <div className="w-8 text-center font-mono font-bold text-sm text-gray-800 flex items-center justify-center h-full">
                {quantity}
            </div>
            <button 
                onClick={handleIncrement}
                className="h-full px-3 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-r-lg transition-all focus:outline-none flex items-center justify-center"
                aria-label="Increase quantity"
            >
                <Plus size={16} />
            </button>
        </div>
        
        <button 
            onClick={handleAdd}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-3 rounded-lg font-bold text-sm shadow-sm active:transform active:scale-95 transition-all flex items-center justify-center"
        >
            Add
        </button>
      </div>
    </div>
  );
};