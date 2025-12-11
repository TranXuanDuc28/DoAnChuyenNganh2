import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PoseExercises.css';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const PoseExercises = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingExercise, setEditingExercise] = useState(null);
    const [formData, setFormData] = useState({
        exercise_id: '',
        name: '',
        description: '',
        icon: '',
        color: '#007bff',
        gradient_start: '#007bff',
        gradient_end: '#28a745',
        mode: 'image',
        is_active: true,
        display_order: 0
    });

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('admin_token');
            const response = await axios.get(`${API_BASE_URL}/admin/pose-exercises/exercises`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExercises(response.data.exercises || []);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            alert('Không thể tải danh sách bài tập');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editingExercise) {
                await axios.put(
                    `${API_BASE_URL}/admin/pose-exercises/exercises/${editingExercise.id}`,
                    formData,
                    config
                );
                alert('Cập nhật bài tập thành công!');
            } else {
                await axios.post(`${API_BASE_URL}/admin/pose-exercises/exercises`, formData, config);
                alert('Tạo bài tập mới thành công!');
            }

            setShowModal(false);
            resetForm();
            fetchExercises();
        } catch (error) {
            console.error('Error saving exercise:', error);
            alert(error.response?.data?.message || 'Lỗi khi lưu bài tập');
        }
    };

    const handleEdit = (exercise) => {
        setEditingExercise(exercise);
        setFormData({
            exercise_id: exercise.exercise_id,
            name: exercise.name,
            description: exercise.description || '',
            icon: exercise.icon || '',
            color: exercise.color || '#007bff',
            gradient_start: exercise.gradient_start || '#007bff',
            gradient_end: exercise.gradient_end || '#28a745',
            mode: exercise.mode,
            is_active: exercise.is_active,
            display_order: exercise.display_order || 0
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bài tập này?')) return;

        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`${API_BASE_URL}/admin/pose-exercises/exercises/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Xóa bài tập thành công!');
            fetchExercises();
        } catch (error) {
            console.error('Error deleting exercise:', error);
            alert('Lỗi khi xóa bài tập');
        }
    };

    const resetForm = () => {
        setEditingExercise(null);
        setFormData({
            exercise_id: '',
            name: '',
            description: '',
            icon: '',
            color: '#007bff',
            gradient_start: '#007bff',
            gradient_end: '#28a745',
            mode: 'image',
            is_active: true,
            display_order: 0
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (loading) {
        return <div className="content-container"><p>Đang tải...</p></div>;
    }

    return (
        <div className="content-container">
            <div className="content-header">
                <h1>Quản lý Bài tập AI Pose</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    + Thêm bài tập mới
                </button>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Icon</th>
                            <th>ID</th>
                            <th>Tên</th>
                            <th>Mô tả</th>
                            <th>Loại</th>
                            <th>Trạng thái</th>
                            <th>Thứ tự</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exercises.map((exercise) => (
                            <tr key={exercise.id}>
                                <td style={{ fontSize: '32px', textAlign: 'center' }}>
                                    {exercise.icon}
                                </td>
                                <td><code>{exercise.exercise_id}</code></td>
                                <td><strong>{exercise.name}</strong></td>
                                <td>{exercise.description?.substring(0, 50)}...</td>
                                <td>
                                    <span className={`badge badge-${exercise.mode === 'system' ? 'info' : exercise.mode === 'image' ? 'warning' : 'primary'}`}>
                                        {exercise.mode}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${exercise.is_active ? 'badge-success' : 'badge-secondary'}`}>
                                        {exercise.is_active ? 'Hoạt động' : 'Tắt'}
                                    </span>
                                </td>
                                <td>{exercise.display_order}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-info"
                                        onClick={() => handleEdit(exercise)}
                                        style={{ marginRight: '8px' }}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(exercise.id)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingExercise ? 'Chỉnh sửa bài tập' : 'Thêm bài tập mới'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Exercise ID *</label>
                                <input
                                    type="text"
                                    name="exercise_id"
                                    value={formData.exercise_id}
                                    onChange={handleInputChange}
                                    required
                                    disabled={!!editingExercise}
                                    placeholder="e.g., Tree_Pose, push-ups"
                                />
                                <small>Unique identifier (không thể thay đổi sau khi tạo)</small>
                            </div>

                            <div className="form-group">
                                <label>Tên bài tập *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Tree Pose, Push Ups"
                                />
                            </div>

                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Mô tả chi tiết về bài tập..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Icon (Emoji)</label>
                                    <input
                                        type="text"
                                        name="icon"
                                        value={formData.icon}
                                        onChange={handleInputChange}
                                        placeholder="🌳"
                                        maxLength="10"
                                    />
                                    <small>Nhập emoji hoặc icon</small>
                                </div>

                                <div className="form-group">
                                    <label>Loại *</label>
                                    <select
                                        name="mode"
                                        value={formData.mode}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="system">System (Chức năng hệ thống)</option>
                                        <option value="image">Image (Yoga - Ảnh tĩnh)</option>
                                        <option value="video">Video (Bài tập động)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Màu chính</label>
                                    <input
                                        type="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Gradient Start</label>
                                    <input
                                        type="color"
                                        name="gradient_start"
                                        value={formData.gradient_start}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Gradient End</label>
                                    <input
                                        type="color"
                                        name="gradient_end"
                                        value={formData.gradient_end}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Thứ tự hiển thị</label>
                                    <input
                                        type="number"
                                        name="display_order"
                                        value={formData.display_order}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                    <small>Số nhỏ hơn sẽ hiển thị trước</small>
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleInputChange}
                                        />
                                        Kích hoạt (hiển thị trong app)
                                    </label>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary">
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

export default PoseExercises;
