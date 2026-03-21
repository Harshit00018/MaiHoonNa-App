import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { DataCard } from '../components/common/DataCard'
import { StatusChip } from '../components/common/StatusChip';
import { subscriberApi } from '../../services/api';
import { MapPin, Users, Package, Phone, Mail, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subscriberApi.getAll();
      setSubscribers(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Subscribers" description="All registered subscribers from the database" />
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading subscribers...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Subscribers" description="All registered subscribers from the database" />
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
        title={`Subscribers (${subscribers.length})`}
        description="All registered subscribers from the database"
      />
      {subscribers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mb-4 opacity-30" />
          <p>No subscribers found in the database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscribers.map((sub) => (
            <DataCard key={sub.id} title={sub.name} description={`Subscriber`}>
              <div className="space-y-3">

                {sub.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{sub.phone}</span>
                  </div>
                )}

                {sub.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{sub.email}</span>
                  </div>
                )}

                {sub.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{sub.address}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{sub.beneficiaryCount ?? sub.beneficiaries?.length ?? 0} Beneficiar{(sub.beneficiaryCount ?? 0) === 1 ? 'y' : 'ies'}</span>
                </div>

                {sub.activePackage && (
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{sub.activePackage}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <StatusChip status={sub.isActive ? 'Active' : 'Inactive'} />
                  <span className="text-xs text-muted-foreground">
                    {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('en-IN') : ''}
                  </span>
                </div>
              </div>
            </DataCard>
          ))}
        </div>
      )}
    </div>
  );
}
