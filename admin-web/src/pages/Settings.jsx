import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Save, Plus, Trash2 } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    type: 'string',
    category: 'general',
    description: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      key: '',
      value: '',
      type: 'string',
      category: 'general',
      description: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createOrUpdateSetting(formData);
      setShowModal(false);
      fetchSettings();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleUpdate = async (key, value) => {
    try {
      await adminAPI.updateSetting(key, { value });
      fetchSettings();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (key) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cài đặt này?')) return;
    try {
      await adminAPI.deleteSetting(key);
      fetchSettings();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    const category = setting.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(setting);
    return acc;
  }, {});

  const categoryLabels = {
    appearance: 'Giao diện',
    general: 'Chung',
    features: 'Tính năng',
    notifications: 'Thông báo',
    social: 'Xã hội'
  };

  if (loading) {
    return <div className="settings-loading">Đang tải...</div>;
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1>Cài đặt hệ thống</h1>
          <p>Tùy chỉnh giao diện và cấu hình hệ thống</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <Plus size={20} />
          Thêm cài đặt
        </button>
      </div>

      {Object.keys(groupedSettings).map((category) => (
        <div key={category} className="settings-group">
          <h2>{categoryLabels[category] || category}</h2>
          <div className="settings-list">
            {groupedSettings[category].map((setting) => (
              <div key={setting.key} className="setting-item">
                <div className="setting-info">
                  <h3>{setting.key}</h3>
                  {setting.description && <p>{setting.description}</p>}
                </div>
                <div className="setting-control">
                  {setting.type === 'boolean' ? (
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={setting.value === 'true'}
                        onChange={(e) => handleUpdate(setting.key, e.target.checked.toString())}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  ) : setting.type === 'color' ? (
                    <input
                      type="color"
                      value={setting.value || '#000000'}
                      onChange={(e) => handleUpdate(setting.key, e.target.value)}
                      className="color-input"
                    />
                  ) : (
                    <input
                      type={setting.type === 'number' ? 'number' : 'text'}
                      value={setting.value || ''}
                      onChange={(e) => handleUpdate(setting.key, e.target.value)}
                      className="setting-input"
                    />
                  )}
                  <button
                    onClick={() => handleDelete(setting.key)}
                    className="btn-icon btn-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Thêm cài đặt mới</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Key *</label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  required
                  placeholder="app.primary_color"
                />
              </div>
              <div className="form-group">
                <label>Giá trị *</label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Loại *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="color">Color</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Danh mục *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="appearance">Giao diện</option>
                    <option value="general">Chung</option>
                    <option value="features">Tính năng</option>
                    <option value="notifications">Thông báo</option>
                    <option value="social">Xã hội</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;








