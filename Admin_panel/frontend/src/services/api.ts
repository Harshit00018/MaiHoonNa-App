/**
 * MaiHoonNa Senior Care Operations Portal - API Service Layer
 * This file contains all API interaction functions
 * Currently returns mock data - replace with actual API calls when backend is ready
 */

import {
  mockUsers,
  mockZones,
  mockOperationsManagers,
  mockCareCompanions,
  mockSubscribers,
  mockBeneficiaries,
  mockSupportTickets,
  mockActivityLogs,
  mockPartners,
  mockVolunteers,
  mockBenefits,
  mockSubscriptionPackages,
  mockTodayVisits,
} from './mockData';

import type {
  User,
  Zone,
  OperationsManager,
  CareCompanion,
  Subscriber,
  Beneficiary,
  SupportTicket,
  ActivityLog,
  Partner,
  Volunteer,
  Benefit,
  SubscriptionPackage,
  VisitBlock,
} from '../types';

// Simulate network delay for realistic behavior
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

const API_BASE = 'http://localhost:3001/api';

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export const authApi = {
  /**
   * Login with phone and OTP
   * @param phone - User's phone number
   * @param otp - One-time password
   * @returns User object if credentials are valid
   */
  async login(phone: string, otp: string): Promise<User> {
    await delay();
    // Mock validation - in production, validate against backend
    const user = mockUsers.find(u => u.phone === phone);
    if (user && otp === '123456') {
      return user;
    }
    throw new Error('Invalid credentials');
  },

  /**
   * Login with biometric authentication
   * @param userId - User ID
   * @returns User object if biometric is valid
   */
  async biometricLogin(userId: string): Promise<User> {
    await delay();
    const user = mockUsers.find(u => u.id === userId && u.biometricEnabled);
    if (user) {
      return user;
    }
    throw new Error('Biometric authentication failed');
  },

  /**
   * Send OTP to phone number
   * @param phone - User's phone number
   */
  async sendOTP(phone: string): Promise<void> {
    await delay();
    // In production, trigger SMS/WhatsApp OTP
    console.log(`OTP sent to ${phone}: 123456`);
  },
};

// ============================================================================
// USER MANAGEMENT API
// ============================================================================

export const userApi = {
  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    await delay();
    return [...mockUsers];
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User | undefined> {
    await delay();
    return mockUsers.find(u => u.id === id);
  },

  /**
   * Create new user
   */
  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    await delay();
    const newUser: User = {
      ...user,
      id: `U${String(mockUsers.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return newUser;
  },

  /**
   * Update user
   */
  async update(id: string, updates: Partial<User>): Promise<User> {
    await delay();
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    mockUsers[index] = { ...mockUsers[index], ...updates };
    return mockUsers[index];
  },

  /**
   * Create staff member (User + Profile)
   */
  async createStaff(data: { name: string; phone: string; role: string; zoneId: string }): Promise<any> {
    const response = await fetch(`${API_BASE}/users/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  },
};

// ============================================================================
// ZONES API
// ============================================================================

export const zoneApi = {
  async getAll(): Promise<Zone[]> {
    await delay();
    return [...mockZones];
  },

  async getById(id: string): Promise<Zone | undefined> {
    await delay();
    return mockZones.find(z => z.id === id);
  },

  async create(zone: Omit<Zone, 'id' | 'createdAt'>): Promise<Zone> {
    await delay();
    const newZone: Zone = {
      ...zone,
      id: `Z${String(mockZones.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    mockZones.push(newZone);
    return newZone;
  },

  async update(id: string, updates: Partial<Zone>): Promise<Zone> {
    await delay();
    const index = mockZones.findIndex(z => z.id === id);
    if (index === -1) throw new Error('Zone not found');
    mockZones[index] = { ...mockZones[index], ...updates };
    return mockZones[index];
  },
};

// ============================================================================
// OPERATIONS MANAGER API
// ============================================================================

export const operationsManagerApi = {
  async getAll(): Promise<OperationsManager[]> {
    await delay();
    return [...mockOperationsManagers];
  },

  async getById(id: string): Promise<OperationsManager | undefined> {
    await delay();
    return mockOperationsManagers.find(om => om.id === id);
  },
};

// ============================================================================
// CARE COMPANION API
// ============================================================================

export const careCompanionApi = {
  async getAll(): Promise<CareCompanion[]> {
    const response = await fetch(`${API_BASE}/users/care-companions`);
    const result = await response.json();
    const data = result.data || [];
    
    // Normalize DB response to match CareCompanion interface
    return data.map((cc: any) => ({
      ...cc,
      name: cc.user?.name || cc.name,
      phone: cc.user?.phone || cc.phone,
      isActive: cc.user?.isActive ?? true,
      joinedDate: cc.createdAt,
      // Default values for missing mock fields
      utilization: 0,
      backgroundVerification: {
        aadhaarNumber: 'Verified',
        aadhaarVerified: true,
        policeVerificationStatus: 'verified',
        medicalCheckupStatus: 'completed'
      }
    }));
  },

  async getById(id: string): Promise<CareCompanion | undefined> {
    await delay();
    return mockCareCompanions.find(cc => cc.id === id);
  },

  async getByZone(zoneId: string): Promise<CareCompanion[]> {
    await delay();
    return mockCareCompanions.filter(cc => cc.zoneId === zoneId);
  },
};

// ============================================================================
// SUBSCRIBER API
// ============================================================================

export const subscriberApi = {
  async getAll(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE}/subscribers`);
      const result = await response.json();
      return result.data || [];
    } catch (err) {
      console.error('subscriberApi.getAll failed, falling back to mock:', err);
      return [...mockSubscribers];
    }
  },

  async getById(id: string): Promise<any | undefined> {
    try {
      const response = await fetch(`${API_BASE}/subscribers/${id}`);
      const result = await response.json();
      return result.data || undefined;
    } catch {
      return mockSubscribers.find(s => s.id === id);
    }
  },
};

// ============================================================================
// BENEFICIARY API
// ============================================================================

export const beneficiaryApi = {
  async getAll(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE}/beneficiaries`);
      const result = await response.json();
      // Normalize to match expected shape
      return (result.data || []).map((b: any) => {
        const emContacts = Array.isArray(b.emergencyContacts) ? b.emergencyContacts : [];
        const firstEmContact = emContacts[0] || {};
        return {
          ...b,
          medicalHistory: b.medicalConditions
            ? (typeof b.medicalConditions === 'string'
                ? b.medicalConditions.split(',').map((s: string) => s.trim()).filter(Boolean)
                : b.medicalConditions)
            : [],
          medications: b.medications || [],
          emergencyContact: { 
            name: firstEmContact.name || b.subscriberName || 'N/A', 
            relation: firstEmContact.relation || 'Subscriber', 
            phone: firstEmContact.phone || b.subscriberPhone || '' 
          },
          careCompanion: b.careCompanion,
          secondaryCareCompanion: b.secondaryCareCompanion,
          fieldManager: b.fieldManager,
          emotionalScore: b.emotionalScore,
          clinicalConfiguration: {
            bloodPressure: { enabled: true, frequency: 'daily', alertThresholds: { min: 80, max: 140 } },
            spO2: { enabled: true, frequency: 'daily', alertThresholds: { min: 94, max: null } },
            temperature: { enabled: false, frequency: 'weekly', alertThresholds: null },
            heartRate: { enabled: true, frequency: 'daily', alertThresholds: { min: 55, max: 100 } },
            bloodSugar: { enabled: false, frequency: 'weekly', alertThresholds: null },
            weight: { enabled: false, frequency: 'monthly', alertThresholds: null },
          }
        };
      });
    } catch (err) {
      console.error('beneficiaryApi.getAll failed, falling back to mock:', err);
      return [...mockBeneficiaries];
    }
  },

  async getById(id: string): Promise<any | undefined> {
    try {
      const response = await fetch(`${API_BASE}/beneficiaries/${id}`);
      const result = await response.json();
      return result.data || undefined;
    } catch {
      return mockBeneficiaries.find(b => b.id === id);
    }
  },

  async getBySubscriber(subscriberId: string): Promise<any[]> {
    await delay();
    return mockBeneficiaries.filter(b => b.subscriberId === subscriberId);
  },

  async updateClinicalConfig(id: string, config: Partial<Beneficiary['clinicalConfiguration']>): Promise<Beneficiary> {
    await delay();
    const index = mockBeneficiaries.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Beneficiary not found');
    mockBeneficiaries[index].clinicalConfiguration = {
      ...mockBeneficiaries[index].clinicalConfiguration,
      ...config,
    };
    return mockBeneficiaries[index];
  },
};

// ============================================================================
// SCHEDULE / VISITS API
// ============================================================================

export const scheduleApi = {
  async getTodayVisits(): Promise<VisitBlock[]> {
    await delay();
    return [...mockTodayVisits];
  },

  async assignCareCompanion(visitId: string, careCompanionId: string): Promise<VisitBlock> {
    await delay();
    const index = mockTodayVisits.findIndex(v => v.id === visitId);
    if (index === -1) throw new Error('Visit not found');
    mockTodayVisits[index].careCompanionId = careCompanionId;
    return mockTodayVisits[index];
  },

  async updateVisitStatus(visitId: string, status: VisitBlock['status']): Promise<VisitBlock> {
    await delay();
    const index = mockTodayVisits.findIndex(v => v.id === visitId);
    if (index === -1) throw new Error('Visit not found');
    mockTodayVisits[index].status = status;
    return mockTodayVisits[index];
  },
};

// ============================================================================
// SUPPORT TICKETS API
// ============================================================================

export const supportApi = {
  async getAll(): Promise<SupportTicket[]> {
    await delay();
    return [...mockSupportTickets];
  },

  async getById(id: string): Promise<SupportTicket | undefined> {
    await delay();
    return mockSupportTickets.find(t => t.id === id);
  },

  async updateStatus(id: string, status: SupportTicket['status']): Promise<SupportTicket> {
    await delay();
    const index = mockSupportTickets.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Ticket not found');
    mockSupportTickets[index].status = status;
    mockSupportTickets[index].updatedAt = new Date().toISOString();
    if (status === 'resolved' || status === 'closed') {
      mockSupportTickets[index].resolvedAt = new Date().toISOString();
    }
    return mockSupportTickets[index];
  },
};

// ============================================================================
// ACTIVITY LOG API
// ============================================================================

export const activityLogApi = {
  async getAll(limit?: number): Promise<ActivityLog[]> {
    await delay();
    const logs = [...mockActivityLogs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return limit ? logs.slice(0, limit) : logs;
  },

  async logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> {
    await delay();
    const newLog: ActivityLog = {
      ...activity,
      id: `LOG${String(mockActivityLogs.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
    };
    mockActivityLogs.unshift(newLog);
    return newLog;
  },
};

// ============================================================================
// PARTNER API
// ============================================================================

export const partnerApi = {
  async getAll(): Promise<Partner[]> {
    await delay();
    return [...mockPartners];
  },

  async getById(id: string): Promise<Partner | undefined> {
    await delay();
    return mockPartners.find(p => p.id === id);
  },
};

// ============================================================================
// VOLUNTEER API
// ============================================================================

export const volunteerApi = {
  async getAll(): Promise<Volunteer[]> {
    await delay();
    return [...mockVolunteers];
  },

  async getById(id: string): Promise<Volunteer | undefined> {
    await delay();
    return mockVolunteers.find(v => v.id === id);
  },
};

// ============================================================================
// PRODUCT FACTORY API (Benefits & Packages)
// ============================================================================

export const benefitApi = {
  async getAll(): Promise<Benefit[]> {
    await delay();
    return [...mockBenefits];
  },
};

export const packageApi = {
  async getAll(): Promise<SubscriptionPackage[]> {
    await delay();
    return [...mockSubscriptionPackages];
  },

  async create(pkg: Omit<SubscriptionPackage, 'id' | 'createdAt'>): Promise<SubscriptionPackage> {
    await delay();
    const newPackage: SubscriptionPackage = {
      ...pkg,
      id: `PKG${String(mockSubscriptionPackages.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    mockSubscriptionPackages.push(newPackage);
    return newPackage;
  },
};
// ============================================================================
// TEAM MANAGEMENT & ONBOARDING API
// ============================================================================

export const teamApi = {
  async getTeams(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/teams`);
    const result = await response.json();
    return result.data || [];
  },

  async createTeam(data: { name: string; fieldManagerId: string; zone: string; careCompanionIds: string[] }): Promise<any> {
    const response = await fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.data;
  },

  async getAvailableCompanions(): Promise<CareCompanion[]> {
    const response = await fetch(`${API_BASE}/teams/available-companions`);
    const result = await response.json();
    return result.data;
  },

  async getAvailableManagers(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/teams/available-managers`);
    const result = await response.json();
    return result.data;
  },

  async onboardCC(data: { userId: string; bio: string; specialization: string[]; zone: string }): Promise<any> {
    const response = await fetch(`${API_BASE}/teams/onboard-cc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.data;
  },

  async onboardFM(data: { userId: string; zone: string }): Promise<any> {
    const response = await fetch(`${API_BASE}/teams/onboard-fm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.data;
  },

  async getZones(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/zones`);
    const result = await response.json();
    return result.data || [];
  }
};
