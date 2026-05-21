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
          choose_a_st.split(" ").join("-")
      );
    } catch (error) {}
  }, [choose_a_st]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="text-muted">Đang tải dữ liệu...</h4>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Gặp lỗi trong quá trình xử lí dữ liệu, vui lòng thử lại.
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
        .learning-hub-container {
          margin-top: 8vh;
          padding: 5%;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          min-height: 100vh;
        }

        .control-select {
          background: white;
          border: 2px solid #667eea;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-size: 1.1rem;
          font-weight: 500;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .control-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
          outline: none;
        }

        .divlearnHub {
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
          transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .content-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 16px;
          padding: 2rem;
        }

        .practice-section {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          border-radius: 16px;
          padding: 2rem;
        }

        .info-section {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 2rem;
          border-left: 4px solid #667eea;
        }

        .btn-modern {
          border-radius: 12px;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn-modern:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .btn-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-gradient-success {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
        }

        .btn-gradient-warning {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .btn-gradient-info {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }

        .control-buttons {
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .textarea-practice {
          background: linear-gradient(135deg, #1e90ff 0%, #0077ff 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 2.25rem;
          font-weight: 700;
          text-decoration: underline;
          box-shadow: 0 8px 25px rgba(30, 144, 255, 0.3);
          transition: all 0.3s ease;
        }

        .textarea-practice:focus {
          outline: none;
          box-shadow: 0 12px 35px rgba(30, 144, 255, 0.4);
          transform: scale(1.02);
        }

        .info-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #667eea;
          margin-bottom: 1rem;
        }

        .reference-card {
          background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #e1bee7;
          margin-top: 1rem;
        }

        .vowel-guide {
          background: linear-gradient(135deg, #bbdefb 0%, #c8e6c9 100%);
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          margin: 1rem 0;
          border: 2px solid #4fc3f7;
        }

        .lesson-title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          text-align: center;
          margin-bottom: 2rem;
        }

        .youtube-container {
          position: relative;
          overflow: hidden;
          width: 100%;
          padding-top: 56.25%;
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          margin-bottom: 2rem;
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

        .lesson-select {
          background: white;
          border: 2px solid #667eea;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .lesson-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
          outline: none;
        }

        // .step-guide {
        //   background: linear-gradient(135deg, #fff3e0 0%, #f3e5f5 100%);
        //   border-radius: 12px;
        //   padding: 1.5rem;
        //   border-left: 4px solid #ff9800;
        //   margin: 1rem 0;
        // }

        .status-check {
          background: white;
          border-radius: 12px;
          padding: 1rem;
          border: 1px solid #e9ecef;
          margin: 1rem 0;
        }

        @media (max-width: 768px) {
          .learning-hub-container {
            padding: 3%;
            margin-top: 6vh;
          }

          .control-buttons {
            flex-direction: column;
          }

          .textarea-practice {
            font-size: 1.5rem;
          }

          .btn-modern {
            width: 100%;
            margin-bottom: 0.5rem;
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
                dataLearning[currentIndex]?.SEO?.seo?.keywords
              )}, ${id}`}
            />
          </Helmet>

          <section>
            {/* Control Section */}
            <div className="mb-4">
              <select
                className="control-select"
                onChange={(e) => {
                  navigate(
                    `/learninghub/${id}?ls=${currentIndex}&&id=${e.target.value}`
                  );
                }}
              >
                <option value="div_01_content_table_to_practice">
                  <i className="bi bi-list-ul me-2"></i>Chọn chức năng
                </option>
                <option value="div_01_content_to_learn">
                  <i className="bi bi-book me-2"></i>Nội dung
                </option>
                <option value="div_01_content_table_to_practice">
                  <i className="bi bi-table me-2"></i>Chọn bài học (1)
                </option>
                <option value="div_01_prac_ghep_am">
                  <i className="bi bi-music-note-beamed me-2"></i>Ghép âm
                </option>
                <option value="div_01_prac_luyen_am">
                  <i className="bi bi-chat-square-text me-2"></i>Nguyên tắc ghép
                  âm
                </option>
                <option value="div_01_prac_hoc_thuoc">
                  <i className="bi bi-brain me-2"></i>Học thuộc
                </option>
                <option value="div_01_prac_phuongphaphoc">
                  <i className="bi bi-lightbulb me-2"></i>Phương pháp học
                </option>
                <option value="div_01_prac_bangnhap">
                  <i className="bi bi-link-45deg me-2"></i>Custom link thực hành
                  (2)
                </option>
                <option value="div_01_prac_vaothuchanh">
                  <i className="bi bi-play-circle me-2"></i>Vào thực hành (3)
                </option>
              </select>
            </div>

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
                    fontSize: "1.875rem",
                    fontWeight: "400",
                    whiteSpace: "pre-line",
                  }}
                >
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
                  background:
                    "linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%)",
                  padding: "2rem",
                }}
              >
                {rShowLessonTABLE(
                  dataLearning,
                  currentIndex,
                  setCurrentIndex,
                  navigate,
                  id
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
                          .join("-")}`
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
                          .join("-")}`
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
                    {/* Control Buttons */}
                    <div className="d-flex flex-wrap control-buttons">
                      <button
                        onClick={() => {
                          navigate(
                            `/learninghub/${id}?ls=${currentIndex}&&scrollY=${
                              params.get("scrollY") || 0
                            }&&id=div_01_content_table_to_practice`
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
                              window.location.search
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
                              window.location.search
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
                                  "btn-gradient-success"
                                );
                                setTimeout(() => {
                                  button.innerHTML = originalText;
                                  button.className = button.className.replace(
                                    "btn-gradient-success",
                                    "btn-gradient-info"
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

                    {/* Guide Section */}
                    <div className="step-guide">
                      <h5 className="mb-3">
                        <i className="bi bi-lightbulb me-2"></i>4 bước: Đoán -
                        Tra - Tìm - Ghép
                      </h5>
                      <div className="vowel-guide">
                        <h4 style={{ color: "#1976d2", margin: 0 }}>
                          <strong>U - E - O - A - i - Ơ</strong>
                        </h4>
                      </div>
                    </div>

                    {/* Practice Text */}
                    <div className="info-card">
                      <h1 id="getCMDLIST" className="text-primary mb-3">
                        {choose_a_st ? choose_a_st : CMDlist}
                      </h1>
                    </div>

                    {/* Practice Textarea */}
                    <textarea
                      className="textarea-practice w-100"
                      id="clearClassForTable"
                      rows="6"
                      placeholder="Nhập phiên âm tại đây..."
                    ></textarea>

                    {/* Similarity Matcher */}
                    <div className="reference-card">
                      {StringSimilarityMatcher(
                        CMDlist,
                        dataLearning[currentIndex]?.HDTB?.IPA
                      )}
                    </div>

                    {/* Instructions */}
                    <div className="row mt-4">
                      <div className="col-md-6">
                        <div className="info-card">
                          <h6 className="text-primary">
                            <i className="bi bi-search me-2"></i>
                            "Tìm" là tìm đầu tiên:
                          </h6>
                          <div className="vowel-guide">
                            <strong style={{ color: "#1976d2" }}>
                              U - E - O - A - i - Ơ
                            </strong>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-card">
                          <h6 className="text-success">
                            <i className="bi bi-hand-index me-2"></i>
                            Đọc giữ nhịp theo quy tắc 4 ngón bàn tay phải
                          </h6>
                        </div>
                      </div>
                    </div>

                    <i id="DeCode" className="d-none"></i>
                  </div>

                  <div className="col-lg-6">
                    <Dictaphone CMDlist={CMDlist} />

                    <hr className="my-4" />

                    {/* Audio Test */}
                    <div className="status-check">
                      <button
                        className="btn btn-modern btn-gradient-warning mb-3"
                        onClick={() => {
                          ReadMessage(
                            { imale: 0, ifemale: 2 },
                            "Sorry, what did you say?",
                            1,
                            [{ id: "sorryFemale" }]
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
                        className="btn btn-modern btn-gradient-warning"
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

              {/* Other sections with enhanced styling */}
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
                    <p className="lead">
                      <i className="bi bi-lightbulb text-warning me-2"></i>
                      Là một cách bổ trợ{" "}
                      <strong>trực tiếp, nhanh chóng và hiệu quả</strong> cho
                      quá trình thực hành nghe nói. Tuy có hơi nhàm chán nhưng
                      bù lại sẽ <strong>rút ngắn đáng kể</strong> số lần cần
                      phải thực hành để đạt đến ngưỡng giao tiếp được.
                    </p>
                  </div>

                  <div className="step-guide text-start">
                    <h5>
                      <i className="bi bi-1-circle me-2"></i>
                      Bước 1: Hãy chép mỗi câu phía dưới đây ra giấy một lần.
                    </h5>
                  </div>

                  <div className="step-guide text-start">
                    <h5>
                      <i className="bi bi-2-circle me-2"></i>
                      Bước 2: Bấm vào Nút <strong>
                        Learning by heart!
                      </strong>{" "}
                      bên dưới.
                    </h5>
                    <p>
                      Máy sẽ đọc từng câu một, bạn có 10 giây để nghe và chép
                      lại ra giấy (có thể ghi tắt).
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      navigate(`/learningbyheart/${id}/${currentIndex}`);
                    }}
                    className="btn btn-modern btn-gradient-primary btn-lg"
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
                  <h2 className="text-primary mb-4">
                    Thực hành lặp lại (có ghi nhận phản hồi-sửa chửa) là con
                    đường phải đi qua để đạt được kĩ năng. Hãy lấy kỉ luật và
                    cùng thực hành chung làm động lực.
                  </h2>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="step-guide">
                        <h5>
                          <i className="bi bi-target me-2"></i>
                          Mục tiêu tối thiểu
                        </h5>
                        <p>
                          Để biết nghe nói là{" "}
                          <strong>10.000 lượt nghe nói</strong>.
                        </p>
                      </div>

                      <div className="step-guide">
                        <h5>
                          <i className="bi bi-calendar-day me-2"></i>
                          Mục tiêu hàng ngày
                        </h5>
                        <p>
                          Mỗi buổi thực hành ít cũng phải trên{" "}
                          <strong>100 lượt nghe nói</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="step-guide">
                        <h5>
                          <i className="bi bi-arrow-repeat me-2"></i>
                          Ôn tập kiến thức cốt lõi
                        </h5>
                        <p>
                          Mỗi buổi học đều nên nhắc lại các kiến thức về tách
                          ghép âm.
                        </p>
                      </div>

                      <div className="step-guide">
                        <h5>
                          <i className="bi bi-ear me-2"></i>
                          Thực hành nghe và ghép
                        </h5>
                        <p>Luyện tập ghép âm và tách âm thường xuyên.</p>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-warning" role="alert">
                    <h6>
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
          <option value={""}>
            <i className="bi bi-list me-2"></i>
            Các câu trong bài thực hành
          </option>
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
  id
) {
  try {
    return (
      <div>
        <div className="text-center mb-4">
          {dataLearning.length > 1 ? (
            <h2 className="lesson-title">
              <i className="bi bi-book me-2"></i>
              Bài {convertToRoman(parseInt(currentIndex) + 1)}
            </h2>
          ) : null}
          <h1 className="lesson-title">
            {dataLearning[currentIndex]?.SEO?.seo?.metaTitle}
          </h1>

          {dataLearning[currentIndex].youtubeSrc ? (
            <div className="youtube-container">
              <iframe
                src={dataLearning[currentIndex].youtubeSrc}
                allowFullScreen
              ></iframe>
              <div className="text-center mt-3">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Video được trích dẫn với mục đích tư liệu học tập.
                  <br />
                  Nguồn: {dataLearning[currentIndex].youtubeSrc}
                </small>
              </div>
            </div>
          ) : null}
        </div>

        {dataLearning.length > 1 ? (
          <div className="d-flex justify-content-center mb-4">
            <div style={{ width: "300px" }}>
              {renderContentOftable(
                dataLearning,
                currentIndex,
                setCurrentIndex,
                navigate,
                id
              )}
            </div>
          </div>
        ) : null}
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
  id
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
    targetDiv.style.padding = "24px";
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
          <div className="row">
            <div className="col-md-4">
              <div className="info-card">
                <h6 className="text-info">
                  <i className="bi bi-translate me-2"></i>
                  Dịch thô:
                </h6>
                <p className="mb-0" style={{ color: "black" }}>
                  <strong>{ipa02}</strong>
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="info-card">
                <h6 className="text-success">
                  <i className="bi bi-globe-europe-africa me-2"></i>
                  Phiên âm UK:
                </h6>
                <p className="mb-0" style={{ color: "black" }}>
                  <strong>{ipa03}</strong>
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="info-card">
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
