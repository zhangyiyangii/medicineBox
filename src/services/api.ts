// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 存储token
const getToken = () => localStorage.getItem('token');
const setToken = (token: string) => localStorage.setItem('token', token);
const removeToken = () => localStorage.setItem('token', '');

// API请求封装
async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || '请求失败');
  }

  return response.json();
}

// 认证API
export const authAPI = {
  async login(username: string, password: string) {
    const result = await request('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (result.token) {
      setToken(result.token);
    }
    return result;
  },

  async register(userData: {
    username: string;
    password: string;
    name: string;
    phone?: string;
    blood_type?: string;
    allergies?: string;
    medical_history?: string;
  }) {
    return request('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout() {
    removeToken();
  },

  getProfile() {
    return request('/api/users/profile');
  },

  updateProfile(data: any) {
    return request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getSettings() {
    return request('/api/users/settings');
  },

  updateSettings(data: any) {
    return request('/api/users/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// 药物API
export const medicationAPI = {
  getAll(activeOnly = true) {
    return request(`/api/medications?active_only=${activeOnly}`);
  },

  getById(id: string) {
    return request(`/api/medications/${id}`);
  },

  create(data: {
    name: string;
    dosage: string;
    unit?: string;
    frequency: string;
    times: string[];
    box_number: number;
    stock?: number;
    start_date: string;
    end_date?: string;
    instructions?: string;
    icon?: string;
  }) {
    return request('/api/medications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: any) {
    return request(`/api/medications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return request(`/api/medications/${id}`, {
      method: 'DELETE',
    });
  },

  updateStock(id: string, stock: number) {
    return request(`/api/medications/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ stock }),
    });
  },

  getBoxStatus() {
    return request('/api/medications/box-status');
  },
};

// 服药记录API
export const logAPI = {
  getHistory(params?: {
    start_date?: string;
    end_date?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return request(`/api/logs${queryParams ? `?${queryParams}` : ''}`);
  },

  getTodayReminders() {
    return request('/api/logs/today');
  },

  getTrend(days = 7) {
    return request(`/api/logs/trend?days=${days}`);
  },

  recordMedication(data: {
    medication_id: string;
    status: 'taken' | 'missed' | 'skipped';
    notes?: string;
  }) {
    return request('/api/logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  makeupMedication(data: {
    medication_id: string;
    notes?: string;
  }) {
    return request('/api/logs/makeup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// 辅助函数：转换 snake_case 到 camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj !== 'object') {
    return obj;
  }

  const converted: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    converted[camelKey] = toCamelCase(value);
  }
  return converted;
}

// 家属API
export const familyAPI = {
  getAll() {
    return request('/api/family').then(data => {
      // 转换数据格式从 snake_case 到 camelCase
      if (data.family_members) {
        return data.family_members.map((member: any) => toCamelCase(member));
      }
      return [];
    });
  },

  create(data: {
    name: string;
    phone: string;
    relation?: string;
    notify_on_missed?: boolean;
    notify_on_low_stock?: boolean;
    notify_on_daily_report?: boolean;
    notify_on_emergency?: boolean;
  }) {
    return request('/api/family', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: any) {
    return request(`/api/family/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return request(`/api/family/${id}`, {
      method: 'DELETE',
    });
  },

  getNotifications(unreadOnly = false) {
    return request(`/api/family/notifications?unread_only=${unreadOnly}`);
  },

  markNotificationRead(id: string) {
    return request(`/api/family/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  markAllNotificationsRead() {
    return request('/api/family/notifications/read-all', {
      method: 'PUT',
    });
  },

  sendEmergencyNotification(message: string) {
    return request('/api/family/notifications/emergency', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  sendMissedNotification(medication_name: string, time: string) {
    return request('/api/family/notifications/missed', {
      method: 'POST',
      body: JSON.stringify({ medication_name, time }),
    });
  },
};

// 紧急联系API
export const emergencyAPI = {
  getAll() {
    return request('/api/emergency');
  },

  create(data: {
    type: string;
    name: string;
    phone: string;
    notes?: string;
  }) {
    return request('/api/emergency', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: any) {
    return request(`/api/emergency/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return request(`/api/emergency/${id}`, {
      method: 'DELETE',
    });
  },

  emergencyCall(type: string) {
    return request('/api/emergency/call', {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  },

  getMedicalInfo() {
    return request('/api/emergency/medical-info');
  },
};

// 提醒API
export const reminderAPI = {
  getAll() {
    return request('/api/reminders');
  },

  getPending() {
    return request('/api/reminders/pending');
  },

  create(data: {
    medication_id: string;
    time: string;
    days: string[];
    enabled?: boolean;
    voice_reminder?: boolean;
  }) {
    return request('/api/reminders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: any) {
    return request(`/api/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return request(`/api/reminders/${id}`, {
      method: 'DELETE',
    });
  },
};

export default {
  auth: authAPI,
  medication: medicationAPI,
  log: logAPI,
  family: familyAPI,
  emergency: emergencyAPI,
  reminder: reminderAPI,
};
