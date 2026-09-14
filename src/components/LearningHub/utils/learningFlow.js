// Nguồn dữ liệu DUY NHẤT mô tả trình tự học của LearningHub — dùng chung cho:
// thanh tiến trình 3 giai đoạn, thanh pill điều hướng (đánh số 1→8), và nút
// "Tiếp tục" ở cuối mỗi phần. Đổi thứ tự/nhãn thì chỉ cần sửa ở đây.
//
// Lưu ý: đây CHỈ là dữ liệu hiển thị (nhãn, icon, thứ tự, giai đoạn) — không
// đổi id của bất kỳ section nào (value phải khớp đúng với id trong các file
// LearningHub/sections/*.js), nên không ảnh hưởng tới cơ chế show/hide hiện có
// (handle_div) hay bất kỳ link cũ nào trỏ thẳng tới các id này.
export const LEARNING_FLOW = [
  {
    value: "div_01_content_to_learn",
    icon: "bi-book",
    label: "Nội dung",
    phase: 1,
  },
  {
    value: "div_01_prac_luyen_am",
    icon: "bi-chat-square-text",
    label: "Nguyên tắc ghép âm",
    phase: 1,
  },
  {
    value: "div_01_content_table_to_practice",
    icon: "bi-table",
    label: "Chọn bài học",
    phase: 2,
  },
  {
    value: "div_01_prac_ghep_am",
    icon: "bi-music-note-beamed",
    label: "Ghép âm",
    phase: 2,
  },
  {
    value: "div_01_prac_hoc_thuoc",
    icon: "bi-lightbulb",
    label: "Mẫu câu",
    phase: 2,
  },
  {
    value: "div_01_prac_phuongphaphoc",
    icon: "bi-mortarboard",
    label: "Phương pháp học",
    phase: 3,
  },
  {
    value: "div_01_prac_bangnhap",
    icon: "bi-link-45deg",
    label: "Custom link",
    phase: 3,
  },
  {
    value: "div_01_prac_vaothuchanh",
    icon: "bi-play-circle",
    label: "Vào thực hành",
    phase: 3,
  },
];

// 3 giai đoạn lớn hiển thị trên thanh tiến trình đầu trang
export const PHASES = [
  { phase: 1, label: "Tìm hiểu bài", icon: "bi-journal-text" },
  { phase: 2, label: "Luyện tập", icon: "bi-music-note-beamed" },
  { phase: 3, label: "Thực hành", icon: "bi-play-circle" },
];

// Giai đoạn (1/2/3) mà một section thuộc về — dùng để tô sáng đúng ô trên
// thanh tiến trình theo section đang mở
export function getPhaseForValue(value) {
  const item = LEARNING_FLOW.find((it) => it.value === value);
  return item ? item.phase : null;
}

// Section kế tiếp trong trình tự học — dùng cho nút "Tiếp tục".
// Trả về null nếu đây đã là section cuối cùng (không có nút Tiếp tục nữa).
export function getNextItem(value) {
  const idx = LEARNING_FLOW.findIndex((it) => it.value === value);
  if (idx === -1 || idx === LEARNING_FLOW.length - 1) return null;
  return LEARNING_FLOW[idx + 1];
}
