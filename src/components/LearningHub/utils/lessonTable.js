import { convertToRoman } from "./renderHelpers";

export function renderContentOftable(
  dataLearning,
  currentIndex,
  setCurrentIndex,
  navigate,
  id,
) {
  try {
    if (!dataLearning) return null;
    return (
      <select
        value={currentIndex}
        onChange={(e) => {
          navigate(`/learninghub/${id}?ls=${e.target.value}`);
        }}
        className="lesson-select w-100"
        aria-label="Chọn bài học"
      >
        {dataLearning.map((item, index) => (
          <option key={index} value={index}>
            {index + 1}. {item.SEO.seo.metaTitle}
          </option>
        ))}
      </select>
    );
  } catch (error) {
    return null;
  }
}

export function rShowLessonTABLE(
  dataLearning,
  currentIndex,
  setCurrentIndex,
  navigate,
  id,
) {
  try {
    return (
      <div>
        <div className="text-center mb-4">
          {dataLearning.length > 1 ? (
            <div
              className="text-uppercase small fw-bold mb-1"
              style={{ color: "#64748b", letterSpacing: "0.12em" }}
            >
              Bài {convertToRoman(parseInt(currentIndex) + 1)}
            </div>
          ) : null}
          <h1 className="lesson-title">
            {dataLearning[currentIndex]?.SEO?.seo?.metaTitle}
          </h1>
          {dataLearning.length > 1 ? (
            <div className="d-flex justify-content-center mb-4">
              <div style={{ width: "100%", maxWidth: "420px" }}>
                {renderContentOftable(
                  dataLearning,
                  currentIndex,
                  setCurrentIndex,
                  navigate,
                  id,
                )}
              </div>
            </div>
          ) : null}
          {dataLearning[currentIndex].youtubeSrc ? (
            <>
              <div className="youtube-container">
                <iframe
                  src={dataLearning[currentIndex].youtubeSrc}
                  allowFullScreen
                  title="Video bài học"
                ></iframe>
              </div>
              <small className="text-muted d-block mb-3">
                <i className="bi bi-info-circle me-1"></i>
                Video được trích dẫn với mục đích tư liệu học tập. Nguồn:{" "}
                {dataLearning[currentIndex].youtubeSrc}
              </small>
            </>
          ) : null}
        </div>
      </div>
    );
  } catch (error) {
    return null;
  }
}
