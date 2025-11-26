import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import './Content.css';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'strength',
    difficulty: 'beginner',
    duration: 30,
    exercises: [],
    estimatedCalories: 0,
    imageUrl: ''
  });

  useEffect(() => {
    fetchWorkouts();
  }, [page, search]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getWorkouts({
        page,
        limit: 20,
        search,
        category: '',
        difficulty: ''
      });
      setWorkouts(response.data.workouts);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingWorkout(null);
    setImageFile(null);
    setImagePreview('');
    setFormData({
      name: '',
      description: '',
      category: 'strength',
      difficulty: 'beginner',
      duration: 30,
      exercises: [],
      estimatedCalories: 0,
      imageUrl: ''
    });
    setShowModal(true);
  };

  const handleEdit = (workout) => {
    setEditingWorkout(workout);
    setImageFile(null);
    setImagePreview(workout.imageUrl || '');
    setFormData({
      name: workout.name || '',
      description: workout.description || '',
      category: workout.category || 'strength',
      difficulty: workout.difficulty || 'beginner',
      duration: workout.duration || 30,
      exercises: Array.isArray(workout.exercises) ? workout.exercises : [],
      estimatedCalories: workout.estimatedCalories || 0,
      imageUrl: workout.imageUrl || ''
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

      if (editingWorkout) {
        await adminAPI.updateWorkout(editingWorkout.id, submitFormData);
      } else {
        await adminAPI.createWorkout(submitFormData);
      }
      setShowModal(false);
      fetchWorkouts();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa workout này?')) return;
    try {
      await adminAPI.deleteWorkout(id);
      fetchWorkouts();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="content-page">
      <div className="page-header">
        <div>
          <h1>Quản lý Workouts</h1>
          <p>Quản lý tất cả workouts trong hệ thống</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <Plus size={20} />
          Thêm Workout
        </button>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm workout..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
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
                  <th>Độ khó</th>
                  <th>Thời gian (phút)</th>
                  <th>Calories</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {workouts.map((workout) => (
                  <tr key={workout.id}>
                    <td>{workout.id}</td>
                    <td>
                      {workout.imageUrl ? (
                        <img 
                          src={workout.imageUrl} 
                          alt={workout.name}
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
                    <td>{workout.name}</td>
                    <td>
                      <span className="badge badge-category">{workout.category}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${workout.difficulty}`}>
                        {workout.difficulty}
                      </span>
                    </td>
                    <td>{workout.duration}</td>
                    <td>{workout.estimatedCalories || 0}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(workout)} className="btn-icon">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(workout.id)} className="btn-icon btn-danger">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
            <h2>{editingWorkout ? 'Chỉnh sửa Workout' : 'Thêm Workout mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên Workout *</label>
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
                    <option value="hiit">HIIT</option>
                    <option value="yoga">Yoga</option>
                    <option value="pilates">Pilates</option>
                    <option value="crossfit">Crossfit</option>
                    <option value="custom">Custom</option>
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
              <div className="form-row">
                <div className="form-group">
                  <label>Thời gian (phút) *</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Calories ước tính</label>
                  <input
                    type="number"
                    value={formData.estimatedCalories}
                    onChange={(e) => setFormData({ ...formData, estimatedCalories: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Hình ảnh workout</label>
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
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  {editingWorkout ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workouts;




