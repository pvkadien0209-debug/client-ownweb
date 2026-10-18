import RoomofflineGetLink from "../../RoomofflineGetLink";

// Cập nhật (dọn dẹp — đã xóa toàn bộ RoomofflineV2-V6, chỉ giữ Roomoffline
// bản gốc): trước đây render RoomofflineV2GetLink.js (có nút chọn
// Roomoffline/RoomofflineV2), file đó đã bị xóa cùng thư mục RoomofflineV2/.
// Thay bằng RoomofflineGetLink.js (file mới, cùng chỗ với LearningHub_getlink.js
// — file gốc vẫn còn nguyên, không bị đổi), chỉ tạo link cho Roomoffline,
// không còn nút chọn targetMode vì RoomofflineV2 không còn tồn tại.
export default function CustomLinkSection({ id, currentIndex, dataLearning }) {
  return (
    <div
      id="div_01_prac_bangnhap"
      className="divlearnHub info-section"
      style={{
        flex: 0,
        width: "0",
        padding: "0",
        overflow: "hidden",
      }}
    >
      <RoomofflineGetLink
        id={id}
        index={currentIndex}
        lessonSetLength={dataLearning.length}
        typeSet={dataLearning[currentIndex]?.typeSets || ["A1"]}
      />
    </div>
  );
}
