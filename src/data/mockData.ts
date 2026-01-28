import { Medication, MedicationLog, FamilyMember, EmergencyContact, BoxStatus } from '../types';

export const mockMedications: Medication[] = [
  {
    id: '1',
    name: '阿司匹林',
    dosage: '100mg',
    frequency: 'daily',
    times: ['08:00'],
    boxNumber: 1,
    stock: 25,
    startDate: '2024-01-01',
    instructions: '早餐后服用，肠胃不适者可与食物同服',
    icon: '💊'
  },
  {
    id: '2',
    name: '降压药',
    dosage: '50mg',
    frequency: 'twice',
    times: ['08:00', '20:00'],
    boxNumber: 2,
    stock: 18,
    startDate: '2024-01-01',
    instructions: '每日两次，间隔12小时，监测血压',
    icon: '💉'
  },
  {
    id: '3',
    name: '维生素D',
    dosage: '400IU',
    frequency: 'daily',
    times: ['09:00'],
    boxNumber: 3,
    stock: 30,
    startDate: '2024-01-15',
    instructions: '早餐后服用，有助于钙吸收',
    icon: '💊'
  },
  {
    id: '4',
    name: '安眠药',
    dosage: '5mg',
    frequency: 'daily',
    times: ['22:00'],
    boxNumber: 4,
    stock: 10,
    startDate: '2024-02-01',
    instructions: '睡前30分钟服用，驾驶前禁用',
    icon: '🌙'
  },
  {
    id: '5',
    name: '降糖药',
    dosage: '500mg',
    frequency: 'thrice',
    times: ['07:30', '12:30', '18:30'],
    boxNumber: 5,
    stock: 8,
    startDate: '2024-01-10',
    instructions: '餐前服用，监测血糖变化',
    icon: '🩸'
  },
  {
    id: '6',
    name: '钙片',
    dosage: '600mg',
    frequency: 'daily',
    times: ['10:00'],
    boxNumber: 6,
    stock: 5,
    startDate: '2024-01-20',
    instructions: '可与维生素D同服，避免与茶同服',
    icon: '🦴'
  }
];

export const mockMedicationLogs: MedicationLog[] = [
  { id: '1', medicationId: '1', medicationName: '阿司匹林', takenAt: '2024-03-15 08:05', status: 'taken', boxNumber: 1 },
  { id: '2', medicationId: '2', medicationName: '降压药', takenAt: '2024-03-15 08:10', status: 'taken', boxNumber: 2 },
  { id: '3', medicationId: '5', medicationName: '降糖药', takenAt: '2024-03-15 07:35', status: 'taken', boxNumber: 5 },
  { id: '4', medicationId: '3', medicationName: '维生素D', takenAt: '2024-03-15 09:00', status: 'missed', boxNumber: 3 },
  { id: '5', medicationId: '1', medicationName: '阿司匹林', takenAt: '2024-03-14 08:00', status: 'taken', boxNumber: 1 },
  { id: '6', medicationId: '2', medicationName: '降压药', takenAt: '2024-03-14 08:05', status: 'taken', boxNumber: 2 },
  { id: '7', medicationId: '2', medicationName: '降压药', takenAt: '2024-03-14 20:00', status: 'taken', boxNumber: 2 },
  { id: '8', medicationId: '4', medicationName: '安眠药', takenAt: '2024-03-14 22:00', status: 'taken', boxNumber: 4 },
  { id: '9', medicationId: '5', medicationName: '降糖药', takenAt: '2024-03-14 07:30', status: 'taken', boxNumber: 5 },
  { id: '10', medicationId: '5', medicationName: '降糖药', takenAt: '2024-03-14 12:30', status: 'skipped', boxNumber: 5 },
  { id: '11', medicationId: '1', medicationName: '阿司匹林', takenAt: '2024-03-13 08:15', status: 'taken', boxNumber: 1 },
  { id: '12', medicationId: '2', medicationName: '降压药', takenAt: '2024-03-13 08:00', status: 'taken', boxNumber: 2 },
];

export const mockFamilyMembers: FamilyMember[] = [
  {
    id: '1',
    name: '张阿姨',
    phone: '138****1234',
    relation: '女儿',
    notifyOnMissed: true,
    notifyOnLowStock: true
  },
  {
    id: '2',
    name: '李叔叔',
    phone: '139****5678',
    relation: '儿子',
    notifyOnMissed: true,
    notifyOnLowStock: false
  }
];

export const mockEmergencyContacts: EmergencyContact[] = [
  { id: '1', type: 'doctor', name: '王医生', phone: '010-12345678', available: true },
  { id: '2', type: 'hospital', name: '市第一医院', phone: '120', available: true },
  { id: '3', type: 'ambulance', name: '急救中心', phone: '120', available: true },
  { id: '4', type: 'family', name: '紧急联系人-张阿姨', phone: '13800138000', available: true }
];

export const mockBoxStatus: BoxStatus[] = [
  { boxNumber: 1, hasMedication: true, medicationName: '阿司匹林', medicationId: '1', stockLevel: 'full', nextReminder: '08:00' },
  { boxNumber: 2, hasMedication: true, medicationName: '降压药', medicationId: '2', stockLevel: 'medium', nextReminder: '08:00' },
  { boxNumber: 3, hasMedication: true, medicationName: '维生素D', medicationId: '3', stockLevel: 'full', nextReminder: '09:00' },
  { boxNumber: 4, hasMedication: true, medicationName: '安眠药', medicationId: '4', stockLevel: 'medium', nextReminder: '22:00' },
  { boxNumber: 5, hasMedication: true, medicationName: '降糖药', medicationId: '5', stockLevel: 'low', nextReminder: '07:30' },
  { boxNumber: 6, hasMedication: true, medicationName: '钙片', medicationId: '6', stockLevel: 'low', nextReminder: '10:00' },
  { boxNumber: 7, hasMedication: false, stockLevel: 'empty' },
  { boxNumber: 8, hasMedication: false, stockLevel: 'empty' },
];
