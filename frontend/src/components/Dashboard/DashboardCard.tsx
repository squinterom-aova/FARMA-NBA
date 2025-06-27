import React from 'react';
import { ChartData } from '@/types';

interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ComponentType<{ className?: string }>;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  trend?: ChartData[];
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  trend
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600',
  };

  const changeColorClasses = {
    positive: 'text-success-600',
    negative: 'text-danger-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                change.isPositive ? changeColorClasses.positive : changeColorClasses.negative
              }`}>
                {change.isPositive ? '+' : ''}{change.value}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs mes anterior</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && trend.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Tendencia</span>
            <span>Últimos 7 días</span>
          </div>
          <div className="mt-2 flex items-end space-x-1 h-8">
            {trend.map((item, index) => (
              <div
                key={index}
                className="flex-1 bg-gray-200 rounded-t"
                style={{
                  height: `${(item.value / Math.max(...trend.map(t => t.value))) * 100}%`,
                  backgroundColor: item.color || '#e5e7eb'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCard; 