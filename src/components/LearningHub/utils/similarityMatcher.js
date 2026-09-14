import { compareTwoStrings } from "string-similarity";

export function StringSimilarityMatcher(inputString, phrasesArray) {
  if (
    !phrasesArray ||
    !Array.isArray(phrasesArray) ||
    phrasesArray.length === 0
  ) {
    return null;
  }

  // Helper: dán thêm nội dung vào textarea đã có, không ghi đè
  const appendToTextarea = (text) => {
    if (!text) return;
    const textarea = document.getElementById("clearClassForTable");
    if (textarea) {
      const current = textarea.value || "";
      // Nếu đã có nội dung thì thêm dấu cách trước khi nối
      textarea.value = current ? current + " " + text : text;
      // Focus lại để người dùng thấy con trỏ ở cuối
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    }
  };

  // Helper: xóa toàn bộ nội dung của một phần tử theo id
  const clearTextareaById = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.value = "";
      el.focus();
    }
  };

  try {
    let mockSimilarityScoreRate;
    phrasesArray.forEach((e) => {
      const mockSimilarityScore = compareTwoStrings(inputString, e["IPA-01"]);
      if (mockSimilarityScore > 0.9) {
        mockSimilarityScoreRate = e;
      }
    });
    // Check if we found a match
    if (mockSimilarityScoreRate) {
      const ipa02 = mockSimilarityScoreRate["IPA-02"] || "";
      const ipa03 = mockSimilarityScoreRate["IPA-03"] || "";
      const ipa04 = mockSimilarityScoreRate["IPA-04"] || "";
      const decodeElement = document.getElementById("DeCode");
      if (decodeElement) {
        decodeElement.textContent = ipa02 + "zzz" + ipa03 + "zzz" + ipa04;
      }
      return (
        <div className="reference-card">
          <div className="row">
            <div className="col-6">
              <h6 className="text-info">
                <i className="bi bi-info-circle me-2"></i>
                Thông tin tham khảo:
              </h6>
            </div>
            <div className="col-6">
              {" "}
              <button
                type="button"
                className="btn btn-sm btn-outline-info py-0 px-1"
                title="Xóa text"
                onClick={() => clearTextareaById("clearClassForTable")}
              >
                XXXX
              </button>
            </div>
          </div>

          <div className="row g-2">
            <div className="col-12 col-md-4">
              <div className="info-card h-100 mb-0">
                <h6 className="text-info">
                  <i className="bi bi-translate me-2"></i>
                  Dịch thô:
                </h6>
                <p
                  className="mb-0 d-flex align-items-center gap-2"
                  style={{ color: "black" }}
                >
                  <strong>{ipa02}</strong>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-info py-0 px-1"
                    title="Dán vào ô phiên âm"
                    onClick={() => appendToTextarea(ipa02)}
                  >
                    <i className="bi bi-plus-lg"></i>
                  </button>
                </p>
              </div>
            </div>
            <div className="col-6 col-md-4">
              <div className="info-card h-100 mb-0">
                <h6 className="text-success">
                  <i className="bi bi-globe-europe-africa me-2"></i>
                  Phiên âm UK:
                </h6>
                <p
                  className="mb-0 d-flex align-items-center gap-2"
                  style={{ color: "black" }}
                >
                  <strong>{ipa03}</strong>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-success py-0 px-1"
                    title="Dán vào ô phiên âm"
                    onClick={() => appendToTextarea(ipa03)}
                  >
                    <i className="bi bi-plus-lg"></i>
                  </button>
                </p>
              </div>
            </div>
            <div className="col-6 col-md-4">
              <div className="info-card h-100 mb-0">
                <h6 className="text-warning">
                  <i className="bi bi-globe-americas me-2"></i>
                  Phiên âm US:
                </h6>
                <p
                  className="mb-0 d-flex align-items-center gap-2"
                  style={{ color: "black" }}
                >
                  <strong>{ipa04}</strong>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-warning py-0 px-1"
                    title="Dán vào ô phiên âm"
                    onClick={() => appendToTextarea(ipa04)}
                  >
                    <i className="bi bi-plus-lg"></i>
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  } catch (error) {
    console.error("Error in StringSimilarityMatcher:", error);
    return null;
  }
}
