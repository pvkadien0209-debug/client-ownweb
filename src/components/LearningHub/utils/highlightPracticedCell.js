import { useEffect } from "react";

// Tô màu TẤT CẢ ô "đã luyện tập" trong bảng câu của BÀI HỌC ĐANG MỞ (TableHD -
// B101_FINAL_TABLE-HD.js, file cũ dùng chung cho nhiều nơi, KHÔNG được sửa)
// — theo yêu cầu "lưu cả lịch sử các câu đã ghép trước đó" (mục tiêu: làm
// xong chụp hình lại, chứng minh đã làm bài tập) + "chỉ 2 màu: đọc đúng +
// sắp xếp đúng" (không tính "ghép đúng").
//
// Đã kiểm tra trực tiếp code TableHD: từng <td> không có id/data-attribute
// nào gắn theo giá trị câu, nên không thể target bằng CSS selector thông
// thường. Giải pháp: gắn 1 ref bọc ngoài toàn bộ bảng (ở LessonTableSection/
// MauCauSection — 2 file MỚI, được phép sửa); mỗi khi tiến trình của BÀI HỌC
// ĐANG MỞ đổi thì quét lại TOÀN BỘ <td>, so khớp textContent với map tiến
// trình (progressMap — CHỈ của bài học đang mở, xem LearningHub.js) rồi
// áp/xoá border màu trực tiếp lên DOM node — không đụng vào
// B101_FINAL_TABLE-HD.js.
//
// LUÔN xoá style cũ trước khi áp lại (kể cả ô KHÔNG khớp) để không bị dính
// màu cũ khi mở sang bài học khác hoặc khi nội dung bảng đổi.
export const READ_CORRECT_COLOR = "#0d6efd"; // đọc đúng — viền trái xanh dương
export const ARRANGE_CORRECT_COLOR = "#fd7e14"; // sắp xếp đúng — viền phải cam

export function useHighlightPracticedCells(wrapRef, progressMap, extraDep) {
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const cells = wrap.querySelectorAll("td");
    cells.forEach((td) => {
      const key = td.textContent.trim();
      const entry = key && progressMap ? progressMap[key] : null;
      td.style.borderLeft = entry?.readCorrect
        ? `4px solid ${READ_CORRECT_COLOR}`
        : "";
      td.style.borderRight = entry?.arrangeCorrect
        ? `4px solid ${ARRANGE_CORRECT_COLOR}`
        : "";
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressMap, extraDep]);
}
