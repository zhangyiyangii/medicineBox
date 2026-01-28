import { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  MinusCircle,
  TrendingUp,
  Clock,
  Download,
  FileText
} from 'lucide-react';
import { logAPI } from '../services/api';
import { MedicationLog } from '../types';

export default function History() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<'all' | 'taken' | 'missed' | 'skipped'>('all');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [selectedDate, filterStatus]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await logAPI.getHistory({
        status: filterStatus === 'all' ? undefined : filterStatus
      });
      setLogs((data as any)?.logs || []);
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    return matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'taken': return { bg: 'bg-green-100 text-green-700', label: '已服用' };
      case 'missed': return { bg: 'bg-red-100 text-red-700', label: '漏服' };
      case 'skipped': return { bg: 'bg-yellow-100 text-yellow-700', label: '已跳过' };
      default: return { bg: 'bg-gray-100 text-gray-700', label: '待服用' };
    }
  };

  const stats = {
    taken: filteredLogs.filter(l => l.status === 'taken').length,
    missed: filteredLogs.filter(l => l.status === 'missed').length,
    skipped: filteredLogs.filter(l => l.status === 'skipped').length,
    total: filteredLogs.length
  };

  const adherenceRate = stats.total > 0 ? Math.round((stats.taken / (stats.total - stats.skipped)) * 100) : 100;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const statCards = [
    { key: 'taken', label: '已服用', value: stats.taken, gradient: 'from-green-400 to-green-600', icon: CheckCircle },
    { key: 'missed', label: '漏服', value: stats.missed, gradient: 'from-red-400 to-red-600', icon: XCircle },
    { key: 'skipped', label: '已跳过', value: stats.skipped, gradient: 'from-yellow-400 to-yellow-600', icon: MinusCircle },
    { key: 'rate', label: '依从率', value: `${adherenceRate}%`, gradient: 'from-blue-400 to-indigo-600', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">服药历史</h1>
          <p className="text-gray-500 text-sm mt-1">查看和管理服药记录</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 transition-all active:scale-95">
          <Download className="w-5 h-5" />
          导出记录
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1`}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-white/80 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() - 1);
                setSelectedDate(newDate);
              }}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-800">{formatDate(selectedDate.toISOString())}</span>
            </div>
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() + 1);
                setSelectedDate(newDate);
              }}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {mode === 'day' ? '日' : mode === 'week' ? '周' : '月'}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'taken', 'missed', 'skipped'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === status
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? '全部' : status === 'taken' ? '已服用' : status === 'missed' ? '漏服' : '已跳过'}
            </button>
          ))}
        </div>
      </div>

      {/* Medication Records */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">服药记录</h3>
            <p className="text-sm text-gray-500">共 {filteredLogs.length} 条记录</p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredLogs.map((log) => {
            const statusBadge = getStatusBadge(log.status);
            return (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Status icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      log.status === 'taken' ? 'bg-green-100' :
                      log.status === 'missed' ? 'bg-red-100' :
                      log.status === 'skipped' ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      {log.status === 'taken' && <CheckCircle className="w-6 h-6 text-green-600" />}
                      {log.status === 'missed' && <XCircle className="w-6 h-6 text-red-500" />}
                      {log.status === 'skipped' && <MinusCircle className="w-6 h-6 text-yellow-500" />}
                    </div>

                    {/* Record info */}
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">{log.medicationName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>药格 #{log.boxNumber}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>{formatTime(log.takenAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusBadge.bg}`}>
                    {statusBadge.label}
                  </span>
                </div>

                {/* Notes */}
                {log.notes && (
                  <p className="mt-3 text-sm text-gray-500 bg-blue-50 px-4 py-2.5 rounded-xl ml-16">
                    💡 {log.notes}
                  </p>
                )}
              </div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">没有找到服药记录</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-gray-800">近7天服药趋势</h3>
        </div>

        <div className="flex items-end justify-between h-48 gap-3">
          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => {
            const heights = [100, 85, 90, 75, 100, 80, 95];
            const isToday = index === 4;
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-3">
                <div className="w-full flex items-end justify-center h-36">
                  <div
                    className={`w-full max-w-[48px] rounded-t-xl transition-all duration-300 ${
                      isToday
                        ? 'bg-gradient-to-t from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    style={{ height: `${heights[index]}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
