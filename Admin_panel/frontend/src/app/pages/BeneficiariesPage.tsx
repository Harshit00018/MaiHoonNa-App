/**
 * Beneficiaries Page - Full care profiles with Clinical Configuration
 */

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { DataCard } from '../components/common/DataCard';
import { StatusChip } from '../components/common/StatusChip';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { beneficiaryApi } from '../../services/api';
import type { Beneficiary } from '../../types';
import { Heart, Activity, Thermometer, Droplet, Scale, Phone, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [selectedBen, setSelectedBen] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true); setError(null);
    try {
      const data = await beneficiaryApi.getAll();
      setBeneficiaries(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load beneficiaries');
    } finally {
      setLoading(false);
    }
  };

  const handleVitalToggle = async (vitalKey: keyof Beneficiary['clinicalConfiguration'], enabled: boolean) => {
    if (!selectedBen) return;
    try {
      await beneficiaryApi.updateClinicalConfig(selectedBen.id, {
        [vitalKey]: { ...selectedBen.clinicalConfiguration[vitalKey], enabled },
      });
      await loadData();
      const updated = await beneficiaryApi.getById(selectedBen.id);
      if (updated) setSelectedBen(updated);
      toast.success(`${vitalKey} monitoring ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update configuration');
    }
  };

  const vitalIcons = {
    bloodPressure: Activity,
    spO2: Activity,
    temperature: Thermometer,
    heartRate: Heart,
    bloodSugar: Droplet,
    weight: Scale,
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Beneficiaries" description="Manage beneficiary care profiles and clinical configurations" />
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading beneficiaries...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Beneficiaries" description="Manage beneficiary care profiles and clinical configurations" />
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={loadData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Beneficiaries"
        description="Manage beneficiary care profiles and clinical configurations"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {beneficiaries.map((ben) => (
          <Dialog key={ben.id}>
            <DialogTrigger asChild>
              <div
                className="cursor-pointer"
                onClick={() => setSelectedBen(ben)}
              >
                <DataCard title={ben.name} description={`Age: ${ben.age} • ${ben.gender}`}>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {(ben.medicalHistory || []).slice(0, 3).map((condition: string) => (
                        <span key={condition} className="text-xs px-2 py-1 bg-[#FFF5EE] text-[#FF7A00] rounded-full">
                          {condition}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>Emergency: {ben.emergencyContact.name}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      View Profile
                    </Button>
                  </div>
                </DataCard>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{ben.name}</DialogTitle>
                <DialogDescription>
                  Complete care profile and clinical configuration
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="profile" className="mt-4">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="clinical">Clinical Config</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Age</Label>
                      <p className="font-medium">{ben.age} years</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Gender</Label>
                      <p className="font-medium capitalize">{ben.gender}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Medications</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(ben.medications || []).length > 0 ? (
                          (ben.medications || []).map((med: string) => (
                            <span key={med} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                              {med}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No medications logged</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-muted-foreground">Medical History</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(ben.medicalHistory || []).map((condition: string) => (
                          <span key={condition} className="px-3 py-1 bg-[#FFF5EE] text-[#FF7A00] rounded-full text-sm">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary rounded-lg">
                      <Label className="text-muted-foreground">Emergency Contact</Label>
                      <div className="mt-2 space-y-1">
                        <p className="font-medium">{ben.emergencyContact.name}</p>
                        <p className="text-sm text-muted-foreground">{ben.emergencyContact.relation}</p>
                        <p className="text-sm">{ben.emergencyContact.phone}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-secondary rounded-lg">
                      <Label className="text-muted-foreground">Assigned Staff</Label>
                      <div className="mt-2 space-y-1">
                        <p className="font-medium text-sm">Primary CC: <span className="font-normal text-muted-foreground">{ben.careCompanion || 'Unassigned'}</span></p>
                        <p className="font-medium text-sm">Secondary CC: <span className="font-normal text-muted-foreground">{ben.secondaryCareCompanion || 'Unassigned'}</span></p>
                        <p className="font-medium text-sm">Field Manager: <span className="font-normal text-muted-foreground">{ben.fieldManager || 'Unassigned'}</span></p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-2">
                      <StatusChip status={ben.isActive ? 'Active' : 'Inactive'} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="clinical" className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Configure which vitals to monitor for this beneficiary
                  </p>
                  
                  {Object.entries(ben.clinicalConfiguration || {}).map(([key, config]) => {
                    const cfg = config as any;
                    const vitalKey = key as keyof Beneficiary['clinicalConfiguration'];
                    const Icon = vitalIcons[vitalKey];
                    const vitalLabel = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    
                    return (
                      <div key={key} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${cfg.enabled ? 'bg-[#DFF4E6]' : 'bg-secondary'}`}>
                            <Icon className={`w-5 h-5 ${cfg.enabled ? 'text-success-foreground' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{vitalLabel}</p>
                            <p className="text-xs text-muted-foreground">
                              Frequency: {cfg.frequency}
                              {cfg.alertThresholds && (
                                <span className="ml-2">
                                  • Thresholds: {cfg.alertThresholds.min ?? '-'} - {cfg.alertThresholds.max ?? '-'}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={cfg.enabled}
                          onCheckedChange={(checked) => handleVitalToggle(vitalKey, checked)}
                        />
                      </div>
                    );
                  })}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
