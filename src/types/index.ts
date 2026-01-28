export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: 'daily' | 'twice' | 'thrice' | 'weekly';
  times: string[];
  boxNumber: number;
  stock: number;
  startDate: string;
  endDate?: string;
  instructions?: string;
  icon?: string;
}

export interface Reminder {
  id: string;
  medicationId: string;
  time: string;
  days: string[];
  enabled: boolean;
  voiceReminder: boolean;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  takenAt: string;
  status: 'taken' | 'missed' | 'skipped';
  boxNumber: number;
  notes?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  relation: string;
  notifyOnMissed: boolean;
  notifyOnLowStock: boolean;
}

export interface EmergencyContact {
  id: string;
  type: 'doctor' | 'hospital' | 'ambulance' | 'family';
  name: string;
  phone: string;
  available: boolean;
}

export interface BoxStatus {
  boxNumber: number;
  hasMedication: boolean;
  medicationName?: string;
  medicationId?: string;
  stockLevel: 'full' | 'medium' | 'low' | 'empty';
  nextReminder?: string;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  voiceRemindersEnabled: boolean;
  autoRefillReminders: boolean;
  familyNotificationsEnabled: boolean;
  emergencyModeEnabled: boolean;
}
