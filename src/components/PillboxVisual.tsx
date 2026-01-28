import { BoxStatus } from '../types';
import { AlertCircle, CheckCircle, Clock, Pill } from 'lucide-react';

interface PillboxVisualProps {
  boxes: BoxStatus[];
  onBoxClick?: (boxNumber: number) => void;
}

const getStockColor = (level: BoxStatus['stockLevel']) => {
  switch (level) {
    case 'full': return { bg: 'from-green-400 to-green-600', light: 'bg-green-100', text: 'text-green-600' };
    case 'medium': return { bg: 'from-yellow-400 to-yellow-600', light: 'bg-yellow-100', text: 'text-yellow-600' };
    case 'low': return { bg: 'from-orange-400 to-orange-600', light: 'bg-orange-100', text: 'text-orange-600' };
    case 'empty': return { bg: 'from-gray-300 to-gray-400', light: 'bg-gray-100', text: 'text-gray-500' };
    default: return { bg: 'from-gray-300 to-gray-400', light: 'bg-gray-100', text: 'text-gray-500' };
  }
};

const getStockPercentage = (level: BoxStatus['stockLevel']) => {
  switch (level) {
    case 'full': return '100%';
    case 'medium': return '60%';
    case 'low': return '25%';
    case 'empty': return '0%';
    default: return '0%';
  }
};

export default function PillboxVisual({ boxes, onBoxClick }: PillboxVisualProps) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-50 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-100 to-transparent rounded-full opacity-50 translate-y-1/2 -translate-x-1/2" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">智能药盒</h3>
            <p className="text-sm text-gray-500">实时药物管理</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600" />
            <span className="text-gray-600">充足</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
            <span className="text-gray-600">中等</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-600" />
            <span className="text-gray-600">不足</span>
          </div>
        </div>
      </div>

      {/* Pillbox Grid */}
      <div className="relative z-10 grid grid-cols-4 gap-3 sm:gap-4">
        {boxes.map((box) => {
          const colors = getStockColor(box.stockLevel);
          return (
            <div
              key={box.boxNumber}
              onClick={() => onBoxClick?.(box.boxNumber)}
              className={`group cursor-pointer transition-all duration-300 active:scale-95 touch-target ${
                !box.hasMedication ? 'opacity-50' : ''
              }`}
            >
              {/* Box Container */}
              <div className={`aspect-square rounded-2xl border-3 overflow-hidden relative shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 ${
                box.hasMedication
                  ? `bg-gradient-to-br ${colors.bg} border-white shadow-lg`
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300'
              }`}>
                {/* Inner content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                  {/* Box number */}
                  <div className={`text-xs font-bold ${box.hasMedication ? 'text-white/90' : 'text-gray-400'}`}>
                    #{box.boxNumber}
                  </div>

                  {/* Medication icon */}
                  {box.hasMedication ? (
                    <>
                      {/* Pill icon */}
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mt-1">
                        <Pill className="w-5 h-5 text-white" />
                      </div>

                      {/* Medication name */}
                      <span className="text-[10px] sm:text-xs font-semibold text-white text-center leading-tight mt-1 line-clamp-2 drop-shadow-md">
                        {box.medicationName}
                      </span>

                      {/* Stock bar */}
                      <div className="w-full mt-2 space-y-1">
                        <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full transition-all duration-500"
                            style={{ width: getStockPercentage(box.stockLevel) }}
                          />
                        </div>
                      </div>

                      {/* Status icon */}
                      <div className="mt-1">
                        {box.stockLevel === 'low' ? (
                          <AlertCircle className="w-4 h-4 text-yellow-300 animate-pulse" />
                        ) : box.stockLevel === 'empty' ? (
                          <AlertCircle className="w-4 h-4 text-red-300" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-white/80" />
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">空</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Next reminder badge */}
                {box.nextReminder && box.hasMedication && (
                  <div className="absolute -top-1 -right-1 bg-white shadow-lg rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-blue-500" />
                    <span className="text-[10px] font-medium text-gray-700">{box.nextReminder}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom info */}
      <div className="relative z-10 mt-6 flex justify-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-lg shadow-blue-500/30">
          <span>点击药格查看详情</span>
          <CheckCircle className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
