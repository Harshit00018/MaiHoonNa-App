import React, { useState, useEffect } from 'react';
import {
  MapPin, Plus, X, Building2, Power, PowerOff,
  Phone, Calendar, Edit2, Trash2, Loader2,
  Navigation, AlertTriangle, Users, UserCheck
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

interface Zone {
  id: string;
  name: string;
  city: string;
  address: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  leaseStartDate: string | null;
  leaseEndDate: string | null;
  isActive: boolean;
  fieldManagerId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FieldManager {
  id: string;
  name: string;
  phone: string;
}

const emptyForm = {
  name: '', city: '', address: '', state: '', pincode: '',
  phone: '', latitude: '', longitude: '',
  leaseStartDate: '', leaseEndDate: '',
  fieldManagerId: ''
};

const ZonesPage = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [fieldManagers, setFieldManagers] = useState<FieldManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [assigningZone, setAssigningZone] = useState<Zone | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ─── Fetch data ─────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setError(null);
      const [zonesRes, fmsRes] = await Promise.all([
        fetch(`${API_BASE}/zones`),
        fetch(`${API_BASE}/users/field-managers`)
      ]);

      const zonesJson = await zonesRes.json();
      const fmsJson = await fmsRes.json();

      if (zonesJson.success) setZones(zonesJson.data);
      if (fmsJson.success) setFieldManagers(fmsJson.data);

      if (!zonesJson.success) throw new Error(zonesJson.message);
    } catch (err: any) {
      setError(err.message || 'Failed to load data. Make sure the backend is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ─── Open modal ─────────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingZone(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEditModal = (zone: Zone) => {
    setEditingZone(zone);
    setForm({
      name: zone.name,
      city: zone.city,
      address: zone.address,
      state: zone.state,
      pincode: zone.pincode,
      phone: zone.phone || '',
      latitude: zone.latitude?.toString() || '',
      longitude: zone.longitude?.toString() || '',
      leaseStartDate: zone.leaseStartDate ? zone.leaseStartDate.slice(0, 10) : '',
      leaseEndDate: zone.leaseEndDate ? zone.leaseEndDate.slice(0, 10) : '',
      fieldManagerId: zone.fieldManagerId || ''
    });
    setShowModal(true);
  };

  const openAssignModal = (zone: Zone) => {
    setAssigningZone(zone);
    setShowAssignModal(true);
  };

  // ─── Save (create or update) ─────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingZone
        ? `${API_BASE}/zones/${editingZone.id}`
        : `${API_BASE}/zones`;
      const method = editingZone ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      await fetchData();
      setShowModal(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ─── Assign Field Manager ──────────────────────────────────────────────────
  const handleAssignFM = async (fmId: string) => {
    if (!assigningZone) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/zones/${assigningZone.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldManagerId: fmId === 'none' ? null : fmId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setZones(prev => prev.map(z => z.id === assigningZone.id ? json.data : z));
      setShowAssignModal(false);
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ─── Toggle active ───────────────────────────────────────────────────────────
  const handleToggle = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/zones/${id}/toggle`, { method: 'PATCH' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setZones(prev => prev.map(z => z.id === id ? json.data : z));
    } catch (err: any) {
      alert(`Toggle failed: ${err.message}`);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this zone?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/zones/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setZones(prev => prev.filter(z => z.id !== id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-IN') : '—';

  const isLeaseExpiringSoon = (end: string | null) => {
    if (!end) return false;
    const diff = new Date(end).getTime() - Date.now();
    return diff > 0 && diff < 60 * 24 * 60 * 60 * 1000; // 60 days
  };

  const isLeaseExpired = (end: string | null) => {
    if (!end) return false;
    return new Date(end).getTime() < Date.now();
  };

  return (
    <div className="p-8 bg-[#F4EAE3] min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Zones Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage nodal centers — {zones.length} zone{zones.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#FF7A00] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#e06e00] transition"
        >
          <Plus size={20} /> Add Zone
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3 text-red-700">
          <AlertTriangle size={18} className="shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={36} className="text-[#FF7A00] animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && zones.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Building2 size={48} className="text-[#FF7A00] opacity-40 mb-4" />
          <h3 className="font-black text-gray-600 uppercase text-sm tracking-widest">No Zones Yet</h3>
          <p className="text-gray-400 text-xs mt-2">Click "Add Zone" to register your first nodal center.</p>
        </div>
      )}

      {/* Zones Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {zones.map(zone => (
          <div
            key={zone.id}
            className={`bg-white rounded-[24px] p-6 shadow-sm border transition-all ${zone.isActive ? 'border-[#E7DED6]' : 'opacity-60 grayscale border-gray-200'}`}
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black text-[#FF7A00]">{zone.name}</h3>
                <p className="text-gray-500 font-semibold text-sm mt-0.5">{zone.city}, {zone.state} — {zone.pincode}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAssignModal(zone)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-[10px] font-black uppercase"
                >
                  <Users size={12} />
                  {zone.fieldManagerId ? 'Reassign' : 'Assign Manager'}
                </button>
                <button
                  onClick={() => openEditModal(zone)}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleToggle(zone.id)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-black uppercase transition ${zone.isActive ? 'bg-[#DFF4E6] text-green-700 hover:bg-green-100' : 'bg-[#FFE3E3] text-red-700 hover:bg-red-100'}`}
                >
                  {zone.isActive ? <Power size={12} /> : <PowerOff size={12} />}
                  {zone.isActive ? 'Active' : 'Inactive'}
                </button>
                <button
                  onClick={() => handleDelete(zone.id)}
                  disabled={deletingId === zone.id}
                  className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition"
                >
                  {deletingId === zone.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin size={14} className="text-[#FF7A00] mt-0.5 shrink-0" />
                <span>{zone.address}</span>
              </div>

              {zone.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={14} className="text-[#FF7A00] shrink-0" />
                  <span>{zone.phone}</span>
                </div>
              )}

              {(zone.latitude || zone.longitude) && (
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <Navigation size={13} className="text-[#FF7A00] shrink-0" />
                  <span>{zone.latitude?.toFixed(5)}, {zone.longitude?.toFixed(5)}</span>
                </div>
              )}

              {zone.fieldManagerId && (
                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                  <UserCheck size={14} className="shrink-0" />
                  <span>Field Manager: {fieldManagers.find(m => m.id === zone.fieldManagerId)?.name || 'Assigned'}</span>
                </div>
              )}
            </div>

            {/* Lease dates */}
            {(zone.leaseStartDate || zone.leaseEndDate) && (
              <div className="mt-4 pt-4 border-t border-[#E7DED6]">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Lease Period</p>
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Start</p>
                    <p className="font-bold text-sm text-gray-700">{formatDate(zone.leaseStartDate)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Expiry</p>
                    <p className={`font-bold text-sm ${isLeaseExpired(zone.leaseEndDate) ? 'text-red-600' : isLeaseExpiringSoon(zone.leaseEndDate) ? 'text-amber-600' : 'text-gray-700'}`}>
                      {formatDate(zone.leaseEndDate)}
                      {isLeaseExpired(zone.leaseEndDate) && ' ⚠ Expired'}
                      {isLeaseExpiringSoon(zone.leaseEndDate) && ' ⚠ Expiring Soon'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL: Create / Edit Zone */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-800 uppercase">
                {editingZone ? 'Edit Zone' : 'Register New Zone'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Zone / Nodal Center Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F4EAE3]/40 border border-[#E7DED6] font-semibold text-sm focus:outline-none focus:border-[#FF7A00]"
                  placeholder="e.g. Delhi North Hub"
                />
              </div>

              {/* City + State */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">City *</label>
                  <input
                    required
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4EAE3]/40 border border-[#E7DED6] font-semibold text-sm focus:outline-none focus:border-[#FF7A00]"
                    placeholder="New Delhi"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">State *</label>
                  <input
                    required
                    value={form.state}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4EAE3]/40 border border-[#E7DED6] font-semibold text-sm focus:outline-none focus:border-[#FF7A00]"
                    placeholder="Delhi"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Full Address *</label>
                <textarea
                  required
                  rows={2}
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F4EAE3]/40 border border-[#E7DED6] font-semibold text-sm focus:outline-none focus:border-[#FF7A00] resize-none"
                  placeholder="Street, locality, landmark..."
                />
              </div>

              {/* Pincode + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Pincode *</label>
                  <input
                    required
                    maxLength={6}
                    value={form.pincode}
                    onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4EAE3]/40 border border-[#E7DED6] font-semibold text-sm focus:outline-none focus:border-[#FF7A00]"
                    placeholder="110001"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Phone Number</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4EAE3]/40 border border-[#E7DED6] font-semibold text-sm focus:outline-none focus:border-[#FF7A00]"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Geo Coordinates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4EAE3]/40 border border-[#E7DED6] font-semibold text-sm focus:outline-none focus:border-[#FF7A00]"
                    placeholder="28.6139"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4EAE3]/40 border border-[#E7DED6] font-semibold text-sm focus:outline-none focus:border-[#FF7A00]"
                    placeholder="77.2090"
                  />
                </div>
              </div>

              {/* Lease Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Lease Start Date</label>
                  <input
                    type="date"
                    value={form.leaseStartDate}
                    onChange={e => setForm(f => ({ ...f, leaseStartDate: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4EAE3]/40 border border-[#E7DED6] font-semibold text-sm focus:outline-none focus:border-[#FF7A00]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Lease Expiry Date</label>
                  <input
                    type="date"
                    value={form.leaseEndDate}
                    onChange={e => setForm(f => ({ ...f, leaseEndDate: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4EAE3]/40 border border-[#E7DED6] font-semibold text-sm focus:outline-none focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#FF7A00] text-white py-4 rounded-2xl font-black uppercase tracking-widest mt-4 shadow-lg shadow-orange-100 hover:bg-[#e06e00] transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving && <Loader2 size={18} className="animate-spin" />}
                {editingZone ? 'Save Changes' : 'Register Zone'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Assign Field Manager */}
      {showAssignModal && assigningZone && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-800 uppercase">Assign Manager</h2>
                <p className="text-xs text-gray-500 mt-1">Assigning staff to {assigningZone.name}</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleAssignFM('none')}
                className={`w-full text-left px-5 py-4 rounded-2xl border transition ${!assigningZone.fieldManagerId ? 'bg-blue-50 border-blue-200' : 'border-gray-100 hover:bg-gray-50'}`}
              >
                <p className="font-bold text-sm text-gray-700">None / Unassign</p>
                <p className="text-[10px] text-gray-400 uppercase">Remove current manager</p>
              </button>

              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {fieldManagers.map(fm => (
                  <button
                    key={fm.id}
                    onClick={() => handleAssignFM(fm.id)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border transition ${assigningZone.fieldManagerId === fm.id ? 'bg-blue-50 border-blue-200' : 'border-gray-100 hover:bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm text-gray-800">{fm.name}</p>
                        <p className="text-[10px] text-gray-400">{fm.phone}</p>
                      </div>
                      <UserCheck size={18} className={assigningZone.fieldManagerId === fm.id ? 'text-blue-500' : 'text-gray-200'} />
                    </div>
                  </button>
                ))}

                {fieldManagers.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm italic">No field managers found in database.</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowAssignModal(false)}
              className="w-full mt-6 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZonesPage;