export default function PhuongPhapHocSection() {
  return (
    <div
      id="div_01_prac_phuongphaphoc"
      className="divlearnHub info-section"
      style={{
        flex: 0,
        width: "0",
        padding: "0",
        overflow: "hidden",
      }}
    >
      <h1 className="lesson-title">Phương pháp học hiệu quả</h1>
      <div className="info-card">
        <h4 className="text-primary mb-4 fw-semibold lh-base">
          Thực hành lặp lại (có ghi nhận phản hồi-sửa chửa) là con đường phải
          đi qua để đạt được kĩ năng. Hãy lấy kỉ luật và cùng thực hành chung
          làm động lực.
        </h4>
        <div className="row">
          <div className="col-md-6">
            <div className="step-guide">
              <h6 className="fw-bold">
                <i className="bi bi-bullseye me-2"></i>
                Mục tiêu tối thiểu
              </h6>
              <p className="mb-0">
                Để biết nghe nói là <strong>10.000 lượt nghe nói</strong>.
              </p>
            </div>
            <div className="step-guide">
              <h6 className="fw-bold">
                <i className="bi bi-calendar-day me-2"></i>
                Mục tiêu hàng ngày
              </h6>
              <p className="mb-0">
                Mỗi buổi thực hành ít cũng phải trên{" "}
                <strong>100 lượt nghe nói</strong>.
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="step-guide">
              <h6 className="fw-bold">
                <i className="bi bi-arrow-repeat me-2"></i>
                Ôn tập kiến thức cốt lõi
              </h6>
              <p className="mb-0">
                Mỗi buổi học đều nên nhắc lại các kiến thức về tách ghép âm.
              </p>
            </div>
            <div className="step-guide">
              <h6 className="fw-bold">
                <i className="bi bi-ear me-2"></i>
                Thực hành nghe và ghép
              </h6>
              <p className="mb-0">
                Luyện tập ghép âm và tách âm thường xuyên.
              </p>
            </div>
          </div>
        </div>
        <div className="alert alert-warning mt-2" role="alert">
          <h6 className="fw-bold">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Lưu ý quan trọng:
          </h6>
          <ul className="mb-0">
            <li>
              Giai đoạn ban đầu hãy tập trung vào nguyên âm đại diện{" "}
              <strong>UEOAI-ơ</strong> và nguyên lý ghép âm
            </li>
            <li>
              Chỉ cần vừa đủ để có thể thực hành, đừng quá học kĩ càng
            </li>
            <li>
              Nhanh chóng chuyển qua thực hành, khi thực hành tự khắc sẽ nắm
              nội dung
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
