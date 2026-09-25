import { useRef } from "react";
import TableHD from "../../pracPages/B101_FINAL_TABLE-HD";
import { buildGhepAmUrl } from "../utils/ghepAmUrl";
import { useHighlightPracticedCells } from "../utils/highlightPracticedCell";

export default function MauCauSection({
  dataLearning,
  currentIndex,
  navigate,
  id,
  onOpenGhepAm,
  progressMap,
}) {
  // Tô màu TOÀN BỘ lịch sử các câu đã luyện của bài học đang mở — cùng kỹ
  // thuật với LessonTableSection.js (xem utils/highlightPracticedCell.js).
  const wrapRef = useRef(null);
  useHighlightPracticedCells(wrapRef, progressMap, currentIndex);

  // Cùng cơ chế với LessonTableSection.js: giữ URL "st=" như cũ, nhưng mở
  // popup Ghép âm (PracticeGhepAmModal.js) thay vì điều hướng trang.
  const openGhepAm = (value) => {
    try {
      navigate(buildGhepAmUrl(id, currentIndex, value));
    } catch (error) {}
    try {
      if (typeof onOpenGhepAm === "function") {
        onOpenGhepAm("MC");
      }
    } catch (error) {}
  };
  return (
    <div
      id="div_01_prac_hoc_thuoc"
      className="divlearnHub info-section"
      ref={wrapRef}
      style={{
        flex: 0,
        width: "0",
        padding: "0",
        overflow: "hidden",
      }}
    >
      <div className="text-center">
        <h1 className="lesson-title">Rèn luyện kỹ năng đặt câu!</h1>
        <TableHD
          data={dataLearning[currentIndex]?.HDTB?.MC}
          data_TB={[]}
          HINT={"HINT"}
          fnOnclick={(e) => openGhepAm(e)}
        />
      </div>
    </div>
  );
}
