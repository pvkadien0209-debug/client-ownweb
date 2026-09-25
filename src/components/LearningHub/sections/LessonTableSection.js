import { useRef } from "react";
import TableHD from "../../pracPages/B101_FINAL_TABLE-HD";
import { rShowLessonTABLE } from "../utils/lessonTable";
import { buildGhepAmUrl } from "../utils/ghepAmUrl";
import { useHighlightPracticedCells } from "../utils/highlightPracticedCell";

export default function LessonTableSection({
  dataLearning,
  currentIndex,
  setCurrentIndex,
  navigate,
  id,
  onOpenGhepAm,
  progressMap,
}) {
  // Tô màu TOÀN BỘ lịch sử các câu đã luyện của bài học đang mở (đọc đúng /
  // sắp xếp đúng) — xem utils/highlightPracticedCell.js để biết lý do phải
  // dùng ref + DOM thay vì sửa TableHD (file cũ, dùng chung, không được sửa).
  // `progressMap` chỉ chứa dữ liệu của ĐÚNG bài học đang mở (lọc theo
  // currentIndex ở LearningHub.js) nên tự động không dính màu bài trước.
  const wrapRef = useRef(null);
  useHighlightPracticedCells(wrapRef, progressMap, currentIndex);

  // Bấm vào 1 ô: vẫn cập nhật URL "st=" như cũ (giữ cho Gửi link/Copy link
  // trong popup Ghép âm hoạt động đúng), NHƯNG thay vì điều hướng sang trang
  // Ghép âm full-width, giờ MỞ POPUP (PracticeGhepAmModal.js) ngay tại chỗ —
  // theo yêu cầu "trang Ghép âm điều chỉnh thành popup 85x85". `tableLabel`
  // chỉ để popup hiển thị đang mở từ bảng nào (H0/HD/TV).
  const openGhepAm = (value, tableLabel) => {
    try {
      navigate(buildGhepAmUrl(id, currentIndex, value));
    } catch (error) {}
    try {
      if (typeof onOpenGhepAm === "function") onOpenGhepAm(tableLabel);
    } catch (error) {}
  };
  return (
    <div
      id="div_01_content_table_to_practice"
      className="divlearnHub"
      ref={wrapRef}
      style={{
        flex: 8,
        padding: "1.5rem",
      }}
    >
      {rShowLessonTABLE(dataLearning, currentIndex, setCurrentIndex, navigate, id)}
      <TableHD
        data={dataLearning[currentIndex]?.HDTB?.H0}
        data_TB={[]}
        HINT={"HINT"}
        fnOnclick={(e) => openGhepAm(e, "H0")}
      />
      <TableHD
        data={dataLearning[currentIndex]?.HDTB?.HD}
        data_TB={[]}
        HINT={"HINT"}
        fnOnclick={(e) => openGhepAm(e, "HD")}
      />
      <TableHD
        data={dataLearning[currentIndex]?.HDTB?.TV}
        data_TB={[]}
        HINT={"HINT"}
        fnOnclick={(e) => openGhepAm(e, "TV")}
      />
    </div>
  );
}
