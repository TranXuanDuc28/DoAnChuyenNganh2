import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Users, Dumbbell, Calendar, FileText, TrendingUp } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Đang tải...</div>;
  }

  const statCards = [
    {
      title: 'Tổng người dùng',
      value: stats?.users?.total || 0,
      icon: Users,
      color: '#3b82f6',
      change: stats?.users?.recent || 0,
      changeLabel: 'người mới (7 ngày)'
    },
    {
      title: 'Người dùng hoạt động',
      value: stats?.users?.active || 0,
      icon: TrendingUp,
      color: '#10b981',
      change: stats?.users?.total ? Math.round((stats.users.active / stats.users.total) * 100) : 0,
      changeLabel: '% tổng số'
    },
    {
      title: 'Bài tập',
      value: stats?.content?.exercises || 0,
      icon: Dumbbell,
      color: '#f59e0b',
    },
    {
      title: 'Workouts',
      value: stats?.content?.workouts || 0,
      icon: Calendar,
      color: '#8b5cf6',
    },
    {
      title: 'Kế hoạch tập',
      value: stats?.content?.plans || 0,
      icon: FileText,
      color: '#ec4899',
    },
    {
      title: 'Quản trị viên',
      value: stats?.users?.admins || 0,
      icon: Users,
      color: '#ef4444',
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Tổng quan hệ thống</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <h3>{card.value.toLocaleString()}</h3>
                <p>{card.title}</p>
                {card.change !== undefined && (
                  <span className="stat-change">
                    {card.change} {card.changeLabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;








