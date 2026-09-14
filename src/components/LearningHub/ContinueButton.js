import { getNextItem } from "./utils/learningFlow";

// Nút "Tiếp tục" hiển thị ở cuối phần đang mở, dẫn thẳng sang phần kế tiếp
// theo đúng trình tự học (xem learningFlow.js). Không thay thế thanh pill —
// người học vẫn có thể bấm pill để nhảy tự do tới bất kỳ phần nào.
//
// currentValue: id của section đang mở (chính là "id" trên URL)
// Không render gì nếu đây đã là phần cuối cùng trong trình tự.
export default function ContinueButton({ currentValue, id, currentIndex, navigate }) {
  const nextItem = getNextItem(currentValue);
  if (!nextItem) return null;

  return (
    <div className="d-flex justify-content-end lh-continue-wrap">
      <button
        type="button"
        className="btn btn-modern btn-gradient-primary lh-continue-btn"
        onClick={() => {
          navigate(`/learninghub/${id}?ls=${currentIndex}&&id=${nextItem.value}`);
        }}
      >
        Tiếp tục: {nextItem.label}
        <i className="bi bi-arrow-right ms-2"></i>
      </button>
    </div>
  );
}
