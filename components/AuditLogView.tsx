import React, { useMemo } from 'react';
import { AuditLogEntry } from '../types';
import { Clock, Activity } from 'lucide-react';

interface Props {
  logs: AuditLogEntry[];
}

export const AuditLogView: React.FC<Props> = ({ logs }) => {
  // Sort logs descending
  const sortedLogs = useMemo(() => [...logs].reverse(), [logs]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col h-full shadow-sm">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <Activity size={18} className="text-gray-500" />
        <h2 className="font-semibold text-gray-700">Audit Log</h2>
      </div>
      <div className="overflow-y-auto flex-1 p-0">
        {sortedLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No activity recorded.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedLogs.map((log) => (
              <div key={log.id} className="p-3 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                    <Clock size={10} />
                    {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    {log.userID}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800">{log.action}</p>
                {log.details && (
                  <p className="text-xs text-gray-500 mt-1 pl-2 border-l-2 border-gray-200">
                    {log.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};