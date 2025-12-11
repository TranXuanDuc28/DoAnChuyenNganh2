import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import './Content.css';

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [exerciseCategories, setExerciseCategories] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(''); // New filter state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'strength',
    difficulty: 'beginner',
    categoryIds: [], // Changed from exerciseCategoryId to categoryIds array
    videoUrl: '',
    imageUrl: '',
    equipment: [],
    instructions: [],
    tips: [],
    sets: 3,
    reps: 10,
    duration: 0,
    restTime: 60,
    caloriesPerMinute: 5
  });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    fetchExercises();
    fetchExerciseCategories();
  }, [page, search, selectedCategoryFilter]); // Added selectedCategoryFilter dependency

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showCategoryDropdown && !e.target.closest('.category-dropdown-container')) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategoryDropdown]);

  const fetchExerciseCategories = async () => {
    try {
      const response = await adminAPI.getExerciseCategories();
      setExerciseCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching exercise categories:', error);
    }
  };

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getExercises({
        page,
        limit: 20,
        search,
        category: '',
        difficulty: '',
        categoryId: selectedCategoryFilter || undefined // Add category filter
      });
      setExercises(response.data.exercises);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingExercise(null);
    setImageFile(null);
    setVideoFile(null);
    setImagePreview('');
    setFormData({
      name: '',
      description: '',
      category: 'strength',
      difficulty: 'beginner',
      categoryIds: [],
      videoUrl: '',
      imageUrl: '',
      equipment: [],
      instructions: [],
      tips: [],
      sets: 3,
      reps: 10,
      duration: 0,
      restTime: 60,
      caloriesPerMinute: 5
    });
    setShowModal(true);
  };

  const handleEdit = (exercise) => {
    setEditingExercise(exercise);
    setImageFile(null);
    setVideoFile(null);
    setImagePreview(exercise.imageUrl || '');

    // Extract category IDs from the categories array
    const categoryIds = exercise.categories && Array.isArray(exercise.categories)
      ? exercise.categories.map(cat => cat.id)
      : [];

    setFormData({
      name: exercise.name || '',
      description: exercise.description || '',
      category: exercise.category || 'strength',
      difficulty: exercise.difficulty || 'beginner',
      categoryIds: categoryIds,
      videoUrl: exercise.videoUrl || '',
      imageUrl: exercise.imageUrl || '',
      equipment: Array.isArray(exercise.equipment) ? exercise.equipment : [],
      instructions: Array.isArray(exercise.instructions) ? exercise.instructions : [],
      tips: Array.isArray(exercise.tips) ? exercise.tips : [],
      sets: exercise.sets || 3,
      reps: exercise.reps || 10,
      duration: exercise.duration || 0,
      restTime: exercise.restTime || 60,
      caloriesPerMinute: exercise.caloriesPerMinute || 5
    });
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitFormData = new FormData();

      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          submitFormData.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== null && formData[key] !== undefined) {
          submitFormData.append(key, formData[key]);
        }
      });

      // Add image file if selected
      if (imageFile) {
        submitFormData.append('image', imageFile);
      }

      // Add video file if selected
      if (videoFile) {
        submitFormData.append('videoUrl', videoFile);
      }

      if (editingExercise) {
        await adminAPI.updateExercise(editingExercise.id, submitFormData);
      } else {
        await adminAPI.createExercise(submitFormData);
      }
      setShowModal(false);
      fetchExercises();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài tập này?')) return;
    try {
      await adminAPI.deleteExercise(id);
      fetchExercises();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="content-page">
      <div className="page-header">
        <div>
          <h1>Quản lý bài tập</h1>
          <p>Quản lý tất cả bài tập trong hệ thống</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <Plus size={20} />
          Thêm bài tập
        </button>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm bài tập..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={selectedCategoryFilter}
          onChange={(e) => {
            setSelectedCategoryFilter(e.target.value);
            setPage(1);
          }}
          style={{
            marginLeft: '12px',
            padding: '10px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#1e293b',
            minWidth: '200px'
          }}
        >
          <option value="">Tất cả nhóm cơ</option>
          {exerciseCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} {cat.english_name ? `(${cat.english_name})` : ''}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ảnh</th>
                  <th>Tên</th>
                  <th>Danh mục</th>
                  <th>Nhóm cơ chính</th>
                  <th>Độ khó</th>
                  <th>Sets/Reps</th>
                  <th>Video</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map((exercise) => {
                  const categories = exercise.categories || [];
                  return (
                    <tr key={exercise.id}>
                      <td>{exercise.id}</td>
                      <td>
                        {exercise.imageUrl ? (
                          <img
                            src={exercise.imageUrl}
                            alt={exercise.name}
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '50px',
                            height: '50px',
                            background: '#f1f5f9',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8'
                          }}>
                            No img
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{exercise.name}</div>
                        {exercise.description && (
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                            {exercise.description.length > 50
                              ? exercise.description.substring(0, 50) + '...'
                              : exercise.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-category">{exercise.category}</span>
                      </td>
                      <td>
                        {categories.length > 0 ? (
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '500' }}>
                              {categories.map(cat => cat.name).join(', ')}
                            </div>
                            {categories.length > 2 && (
                              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                +{categories.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${exercise.difficulty}`}>
                          {exercise.difficulty}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px' }}>
                          {exercise.sets && exercise.reps
                            ? `${exercise.sets} × ${exercise.reps}`
                            : exercise.duration
                              ? `${exercise.duration}s`
                              : '-'}
                        </div>
                      </td>
                      <td>{exercise.videoUrl ? '✓' : '✗'}</td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleEdit(exercise)} className="btn-icon">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(exercise.id)} className="btn-icon btn-danger">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                Trước
              </button>
              <span>Trang {page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>{editingExercise ? 'Chỉnh sửa bài tập' : 'Thêm bài tập mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên bài tập *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Danh mục *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="cardio">Cardio</option>
                    <option value="strength">Strength</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="balance">Balance</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Độ khó *</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Nhóm cơ chính (có thể chọn nhiều)</label>
                <div className="category-dropdown-container" style={{ position: 'relative' }}>
                  <div
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: '#fff',
                      minHeight: '42px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      {formData.categoryIds.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {formData.categoryIds.map(id => {
                            const cat = exerciseCategories.find(c => c.id === id);
                            return cat ? (
                              <span
                                key={id}
                                style={{
                                  padding: '2px 8px',
                                  backgroundColor: '#e0f2fe',
                                  color: '#0369a1',
                                  borderRadius: '4px',
                                  fontSize: '13px',
                                  fontWeight: '500'
                                }}
                              >
                                {cat.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-- Chọn nhóm cơ --</span>
                      )}
                    </div>
                    <span style={{ marginLeft: '8px', color: '#64748b' }}>▼</span>
                  </div>

                  {showCategoryDropdown && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '4px',
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        maxHeight: '250px',
                        overflowY: 'auto',
                        zIndex: 1000
                      }}
                    >
                      {exerciseCategories.map((cat) => {
                        const isSelected = formData.categoryIds.includes(cat.id);
                        return (
                          <label
                            key={cat.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '10px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f1f5f9',
                              backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
                              transition: 'background-color 0.15s'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const newCategoryIds = e.target.checked
                                  ? [...formData.categoryIds, cat.id]
                                  : formData.categoryIds.filter(id => id !== cat.id);
                                setFormData({ ...formData, categoryIds: newCategoryIds });
                              }}
                              style={{
                                marginRight: '10px',
                                width: '16px',
                                height: '16px',
                                cursor: 'pointer'
                              }}
                            />
                            <span style={{ fontSize: '14px', color: '#1e293b' }}>
                              {cat.name} {cat.english_name ? `(${cat.english_name})` : ''}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
                <small style={{ display: 'block', marginTop: '4px', color: '#64748b' }}>
                  Chọn một hoặc nhiều nhóm cơ chính (VD: Ngực, Lưng, Chân...)
                </small>
              </div>



              <div className="form-group">
                <label>Thiết bị cần thiết</label>
                <input
                  type="text"
                  placeholder="VD: Tạ đơn, Ghế tập, Thanh xà (phân cách bằng dấu phẩy)"
                  value={formData.equipment.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    equipment: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số sets</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sets}
                    onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Số reps</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.reps}
                    onChange={(e) => setFormData({ ...formData, reps: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Thời gian (giây)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Thời gian nghỉ (giây)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.restTime}
                    onChange={(e) => setFormData({ ...formData, restTime: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Calories/phút</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.caloriesPerMinute}
                    onChange={(e) => setFormData({ ...formData, caloriesPerMinute: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Hướng dẫn thực hiện</label>
                <textarea
                  rows="4"
                  placeholder="Mỗi bước một dòng"
                  value={formData.instructions.join('\n')}
                  onChange={(e) => setFormData({
                    ...formData,
                    instructions: e.target.value.split('\n').filter(s => s.trim())
                  })}
                />
                <small style={{ display: 'block', marginTop: '4px', color: '#64748b' }}>
                  Nhập mỗi bước hướng dẫn trên một dòng
                </small>
              </div>

              <div className="form-group">
                <label>Tips & Lưu ý</label>
                <textarea
                  rows="3"
                  placeholder="Mỗi tip một dòng"
                  value={formData.tips.join('\n')}
                  onChange={(e) => setFormData({
                    ...formData,
                    tips: e.target.value.split('\n').filter(s => s.trim())
                  })}
                />
                <small style={{ display: 'block', marginTop: '4px', color: '#64748b' }}>
                  Nhập mỗi tip trên một dòng
                </small>
              </div>
              <div className="form-group">
                <label>Hình ảnh bài tập</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div style={{ marginTop: '10px' }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: '200px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Video bài tập</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                />
                {videoFile && (
                  <p style={{ marginTop: '5px', color: '#10b981' }}>
                    ✓ Video đã chọn: {videoFile.name}
                  </p>
                )}
                {!videoFile && formData.videoUrl && (
                  <p style={{ marginTop: '5px', color: '#64748b' }}>
                    Video hiện tại: {formData.videoUrl}
                  </p>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  {editingExercise ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exercises;

