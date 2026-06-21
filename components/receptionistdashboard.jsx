'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { apiFetch } from '../lib/api';
import Link from 'next/link';

export default function ReceptionistDashboard() {
  const { logout } = useAuth();
  const toast = useToast();
  const [queue, setQueue] = useState([]);
  const [serving, setServing] = useState(null);
  const [completedToday, setCompletedToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPriority, setNewPriority] = useState('Normal');
  const [avgTime, setAvgTime] = useState(0); // will be set from stats

  const fetchData = async () => {
    try {
      const [queueData, servingData, statsData] = await Promise.all([
        apiFetch('/api/queue'),
        apiFetch('/api/queue/serving'),
        apiFetch('/api/stats'),
      ]);
      setQueue(queueData.filter((p) => p.status === 'waiting'));
      setServing(servingData);
      setCompletedToday(statsData.completed || 0);
      setAvgTime(statsData.averageWait || 12); // fallback to 12 if not available
    } catch (err) {
      if (err.status === 401) {
        logout();
        window.location.href = '/';
      } else {
        toast('Failed to load data', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const addNewPatient = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const data = await apiFetch('/api/queue', {
        method: 'POST',
        body: JSON.stringify({ name: newName, priority: newPriority }),
      });
      setQueue((prev) => {
        if (newPriority === 'Emergency') return [data, ...prev];
        return [...prev, data];
      });
      setNewName('');
      setShowAddModal(false);
      toast('Patient added successfully', 'success');
    } catch (err) {
      toast(err.message || 'Failed to add patient', 'error');
    }
  };

  const callNext = async () => {
    if (queue.length === 0) return;
    try {
      const data = await apiFetch('/api/queue/call-next', { method: 'POST' });
      setServing(data);
      setQueue((prev) => prev.filter((p) => p.id !== data.id));
      toast(`Called ${data.token}`, 'success');
    } catch (err) {
      toast(err.message || 'Failed to call next', 'error');
    }
  };

  const completeServing = async () => {
    if (!serving) return;
    try {
      console.log('completed patient');
      console.log(serving);
      await apiFetch(`/api/queue/complete/${serving.id}`, { method: 'POST' });
      setServing(null);
      setCompletedToday((prev) => prev + 1);
      toast('Patient completed', 'success');
    } catch (err) {
      toast(err.message || 'Failed to complete', 'error');
    }
  };

  const deletePatient = async (id) => {
    if (!confirm('Remove this patient from queue?')) return;
    try {
      await apiFetch(`/api/queue/${id}`, { method: 'DELETE' });
      setQueue((prev) => prev.filter((p) => p.id !== id));
      toast('Patient removed', 'warning');
    } catch (err) {
      toast(err.message || 'Failed to remove', 'error');
    }
  };

  const servePatient = async (patient) => {
    try {
      const data = await apiFetch('/api/queue/call-next', { method: 'POST' });
      setServing(data);
      setQueue((prev) => prev.filter((p) => p.id !== data.id));
      toast(`Serving ${data.token}`, 'success');
    } catch (err) {
      toast(err.message || 'Failed', 'error');
    }
  };

  const skipServing = () => {
    setServing(null);
    toast('Skipped current patient', 'warning');
  };

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
    <div className="bg-[#f9f9ff] text-[#191c21] font-body-md overflow-hidden h-screen flex">
      {/* Sidebar */}
      <aside className="bg-[#ecedf6] w-64 fixed left-0 top-0 h-screen flex flex-col p-4 gap-2 border-r border-[#c2c6d4] z-20">
        <div className="mb-6 px-2">
          <h1 className="text-3xl font-black text-[#00478d]">Queue Cure '26</h1>
          <p className="text-[#424752] text-[13px] opacity-70">Clinical Management Suite</p>
        </div>
        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-4 p-4 bg-[#7af1fc] text-[#006e75] rounded-lg font-bold" href="#">
            <span className="material-symbols-outlined">reorder</span>
            <span>Queue Management</span>
          </a>
          <Link
            className="flex items-center gap-4 p-4 text-[#424752] hover:bg-[#e1e2ea]/30 rounded-lg"
            href="/display"
            target="_blank"
          >
            <span className="material-symbols-outlined">monitor</span>
            <span>Patient Display</span>
          </Link>
        </nav>
        <div className="mt-auto space-y-1 border-t border-[#c2c6d4] pt-4">
          <button
            className="w-full bg-[#00478d] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#005eb8] transition-colors shadow-sm active:scale-95 transform"
            onClick={callNext}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              play_arrow
            </span>
            Call Next Patient
          </button>
          <button
            className="flex items-center gap-4 p-4 text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-lg text-sm w-full"
            onClick={logout}
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-y-auto">
        <header className="bg-white shadow-sm h-16 flex justify-between items-center px-6 sticky top-0 z-10">
          <h2 className="text-[20px] font-semibold text-[#191c21]">Queue Management Dashboard</h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-[#f2f3fb] px-4 py-2 rounded-full border border-[#c2c6d4]">
              <span className="material-symbols-outlined text-[#00478d] text-xl">timer</span>
              <span className="text-[13px]">Est. Avg. Session:</span>
              <input
                className="w-12 bg-transparent border-none p-0 text-[#00478d] font-bold focus:ring-0 text-center"
                value={avgTime}
                onChange={(e) => setAvgTime(Number(e.target.value))}
                type="number"
              />
              <span className="text-[13px]">min</span>
            </div>
            <button
              className="bg-[#00478d] text-white px-6 py-2 rounded-full font-bold text-[13px] hover:opacity-90 active:scale-95 transition-all"
              onClick={() => setShowAddModal(true)}
            >
              + Add Patient
            </button>
          </div>
        </header>

        <div className="p-6 max-w-[1440px] mx-auto space-y-6">
          {/* Stats Cards */}
          <section className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-4 bg-[#00478d] rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden h-48">
              <div className="relative z-10">
                <p className="text-[#c8daff] text-[13px] uppercase tracking-wider font-bold">
                  Currently Serving
                </p>
                <h3 className="text-[48px] font-bold leading-[56px] tracking-tight mt-2">
                  {serving ? serving.token : '--'}
                </h3>
                <p className="text-[20px] font-semibold leading-[28px] opacity-90 mt-2">
                  {serving ? serving.name : 'Station Idle'}
                </p>
              </div>
              <div className="flex gap-2 relative z-10">
                <button
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-bold"
                  onClick={completeServing}
                >
                  Complete
                </button>
                <button
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold"
                  onClick={skipServing}
                >
                  Skip
                </button>
              </div>
              <span
                className="material-symbols-outlined absolute -right-4 -bottom-4 text-[160px] opacity-10 rotate-12"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                medical_services
              </span>
            </div>

            <div className="col-span-12 md:col-span-8 grid grid-cols-3 gap-4">
              <div className="bg-[#ecedf6] border border-[#c2c6d4] rounded-2xl p-6 flex flex-col justify-center">
                <p className="text-[#424752] text-[13px] font-bold">Total Waiting</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-[48px] font-bold leading-[56px] tracking-tight text-[#191c21]">
                    {queue.length}
                  </h4>
                  <span className="text-[#424752] font-medium">Patients</span>
                </div>
              </div>
              <div className="bg-[#ecedf6] border border-[#c2c6d4] rounded-2xl p-6 flex flex-col justify-center">
                <p className="text-[#424752] text-[13px] font-bold">Next Wait Time</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-[48px] font-bold leading-[56px] tracking-tight text-[#006970]">
                    {queue.length * avgTime}
                  </h4>
                  <span className="text-[#424752] font-medium">Min</span>
                </div>
              </div>
              <div className="bg-[#ecedf6] border border-[#c2c6d4] rounded-2xl p-6 flex flex-col justify-center">
                <p className="text-[#424752] text-[13px] font-bold">Completed Today</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-[48px] font-bold leading-[56px] tracking-tight text-[#00478d]">
                    {completedToday}
                  </h4>
                  <span className="text-[#424752] font-medium">Total</span>
                </div>
              </div>
            </div>
          </section>

          {/* Queue Table */}
          <section className="bg-white rounded-2xl border border-[#c2c6d4] overflow-hidden shadow-sm">
            <div className="p-4 px-6 border-b border-[#c2c6d4] flex justify-between items-center bg-white">
              <h3 className="text-[20px] font-semibold text-[#191c21]">Live Queue List</h3>
            </div>
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#ecedf6] text-[#424752] text-[13px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Token #</th>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created Time</th>
                    <th className="px-6 py-4">Est. Wait</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((patient, index) => (
                    <tr
                      key={patient.id}
                      className="queue-table-row border-b border-[#c2c6d4] hover:bg-[#f2f3fb] transition-colors group status-stripe"
                      style={{
                        borderLeftColor:
                          patient.priority === 'Emergency'
                            ? '#ba1a1a'
                            : patient.priority === 'Urgent'
                            ? '#793100'
                            : 'transparent',
                      }}
                    >
                      <td className="px-6 py-4 font-bold text-[#424752]">#{patient.token}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#191c21]">{patient.name}</div>
                        <div className="text-xs text-[#424752] opacity-60">{patient.priority} Priority</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e1e2ea] text-[#424752]">
                          WAITING
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#424752] text-sm">{patient.time || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-[#006970] font-bold">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {index * avgTime}m
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="row-actions flex justify-end gap-1">
                          <button
                            onClick={() => servePatient(patient)}
                            className="p-2 hover:bg-[#00478d]/10 text-[#00478d] rounded-lg"
                          >
                            <span className="material-symbols-outlined">play_circle</span>
                          </button>
                          <button
                            onClick={() => deletePatient(patient.id)}
                            className="p-2 hover:bg-[#ba1a1a]/10 text-[#ba1a1a] rounded-lg"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {queue.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-24 h-24 bg-[#ecedf6] rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[#424752] text-4xl">person_off</span>
                  </div>
                  <h4 className="text-[20px] font-semibold text-[#191c21]">No Patients in Queue</h4>
                  <button
                    className="mt-6 bg-[#00478d] text-white px-8 py-2 rounded-full font-bold"
                    onClick={() => setShowAddModal(true)}
                  >
                    Add First Patient
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191c21]/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-2xl font-semibold text-[#191c21] mb-4">New Patient Entry</h3>
            <form onSubmit={addNewPatient}>
              <div className="space-y-4">
                <div>
                  <label className="text-[13px] font-bold text-[#424752] mb-1 block">
                    Full Patient Name
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-[#727783] focus:border-[#00478d] focus:ring-2 focus:ring-[#00478d]/20 text-[16px]"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Johnathan Smith"
                    required
                    type="text"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-[#424752] mb-1 block">Priority Level</label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-[#727783] focus:border-[#00478d] focus:ring-2 focus:ring-[#00478d]/20 text-[16px]"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  className="flex-1 py-3 font-bold text-[#424752] hover:bg-[#e1e2ea]/30 rounded-lg"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-3 font-bold bg-[#00478d] text-white rounded-lg shadow-md hover:bg-[#005eb8]"
                  type="submit"
                >
                  Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}