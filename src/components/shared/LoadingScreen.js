import React from "react";

// Màn "đang tải" dùng chung cho các trang cần chờ dữ liệu (thay cho việc mỗi
// trang tự vẽ một kiểu loading khác nhau). Mẫu lấy nguyên từ màn loading gốc
// của LearningHub.js (spinner Bootstrap) để không đổi giao diện nơi đã đẹp sẵn.
//
// message: chữ hiển thị dưới spinner (mặc định: "Đang tải dữ liệu…")
// fullHeight: true = chiếm hết chiều cao màn hình (vh-100, dùng khi đây là
//   toàn bộ nội dung trang); false = chỉ chiếm khoảng trống vừa đủ (py-5,
//   dùng khi lồng bên trong một khối nội dung khác)
const LoadingScreen = ({ message = "Đang tải dữ liệu…", fullHeight = true }) => (
  <div
    className={`d-flex justify-content-center align-items-center ${
      fullHeight ? "vh-100" : "py-5"
    }`}
  >
    <div className="text-center">
      <div
        className="spinner-border mb-3"
        role="status"
        style={{ width: "3rem", height: "3rem", color: "var(--brand-primary, #4f46e5)" }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <h5 className="text-muted fw-normal">{message}</h5>
    </div>
  </div>
);

export default LoadingScreen;
