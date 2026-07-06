import React, { useEffect, useState, useContext } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Lobby from "./Lobby";
import TableHD from "./pracPages/B101_FINAL_TABLE-HD";
import TableTB from "./pracPages/B101_FINAL_TABLE-TB-NotAdd";
// import { ObjREADContext } from "../App";
import { compareTwoStrings } from "string-similarity";
import Dictaphone from "../ulti/RegcognitionV2024-05-NG_FOR_TEACHING";
import NguyenTacghepam from "./A1_NguyentacGhepam";
import ReadMessage from "../ulti/ReadMessage_2024";
import read_by_Tts from "../ulti/readMessage_TtsServer";
import Getlink from "./LearningHub_getlink";
import { socket } from "../App";
import YouTubeVideoSearch from "./LearningHub/YouTubeVideoSearch";

const colors = ["red", "orange", "black", "green", "blue", "indigo", "violet"];

// Danh sách chức năng — dùng chung cho thanh điều hướng dạng pill
const NAV_ITEMS = [
  {
    value: "div_01_content_table_to_practice",
    icon: "bi-table",
    label: "Chọn bài học",
    step: "1",
  },
  {
    value: "div_01_prac_ghep_am",
    icon: "bi-music-note-beamed",
    label: "Ghép âm",
  },
  { value: "div_01_content_to_learn", icon: "bi-book", label: "Nội dung" },
  {
    value: "div_01_prac_luyen_am",
    icon: "bi-chat-square-text",
    label: "Nguyên tắc ghép âm",
  },
  { value: "div_01_prac_hoc_thuoc", icon: "bi-lightbulb", label: "Học thuộc" },
  {
    value: "div_01_prac_phuongphaphoc",
    icon: "bi-mortarboard",
    label: "Phương pháp học",
  },
  {
    value: "div_01_prac_bangnhap",
    icon: "bi-link-45deg",
    label: "Custom link",
    step: "2",
  },
  {
    value: "div_01_prac_vaothuchanh",
    icon: "bi-play-circle",
    label: "Vào thực hành",
    step: "3",
  },
];

const LearningHub = ({ setSttRoom, STTconnectFN }) => {
  const { id } = useParams();
  const locationSet = useLocation();
  const params = new URLSearchParams(locationSet.search);
  const [dataLearning, setDataLearning] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [STTPractice, setSTTPractice] = useState(true);
  // const ObjREAD = useContext(ObjREADContext);
  const [choose_a_st, setchoose_a_st] = useState(null);
  const [CMDlist, setCMDlist] = useState("Hi how are you");
  const [StartToGetData, setStartToGetData] = useState(false);
  const navigate = useNavigate();

  // id của section đang mở — để highlight pill đang active
  const activeId = params.get("id") || "div_01_content_table_to_practice";

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        let response;
        if (id.charAt(1) === "z") {
          response = await fetch(`/jsonData/forseo/${id}.json`);
        } else {
          response = await fetch(`/jsonData/${id}.json`);
        }
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setDataLearning(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTitle();
  }, [id]);

  useEffect(() => {
    handle_div(params.get("id"));
    if (params.get("id") === "div_01_prac_ghep_am") {
      window.scrollTo({
        top: 0,
        // behavior: "smooth", // cuộn mượt
      });
    }
    if (params.get("id") === "div_01_content_table_to_practice") {
      window.scrollTo({
        top: params.get("scrollY") || 0,
        // behavior: "smooth", // cuộn mượt
      });
    }
    if (params.get("st")) {
      try {
        setCMDlist(params.get("st").split("-").join(" "));
      } catch (error) {}
    }
    if (params.get("ls")) {
      try {
        setCurrentIndex(params.get("ls"));
      } catch (error) {}
    }
  }, [params]);

  useEffect(() => {
    try {
      navigate(
        `/learninghub/${id}?ls=${currentIndex}&&id=div_01_prac_ghep_am&&st=` +
          choose_a_st.split(" ").join("-"),
      );
    } catch (error) {}
  }, [choose_a_st]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div
            className="spinner-border mb-3"
            role="status"
            style={{ width: "3rem", height: "3rem", color: "#4f46e5" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted fw-normal">Đang tải dữ liệu…</h5>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5" style={{ maxWidth: 480 }}>
        <div className="alert alert-danger text-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill d-block fs-1 mb-2"></i>
          <p className="mb-3">
            Gặp lỗi trong quá trình xử lí dữ liệu, vui lòng thử lại.
          </p>
          <button
            className="btn btn-outline-danger"
            onClick={() => window.location.reload()}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Bootstrap CSS & Icons */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
        rel="stylesheet"
      />
      <style jsx>{`
        :root {
          --lh-primary: #4f46e5;
          --lh-primary-soft: #eef2ff;
          --lh-ink: #1e293b;
          --lh-muted: #64748b;
          --lh-bg: #f6f7fb;
          --lh-card: #ffffff;
          --lh-border: #e2e8f0;
          --lh-radius: 14px;
          --lh-shadow:
            0 1px 3px rgba(15, 23, 42, 0.06), 0 6px 18px rgba(15, 23, 42, 0.05);
        }
        .learning-hub-container {
          margin-top: 8vh;
          padding: 1.25rem 4% 4rem;
          background: var(--lh-bg);
          min-height: 100vh;
          color: var(--lh-ink);
        }

        /* ====== Thanh điều hướng dạng pill (cuộn ngang, dính trên cùng) ====== */
        .lh-nav {
          position: sticky;
          top: 8vh;
          z-index: 100;
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding: 0.6rem 0.25rem;
          margin: 0 -0.25rem 1.25rem;
          background: linear-gradient(var(--lh-bg) 85%, transparent);
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .lh-nav::-webkit-scrollbar {
          display: none;
        }
        .lh-pill {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 1rem;
          border-radius: 999px;
          border: 1.5px solid var(--lh-border);
          background: var(--lh-card);
          color: var(--lh-ink);
          font-size: 0.92rem;
          font-weight: 500;
          white-space: nowrap;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .lh-pill:active {
          transform: scale(0.96);
        }
        .lh-pill.active {
          background: var(--lh-primary);
          border-color: var(--lh-primary);
          color: #fff;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
        }
        .lh-pill .lh-step {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.2rem;
          height: 1.2rem;
          border-radius: 50%;
          font-size: 0.7rem;
          font-weight: 700;
          background: var(--lh-primary-soft);
          color: var(--lh-primary);
        }
        .lh-pill.active .lh-step {
          background: rgba(255, 255, 255, 0.25);
          color: #fff;
        }

        /* ====== Các section ====== */
        .divlearnHub {
          background: var(--lh-card);
          border-radius: var(--lh-radius);
          box-shadow: var(--lh-shadow);
          border: 1px solid var(--lh-border);
          transition:
            opacity 0.25s ease,
            padding 0.25s ease;
          overflow: hidden;
        }
        .content-section {
          background: var(--lh-card);
          border-radius: var(--lh-radius);
        }
        .practice-section {
          background: var(--lh-card);
          border-radius: var(--lh-radius);
        }
        .info-section {
          background: var(--lh-card);
          border-radius: var(--lh-radius);
        }

        /* ====== Nút ====== */
        .btn-modern {
          border-radius: 12px;
          padding: 0.7rem 1.25rem;
          font-weight: 600;
          border: none;
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease;
          min-height: 44px; /* vùng chạm tối thiểu trên mobile */
        }
        .btn-modern:active {
          transform: scale(0.97);
        }
        .btn-gradient-primary {
          background: var(--lh-primary);
          color: #fff;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }
        .btn-gradient-success {
          background: #059669;
          color: #fff;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }
        .btn-gradient-warning {
          background: #d97706;
          color: #fff;
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
        }
        .btn-gradient-info {
          background: #0284c7;
          color: #fff;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
        }
        .btn-gradient-primary:hover,
        .btn-gradient-success:hover,
        .btn-gradient-warning:hover,
        .btn-gradient-info:hover {
          color: #fff;
          filter: brightness(1.07);
        }
        .control-buttons {
          gap: 0.6rem;
          margin-bottom: 1.25rem;
        }

        /* ====== Ô nhập phiên âm ====== */
        .textarea-practice {
          background: #fff;
          color: var(--lh-ink);
          border: 2px solid var(--lh-primary);
          border-radius: 12px;
          font-size: clamp(1.35rem, 4vw, 2rem);
          font-weight: 700;
          padding: 0.85rem 1rem;
          box-shadow: var(--lh-shadow);
          transition:
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }
        .textarea-practice::placeholder {
          color: #94a3b8;
          font-weight: 400;
          font-size: 1rem;
          text-decoration: none;
        }
        .textarea-practice:focus {
          outline: none;
          border-color: var(--lh-primary);
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.18);
        }

        /* ====== Thẻ thông tin ====== */
        .info-card {
          background: var(--lh-card);
          border-radius: 12px;
          padding: 1.1rem 1.25rem;
          box-shadow: var(--lh-shadow);
          border: 1px solid var(--lh-border);
          border-left: 4px solid var(--lh-primary);
          margin-bottom: 1rem;
        }
        .reference-card {
          background: var(--lh-primary-soft);
          border-radius: 12px;
          padding: 1.1rem 1.25rem;
          border: 1px solid #c7d2fe;
          margin-top: 1rem;
        }
        .vowel-guide {
          background: #fff;
          border-radius: 12px;
          padding: 0.85rem;
          text-align: center;
          margin: 0.75rem 0;
          border: 2px dashed var(--lh-primary);
          letter-spacing: 0.15em;
        }
        .step-guide {
          background: #fffbeb;
          border-radius: 12px;
          padding: 1.1rem 1.25rem;
          border-left: 4px solid #d97706;
          margin: 0.75rem 0;
        }
        .lesson-title {
          color: var(--lh-primary);
          font-weight: 700;
          text-align: center;
          margin-bottom: 1.5rem;
          line-height: 1.3;
        }
        .practice-sentence {
          color: var(--lh-primary);
          font-size: clamp(1.5rem, 5vw, 2.25rem);
          font-weight: 700;
          line-height: 1.35;
          word-break: break-word;
          margin: 0;
        }

        /* ====== YouTube ====== */
        .youtube-container {
          position: relative;
          overflow: hidden;
          width: 100%;
          padding-top: 56.25%;
          border-radius: var(--lh-radius);
          box-shadow: var(--lh-shadow);
          margin-bottom: 1.5rem;
          background: #0f172a;
        }
        .youtube-container iframe {
          position: absolute;
          top: 15%;
          left: 15%;
          bottom: 15%;
          right: 15%;
          width: 70%;
          height: 70%;
          border: 0;
          border-radius: 12px;
        }

        /* ====== Select ====== */
        .lesson-select,
        .control-select {
          background: var(--lh-card);
          border: 1.5px solid var(--lh-border);
          border-radius: 12px;
          padding: 0.7rem 1rem;
          font-size: 1rem;
          box-shadow: var(--lh-shadow);
          min-height: 44px;
        }
        .lesson-select:focus,
        .control-select:focus {
          border-color: var(--lh-primary);
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.18);
          outline: none;
        }
        .status-check {
          background: var(--lh-card);
          border-radius: 12px;
          padding: 1.1rem 1.25rem;
          border: 1px solid var(--lh-border);
          margin: 1rem 0;
        }

        @media (max-width: 768px) {
          .learning-hub-container {
            padding: 0.75rem 3% 5rem;
            margin-top: 6vh;
          }
          .control-buttons {
            flex-direction: column;
          }
          .btn-modern {
            width: 100%;
            margin-bottom: 0.25rem;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .divlearnHub,
          .lh-pill,
          .btn-modern,
          .textarea-practice {
            transition: none;
          }
        }
      `}</style>
      <HelmetProvider>
        <div className="learning-hub-container">
          <Helmet>
            <title>
              {`Cùng thực hành: ${
                dataLearning[currentIndex]?.SEO?.seo?.metaTitle ||
                "Learning Hub"
              }`}
            </title>
            <meta
              name="description"
              content={
                dataLearning[currentIndex]?.SEO?.seo?.metaDescription || ""
              }
            />
            <meta
              name="keywords"
              content={`Cùng thực hành, cung thuc hanh, ${arrayToString(
                dataLearning[currentIndex]?.SEO?.seo?.keywords,
              )}, ${id}`}
            />
          </Helmet>
          <section>
            {/* ====== Điều hướng chức năng: pill cuộn ngang, dính trên cùng ====== */}
            <nav className="lh-nav" aria-label="Chức năng học tập">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`lh-pill ${activeId === item.value ? "active" : ""}`}
                  onClick={() => {
                    navigate(
                      `/learninghub/${id}?ls=${currentIndex}&&id=${item.value}`,
                    );
                  }}
                >
                  <i className={`bi ${item.icon}`}></i>
                  {item.label}
                  {item.step ? (
                    <span className="lh-step">{item.step}</span>
                  ) : null}
                </button>
              ))}
            </nav>

            <div className="d-flex">
              {/* Content Section */}
              <div
                id="div_01_content_to_learn"
                className="divlearnHub content-section"
                style={{
                  flex: 0,
                  width: "0",
                  padding: "0",
                }}
              >
                <div
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: "400",
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                  }}
                >
                  <TableHD
                    data={dataLearning[currentIndex]?.HDTB?.HT}
                    data_TB={[]}
                    HINT={"HINT"}
                    fnOnclick={(e) => {}}
                  />

                  {dataLearning[currentIndex]?.HDTB?.IF?.IFdes}
                  {dataLearning[currentIndex] ? (
                    <div>{renderContent(dataLearning, currentIndex)}</div>
                  ) : null}
                </div>
              </div>

              {/* Table Section */}
              <div
                id="div_01_content_table_to_practice"
                className="divlearnHub"
                style={{
                  flex: 8,
                  padding: "1.5rem",
                }}
              >
                {rShowLessonTABLE(
                  dataLearning,
                  currentIndex,
                  setCurrentIndex,
                  navigate,
                  id,
                )}
                <TableHD
                  data={dataLearning[currentIndex]?.HDTB?.HD}
                  data_TB={[]}
                  HINT={"HINT"}
                  fnOnclick={(e) => {
                    try {
                      navigate(
                        `/learninghub/${id}?ls=${currentIndex}&&scrollY=${
                          window.scrollY
                        }&&id=div_01_prac_ghep_am&&st=${e
                          .toString()
                          .split(" ")
                          .join("-")}`,
                      );
                    } catch (error) {}
                  }}
                />
                <TableHD
                  data={dataLearning[currentIndex]?.HDTB?.TV}
                  data_TB={[]}
                  HINT={"HINT"}
                  fnOnclick={(e) => {
                    try {
                      navigate(
                        `/learninghub/${id}?ls=${currentIndex}&&scrollY=${
                          window.scrollY
                        }&&id=div_01_prac_ghep_am&&st=${e
                          .toString()
                          .split(" ")
                          .join("-")}`,
                      );
                    } catch (error) {}
                  }}
                />
              </div>

              {/* Practice Section */}
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
                    {StringSimilarityMatcher(
                      CMDlist,
                      dataLearning[currentIndex]?.HDTB?.IPA,
                    )}

                    {/* Gợi ý 4 bước */}
                    <div className="step-guide">
                      <h6 className="mb-2 fw-bold">
                        <i className="bi bi-lightbulb me-2"></i>4 bước: Đoán –
                        Tra – Tìm – Ghép
                      </h6>
                      <p className="small text-muted mb-2">
                        "Tìm" là tìm đầu tiên · Đọc giữ nhịp theo quy tắc 4 ngón
                        bàn tay phải
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
                            const decodeElement =
                              document.getElementById("DeCode");
                            const DeCodeText = decodeElement
                              ? decodeElement.textContent
                              : "";
                            const params = new URLSearchParams(
                              window.location.search,
                            );
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
                            const decodeElement =
                              document.getElementById("DeCode");
                            const DeCodeText = decodeElement
                              ? decodeElement.textContent
                              : "";
                            const params = new URLSearchParams(
                              window.location.search,
                            );
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
                        Có nghe âm thanh máy nói "Sorry, what did you say?" là
                        ổn
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

              {/* Other sections */}
              <div
                id="div_01_prac_luyen_am"
                className="divlearnHub info-section"
                style={{
                  flex: 0,
                  width: "0",
                  padding: "0",
                  overflow: "hidden",
                }}
              >
                <NguyenTacghepam />
              </div>
              <div
                id="div_01_prac_hoc_thuoc"
                className="divlearnHub info-section"
                style={{
                  flex: 0,
                  width: "0",
                  padding: "0",
                  overflow: "hidden",
                }}
              >
                <div className="text-center">
                  <h1 className="lesson-title">Học thuộc lòng!</h1>
                  <div className="info-card text-start">
                    <p className="lead mb-0">
                      <i className="bi bi-lightbulb text-warning me-2"></i>
                      Là một cách bổ trợ{" "}
                      <strong>trực tiếp, nhanh chóng và hiệu quả</strong> cho
                      quá trình thực hành nghe nói. Tuy có hơi nhàm chán nhưng
                      bù lại sẽ <strong>rút ngắn đáng kể</strong> số lần cần
                      phải thực hành để đạt đến ngưỡng giao tiếp được.
                    </p>
                  </div>
                  <div className="step-guide text-start">
                    <h6 className="fw-bold mb-1">
                      <i className="bi bi-1-circle me-2"></i>
                      Bước 1: Hãy chép mỗi câu phía dưới đây ra giấy một lần.
                    </h6>
                  </div>
                  <div className="step-guide text-start">
                    <h6 className="fw-bold mb-1">
                      <i className="bi bi-2-circle me-2"></i>
                      Bước 2: Bấm vào Nút <strong>
                        Learning by heart!
                      </strong>{" "}
                      bên dưới.
                    </h6>
                    <p className="mb-0 small text-muted">
                      Máy sẽ đọc từng câu một, bạn có 10 giây để nghe và chép
                      lại ra giấy (có thể ghi tắt).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigate(`/learningbyheart/${id}/${currentIndex}`);
                    }}
                    className="btn btn-modern btn-gradient-primary btn-lg mt-2"
                  >
                    <i className="bi bi-heart me-2"></i>
                    Learning by heart
                  </button>
                </div>
              </div>
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
                    Thực hành lặp lại (có ghi nhận phản hồi-sửa chửa) là con
                    đường phải đi qua để đạt được kĩ năng. Hãy lấy kỉ luật và
                    cùng thực hành chung làm động lực.
                  </h4>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="step-guide">
                        <h6 className="fw-bold">
                          <i className="bi bi-bullseye me-2"></i>
                          Mục tiêu tối thiểu
                        </h6>
                        <p className="mb-0">
                          Để biết nghe nói là{" "}
                          <strong>10.000 lượt nghe nói</strong>.
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
                          Mỗi buổi học đều nên nhắc lại các kiến thức về tách
                          ghép âm.
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
                        Nhanh chóng chuyển qua thực hành, khi thực hành tự khắc
                        sẽ nắm nội dung
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
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
                <Getlink
                  id={id}
                  index={currentIndex}
                  lessonSetLength={dataLearning.length}
                  typeSet={dataLearning[currentIndex]?.typeSets || ["A1"]}
                />
              </div>
              <div
                id="div_01_prac_vaothuchanh"
                className="divlearnHub info-section"
                style={{
                  flex: 0,
                  width: "0",
                  padding: "0",
                  overflow: "hidden",
                }}
              >
                {STTPractice && dataLearning !== null ? (
                  <Lobby
                    STTconnectFN={STTconnectFN}
                    setSttRoom={setSttRoom}
                    fileName={id}
                    objList={createArrayFromNumber(dataLearning.length - 1)}
                    objListDefault={[currentIndex]}
                    custom={true}
                    id={id}
                    currentIndex={currentIndex}
                  />
                ) : (
                  <div className="text-center py-5">
                    <div className="info-card">
                      <h3 className="mb-4">
                        <i className="bi bi-play-circle text-primary me-2"></i>
                        Sẵn sàng thực hành?
                      </h3>
                      <button
                        onClick={() => {
                          setSTTPractice(true);
                        }}
                        className="btn btn-modern btn-gradient-primary btn-lg"
                      >
                        <i className="bi bi-mic me-2"></i>
                        Cùng thực hành
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </HelmetProvider>
    </>
  );
};
export default LearningHub;

// Utility Functions
function createArrayFromNumber(n) {
  return Array.from({ length: n + 1 }, (_, index) => index);
}
function generateBootstrapList(sentences, choose_a_st, setchoose_a_st) {
  try {
    if (!Array.isArray(sentences)) {
      throw new Error("Input is not an array");
    }
    const listItems = sentences.map((sentence, index) => (
      <option value={sentence} key={index}>
        {sentence}
      </option>
    ));
    return (
      <div>
        <select
          onChange={(e) => {
            setchoose_a_st(e.target.value);
          }}
          className="form-select lesson-select"
        >
          <option value={""}>Các câu trong bài thực hành</option>
          {listItems}
        </select>
      </div>
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}
function rShowLessonTABLE(
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
function renderContent(dataLearning, currentIndex) {
  try {
    if (!dataLearning[currentIndex]) return null;
    const { cssStyles, contentArray } = dataLearning[currentIndex].SEO;
    return contentArray.map((item, index) => {
      const Tag = item.tag || "div";
      const style = cssStyles[item.cssClass] || {};
      return (
        <Tag key={index} style={style}>
          {item.content}
        </Tag>
      );
    });
  } catch (error) {
    return null;
  }
}
function renderContentOftable(
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
function arrayToString(array) {
  if (!Array.isArray(array)) return "";
  return array.join(", ");
}
function convertToRoman(num) {
  const romanNumerals = [
    { value: 1000, symbol: "M" },
    { value: 900, symbol: "CM" },
    { value: 500, symbol: "D" },
    { value: 400, symbol: "CD" },
    { value: 100, symbol: "C" },
    { value: 90, symbol: "XC" },
    { value: 50, symbol: "L" },
    { value: 40, symbol: "XL" },
    { value: 10, symbol: "X" },
    { value: 9, symbol: "IX" },
    { value: 5, symbol: "V" },
    { value: 4, symbol: "IV" },
    { value: 1, symbol: "I" },
  ];
  let roman = "";
  for (const numeral of romanNumerals) {
    while (num >= numeral.value) {
      roman += numeral.symbol;
      num -= numeral.value;
    }
  }
  return roman;
}
function handle_div(id) {
  if (!id) {
    id = "div_01_content_table_to_practice";
  }
  const divs = document.querySelectorAll(".divlearnHub");
  divs.forEach((div) => {
    div.style.flex = "0";
    div.style.opacity = "0";
    div.style.width = "0px";
    div.style.padding = "0px";
    div.style.pointerEvents = "none";
  });
  const targetDiv = document.getElementById(id);
  if (targetDiv) {
    targetDiv.style.opacity = "1";
    targetDiv.style.flex = "8";
    targetDiv.style.width = "80wh";
    targetDiv.style.padding = "20px";
    targetDiv.style.pointerEvents = "auto";
  } else {
    console.warn("No div found with the id:", id);
  }
}
function kiemtramic() {
  try {
    navigator.permissions
      .query({ name: "microphone" })
      .then(function (permissionStatus) {
        if (permissionStatus.state === "denied") {
          document.getElementById("kiemtramicro").innerHTML =
            '<div class="alert alert-warning"><i class="bi bi-exclamation-triangle me-2"></i>Quyền truy cập micro đã bị từ chối trước đó. Vui lòng cấp quyền lại!</div>';
          navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(function (stream) {
              document.getElementById("kiemtramicro").innerHTML =
                '<div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>Trang web có quyền sử dụng micro!</div>';
              stream.getTracks().forEach((track) => track.stop());
            })
            .catch(function (error) {
              document.getElementById("kiemtramicro").innerHTML =
                '<div class="alert alert-danger"><i class="bi bi-x-circle me-2"></i>Trang web không có quyền sử dụng micro hoặc bạn chưa cấp quyền.</div>';
            });
        } else if (permissionStatus.state === "granted") {
          document.getElementById("kiemtramicro").innerHTML =
            '<div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>Trang web có quyền sử dụng micro!</div>';
        } else {
          navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(function (stream) {
              document.getElementById("kiemtramicro").innerHTML =
                '<div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>Trang web có quyền sử dụng micro!</div>';
              stream.getTracks().forEach((track) => track.stop());
            })
            .catch(function (error) {
              document.getElementById("kiemtramicro").innerHTML =
                '<div class="alert alert-danger"><i class="bi bi-x-circle me-2"></i>Trang web không có quyền sử dụng micro hoặc bạn chưa cấp quyền.</div>';
            });
        }
      });
  } catch (error) {
    console.error("Lỗi khi kiểm tra micro:", error);
  }
}
function StringSimilarityMatcher(inputString, phrasesArray) {
  if (
    !phrasesArray ||
    !Array.isArray(phrasesArray) ||
    phrasesArray.length === 0
  ) {
    return null;
  }
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
          <h6 className="text-primary mb-3">
            <i className="bi bi-search me-2"></i>
            Tham khảo:
          </h6>
          <div className="row g-2">
            <div className="col-12 col-md-4">
              <div className="info-card h-100 mb-0">
                <h6 className="text-info">
                  <i className="bi bi-translate me-2"></i>
                  Dịch thô:
                </h6>
                <p className="mb-0" style={{ color: "black" }}>
                  <strong>{ipa02}</strong>
                </p>
              </div>
            </div>
            <div className="col-6 col-md-4">
              <div className="info-card h-100 mb-0">
                <h6 className="text-success">
                  <i className="bi bi-globe-europe-africa me-2"></i>
                  Phiên âm UK:
                </h6>
                <p className="mb-0" style={{ color: "black" }}>
                  <strong>{ipa03}</strong>
                </p>
              </div>
            </div>
            <div className="col-6 col-md-4">
              <div className="info-card h-100 mb-0">
                <h6 className="text-warning">
                  <i className="bi bi-globe-americas me-2"></i>
                  Phiên âm US:
                </h6>
                <p className="mb-0" style={{ color: "black" }}>
                  <strong>{ipa04}</strong>
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
