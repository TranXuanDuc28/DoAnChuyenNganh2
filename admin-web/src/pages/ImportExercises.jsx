import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download, ExternalLink } from 'lucide-react';
import './Content.css';

const ImportExercises = () => {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [range, setRange] = useState('Sheet1');
  const [apiKey, setApiKey] = useState('');
  const [updateExisting, setUpdateExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [template, setTemplate] = useState(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const response = await adminAPI.getImportTemplate();
      setTemplate(response.data);
    } catch (error) {
      console.error('Error fetching template:', error);
    }
  };

  const handleValidate = async () => {
    if (!spreadsheetUrl.trim()) {
      alert('Vui lòng nhập URL Google Sheet');
      return;
    }

    setValidating(true);
    setValidation(null);
    setImportResults(null);

    try {
      const response = await adminAPI.validateSheet({
        spreadsheetUrl: spreadsheetUrl.trim(),
        range: range.trim() || 'Sheet1',
        apiKey: apiKey.trim() || undefined
      });

      setValidation(response.data);
    } catch (error) {
      console.error('Validation error:', error);
      setValidation({
        valid: false,
        error: error.response?.data?.message || error.message || 'Không thể kết nối đến Google Sheet'
      });
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async () => {
    if (!spreadsheetUrl.trim()) {
      alert('Vui lòng nhập URL Google Sheet');
      return;
    }

    if (!validation || !validation.valid) {
      alert('Vui lòng validate sheet trước khi import');
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn import ${validation.rowCount} bài tập?\n\n` +
      (updateExisting ? 'Các bài tập trùng tên sẽ được cập nhật.' : 'Các bài tập trùng tên sẽ bị bỏ qua.')
    );

    if (!confirmed) return;

    setLoading(true);
    setImportResults(null);

    try {
      const response = await adminAPI.importExercises({
        spreadsheetUrl: spreadsheetUrl.trim(),
        range: range.trim() || 'Sheet1',
        apiKey: apiKey.trim() || undefined,
        updateExisting
      });

      setImportResults(response.data.results);
    } catch (error) {
      console.error('Import error:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi import');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSpreadsheetUrl('');
    setRange('Sheet1');
    setValidation(null);
    setImportResults(null);
  };

  return (
    <div className="content-page">
      <div className="page-header">
        <div>
          <h1>Import bài tập từ Google Sheet</h1>
          <p>Tải lên hàng loạt bài tập từ Google Sheets</p>
        </div>
      </div>

      {/* Instructions Card */}
      <div style={{ 
        backgroundColor: '#f0f9ff', 
        border: '1px solid #bae6fd',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <AlertCircle size={20} color="#0369a1" />
          Hướng dẫn sử dụng
        </h3>
        <ol style={{ marginLeft: '20px', color: '#0c4a6e', lineHeight: '1.8' }}>
          <li>Tạo Google Sheet với định dạng theo template bên dưới</li>
          <li>Đảm bảo sheet được chia sẻ công khai (Anyone with the link can view)</li>
          <li>Copy URL của Google Sheet và paste vào form</li>
          <li>Nhập Google Sheets API key (hoặc để trống nếu đã cấu hình trong .env)</li>
          <li>Click "Validate" để kiểm tra định dạng</li>
          <li>Click "Import" để bắt đầu import dữ liệu</li>
        </ol>
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fff', borderRadius: '8px' }}>
          <strong>Lấy Google Sheets API Key:</strong>
          <ol style={{ marginLeft: '20px', marginTop: '8px', lineHeight: '1.6' }}>
            <li>Truy cập <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#0369a1' }}>Google Cloud Console</a></li>
            <li>Tạo project mới hoặc chọn project có sẵn</li>
            <li>Enable Google Sheets API</li>
            <li>Tạo credentials → API Key</li>
            <li>Copy API key và paste vào form hoặc thêm vào file .env</li>
          </ol>
        </div>
      </div>

      {/* Import Form */}
      <div style={{ 
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{ marginBottom: '20px' }}>Thông tin Google Sheet</h3>
        
        <div className="form-group">
          <label>URL Google Sheet *</label>
          <input
            type="text"
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={spreadsheetUrl}
            onChange={(e) => setSpreadsheetUrl(e.target.value)}
            disabled={loading || validating}
          />
          <small style={{ display: 'block', marginTop: '4px', color: '#64748b' }}>
            Paste URL đầy đủ của Google Sheet
          </small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tên sheet / Range</label>
            <input
              type="text"
              placeholder="Sheet1 hoặc Sheet1!A1:Z100"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              disabled={loading || validating}
            />
            <small style={{ display: 'block', marginTop: '4px', color: '#64748b' }}>
              Mặc định: Sheet1
            </small>
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <label style={{ marginBottom: 0 }}>Google Sheets API Key</label>
            <button
              type="button"
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showApiKeyInput ? 'Ẩn' : 'Hiện'}
            </button>
          </div>
          {showApiKeyInput && (
            <>
              <input
                type="password"
                placeholder="AIza..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={loading || validating}
              />
              <small style={{ display: 'block', marginTop: '4px', color: '#64748b' }}>
                Để trống nếu đã cấu hình GOOGLE_SHEETS_API_KEY trong .env
              </small>
            </>
          )}
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="updateExisting"
            checked={updateExisting}
            onChange={(e) => setUpdateExisting(e.target.checked)}
            disabled={loading || validating}
            style={{ width: 'auto' }}
          />
          <label htmlFor="updateExisting" style={{ marginBottom: 0 }}>
            Cập nhật bài tập đã tồn tại (nếu trùng tên)
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            className="btn-primary"
            onClick={handleValidate}
            disabled={loading || validating || !spreadsheetUrl.trim()}
          >
            <FileSpreadsheet size={18} />
            {validating ? 'Đang kiểm tra...' : 'Validate Sheet'}
          </button>

          <button
            className="btn-primary"
            onClick={handleImport}
            disabled={loading || validating || !validation?.valid}
            style={{
              backgroundColor: validation?.valid ? '#10b981' : '#94a3b8',
              opacity: validation?.valid ? 1 : 0.6
            }}
          >
            <Upload size={18} />
            {loading ? 'Đang import...' : 'Import Exercises'}
          </button>

          <button
            className="btn-secondary"
            onClick={handleReset}
            disabled={loading || validating}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Validation Results */}
      {validation && (
        <div style={{ 
          backgroundColor: validation.valid ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${validation.valid ? '#bbf7d0' : '#fecaca'}`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '12px',
            color: validation.valid ? '#166534' : '#991b1b'
          }}>
            {validation.valid ? <CheckCircle size={20} /> : <XCircle size={20} />}
            {validation.valid ? 'Sheet hợp lệ' : 'Sheet không hợp lệ'}
          </h3>
          
          {validation.valid ? (
            <div style={{ color: '#166534' }}>
              <p><strong>Số dòng dữ liệu:</strong> {validation.rowCount}</p>
              <p><strong>Các cột tìm thấy:</strong></p>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '6px', 
                marginTop: '8px' 
              }}>
                {validation.headers?.map((header, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    {header}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: '#991b1b' }}>
              <strong>Lỗi:</strong> {validation.error}
            </p>
          )}
        </div>
      )}

      {/* Import Results */}
      {importResults && (
        <div style={{ 
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ marginBottom: '16px' }}>Kết quả Import</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              padding: '16px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0369a1' }}>
                {importResults.total}
              </div>
              <div style={{ fontSize: '14px', color: '#0c4a6e', marginTop: '4px' }}>
                Tổng số
              </div>
            </div>

            <div style={{ 
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a' }}>
                {importResults.created}
              </div>
              <div style={{ fontSize: '14px', color: '#166534', marginTop: '4px' }}>
                Tạo mới
              </div>
            </div>

            <div style={{ 
              padding: '16px',
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#d97706' }}>
                {importResults.updated}
              </div>
              <div style={{ fontSize: '14px', color: '#92400e', marginTop: '4px' }}>
                Cập nhật
              </div>
            </div>

            <div style={{ 
              padding: '16px',
              backgroundColor: '#fef2f2',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626' }}>
                {importResults.failed}
              </div>
              <div style={{ fontSize: '14px', color: '#991b1b', marginTop: '4px' }}>
                Thất bại
              </div>
            </div>
          </div>

          {importResults.errors && importResults.errors.length > 0 && (
            <div>
              <h4 style={{ marginBottom: '12px', color: '#dc2626' }}>
                Chi tiết lỗi ({importResults.errors.length})
              </h4>
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                padding: '12px'
              }}>
                {importResults.errors.map((error, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: '8px',
                      marginBottom: '8px',
                      backgroundColor: '#fff',
                      borderRadius: '6px',
                      borderLeft: '3px solid #dc2626'
                    }}
                  >
                    <strong style={{ color: '#991b1b' }}>{error.name}</strong>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                      {error.error}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Template Info */}
      {template && (
        <div style={{ 
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Download size={20} />
            Template & Định dạng
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '8px', color: '#0f172a' }}>Cột bắt buộc:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {template.requiredColumns.map((col, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '8px', color: '#0f172a' }}>Cột tùy chọn:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {template.optionalColumns.map((col, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    borderRadius: '6px',
                    fontSize: '13px'
                  }}
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '8px', color: '#0f172a' }}>Ví dụ dữ liệu:</h4>
            <div style={{ 
              overflowX: 'auto',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <table style={{ 
                width: '100%', 
                fontSize: '12px',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#e2e8f0' }}>
                    {Object.keys(template.example[0]).map((key, idx) => (
                      <th key={idx} style={{ 
                        padding: '8px', 
                        textAlign: 'left',
                        borderBottom: '2px solid #cbd5e1',
                        whiteSpace: 'nowrap'
                      }}>
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {template.example.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((value, vidx) => (
                        <td key={vidx} style={{ 
                          padding: '8px',
                          borderBottom: '1px solid #e2e8f0',
                          whiteSpace: 'nowrap'
                        }}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: '8px', color: '#0f172a' }}>Lưu ý:</h4>
            <ul style={{ marginLeft: '20px', lineHeight: '1.8', color: '#475569' }}>
              {template.notes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExercises;

