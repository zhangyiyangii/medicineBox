import { useState, useEffect } from 'react';
import {
  Users,
  Phone,
  Bell,
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  X
} from 'lucide-react';
import { familyAPI } from '../services/api';
import { FamilyMember } from '../types';

export default function Family() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [notifications, setNotifications] = useState({
    missedMedication: true,
    lowStock: true,
    dailyReport: true,
    emergency: true
  });
  const [newMember, setNewMember] = useState<{
    name: string;
    phone: string;
    relation: string;
    notifyOnMissed: boolean;
    notifyOnLowStock: boolean;
  }>({
    name: '',
    phone: '',
    relation: '',
    notifyOnMissed: true,
    notifyOnLowStock: true
  });

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      setLoading(true);
      const data = await familyAPI.getAll();
      setFamilyMembers(data as FamilyMember[]);
    } catch (error) {
      console.error('加载家属列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.phone) {
      setError('请填写姓名和手机号');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await familyAPI.create({
        name: newMember.name,
        phone: newMember.phone,
        relation: newMember.relation || '',
        notify_on_missed: newMember.notifyOnMissed,
        notify_on_low_stock: newMember.notifyOnLowStock,
        notify_on_daily_report: true,  // 总是启用
        notify_on_emergency: true      // 总是启用
      });
      setSuccess('添加成功！');
      setShowAddModal(false);
      setNewMember({
        name: '',
        phone: '',
        relation: '',
        notifyOnMissed: true,
        notifyOnLowStock: true
      });
      loadFamilyMembers();
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '添加失败，请重试';
      setError(errorMessage);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (confirm('确定要删除这个家属吗？')) {
      try {
        await familyAPI.delete(id);
        loadFamilyMembers();
      } catch (error) {
        console.error('删除家属失败:', error);
      }
    }
  };

  const recentNotifications = [
    { id: '1', member: '张阿姨', type: 'missed', message: '维生素D 服药提醒未响应', time: '10分钟前', read: false },
    { id: '2', member: '李叔叔', type: 'low', message: '降糖药库存不足，仅剩8片', time: '1小时前', read: true },
    { id: '3', member: '张阿姨', type: 'daily', message: '服药日报: 今日服药率 83%', time: '2小时前', read: true }
  ];

  const notificationItems = [
    { key: 'missedMedication', label: '漏服药物提醒', desc: '当服药时间超过30分钟未响应时通知', gradient: 'from-red-400 to-red-600' },
    { key: 'lowStock', label: '库存不足提醒', desc: '当药物库存低于10片时通知', gradient: 'from-orange-400 to-orange-600' },
    { key: 'dailyReport', label: '每日服药报告', desc: '每天晚上发送服药记录汇总', gradient: 'from-green-400 to-green-600' },
    { key: 'emergency', label: '紧急情况通知', desc: '紧急模式下立即通知所有家属', gradient: 'from-purple-400 to-purple-600' }
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">家属通知设置</h1>
          <p className="text-gray-500 text-sm mt-1">管理家属成员和通知偏好</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          添加家属
        </button>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">通知类型</h3>
            <p className="text-sm text-gray-500">选择需要通知家属的事件</p>
          </div>
        </div>

        <div className="space-y-4">
          {notificationItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  {item.key === 'missedMedication' && <AlertTriangle className="w-5 h-5 text-white" />}
                  {item.key === 'lowStock' && <Clock className="w-5 h-5 text-white" />}
                  {item.key === 'dailyReport' && <CheckCircle className="w-5 h-5 text-white" />}
                  {item.key === 'emergency' && <Shield className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Family Members */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">家属成员</h3>
            <p className="text-sm text-gray-500">已添加 {familyMembers.length} 位家属成员</p>
          </div>
        </div>

        <div className="space-y-4">
          {familyMembers.map((member) => (
            <div
              key={member.id}
              className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-lg transition-all hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-white">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{member.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="w-4 h-4" />
                      <span>{member.relation} · {member.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Notification preferences */}
              <div className="flex gap-3">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
                  member.notifyOnMissed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {member.notifyOnMissed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  漏服通知
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
                  member.notifyOnLowStock ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {member.notifyOnLowStock ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  库存通知
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">最近通知</h3>
            <p className="text-sm text-gray-500">发送给家属的通知记录</p>
          </div>
        </div>

        <div className="space-y-3">
          {recentNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-2xl transition-all ${
                notification.read ? 'bg-gray-50' : 'bg-blue-50 border-2 border-blue-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    notification.type === 'missed' ? 'bg-red-100' :
                    notification.type === 'low' ? 'bg-orange-100' : 'bg-green-100'
                  }`}>
                    {notification.type === 'missed' && <AlertTriangle className="w-6 h-6 text-red-600" />}
                    {notification.type === 'low' && <Clock className="w-6 h-6 text-orange-600" />}
                    {notification.type === 'daily' && <CheckCircle className="w-6 h-6 text-green-600" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      通知 <span className="text-blue-600">{notification.member}</span>
                    </p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap bg-gray-200 px-2 py-1 rounded-full">
                  {notification.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
          查看更多通知
        </button>
      </div>

      {/* Add Family Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">添加家属成员</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* 错误提示 */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* 成功提示 */}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                  {success}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">姓名 *</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="请输入姓名"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">手机号 *</label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  placeholder="请输入手机号"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">关系</label>
                <input
                  type="text"
                  value={newMember.relation}
                  onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                  placeholder="例如: 女儿、儿子"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={newMember.notifyOnMissed}
                    onChange={(e) => setNewMember({ ...newMember, notifyOnMissed: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">漏服药物通知</p>
                    <p className="text-sm text-gray-500">当服药提醒未响应时发送通知</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={newMember.notifyOnLowStock}
                    onChange={(e) => setNewMember({ ...newMember, notifyOnLowStock: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">库存不足通知</p>
                    <p className="text-sm text-gray-500">当药物库存低于10片时发送通知</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddMember}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
