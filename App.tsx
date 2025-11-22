
import React, { useState, useCallback } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  CreditCard, 
  Sparkles, 
  User,
  Plus,
  Minus,
  LayoutDashboard,
  Store
} from 'lucide-react';
import { InventoryCard } from './components/InventoryCard';
import { AuditLogView } from './components/AuditLogView';
import { ReceiptPreview } from './components/ReceiptPreview';
import { Dashboard } from './components/Dashboard';
import { SAMPLE_INVENTORY, INITIAL_PROMOTIONS, CURRENCY_SYMBOL } from './constants';
import { InventoryItem, CartItem, AuditLogEntry, ViewState } from './types';
import { generateUpsellSuggestions } from './services/geminiService';

export default function App() {
  // --- State ---
  const [view, setView] = useState<ViewState>(ViewState.POS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [lastReceipt, setLastReceipt] = useState<string>("");
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [isThinking, setIsThinking] = useState(false);
  
  // Session Analytics State
  const [sessionStats, setSessionStats] = useState({
    totalRevenue: 0.00,
    orderCount: 0
  });

  // --- Derived State ---
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // --- Helpers ---
  const addLog = useCallback((action: string, details?: string) => {
    const newLog: AuditLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      userID: 'User-1',
      action,
      details
    };
    setAuditLogs(prev => [...prev, newLog]);
  }, []);

  // --- Handlers ---
  const addToCart = (item: InventoryItem, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        addLog("Updated Cart", `Added ${quantity}x ${item.name}`);
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      } else {
        addLog("Added to Cart", `Added ${quantity}x ${item.name}`);
        return [...prev, { ...item, quantity: quantity }];
      }
    });
    if (aiSuggestion) setAiSuggestion(""); 
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const updatePrice = (itemId: string, newPrice: number) => {
    setCart(prev => prev.map(item => 
      item.id === itemId ? { ...item, price: newPrice >= 0 ? newPrice : 0 } : item
    ));
  };

  const addCustomItem = () => {
    const newItem: CartItem = {
      id: `custom-${Date.now()}`,
      name: "Custom Item",
      price: 0.00,
      category: "Custom",
      quantity: 1
    };
    setCart(prev => [...prev, newItem]);
    addLog("Added Custom Item", "Manual entry");
  };

  const removeFromCart = (itemId: string) => {
    const item = cart.find(i => i.id === itemId);
    if (item) {
      addLog("Removed from Cart", `Removed ${item.name}`);
      setCart(prev => prev.filter(i => i.id !== itemId));
    }
  };

  const generateReceiptText = () => {
    const dateStr = new Date().toLocaleString();
    let text = `      SWIFTPOS RETAIL\n`;
    text += `      123 React Lane\n`;
    text += `--------------------------\n`;
    text += `Date: ${dateStr}\n`;
    text += `Order ID: #${Math.floor(Math.random() * 9999)}\n`;
    text += `--------------------------\n`;
    
    cart.forEach(item => {
      const lineTotal = item.price * item.quantity;
      text += `${item.quantity}x ${item.name.padEnd(12)} ${CURRENCY_SYMBOL}${lineTotal.toFixed(2)}\n`;
    });
    
    text += `--------------------------\n`;
    text += `TOTAL:          ${CURRENCY_SYMBOL}${totalAmount.toFixed(2)}\n`;
    return text;
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const receipt = generateReceiptText();
    setLastReceipt(receipt);
    
    setSessionStats(prev => ({
      totalRevenue: prev.totalRevenue + totalAmount,
      orderCount: prev.orderCount + 1
    }));

    addLog("Checkout Completed", `Total: ${CURRENCY_SYMBOL}${totalAmount.toFixed(2)}`);
    setCart([]);
    setAiSuggestion("");
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 bg-indigo-900 flex flex-col items-center py-8 gap-8 shadow-xl z-20">
         {/* Logo/Brand */}
         <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-900/50">
           <Sparkles className="text-white" size={20} />
         </div>

         {/* Nav Items */}
         <button 
           onClick={() => setView(ViewState.POS)}
           className={`p-3 rounded-xl transition-all duration-200 group relative ${view === ViewState.POS ? 'bg-white text-indigo-900 shadow-lg' : 'text-indigo-200 hover:bg-white/10'}`}
         >
           <Store size={24} />
           <span className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
             Point of Sale
           </span>
         </button>

         <button 
           onClick={() => setView(ViewState.DASHBOARD)}
           className={`p-3 rounded-xl transition-all duration-200 group relative ${view === ViewState.DASHBOARD ? 'bg-white text-indigo-900 shadow-lg' : 'text-indigo-200 hover:bg-white/10'}`}
         >
           <LayoutDashboard size={24} />
           <span className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
             Dashboard
           </span>
         </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {view === ViewState.POS ? (
          <>
            {/* Left: Inventory */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
               {/* Header */}
               <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center shadow-sm z-10">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">SwiftPOS</h1>
                    <p className="text-sm text-gray-500 font-medium">Retail Terminal #01 • {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="bg-indigo-50 px-4 py-2 rounded-full flex items-center gap-2 text-indigo-700 font-bold text-sm border border-indigo-100">
                        <User size={16} />
                        <span>Admin User</span>
                     </div>
                  </div>
               </header>

               {/* Inventory Grid */}
               <div className="flex-1 overflow-y-auto p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                     {SAMPLE_INVENTORY.map(item => (
                        <div key={item.id} className="h-full">
                           <InventoryCard item={item} onAdd={addToCart} />
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Right: Cart & Audit */}
            <div className="w-[450px] bg-white border-l border-gray-200 flex flex-col shadow-2xl z-10">
               {/* Cart Section */}
               <div className="flex-1 flex flex-col min-h-0">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                     <div className="flex items-center gap-2 text-gray-800">
                        <ShoppingCart size={20} className="text-indigo-600" />
                        <h2 className="font-bold text-lg">Current Order</h2>
                     </div>
                     <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-md text-xs font-bold font-mono">
                        {cart.reduce((acc, i) => acc + i.quantity, 0)} ITEMS
                     </span>
                  </div>

                  {/* Cart Items List */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-3">
                     {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-60">
                           <ShoppingCart size={64} strokeWidth={1} />
                           <p className="font-medium">Cart is empty</p>
                        </div>
                     ) : (
                        cart.map(item => (
                           <div key={item.id} className="group flex flex-col gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-200">
                              {/* Top Row: Name & Remove */}
                              <div className="flex justify-between items-start">
                                 <div>
                                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{item.category}</span>
                                    <h4 className="font-bold text-gray-800">{item.name}</h4>
                                 </div>
                                 <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                  >
                                    <Trash2 size={16} />
                                 </button>
                              </div>

                              {/* Bottom Row: Quantity & Price Controls */}
                              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                 {/* Quantity Control */}
                                 <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 h-8">
                                    <button 
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      className="px-2 h-full text-gray-500 hover:text-indigo-600 hover:bg-white rounded-l-lg transition-colors"
                                    >
                                      <Minus size={14} />
                                    </button>
                                    <input 
                                      type="number"
                                      min="1"
                                      className="w-10 h-full bg-transparent text-center font-mono text-sm font-bold text-gray-800 focus:outline-none"
                                      value={item.quantity}
                                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                    />
                                    <button 
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="px-2 h-full text-gray-500 hover:text-indigo-600 hover:bg-white rounded-r-lg transition-colors"
                                    >
                                      <Plus size={14} />
                                    </button>
                                 </div>

                                 {/* Price Control */}
                                 <div className="flex items-center gap-1">
                                    <span className="text-gray-400 text-xs font-medium">@</span>
                                    <div className="relative group/price">
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs pointer-events-none">{CURRENCY_SYMBOL}</span>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="w-20 pl-5 pr-1 py-1 text-right font-mono font-bold text-gray-800 bg-transparent hover:bg-gray-50 focus:bg-indigo-50 rounded border border-transparent hover:border-gray-200 focus:border-indigo-300 focus:outline-none transition-all text-sm"
                                        value={item.price}
                                        onChange={(e) => updatePrice(item.id, parseFloat(e.target.value) || 0)}
                                      />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))
                     )}
                     
                     {/* Add Custom Item Button */}
                     <button 
                        onClick={addCustomItem}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium text-sm hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2"
                     >
                        <Plus size={16} />
                        <span>Add Custom Item</span>
                     </button>
                  </div>

                  {/* Totals & Actions */}
                  <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-4">
                     {/* AI Suggestion */}
                     {aiSuggestion && (
                       <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white shadow-lg relative overflow-hidden animate-in slide-in-from-bottom-2">
                          <div className="flex items-start gap-3 relative z-10">
                             <Sparkles size={18} className="mt-0.5 text-yellow-300 shrink-0" />
                             <div>
                                <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">AI Recommendation</p>
                                <p className="text-sm font-medium leading-relaxed">{aiSuggestion}</p>
                             </div>
                          </div>
                       </div>
                     )}

                     <div className="space-y-2">
                        <div className="flex justify-between items-center text-gray-600">
                           <span className="font-medium">Subtotal</span>
                           <span className="font-mono">{CURRENCY_SYMBOL}{totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600">
                           <span className="font-medium">Tax (0%)</span>
                           <span className="font-mono">{CURRENCY_SYMBOL}0.00</span>
                        </div>
                        <div className="flex justify-between items-center text-2xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                           <span>Total</span>
                           <span className="font-mono">{CURRENCY_SYMBOL}{totalAmount.toFixed(2)}</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                        <button 
                           className="flex items-center justify-center gap-2 bg-white border border-indigo-200 text-indigo-600 py-3.5 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
                           onClick={async () => {
                              setIsThinking(true);
                              const suggestion = await generateUpsellSuggestions(cart, INITIAL_PROMOTIONS);
                              setAiSuggestion(suggestion);
                              setIsThinking(false);
                           }}
                           disabled={isThinking}
                        >
                           {isThinking ? <span className="animate-spin">⟳</span> : <Sparkles size={18} />}
                           <span>Upsell AI</span>
                        </button>
                        <button 
                           onClick={handleCheckout}
                           disabled={cart.length === 0}
                           className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-gray-900/20 hover:bg-black hover:shadow-xl active:transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <CreditCard size={18} />
                           <span>Pay Now</span>
                        </button>
                     </div>
                  </div>
               </div>

               {/* Audit Log Drawer */}
               <div className="h-1/4 min-h-[200px] border-t border-gray-200">
                  <AuditLogView logs={auditLogs} />
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 bg-gray-100 overflow-y-auto p-8">
             <Dashboard stats={sessionStats} logs={auditLogs} />
          </div>
        )}
        
        {/* Receipt Overlay */}
        {lastReceipt && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setLastReceipt("")}>
             <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-lg flex items-center gap-2">
                      <CreditCard className="text-green-600" size={20} /> 
                      Transaction Complete
                   </h3>
                   <button onClick={() => setLastReceipt("")} className="text-gray-400 hover:text-gray-600"><Trash2 size={20}/></button> 
                </div>
                <ReceiptPreview text={lastReceipt} />
                <button onClick={() => setLastReceipt("")} className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">
                   Start New Order
                </button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
