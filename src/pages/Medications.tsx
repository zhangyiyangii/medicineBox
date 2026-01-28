import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Bell,
  Clock,
  Package,
  X,
  Pill
} from 'lucide-react';
import { medicationAPI } from '../services/api';
import { Medication } from '../types';

const frequencyLabels: Record<string, string> = {
  daily: '每日一次',
  twice: '每日两次',
  thrice: '每日三次',
  weekly: '每周一次'
};

export default function Medications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStock, setFilterStock] = useState<'all' | 'low'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setLoading(true);
      const data = await medicationAPI.getAll(false);
      setMedications(data as Medication[]);
    } catch (error) {
      console.error('加载药物列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const [newMedication, setNewMedication] = useState<Partial<Medication>>({
    name: '',
    dosage: '',
    frequency: 'daily',
    times: ['08:00'],
    boxNumber: 1,
    stock: 30,
    startDate: new Date().toISOString().split('T')[0],
    instructions: ''
  });

  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStock === 'low' ? (med.stock || 0) <= 10 : true;
    return matchesSearch && matchesFilter;
  });

  const handleAddMedication = async () => {
    if (!newMedication.name || !newMedication.dosage) {
      alert('请填写药物名称和剂量');
      return;
    }

    const payload = {
      name: newMedication.name,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency || 'daily',
      times: newMedication.times || ['08:00'],
      box_number: newMedication.boxNumber || 1,
      stock: newMedication.stock || 30,
      start_date: newMedication.startDate || new Date().toISOString().split('T')[0],
      instructions: newMedication.instructions
    };

    console.log('发送数据:', JSON.stringify(payload, null, 2));

    try {
      const result = await medicationAPI.create(payload);
      console.log('添加成功:', result);
      setShowAddModal(false);
      setNewMedication({
        name: '',
        dosage: '',
        frequency: 'daily',
        times: ['08:00'],
        boxNumber: 1,
        stock: 30,
        startDate: new Date().toISOString().split('T')[0],
        instructions: ''
      });
      loadMedications();
    } catch (error) {
      console.error('添加药物失败:', error);
      alert('添加失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (confirm('确定要删除这个药物吗？')) {
      try {
        await medicationAPI.delete(id);
        loadMedications();
      } catch (error) {
        console.error('删除药物失败:', error);
      }
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 5) return { color: 'bg-red-100 text-red-700', label: '紧急', dot: 'bg-red-500' };
    if (stock <= 10) return { color: 'bg-orange-100 text-orange-700', label: '不足', dot: 'bg-orange-500' };
    if (stock <= 20) return { color: 'bg-yellow-100 text-yellow-700', label: '偏低', dot: 'bg-yellow-500' };
    return { color: 'bg-green-100 text-green-700', label: '充足', dot: 'bg-green-500' };
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">药物管理</h1>
          <p className="text-gray-500 text-sm mt-1">管理您的药物清单和服药计划</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          添加药物
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索药物名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => setFilterStock(filterStock === 'all' ? 'low' : 'all')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
              filterStock === 'low'
                ? 'bg-orange-50 border-orange-200 text-orange-600'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">{filterStock === 'low' ? '仅显示库存不足' : '所有药物'}</span>
          </button>
        </div>
      </div>

      {/* Medication List */}
      <div className="grid gap-4">
        {filteredMedications.map((medication) => {
          const stockStatus = getStockStatus(medication.stock || 0);
          return (
            <div
              key={medication.id}
              className="bg-white rounded-3xl shadow-lg p-5 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Medication Icon */}
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                    {medication.icon || '💊'}
                  </div>

                  {/* Medication Info */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg text-gray-800">{medication.name}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stockStatus.dot}`} />
                        {stockStatus.label} ({medication.stock}片)
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{medication.dosage} · {frequencyLabels[medication.frequency] || medication.frequency}</p>

                    <div className="flex flex-wrap gap-2">
                      {/* Time badges */}
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                        <Clock className="w-4 h-4" />
                        {Array.isArray(medication.times) ? medication.times.join(', ') : medication.times}
                      </div>

                      {/* Box location */}
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                        <Package className="w-4 h-4" />
                        药格 #{medication.boxNumber}
                      </div>
                    </div>

                    {medication.instructions && (
                      <p className="mt-3 text-sm text-gray-500 bg-blue-50 px-4 py-2.5 rounded-xl">
                        💡 {medication.instructions}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMedication(medication.id)}
                    className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Reminder settings */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <span>语音提醒: {Array.isArray(medication.times) ? medication.times.join(', ') : medication.times}</span>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">开启提醒</span>
                </label>
              </div>
            </div>
          );
        })}

        {filteredMedications.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Pill className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">没有找到匹配的药物</p>
            <p className="text-gray-400 text-sm mt-1">尝试其他搜索词或添加新药物</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">加载中...</p>
          </div>
        )}
      </div>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">添加新药物</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Medication Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">药物名称 *</label>
                <input
                  type="text"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                  placeholder="例如: 阿司匹林"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Dosage */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">剂量 *</label>
                <input
                  type="text"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  placeholder="例如: 100mg"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">服药频率</label>
                <div className="grid grid-cols-2 gap-2">
                  {['daily', 'twice', 'thrice', 'weekly'].map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setNewMedication({ ...newMedication, frequency: freq as Medication['frequency'] })}
                      className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        newMedication.frequency === freq
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {frequencyLabels[freq]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Times */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">服药时间</label>
                <div className="space-y-2">
                  {newMedication.times?.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const times = [...(newMedication.times || [])];
                          times[index] = e.target.value;
                          setNewMedication({ ...newMedication, times });
                        }}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {index > 0 && (
                        <button
                          onClick={() => {
                            const times = newMedication.times?.filter((_, i) => i !== index);
                            setNewMedication({ ...newMedication, times });
                          }}
                          className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {(newMedication.frequency === 'twice' || newMedication.frequency === 'thrice') &&
                    (newMedication.times?.length || 0) < (newMedication.frequency === 'twice' ? 2 : 3) && (
                      <button
                        onClick={() => setNewMedication({ ...newMedication, times: [...(newMedication.times || []), '12:00'] })}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        添加时间
                      </button>
                    )}
                </div>
              </div>

              {/* Box Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">药格位置</label>
                <select
                  value={newMedication.boxNumber}
                  onChange={(e) => setNewMedication({ ...newMedication, boxNumber: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>药格 #{num}</option>
                  ))}
                </select>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">初始库存 (片)</label>
                <input
                  type="number"
                  value={newMedication.stock}
                  onChange={(e) => setNewMedication({ ...newMedication, stock: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">用药说明</label>
                <textarea
                  value={newMedication.instructions}
                  onChange={(e) => setNewMedication({ ...newMedication, instructions: e.target.value })}
                  placeholder="例如: 餐后服用..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">开始日期 *</label>
                <input
                  type="date"
                  value={newMedication.startDate}
                  onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                onClick={handleAddMedication}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all"
              >
                添加药物
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
