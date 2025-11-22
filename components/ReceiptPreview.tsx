import React from 'react';
import { Receipt } from 'lucide-react';

interface Props {
  text: string;
}

export const ReceiptPreview: React.FC<Props> = ({ text }) => {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2 text-gray-700">
        <Receipt size={16} />
        <span className="text-sm font-bold">Latest Receipt</span>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 shadow-inner overflow-hidden relative group">
        <pre className="font-mono text-xs text-green-400 whitespace-pre-wrap overflow-y-auto max-h-[200px] leading-relaxed">
          {text || "Waiting for transaction..."}
        </pre>
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] rounded-lg"></div>
      </div>
    </div>
  );
};