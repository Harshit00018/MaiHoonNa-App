import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { DataCard } from '../components/common/DataCard';
import { StatusChip } from '../components/common/StatusChip';
import { operationsManagerApi } from '../../services/api';
import type { OperationsManager } from '../../types';
import { Users, Calendar, TrendingUp } from 'lucide-react';

export default function OperationsManagersPage() {
  const [managers, setManagers] = useState<OperationsManager[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await operationsManagerApi.getAll();
    setManagers(data);
  };

  return (
    <div>
      <PageHeader title="Operations Managers" description="Directory of Operations Managers with performance metrics" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {managers.map((om) => (
          <DataCard key={om.id} title={om.name} description={`${om.email} • ${om.phone}`}>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Assigned Zones</p>
                <div className="flex flex-wrap gap-1">
                  {om.assignedZones.map((zoneId) => (
                    <span key={zoneId} className="text-xs px-2 py-1 bg-secondary rounded-full">{zoneId}</span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#DFF4E6] rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-success-foreground" />
                    <span className="text-xs text-muted-foreground">Subscribers</span>
                  </div>
                  <p className="text-xl font-semibold">{om.performanceMetrics.subscriberCount}</p>
                </div>
                <div className="p-3 bg-[#FFF5EE] rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-[#FF7A00]" />
                    <span className="text-xs text-muted-foreground">Visits</span>
                  </div>
                  <p className="text-xl font-semibold">{om.performanceMetrics.activeVisitsThisMonth}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success-foreground" />
                  <span className="font-semibold text-success-foreground">{om.performanceMetrics.completionRate}%</span>
                </div>
              </div>
              <StatusChip status={om.isActive ? 'Active' : 'Inactive'} />
            </div>
          </DataCard>
        ))}
      </div>
    </div>
  );
}
