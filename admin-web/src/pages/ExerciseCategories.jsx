import React, { useEffect, useMemo, useState } from 'react';
import { Layers, Plus, Edit2, Trash, RefreshCw } from 'lucide-react';
import { adminAPI } from '../services/api';
import './Content.css';

const INITIAL_FORM = {
  name: '',
  english_name: '',
  slug: '',
  description: '',
  image_url: '',
  image_key: '',
  background_color: '#f1f5f9',
  display_order: 0,
  is_active: true,
};

const ExerciseCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);

  const updateImagePreview = (nextValue = '') => {
    setImagePreview((prev) => {
      if (prev && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return nextValue;
    });
  };

  const resetImageSelection = () => {
    updateImagePreview('');
    setSelectedImageFile(null);
    setFileInputKey((prev) => prev + 1);
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const loadCategories = async (query = search) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await adminAPI.getExerciseCategories({
        search: query || undefined,
      });
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load exercise categories', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCategories(search);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData(INITIAL_FORM);
    resetImageSelection();
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      english_name: category.english_name || '',
      slug: category.slug || '',
      description: category.description || '',
      image_url: category.image_url || '',
      image_key: category.image_key || '',
      background_color: category.background_color || '#f1f5f9',
      display_order: category.display_order ?? 0,
      is_active: category.is_active ?? true,
    });
    resetImageSelection();
    updateImagePreview(category.image_url || '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData(INITIAL_FORM);
    setEditingCategory(null);
    resetImageSelection();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setSelectedImageFile(file || null);
    if (file) {
      updateImagePreview(URL.createObjectURL(file));
    } else if (editingCategory?.imageUrl) {
      updateImagePreview(editingCategory.imageUrl);
    } else {
      updateImagePreview('');
    }
    if (event?.target) {
      event.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      const appendField = (key, value) => {
        if (value === undefined || value === null || value === '') return;
        payload.append(key, value);
      };

      // Required fields
      payload.append('name', formData.name);
      
      // Optional fields - only append if they have values
      appendField('english_name', formData.english_name);
      appendField('slug', formData.slug);
      appendField('description', formData.description);
      appendField('image_url', formData.image_url);
      appendField('image_key', formData.image_key);
      appendField('background_color', formData.background_color);
      
      // Always append these
      payload.append('display_order', formData.display_order);
      payload.append('is_active', formData.is_active ? 'true' : 'false');

      if (selectedImageFile) {
        payload.append('image', selectedImageFile);
      }

      if (editingCategory) {
        await adminAPI.updateExerciseCategory(editingCategory.id, payload);
      } else {
        await adminAPI.createExerciseCategory(payload);
      }
      closeModal();
      loadCategories();
    } catch (err) {
      console.error('Save exercise category error', err);
      setError(err.response?.data?.message || 'Không thể lưu danh mục');
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Xóa danh mục "${category.name}"? Bạn sẽ không thể hoàn tác.`
    );
    if (!confirmed) return;

    try {
      await adminAPI.deleteExerciseCategory(category.id);
      loadCategories();
    } catch (err) {
      console.error('Delete exercise category error', err);
      setError(err.response?.data?.message || 'Không thể xóa danh mục');
    }
  };

  const totalCategories = useMemo(() => categories.length, [categories]);
  const englishFolderHint =
    (formData.english_name || formData.slug || formData.name || 'category').trim() || 'category';

  return (
    <div className="content-page">
      <div className="page-header">
        <div>
          <h1>Danh mục bài tập</h1>
          <p>Quản lý nhóm cơ và hình ảnh hiển thị trên app người dùng.</p>
        </div>
        <div className="action-buttons">
          <button className="btn-icon" onClick={() => loadCategories()}>
            <RefreshCw size={18} />
          </button>
          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={18} />
            Thêm danh mục
          </button>
        </div>
      </div>

      <form className="search-bar" onSubmit={handleSearchSubmit}>
        <Layers size={20} />
        <input
          type="text"
          placeholder="Tìm theo tên hoặc tiếng Anh..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-primary" type="submit">
          Tìm kiếm
        </button>
      </form>

      {error && <div className="loading">{error}</div>}

      {loading ? (
        <div className="loading">Đang tải danh mục...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên danh mục</th>
                <th>Tên tiếng Anh</th>
                <th>Slug</th>
                <th>Số bài tập</th>
                <th>Thứ tự</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    Chưa có danh mục nào
                  </td>
                </tr>
              ) : (
                categories.map((category) => {
                  const exercise_count =
                    Number(category.exercise_count ?? 0);
                  return (
                    <tr key={category.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 8,
                              background: category.background_color || '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                            }}
                          >
                            {category.image_url ? (
                              <img
                                src={category.image_url}
                                alt={category.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <Layers size={18} color="#475569" />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{category.name}</div>
                           
                          </div>
                        </div>
                      </td>
                      <td>{category.english_name || '-'}</td>
                      <td>{category.slug}</td>
                      <td>{exercise_count}</td>
                      <td>{category.display_order ?? 0}</td>
                      <td>
                        <span className={`badge ${category.is_active ? 'badge-active' : 'badge-inactive'}`}>
                          {category.is_active ? 'Hoạt động' : 'Tạm tắt'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" onClick={() => openEditModal(category)} type="button">
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => handleDelete(category)}
                            type="button"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="pagination">
            <span>Tổng cộng: {totalCategories} danh mục</span>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <h2>{editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Tên hiển thị *</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tên tiếng Anh</label>
                  <input
                    name="english_name"
                    value={formData.english_name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Slug (tự động nếu bỏ trống)</label>
                  <input
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Thứ tự hiển thị</label>
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Image Key (để map sang asset local)</label>
                  <input
                    name="image_key"
                    value={formData.image_key}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Background Color</label>
                  <input
                    type="color"
                    name="background_color"
                    value={formData.background_color}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL (ưu tiên hiển thị)</label>
                <input
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label>Ảnh danh mục (tải từ thiết bị)</label>
                <input
                  key={fileInputKey}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <small style={{ display: 'block', marginTop: '0.25rem', color: '#64748b' }}>
                  Ảnh sẽ được lưu vào thư mục <code>image/{englishFolderHint}</code> của ứng dụng người dùng.
                </small>
                {imagePreview && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      width: '100%',
                      maxWidth: '220px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Xem trước ảnh danh mục"
                      style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="is_active" style={{ marginBottom: 0 }}>
                  Hoạt động
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  {editingCategory ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseCategories;

