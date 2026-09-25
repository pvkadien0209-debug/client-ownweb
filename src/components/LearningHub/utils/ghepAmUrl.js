// Dùng chung cho các nút/bảng điều hướng sang màn "Ghép âm"
// (trước đây đoạn này bị lặp lại y hệt ở 4 chỗ: 3 lần trong
// LessonTableSection và 1 lần trong MauCauSection)
//
// SỬA: trước đây id=div_01_prac_ghep_am (id của trang "Ghép âm" full-width
// CŨ). Từ khi "Ghép âm" chuyển thành POPUP, PracticeGhepAmSection.js (trang
// cũ mang id đó) không còn được render nữa => cơ chế handle_div (cũ, chạy ở
// LearningHub.js mỗi khi URL "id=" đổi) không tìm thấy div nào khớp, nên ẩn
// LUÔN TẤT CẢ .divlearnHub — kể cả "Chọn bài học" — và bị KẸT ở trạng thái ẩn
// vì đóng popup không có bước phục hồi URL. Nay giữ id trỏ về đúng section
// đang thực sự hiển thị phía sau popup (bảng chọn bài học) để handle_div chỉ
// xác nhận lại đúng section đó, không ẩn gì cả — "Chọn bài học" giữ nguyên
// dù mở hay đóng popup.
export function buildGhepAmUrl(id, currentIndex, value) {
  return `/learninghub/${id}?ls=${currentIndex}&&scrollY=${
    window.scrollY
  }&&id=div_01_content_table_to_practice&&st=${value
    .toString()
    .split(" ")
    .join("-")}`;
}
