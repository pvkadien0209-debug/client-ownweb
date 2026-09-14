import React from "react";

// Màn báo lỗi dùng chung, kèm nút "Tải lại trang". Mẫu lấy nguyên từ màn lỗi
// gốc của LearningHub.js (alert-danger Bootstrap) để không đổi giao diện nơi
// đã đẹp sẵn.
//
// message: nội dung lỗi hiển thị (mặc định: thông báo lỗi chung chung)
const ErrorScreen = ({
  message = "Gặp lỗi trong quá trình xử lí dữ liệu, vui lòng thử lại.",
}) => (
  <div className="container mt-5" style={{ maxWidth: 480 }}>
    <div className="alert alert-danger text-center" role="alert">
      <i className="bi bi-exclamation-triangle-fill d-block fs-1 mb-2"></i>
      <p className="mb-3">{message}</p>
      <button
        className="btn btn-outline-danger"
        onClick={() => window.location.reload()}
      >
        <i className="bi bi-arrow-clockwise me-2"></i>Tải lại trang
      </button>
    </div>
  </div>
);

export default ErrorScreen;
