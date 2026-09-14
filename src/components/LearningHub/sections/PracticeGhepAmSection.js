import Dictaphone from "../../../ulti/RegcognitionV2024-05-NG_FOR_TEACHING";
import ReadMessage from "../../../ulti/ReadMessage_2024";
import { socket } from "../../../App";
import { kiemtramic } from "../utils/micCheck";
import { StringSimilarityMatcher } from "../utils/similarityMatcher";

export default function PracticeGhepAmSection({
  id,
  currentIndex,
  navigate,
  params,
  choose_a_st,
  CMDlist,
  dataLearning,
}) {
  return (
    <div
      id="div_01_prac_ghep_am"
      className="divlearnHub practice-section"
      style={{
        flex: 0,
        width: "0",
        padding: "0",
        overflow: "hidden",
      }}
    >
      <div className="row">
        <div className="col-lg-6">
          {/* Câu đang luyện — đưa lên đầu, là thứ người học cần thấy trước */}
          <div className="info-card">
            <div className="text-muted small mb-1">
              <i className="bi bi-chat-quote me-1"></i>Câu đang luyện
            </div>
            <h1 id="getCMDLIST" className="practice-sentence">
              {choose_a_st ? choose_a_st : CMDlist}
            </h1>
          </div>

          {/* Ô nhập phiên âm */}
          <textarea
            className="textarea-practice w-100"
            id="clearClassForTable"
            rows="4"
            placeholder="Nhập phiên âm tại đây…"
          ></textarea>

          {/* Kết quả tham khảo */}
          {StringSimilarityMatcher(CMDlist, dataLearning[currentIndex]?.HDTB?.IP)}

          {/* Gợi ý 4 bước */}
          <div className="step-guide">
            <h6 className="mb-2 fw-bold">
              <i className="bi bi-lightbulb me-2"></i>4 bước: Đoán – Tra –
              Tìm – Ghép
            </h6>
            <p className="small text-muted mb-2">
              "Tìm" là tìm đầu tiên · Đọc giữ nhịp theo quy tắc 4 ngón bàn
              tay phải
            </p>
            <div className="vowel-guide">
              <h5 style={{ color: "#4f46e5", margin: 0 }}>
                <strong>U – E – O – A – i – Ơ</strong>
              </h5>
            </div>
          </div>

          {/* Nút điều khiển — gom xuống dưới nội dung chính */}
          <div className="d-flex flex-wrap control-buttons mt-3">
            <button
              onClick={() => {
                navigate(
                  `/learninghub/${id}?ls=${currentIndex}&&scrollY=${
                    params.get("scrollY") || 0
                  }&&id=div_01_content_table_to_practice`,
                );
              }}
              className="btn btn-modern btn-gradient-info"
            >
              <i className="bi bi-arrow-left me-2"></i>Quay lại bảng
            </button>
            <button
              onClick={() => {
                try {
                  const idDinhDanh = localStorage.getItem("dinhDanh");
                  const nameDinhDanh =
                    localStorage.getItem("nameDinhDanh") || "";
                  const decodeElement = document.getElementById("DeCode");
                  const DeCodeText = decodeElement
                    ? decodeElement.textContent
                    : "";
                  const params = new URLSearchParams(window.location.search);
                  const stParam = params.get("st") || "";
                  const fullURL =
                    window.location.origin +
                    "/pracst?st=" +
                    stParam +
                    "&&note=" +
                    encodeURIComponent(DeCodeText);
                  const groupChatID =
                    localStorage.getItem("groupChat") || "all";
                  socket.emit("message", {
                    text: "LUYỆN TẬP CÂU: " + stParam + fullURL,
                    time:
                      nameDinhDanh ||
                      (idDinhDanh ? idDinhDanh.slice(0, 4) : ""),
                    group: groupChatID,
                  });
                } catch (error) {
                  console.error("Lỗi khi gửi link thực hành:", error);
                }
              }}
              className="btn btn-modern btn-gradient-warning"
            >
              <i className="bi bi-share me-2"></i>Gửi link
            </button>
            <button
              onClick={(e) => {
                try {
                  const decodeElement = document.getElementById("DeCode");
                  const DeCodeText = decodeElement
                    ? decodeElement.textContent
                    : "";
                  const params = new URLSearchParams(window.location.search);
                  const stParam = params.get("st") || "";
                  const fullURL =
                    window.location.origin +
                    "/pracst?st=" +
                    stParam +
                    "&&note=" +
                    encodeURIComponent(DeCodeText);
                  navigator.clipboard
                    .writeText(fullURL)
                    .then(() => {
                      const button = e.target.closest("button");
                      const originalText = button.innerHTML;
                      button.innerHTML =
                        '<i class="bi bi-check-lg me-2"></i>Đã sao chép!';
                      button.className = button.className.replace(
                        "btn-gradient-info",
                        "btn-gradient-success",
                      );
                      setTimeout(() => {
                        button.innerHTML = originalText;
                        button.className = button.className.replace(
                          "btn-gradient-success",
                          "btn-gradient-info",
                        );
                      }, 2000);
                    })
                    .catch((err) => {
                      console.error("Lỗi khi sao chép:", err);
                    });
                } catch (error) {
                  console.error("Lỗi khi sao chép link:", error);
                }
              }}
              className="btn btn-modern btn-gradient-info"
            >
              <i className="bi bi-clipboard me-2"></i>Copy link
            </button>

            <button
              type="button"
              className="btn btn-sm btn-outline-info py-0 px-1"
              title="Gửi bài tập"
              onClick={() => {
                try {
                  const element = document.getElementById(
                    "clearClassForTable",
                  );

                  if (!element) {
                    console.warn("Không tìm thấy #clearClassForTable");
                    return;
                  }

                  const dataGET = element.value;
                  const timestamp = new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
                  let getCurrent = localStorage.getItem("groupChat") || "all";

                  socket.emit("messageReg", {
                    text: `BTJSON${JSON.stringify({
                      type: "gheptu",
                      data: dataGET,
                      note: "none",
                    })}`,
                    time: timestamp,
                    type: "text",
                    id: null,
                    group: getCurrent,
                  });
                } catch (error) {
                  console.error("Lỗi khi tạo bài tập ghép từ:", error);
                }
              }}
            >
              Bài tập ghép từ #1
            </button>
          </div>
          <i id="DeCode" className="d-none"></i>
        </div>
        <div className="col-lg-6">
          <Dictaphone CMDlist={CMDlist} />
          <hr className="my-4" />
          {/* Audio Test */}
          <div className="status-check">
            <h6 className="text-muted mb-3">
              <i className="bi bi-gear me-2"></i>Kiểm tra thiết bị
            </h6>
            <button
              className="btn btn-modern btn-gradient-warning mb-2 w-100"
              onClick={() => {
                ReadMessage(
                  { imale: 0, ifemale: 2 },
                  "Sorry, what did you say?",
                  1,
                  [{ id: "sorryFemale" }],
                );
              }}
            >
              <i className="bi bi-volume-up me-2"></i>
              Kiểm tra âm thanh
            </button>
            <p className="text-muted small mb-3">
              <i className="bi bi-info-circle me-1"></i>
              Có nghe âm thanh máy nói "Sorry, what did you say?" là ổn
            </p>
            <button
              className="btn btn-modern btn-gradient-warning w-100"
              onClick={() => {
                kiemtramic();
              }}
            >
              <i className="bi bi-mic me-2"></i>
              Kiểm tra microphone
            </button>
            <div id="kiemtramicro" className="mt-2 text-muted"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
