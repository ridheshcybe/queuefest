'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { apiFetch } from '../lib/api';

export default function PatientDisplayScreen() {
  const [queue, setQueue] = useState([]);
  const [serving, setServing] = useState(null);
  const [lookup, setLookup] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avgTime, setAvgTime] = useState(12);
  const toast = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [queueData, servingData, statsData] = await Promise.all([
        apiFetch('/api/queue'),
        apiFetch('/api/queue/serving'),
        apiFetch('/api/stats'), // now public
      ]);
      // Only waiting patients in queue
      const waiting = queueData.filter(p => p.status === 'waiting');
      setQueue(waiting);
      setServing(servingData);
      setAvgTime(statsData.averageWait || 12);
    } catch (err) {
      toast('Failed to load queue data', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-[#00478d] text-4xl">
          refresh
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9ff] text-[#191c21] font-body-md overflow-hidden h-screen flex flex-col">
      <header className="bg-white shadow-sm flex justify-between items-center w-full px-6 h-16 max-w-[1440px] mx-auto z-50">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold text-[#00478d]">Queue Cure '26</span>
          <div className="h-6 w-px bg-[#c2c6d4] mx-2" />
          <span className="text-[20px] font-semibold leading-[28px] text-[#424752]">
            Waiting Room Display
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[13px] font-bold text-[#00478d] uppercase tracking-wider">
              Live Status
            </span>
            <span className="text-[16px] text-[#006970] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#006970] animate-pulse" /> Synced with Reception
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-6 grid grid-cols-12 gap-6 overflow-hidden">
        {/* left column */}
        <div className="col-span-8 flex flex-col gap-6 h-full overflow-hidden">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-6 flex items-center justify-between shadow-sm border border-[#c2c6d4]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#d6e3ff] flex items-center justify-center text-[#00478d]">
                  <span className="material-symbols-outlined text-[20px]">schedule</span>
                </div>
                <div>
                  <p className="text-[#424752] font-medium">Estimated Wait</p>
                  <p className="text-3xl font-bold text-[#00478d]">{queue.length * avgTime} mins</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 flex items-center justify-between shadow-sm border border-[#c2c6d4]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#7af1fc] flex items-center justify-center text-[#006e75]">
                  <span className="material-symbols-outlined text-[20px]">group</span>
                </div>
                <div>
                  <p className="text-[#424752] font-medium">Total Waiting</p>
                  <p className="text-3xl font-bold text-[#006970]">{queue.length} Patients</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-xl border-l-[12px] border-[#00478d] shadow-sm flex flex-col items-center justify-center relative overflow-hidden token-shadow">
            <div className="absolute top-8 left-8">
              <span className="bg-[#00478d] text-white px-4 py-1 rounded-full font-bold text-[13px] tracking-widest uppercase">
                Now Serving
              </span>
            </div>
            {serving ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#00478d]/10 rounded-full blur-3xl opacity-50 pulse-active scale-150" />
                  <h1 className="text-[72px] font-bold leading-[80px] tracking-tight text-[#00478d] relative z-10">
                    {serving.token}
                  </h1>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-3xl font-semibold text-[#191c21]">Consultation Room 04</span>
                  <span className="text-[18px] text-[#424752]">Please proceed to the marked door</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-4">
                <div className="w-24 h-24 rounded-full bg-[#e7e8f0] flex items-center justify-center text-[#727783]">
                  <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>
                    person_search
                  </span>
                </div>
                <div>
                  <h2 className="text-[48px] font-bold leading-[56px] tracking-tight text-[#424752]">
                    Waiting for Patients
                  </h2>
                  <p className="text-[18px] text-[#424752] max-w-md">
                    Preparing to call next patient. Please keep your token ready.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* right column */}
        <div className="col-span-4 flex flex-col gap-6 h-full overflow-hidden">
          <div className="flex-1 bg-[#ecedf6] rounded-xl border border-[#c2c6d4] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-[#c2c6d4] bg-white flex justify-between items-center">
              <h2 className="text-[20px] font-semibold leading-[28px] text-[#191c21] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00478d]">arrow_forward</span> Up Next
              </h2>
              <span className="bg-[#d6e3ff] text-[#001b3d] px-2 py-1 rounded-md text-[13px] font-bold">
                {queue.length} Queue
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {queue.map((item, idx) => (
                <div
                  key={item.token}
                  className="bg-white p-4 rounded-lg shadow-sm border border-[#c2c6d4] flex items-center justify-between hover:scale-[1.02] transition-transform duration-200"
                  style={{ opacity: Math.max(1 - idx * 0.15, 0.3) }}
                >
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#424752] uppercase">Token</span>
                    <span className="text-3xl font-black text-[#191c21]">{item.token}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[13px] font-bold text-[#424752] uppercase">Est. Wait</span>
                    <div className="flex items-center gap-1 text-[#00478d] font-bold">
                      <span className="material-symbols-outlined text-[16px]">avg_time</span>
                      {(idx + 1) * avgTime}m
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#00478d] text-white rounded-xl p-6 shadow-lg flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">search</span>
              <h3 className="text-[20px] font-semibold leading-[28px]">Lookup Your Status</h3>
            </div>
            <div className="relative">
              <input
                className="w-full h-14 bg-[#005eb8] text-white border-none rounded-lg px-4 focus:ring-2 focus:ring-[#7df4ff] placeholder:text-[#c8daff]/70 text-[20px] font-bold uppercase"
                placeholder="Enter Token"
                value={lookup}
                onChange={(e) => setLookup(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                type="text"
              />
              <button
                className="absolute right-2 top-2 h-10 px-4 bg-[#006970] text-white rounded-md font-bold hover:bg-[#7af1fc] hover:text-[#006e75] transition-all"
                onClick={handleLookup}
              >
                Check
              </button>
            </div>
            {lookupResult && (
              <div className="p-4 bg-white/10 rounded-lg border border-white/20 flex flex-col gap-1 animate-in fade-in slide-in-from-top-4 duration-300">
                {lookupResult.patient?.status === 'serving' ? (
                  <div className="text-center font-bold text-[#7df4ff]">
                    You are now being served! Please proceed to Consultation Room 04.
                  </div>
                ) : lookupResult.patient?.status === 'completed' ? (
                  <div className="text-center font-bold opacity-80">
                    Your visit has been completed.
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[16px] opacity-80">Queue Position:</span>
                      <span className="text-[20px] font-bold">#{lookupResult.pos}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[16px] opacity-80">Estimated Wait:</span>
                      <span className="text-[20px] font-bold">~{lookupResult.wait} mins</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}