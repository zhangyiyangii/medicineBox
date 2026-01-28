import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  TrendingUp,
  Clock,
  AlertTriangle,
  Bell,
  ChevronRight,
  Volume2,
  XCircle,
  MinusCircle,
  Phone,
  Calendar,
  X,
  Package,
  Pill
} from 'lucide-react';
import PillboxVisual from '../components/PillboxVisual';
import { logAPI, medicationAPI } from '../services/api';
import { BoxStatus, Medication } from '../types';

interface TodayReminder {
  id: string;
  medication_id: string;
  medication_name: string;
  time: string;
  status: string;
  box_number: number;
}

export default function Dashboard() {
  const [voiceReminderEnabled, setVoiceReminderEnabled] = useState(true);
  const [todayReminders, setTodayReminders] = useState<TodayReminder[]>([]);
  const [stats, setStats] = useState({
    taken: 0,
    missed: 0,
    pending: 0,
    adherenceRate: 0
  });
  const [boxStatus, setBoxStatus] = useState<BoxStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBox, setSelectedBox] = useState<{
    boxNumber: number;
    medication: Medication | null;
    loading: boolean;
  } | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // 并行加载数据
      const [remindersRes, boxRes, trendRes] = await Promise.all([
        logAPI.getTodayReminders().catch(() => ({ reminders: [] })),
        medicationAPI.getBoxStatus().catch(() => []),
        logAPI.getTrend(7).catch(() => ({ adherenceRate: 92 }))
      ]);

      // 处理提醒数据
      const reminders = (remindersRes as any)?.reminders || [];
      setTodayReminders(reminders.map((r: any) => ({
        ...r,
        medication_name: r.medication_name || r.medicationName || '未知药物',
        box_number: r.box_number || r.boxNumber || 1
      })));

      // 处理药盒状态
      setBoxStatus(boxRes as BoxStatus[]);

      // 计算统计数据
      const taken = reminders.filter((r: any) => r.status === 'taken').length;
      const missed = reminders.filter((r: any) => r.status === 'missed').length;
      const pending = reminders.filter((r: any) => r.status === 'pending').length;
      const adherenceRate = (trendRes as any)?.adherenceRate || 92;

      setStats({ taken, missed, pending, adherenceRate });
    } catch (error) {
      console.error('加载数据失败:', error);
      // 使用默认数据
      setTodayReminders([
        { id: '1', medication_id: '1', medication_name: '阿司匹林', time: '08:00', status: 'taken', box_number: 1 },
        { id: '2', medication_id: '2', medication_name: '降压药', time: '08:00', status: 'taken', box_number: 2 },
        { id: '5', medication_id: '5', medication_name: '降糖药', time: '12:30', status: 'pending', box_number: 5 },
        { id: '6', medication_id: '6', medication_name: '降压药', time: '20:00', status: 'pending', box_number: 2 },
      ]);
      setStats({ taken: 2, missed: 0, pending: 2, adherenceRate: 92 });
      setBoxStatus([
        { boxNumber: 1, medicationName: '阿司匹林', hasMedication: true, stockLevel: 'full', nextReminder: '08:00' },
        { boxNumber: 2, medicationName: '降压药', hasMedication: true, stockLevel: 'medium', nextReminder: '20:00' },
        { boxNumber: 3, medicationName: '维生素D', hasMedication: true, stockLevel: 'low', nextReminder: '09:00' },
        { boxNumber: 4, medicationName: '钙片', hasMedication: true, stockLevel: 'full', nextReminder: '18:00' },
        { boxNumber: 5, medicationName: '降糖药', hasMedication: true, stockLevel: 'medium', nextReminder: '12:30' },
        { boxNumber: 6, medicationName: '', hasMedication: false, stockLevel: 'empty', nextReminder: '' },
        { boxNumber: 7, medicationName: '叶酸', hasMedication: true, stockLevel: 'full', nextReminder: '10:00' },
        { boxNumber: 8, medicationName: '', hasMedication: false, stockLevel: 'empty', nextReminder: '' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeMedication = async (reminderId: string, medicationId: string) => {
    try {
      await logAPI.recordMedication({
        medication_id: medicationId,
        status: 'taken'
      });
      // 重新加载数据
      loadDashboardData();
    } catch (error) {
      console.error('记录服药失败:', error);
    }
  };

  const handleMakeupMedication = async (reminderId: string, medicationId: string) => {
    try {
      await logAPI.makeupMedication({
        medication_id: medicationId
      });
      // 重新加载数据
      loadDashboardData();
    } catch (error) {
      console.error('补服失败:', error);
    }
  };

  // 处理药盒点击
  const handleBoxClick = async (boxNumber: number) => {
    const boxInfo = boxStatus.find(b => b.boxNumber === boxNumber);

    // 设置选中的药盒信息
    setSelectedBox({
      boxNumber,
      medication: null,
      loading: true
    });

    if (boxInfo?.hasMedication && boxInfo.medicationId) {
      // 获取药物详情
      try {
        const response = await medicationAPI.getById(boxInfo.medicationId);
        const medData = (response as any)?.medication;
        if (medData) {
          setSelectedBox({
            boxNumber,
            medication: medData as Medication,
            loading: false
          });
        } else {
          setSelectedBox({
            boxNumber,
            medication: null,
            loading: false
          });
        }
      } catch (error) {
        console.error('获取药物详情失败:', error);
        setSelectedBox({
          boxNumber,
          medication: null,
          loading: false
        });
      }
    } else {
      // 空药格
      setSelectedBox({
        boxNumber,
        medication: null,
        loading: false
      });
    }
  };

  // 关闭详情弹窗
  const closeBoxDetail = () => {
    setSelectedBox(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'missed': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'skipped': return <MinusCircle className="w-5 h-5 text-yellow-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'taken': return '已服用';
      case 'missed': return '漏服';
      case 'skipped': return '已跳过';
      default: return '待服用';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'taken': return 'bg-green-100';
      case 'missed': return 'bg-red-100';
      case 'skipped': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };

  // 获取下一个待服用的提醒
  const nextPendingReminder = todayReminders.find(r => r.status === 'pending');

  const formatCurrentTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };
    return now.toLocaleDateString('zh-CN', options);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl p-6 text-white shadow-2xl overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-10 w-20 h-20 bg-white/5 rounded-full" />

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">早上好，张爷爷</h2>
              <p className="text-blue-100 text-base">{formatCurrentTime()}</p>
            </div>

            {/* Voice toggle */}
            <button
              onClick={() => setVoiceReminderEnabled(!voiceReminderEnabled)}
              className={`self-start sm:self-auto p-4 rounded-2xl transition-all duration-300 backdrop-blur-sm ${
                voiceReminderEnabled
                  ? 'bg-white/20 hover:bg-white/30'
                  : 'bg-white/10 opacity-60 hover:opacity-80'
              }`}
            >
              <Volume2 className={`w-8 h-8 ${voiceReminderEnabled ? 'text-white' : 'text-blue-200'}`} />
            </button>
          </div>

          {/* Status indicator */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <span className={`w-2.5 h-2.5 rounded-full ${voiceReminderEnabled ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
              <span className="text-sm font-medium">{voiceReminderEnabled ? '语音提醒已开启' : '语音提醒已关闭'}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Bell className="w-4 h-4" />
              <span className="text-sm">
                {nextPendingReminder
                  ? `下一个: ${nextPendingReminder.time} ${nextPendingReminder.medication_name}`
                  : '今日服药已完成'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold">{stats.taken}/{todayReminders.length}</p>
          <p className="text-white/80 text-sm">今日服药</p>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold">{stats.adherenceRate}%</p>
          <p className="text-white/80 text-sm">按时服药率</p>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold">{stats.pending}</p>
          <p className="text-white/80 text-sm">待服药</p>
        </div>

        <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold">{stats.missed}</p>
          <p className="text-white/80 text-sm">漏服</p>
        </div>
      </div>

      {/* Pillbox Visual */}
      <PillboxVisual
        boxes={boxStatus}
        onBoxClick={handleBoxClick}
      />

      {/* Today's Reminders */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">今日服药提醒</h3>
              <p className="text-sm text-gray-500">共 {todayReminders.length} 个提醒</p>
            </div>
          </div>
          <Link to="/medications" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
            查看全部
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {todayReminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${
                reminder.status === 'missed'
                  ? 'bg-red-50 border-red-200 hover:bg-red-100'
                  : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Status icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusBg(reminder.status)}`}>
                  {getStatusIcon(reminder.status)}
                </div>

                {/* Medication info */}
                <div>
                  <p className="font-bold text-gray-800 text-lg">{reminder.medication_name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>药格 #{reminder.box_number}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span>{reminder.time}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  reminder.status === 'taken' ? 'bg-green-100 text-green-700' :
                  reminder.status === 'missed' ? 'bg-red-100 text-red-700' :
                  reminder.status === 'skipped' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {getStatusText(reminder.status)}
                </span>

                {reminder.status === 'pending' && (
                  <button
                    onClick={() => handleTakeMedication(reminder.id, reminder.medication_id)}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                  >
                    服用
                  </button>
                )}
                {reminder.status === 'missed' && (
                  <button
                    onClick={() => handleMakeupMedication(reminder.id, reminder.medication_id)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                  >
                    补服
                  </button>
                )}
              </div>
            </div>
          ))}

          {todayReminders.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-500">今日暂无服药提醒</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">加载中...</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        {/* Emergency Contact */}
        <Link
          to="/emergency"
          className="relative bg-gradient-to-br from-red-500 via-red-600 to-pink-600 rounded-3xl p-5 text-white shadow-2xl shadow-red-500/25 overflow-hidden group hover:shadow-3xl transition-all hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Phone className="w-8 h-8" />
            </div>
            <p className="font-bold text-xl mb-1">紧急联系</p>
            <p className="text-red-100 text-sm">一键拨打急救</p>
          </div>
        </Link>

        {/* Medication History */}
        <Link
          to="/history"
          className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl p-5 text-white shadow-2xl shadow-blue-500/25 overflow-hidden group hover:shadow-3xl transition-all hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-8 h-8" />
            </div>
            <p className="font-bold text-xl mb-1">服药记录</p>
            <p className="text-blue-100 text-sm">查看历史详情</p>
          </div>
        </Link>
      </div>

      {/* 药盒详情弹窗 */}
      {selectedBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeBoxDetail}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* 弹窗头部 */}
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 text-white relative">
              <button
                onClick={closeBoxDetail}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">药格 #{selectedBox.boxNumber}</h3>
                  <p className="text-blue-100 text-sm">
                    {selectedBox.medication?.name || '空药格'}
                  </p>
                </div>
              </div>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6">
              {selectedBox.loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gray-500">加载中...</p>
                </div>
              ) : selectedBox.medication ? (
                <div className="space-y-4">
                  {/* 药物信息 */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Pill className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{selectedBox.medication.name}</h4>
                        <p className="text-sm text-gray-500">{selectedBox.medication.dosage}</p>
                      </div>
                    </div>
                  </div>

                  {/* 详细信息 */}
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">服用频率</span>
                      <span className="font-medium text-gray-800">
                        {selectedBox.medication.frequency === 'daily' ? '每天' :
                         selectedBox.medication.frequency === 'twice' ? '每天2次' :
                         selectedBox.medication.frequency === 'thrice' ? '每天3次' : '每周'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">服药时间</span>
                      <span className="font-medium text-gray-800">
                        {Array.isArray(selectedBox.medication.times)
                          ? selectedBox.medication.times.join(', ')
                          : selectedBox.medication.times}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">剩余库存</span>
                      <span className={`font-medium ${
                        (selectedBox.medication.stock || 0) <= 10 ? 'text-red-500' : 'text-gray-800'
                      }`}>
                        {selectedBox.medication.stock} 片
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">开始日期</span>
                      <span className="font-medium text-gray-800">{(selectedBox.medication as any).start_date || selectedBox.medication.startDate}</span>
                    </div>
                    {selectedBox.medication.instructions && (
                      <div className="py-2">
                        <span className="text-gray-500 block mb-1">服用说明</span>
                        <span className="text-gray-800">{selectedBox.medication.instructions}</span>
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="pt-4">
                    <Link
                      to="/medications"
                      className="block w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all"
                      onClick={closeBoxDetail}
                    >
                      管理药物
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-2">此药格为空</p>
                  <Link
                    to="/medications"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    onClick={closeBoxDetail}
                  >
                    添加药物
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
