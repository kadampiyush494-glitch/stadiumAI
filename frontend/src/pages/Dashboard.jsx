import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import StadiumMap from '../components/map/StadiumMap';

export function Dashboard() {
  const [queues, setQueues] = useState([]);

  useEffect(() => {
    // Mock queue data until backend is ready
    setQueues([
      { id: 1, name: 'Gate A Entrance', waitTime: 5, status: 'low' },
      { id: 2, name: 'Food Stall C', waitTime: 15, status: 'medium' },
      { id: 3, name: 'Restroom North', waitTime: 25, status: 'high' }
    ]);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-[500px]">
          <StadiumMap onRouteAnnounce={(msg) => console.log('A11y Announce:', msg)} />
        </div>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Queues</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {queues.map(q => (
              <div key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="font-medium text-sm">{q.name}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  q.status === 'low' ? 'bg-green-500/20 text-green-400' :
                  q.status === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {q.waitTime} mins
                </span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
          </CardHeader>
          <p className="text-sm text-white/70 mb-4">
            Ask Gemini about the fastest exits or food options.
          </p>
          <Button variant="accent" className="w-full">Open Chat</Button>
        </Card>
      </div>
    </div>
  );
}
