import { useState, useEffect } from 'react';
import {
  Phone,
  MapPin,
  User,
  AlertTriangle,
  Heart,
  Shield,
  Car,
  Plus,
  Edit2,
  MessageSquare,
  Video,
  PhoneCall
} from 'lucide-react';
import { emergencyAPI } from '../services/api';
import { EmergencyContact } from '../types';

const contactTypeConfig: Record<string, { icon: typeof User; gradient: string; label: string }> = {
  doctor: { icon: User, gradient: 'from-blue-400 to-blue-600', label: '医生' },
  hospital: { icon: Heart, gradient: 'from-red-400 to-red-600', label: '医院' },
  ambulance: { icon: Car, gradient: 'from-green-400 to-green-600', label: '急救' },
  family: { icon: Shield, gradient: 'from-purple-400 to-purple-600', label: '家属' }
};

export default function Emergency() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [calling, setCalling] = useState<string | null>(null);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await emergencyAPI.getAll();
      setContacts(data as EmergencyContact[]);
    } catch (error) {
      console.error('加载紧急联系人失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (contact: EmergencyContact) => {
    setCalling(contact.id);
    setTimeout(() => {
      setCalling(null);
      alert(`正在拨打 ${contact.name}: ${contact.phone}`);
    }, 1000);
  };

  const quickCallNumbers = [
    { name: '急救中心', phone: '120', type: 'ambulance', gradient: 'from-red-500 to-pink-600' },
    { name: '火警', phone: '119', type: 'hospital', gradient: 'from-orange-500 to-red-600' },
    { name: '报警电话', phone: '110', type: 'family', gradient: 'from-blue-500 to-indigo-600' }
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Emergency Mode Toggle */}
      <div className={`relative rounded-3xl p-6 shadow-2xl overflow-hidden transition-all duration-500 ${
        emergencyMode
          ? 'bg-gradient-to-r from-red-500 via-red-600 to-pink-600 shadow-red-500/30'
          : 'bg-gradient-to-r from-gray-800 to-gray-900'
      }`}>
        {/* Animated pulse when emergency mode is on */}
        {emergencyMode && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        )}

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              emergencyMode ? 'bg-white/20 animate-bounce' : 'bg-gray-700'
            }`}>
              <AlertTriangle className={`w-8 h-8 ${emergencyMode ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">紧急呼叫模式</h2>
              <p className={`text-sm ${emergencyMode ? 'text-red-100' : 'text-gray-400'}`}>
                {emergencyMode ? '紧急模式已开启' : '点击右侧开启一键呼叫'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setEmergencyMode(!emergencyMode)}
            className={`relative w-18 h-10 rounded-full transition-all duration-300 ${
              emergencyMode ? 'bg-white' : 'bg-gray-700'
            }`}
          >
            <div className={`absolute top-1 w-8 h-8 rounded-full shadow-lg transition-all duration-300 ${
              emergencyMode ? 'left-9 bg-red-500' : 'left-1 bg-white'
            }`} />
          </button>
        </div>
      </div>

      {/* Emergency Call Panel */}
      {emergencyMode && (
        <div className="bg-gradient-to-br from-red-500 via-red-600 to-orange-600 rounded-3xl p-8 text-center shadow-2xl shadow-red-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="mb-6">
              <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Phone className="w-14 h-14 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">紧急呼叫</h3>
              <p className="text-red-100">点击下方按钮一键呼叫急救中心</p>
            </div>

            <button
              onClick={() => handleCall({ id: 'emergency', type: 'ambulance', name: '急救中心', phone: '120', available: true })}
              className="w-full bg-white text-red-600 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all active:scale-95"
            >
              立即呼叫 120
            </button>

            <div className="mt-4 flex justify-center gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium hover:bg-white/30 transition-all">
                <MessageSquare className="w-5 h-5" />
                发送位置
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium hover:bg-white/30 transition-all">
                <Video className="w-5 h-5" />
                视频连线
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Call Buttons */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-blue-600" />
          快捷呼叫
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {quickCallNumbers.map((number) => (
            <button
              key={number.phone}
              onClick={() => handleCall({ id: number.phone, type: number.type as EmergencyContact['type'], name: number.name, phone: number.phone, available: true })}
              className="flex flex-col items-center p-5 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${number.gradient} rounded-full flex items-center justify-center mb-3 shadow-lg`}>
                <Phone className="w-7 h-7 text-white" />
              </div>
              <p className="font-bold text-gray-800">{number.name}</p>
              <p className="text-lg font-bold text-red-600">{number.phone}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            紧急联系人
          </h3>
          <button className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4" />
            添加
          </button>
        </div>

        <div className="space-y-3">
          {contacts.map((contact) => {
            const config = contactTypeConfig[contact.type];
            const Icon = config.icon;

            return (
              <div
                key={contact.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-lg transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${config.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{contact.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        contact.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${contact.available ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {contact.available ? '在线' : '离线'}
                      </span>
                      <span className="text-gray-500">{contact.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-3 rounded-xl bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleCall(contact)}
                    disabled={calling === contact.id}
                    className={`p-3 rounded-xl transition-all ${
                      calling === contact.id
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-xl'
                    }`}
                  >
                    {calling === contact.id ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Phone className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Location Card */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          当前位置
        </h3>
        <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <MapPin className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800 text-lg">北京市朝阳区建国路100号</p>
            <p className="text-sm text-gray-500">最后更新: 2分钟前</p>
          </div>
          <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all">
            更新位置
          </button>
        </div>
      </div>

      {/* Medical Info Card */}
      <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-2xl shadow-blue-500/20">
        <h3 className="font-bold mb-5 flex items-center gap-2">
          <Heart className="w-5 h-5" />
          个人医疗信息
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-200 text-sm">血型</p>
            <p className="font-bold text-lg">A型</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-200 text-sm">过敏药物</p>
            <p className="font-bold text-lg">青霉素</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-200 text-sm">紧急联系人</p>
            <p className="font-bold text-lg">张阿姨 138****1234</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-200 text-sm">既往病史</p>
            <p className="font-bold text-lg">高血压、糖尿病</p>
          </div>
        </div>
      </div>
    </div>
  );
}
