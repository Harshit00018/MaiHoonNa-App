import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, MapPin, Phone, ShieldCheck, Users, Filter, Loader2, X, Briefcase } from 'lucide-react';
import { teamApi, userApi } from '../../services/api';
import { toast } from 'sonner';

interface FieldManagerItem {
  id: string;
  name: string;
  phone: string;
  zone: string;
  hubName?: string;
  isAvailable: boolean;
  teamCount: number;
}

const FieldManagerPage = () => {
  const [managers, setManagers] = useState<FieldManagerItem[]>([]);
  const [nodalCenters, setNodalCenters] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedZone, setSelectedZone] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [zones, fmResponse] = await Promise.all([
        teamApi.getZones(),
        fetch('http://localhost:3001/api/users/field-managers').then(r => r.json())
      ]);

      setNodalCenters(zones);

      const dbManagers: FieldManagerItem[] = (fmResponse.data || []).map((fm: any) => ({
        id: fm.id,
        name: fm.user?.name || fm.name,
        phone: fm.user?.phone || '',
        zone: fm.zone,
        hubName: zones.find((z: any) => z.id === fm.zone || z.name === fm.zone)?.name || fm.zone,
        isAvailable: fm.isAvailable,
        teamCount: fm.teams?.length || 0,
      }));

      setManagers(dbManagers);
    } catch (err) {
      console.error('Failed to load data', err);
      toast.error('Failed to load field managers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddFM = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    const name = data.get('name') as string;
    const phone = data.get('phone') as string;
    const hubId = data.get('hubId') as string;

    try {
      await userApi.createStaff({
        name,
        phone,
        role: 'field_manager',
        zoneId: hubId,
      });

      toast.success(`${name} successfully onboarded as Field Manager!`);
      form.reset();
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to onboard Field Manager');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredManagers = selectedZone
    ? managers.filter(fm => fm.zone === selectedZone || fm.hubName === nodalCenters.find((z: any) => z.id === selectedZone)?.name)
    : managers;

  return (
    <div className="p-8 bg-[#F4EAE3] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Field Managers (FM)</h1>
          <p className="text-gray-600">Onboard and manage field operations supervisors</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#FF7A00] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-orange-600 transition-colors"
        >
          <UserPlus size={20} /> Onboard New FM
        </button>
      </div>

      {/* Zone Filter Bar */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-[#E7DED6] flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
          <Filter size={16} /> Filter by Zone:
        </div>
        <button
          onClick={() => setSelectedZone('')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${!selectedZone ? 'bg-[#FF7A00] text-white' : 'bg-[#F4EAE3] text-gray-600 hover:bg-orange-100'}`}
        >
          All Zones
        </button>
        {nodalCenters.map((zone: any) => (
          <button
            key={zone.id}
            onClick={() => setSelectedZone(zone.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${selectedZone === zone.id ? 'bg-[#FF7A00] text-white' : 'bg-[#F4EAE3] text-gray-600 hover:bg-orange-100'}`}
          >
            {zone.city}
          </button>
        ))}
        <div className="ml-auto text-sm text-gray-400 font-medium">
          {filteredManagers.length} field manager{filteredManagers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="animate-spin" size={24} />
            <span className="font-medium">Loading field managers...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredManagers.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-[#F4EAE3] rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase size={32} className="text-[#FF7A00]" />
          </div>
          <h3 className="text-lg font-bold text-gray-600 mb-2">No Field Managers Yet</h3>
          <p className="text-gray-400 mb-6">
            {selectedZone ? 'No field managers found in this zone.' : 'Start by onboarding your first field manager.'}
          </p>
          {!selectedZone && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#FF7A00] text-white px-6 py-3 rounded-xl font-bold"
            >
              Onboard First FM
            </button>
          )}
        </div>
      )}

      {/* Grid View */}
      {!loading && filteredManagers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredManagers.map((fm) => (
            <div key={fm.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-[#E7DED6] hover:shadow-md transition-shadow">
              <div className="flex justify-between mb-4">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#1F8A3E] flex items-center justify-center font-bold text-white text-xl">
                    {fm.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{fm.name}</h3>
                    <p className="text-xs text-gray-400 uppercase font-bold">Field Manager</p>
                  </div>
                </div>
                <span className={`h-fit px-3 py-1 rounded-full text-[10px] font-black uppercase ${fm.isAvailable ? 'bg-[#DFF4E6] text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  {fm.isAvailable ? 'Available' : 'Busy'}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                {fm.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone size={14} className="text-[#FF7A00]" /> {fm.phone}
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin size={14} className="text-[#FF7A00]" /> {fm.hubName || fm.zone || 'Unassigned'}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Users size={14} className="text-[#FF7A00]" />
                  {fm.teamCount > 0 ? `Managing ${fm.teamCount} team${fm.teamCount > 1 ? 's' : ''}` : 'No teams assigned'}
                </div>
              </div>

              {/* Compliance Badges */}
              <div className="flex items-center gap-2 pt-4 border-t border-[#E7DED6]">
                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-lg text-[10px] font-bold">
                  <ShieldCheck size={12} /> BGV
                </div>
                <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-lg text-[10px] font-bold">
                  <Briefcase size={12} /> SUPERVISOR
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ONBOARDING MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-800 uppercase">Onboard Field Manager</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddFM} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">Full Name</label>
                  <input name="name" required placeholder="e.g. Rahul Verma" className="w-full mt-1 px-4 py-3 rounded-xl bg-[#F4EAE3]/30 border border-[#E7DED6] focus:outline-none focus:border-[#FF7A00]" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">Gender</label>
                  <select name="gender" className="w-full mt-1 px-4 py-3 rounded-xl bg-[#F4EAE3]/30 border border-[#E7DED6] focus:outline-none focus:border-[#FF7A00]">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Phone Number</label>
                <input name="phone" required placeholder="10-digit mobile number" maxLength={10} className="w-full mt-1 px-4 py-3 rounded-xl bg-[#F4EAE3]/30 border border-[#E7DED6] focus:outline-none focus:border-[#FF7A00]" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Aadhaar Number</label>
                <input name="aadhaar" required placeholder="12-digit Aadhaar number" maxLength={12} className="w-full mt-1 px-4 py-3 rounded-xl bg-[#F4EAE3]/30 border border-[#E7DED6] focus:outline-none focus:border-[#FF7A00]" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">Assign to Nodal Hub</label>
                <select name="hubId" required className="w-full mt-1 px-4 py-3 rounded-xl bg-[#F4EAE3]/30 border border-[#E7DED6] focus:outline-none focus:border-[#FF7A00]">
                  <option value="">Select a Hub</option>
                  {nodalCenters.map((hub: any) => (
                    <option key={hub.id} value={hub.id}>{hub.name} — {hub.city} ({hub.pincode})</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#FF7A00] text-white py-4 rounded-xl font-black uppercase tracking-widest mt-4 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : 'Verify & Onboard'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldManagerPage;
