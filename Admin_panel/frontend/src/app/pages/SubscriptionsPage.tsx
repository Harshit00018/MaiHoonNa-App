/**
 * Subscriptions Page - Product Factory Wizard
 * Step-by-step package creation for non-tech admins
 */

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Checkbox } from '../components/ui/checkbox';
import { packageApi, benefitApi } from '../../services/api';
import type { SubscriptionPackage, Benefit, PackageBenefit } from '../../types';
import { Plus, Check, ArrowRight, ArrowLeft, Package } from 'lucide-react';
import { toast } from 'sonner';
import { StatusChip } from '../components/common/StatusChip';

type WizardStep = 'define' | 'benefits' | 'units' | 'review';

export default function SubscriptionsPage() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [showWizard, setShowWizard] = useState(false);

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('define');
  const [packageName, setPackageName] = useState('');
  const [duration, setDuration] = useState('12');
  const [activeFrom, setActiveFrom] = useState('2026-01-01');
  const [activeTo, setActiveTo] = useState('2026-12-31');
  const [selectedBenefits, setSelectedBenefits] = useState<Set<string>>(new Set());
  const [benefitUnits, setBenefitUnits] = useState<Record<string, number>>({});
  const [totalCost, setTotalCost] = useState('15000');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pkgs, bnfs] = await Promise.all([
      packageApi.getAll(),
      benefitApi.getAll(),
    ]);
    setPackages(pkgs);
    setBenefits(bnfs);
  };

  const toggleBenefit = (benefitId: string) => {
    const newSelected = new Set(selectedBenefits);
    if (newSelected.has(benefitId)) {
      newSelected.delete(benefitId);
      const newUnits = { ...benefitUnits };
      delete newUnits[benefitId];
      setBenefitUnits(newUnits);
    } else {
      newSelected.add(benefitId);
      const benefit = benefits.find(b => b.id === benefitId);
      if (benefit) {
        setBenefitUnits({ ...benefitUnits, [benefitId]: benefit.defaultUnits });
      }
    }
    setSelectedBenefits(newSelected);
  };

  const updateUnits = (benefitId: string, units: number) => {
    setBenefitUnits({ ...benefitUnits, [benefitId]: units });
  };

  const handlePublish = async () => {
    const packageBenefits: PackageBenefit[] = Array.from(selectedBenefits).map(benefitId => ({
      benefitId,
      monthlyUnits: benefitUnits[benefitId] || 0,
    }));

    try {
      await packageApi.create({
        name: packageName,
        duration: parseInt(duration),
        benefits: packageBenefits,
        totalCost: parseInt(totalCost),
        isActive: true,
        activeFrom,
        activeTo,
        createdBy: 'U001',
      });
      toast.success('Package published successfully!');
      await loadData();
      resetWizard();
    } catch (error) {
      toast.error('Failed to publish package');
    }
  };

  const resetWizard = () => {
    setShowWizard(false);
    setCurrentStep('define');
    setPackageName('');
    setDuration('12');
    setSelectedBenefits(new Set());
    setBenefitUnits({});
    setTotalCost('15000');
  };

  const steps = [
    { id: 'define', label: 'Define Package', icon: Package },
    { id: 'benefits', label: 'Add Benefits', icon: Plus },
    { id: 'units', label: 'Set Units', icon: Check },
    { id: 'review', label: 'Review', icon: Check },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div>
      <PageHeader
        title="Product Factory"
        description="Create and manage subscription packages"
        action={
          !showWizard && (
            <Button onClick={() => setShowWizard(true)} className="bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create New Package
            </Button>
          )
        }
      />

      {showWizard ? (
        <div className="max-w-4xl mx-auto">
          {/* Wizard Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = index < currentStepIndex;
                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isActive
                            ? 'border-primary bg-primary text-primary-foreground'
                            : isCompleted
                            ? 'border-[#1F8A3E] bg-[#DFF4E6] text-success-foreground'
                            : 'border-border bg-card text-muted-foreground'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs mt-1 font-medium">{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-0.5 w-20 mx-2 ${isCompleted ? 'bg-[#1F8A3E]' : 'bg-border'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <Card>
            <CardContent className="p-6">
              {currentStep === 'define' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Define Package</h2>
                    <p className="text-sm text-muted-foreground">Enter basic package information</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="packageName">Package Name</Label>
                      <Input
                        id="packageName"
                        value={packageName}
                        onChange={(e) => setPackageName(e.target.value)}
                        placeholder="e.g., Essential Care Package"
                        className="bg-input-background"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (Months)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="bg-input-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cost">Total Cost (₹)</Label>
                        <Input
                          id="cost"
                          type="number"
                          value={totalCost}
                          onChange={(e) => setTotalCost(e.target.value)}
                          className="bg-input-background"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="activeFrom">Active From</Label>
                        <Input
                          id="activeFrom"
                          type="date"
                          value={activeFrom}
                          onChange={(e) => setActiveFrom(e.target.value)}
                          className="bg-input-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="activeTo">Active To</Label>
                        <Input
                          id="activeTo"
                          type="date"
                          value={activeTo}
                          onChange={(e) => setActiveTo(e.target.value)}
                          className="bg-input-background"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'benefits' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Add Benefits</h2>
                    <p className="text-sm text-muted-foreground">Select benefits from the library</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {benefits.map((benefit) => (
                      <div
                        key={benefit.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedBenefits.has(benefit.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => toggleBenefit(benefit.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedBenefits.has(benefit.id)}
                            onCheckedChange={() => toggleBenefit(benefit.id)}
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{benefit.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {benefit.description}
                            </p>
                            <p className="text-xs text-primary mt-2">
                              Default: {benefit.defaultUnits} {benefit.unitLabel}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 'units' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Set Units</h2>
                    <p className="text-sm text-muted-foreground">
                      Define monthly units for each selected benefit
                    </p>
                  </div>
                  <div className="space-y-4">
                    {Array.from(selectedBenefits).map(benefitId => {
                      const benefit = benefits.find(b => b.id === benefitId);
                      if (!benefit) return null;
                      return (
                        <div key={benefitId} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">{benefit.name}</h3>
                            <p className="text-xs text-muted-foreground">{benefit.unitLabel}</p>
                          </div>
                          <div className="w-32">
                            <Input
                              type="number"
                              value={benefitUnits[benefitId] || 0}
                              onChange={(e) => updateUnits(benefitId, parseInt(e.target.value) || 0)}
                              className="bg-input-background"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentStep === 'review' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Review Package</h2>
                    <p className="text-sm text-muted-foreground">
                      Review and publish your package
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-secondary rounded-lg">
                      <h3 className="font-semibold text-lg">{packageName}</h3>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="ml-2 font-medium">{duration} months</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="ml-2 font-medium">₹{totalCost}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Active From:</span>
                          <span className="ml-2 font-medium">{activeFrom}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Active To:</span>
                          <span className="ml-2 font-medium">{activeTo}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Included Benefits:</h4>
                      <div className="space-y-2">
                        {Array.from(selectedBenefits).map(benefitId => {
                          const benefit = benefits.find(b => b.id === benefitId);
                          if (!benefit) return null;
                          return (
                            <div key={benefitId} className="flex items-center justify-between p-3 border border-border rounded">
                              <span className="font-medium">{benefit.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {benefitUnits[benefitId]} {benefit.unitLabel}/month
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentStep === 'define') {
                      resetWizard();
                    } else {
                      const prevIndex = Math.max(0, currentStepIndex - 1);
                      setCurrentStep(steps[prevIndex].id as WizardStep);
                    }
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {currentStep === 'define' ? 'Cancel' : 'Back'}
                </Button>

                {currentStep === 'review' ? (
                  <Button onClick={handlePublish} className="bg-primary">
                    <Check className="w-4 h-4 mr-2" />
                    Publish Package
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      const nextIndex = Math.min(steps.length - 1, currentStepIndex + 1);
                      setCurrentStep(steps[nextIndex].id as WizardStep);
                    }}
                    disabled={
                      (currentStep === 'define' && !packageName) ||
                      (currentStep === 'benefits' && selectedBenefits.size === 0)
                    }
                    className="bg-primary"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs defaultValue="packages" className="space-y-6">
          <TabsList>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="benefits">Benefits Library</TabsTrigger>
          </TabsList>

          <TabsContent value="packages" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <Card key={pkg.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <StatusChip status={pkg.isActive ? 'Active' : 'Inactive'} />
                    </div>
                    <CardDescription>{pkg.duration} months</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">₹{pkg.totalCost}</span>
                      <span className="text-sm text-muted-foreground">per package</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>Active: {pkg.activeFrom} to {pkg.activeTo}</p>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        {pkg.benefits.length} benefits included
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.map((benefit) => (
                <Card key={benefit.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{benefit.name}</CardTitle>
                    <CardDescription className="text-xs">{benefit.type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{benefit.description}</p>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Default:</span>
                      <span className="ml-2 font-medium">
                        {benefit.defaultUnits} {benefit.unitLabel}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
