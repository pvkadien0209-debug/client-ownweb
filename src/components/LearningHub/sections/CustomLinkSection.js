import RoomofflineV2GetLink from "../../RoomofflineV2/RoomofflineV2GetLink";

// Ghi chú (bổ sung, không sửa logic tạo link cũ ở LearningHub_getlink.js —
// file đó vẫn còn nguyên, chỉ không còn được render ở đây): trước đây hiển
// thị 2 bảng riêng (link Roomoffline bản cũ + link RoomofflineV2), theo phản
// hồi "rút gọn lại bằng một nút... thay vì tạo 2 bảng" nên giờ chỉ còn render
// 1 component duy nhất (RoomofflineV2GetLink.js — đã gộp thêm nút chọn
// Roomoffline/RoomofflineV2 bên trong, xem comment đầu file đó).
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
      <RoomofflineV2GetLink
        id={id}
        index={currentIndex}
        lessonSetLength={dataLearning.length}
        typeSet={dataLearning[currentIndex]?.typeSets || ["A1"]}
      />
    </div>
  );
}
