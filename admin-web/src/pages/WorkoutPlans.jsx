import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Search, Trash2 } from 'lucide-react';
import './Content.css';

const WorkoutPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPlans();
  }, [page, search]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getWorkoutPlans({
        page,
        limit: 20,
        search,
        goal: '',
        difficulty: ''
      });
      setPlans(response.data.plans);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching workout plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa kế hoạch này?')) return;
    try {
      await adminAPI.deleteWorkoutPlan(id);
      fetchPlans();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="content-page">
      <div className="page-header">
        <div>
          <h1>Quản lý Kế hoạch tập</h1>
          <p>Xem và quản lý các kế hoạch tập của người dùng</p>
        </div>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm kế hoạch..."
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
                  <th>Tên</th>
                  <th>Người dùng</th>
                  <th>Mục tiêu</th>
                  <th>Độ khó</th>
                  <th>Thời gian (tuần)</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td>{plan.id}</td>
                    <td>{plan.name}</td>
                    <td>
                      {plan.user ? `${plan.user.firstName} ${plan.user.lastName}` : 'N/A'}
                    </td>
                    <td>
                      <span className="badge badge-category">{plan.goal}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${plan.difficulty}`}>
                        {plan.difficulty}
                      </span>
                    </td>
                    <td>{plan.duration}</td>
                    <td>
                      <span className={`badge ${plan.isActive ? 'badge-active' : 'badge-inactive'}`}>
                        {plan.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleDelete(plan.id)} className="btn-icon btn-danger">
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
    </div>
  );
};

export default WorkoutPlans;








