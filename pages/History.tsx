import React, { useEffect, useState } from 'react';
import { HistoryItem } from '../types';
import { mockBackend } from '../services/mockBackend';

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const user = mockBackend.getCurrentUser();

  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        try {
          const data = await mockBackend.getHistory(user.id);
          setHistory(data);
        } catch (error) {
          console.error("Failed to fetch history", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <div className="pb-24 pt-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Activity History</h1>
        <p className="text-gray-500 text-sm">Track your impact and requests.</p>
      </header>

      {loading ? (
        <div className="space-y-4">
             {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {history.length === 0 ? (
             <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm z-10 relative">
               <span className="text-4xl block mb-2">📜</span>
               <p>No activity yet.</p>
             </div>
          ) : (
             history.map((item) => (
              <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icon */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10
                  ${item.type === 'Donation' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                  {item.type === 'Donation' ? '🩸' : '📢'}
                </div>
                
                {/* Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-gray-900">{item.type}</span>
                    <time className="font-mono text-xs text-gray-500">{item.date}</time>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.location}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${item.status === 'Completed' || item.status === 'Accepted' || item.status === 'Fulfilled' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'}`}>
                      {item.status}
                    </span>
                    <span className="text-xs text-gray-400">• {item.units} Unit(s)</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default History;