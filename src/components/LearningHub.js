import React, { useEffect, useState, useContext, useMemo } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import TableTB from "./pracPages/B101_FINAL_TABLE-TB-NotAdd";
import read_by_Tts from "../ulti/readMessage_TtsServer";
import "./LearningHub.css";
import LoadingScreen from "./shared/LoadingScreen";
import ErrorScreen from "./shared/ErrorScreen";
import { handle_div } from "./LearningHub/utils/domSectionToggle";
import { arrayToString } from "./LearningHub/utils/renderHelpers";
import { renderContentOftable } from "./LearningHub/utils/lessonTable";
import ContentSection from "./LearningHub/sections/ContentSection";
import LessonTableSection from "./LearningHub/sections/LessonTableSection";
// PracticeGhepAmSection.js (file cũ, full-width) KHÔNG còn được render nữa —
// theo yêu cầu mới "trang Ghép âm điều chỉnh thành popup 85x85", đã thay
// bằng PracticeGhepAmModal.js (file MỚI) bên dưới. File cũ vẫn giữ nguyên,
// không xoá, không sửa — chỉ không import/render ở đây nữa.
import PracticeGhepAmModal from "./LearningHub/sections/PracticeGhepAmModal";
import NguyenTacSection from "./LearningHub/sections/NguyenTacSection";
import MauCauSection from "./LearningHub/sections/MauCauSection";
import PhuongPhapHocSection from "./LearningHub/sections/PhuongPhapHocSection";
import CustomLinkSection from "./LearningHub/sections/CustomLinkSection";
import ThucHanhSection from "./LearningHub/sections/ThucHanhSection";

// Danh sách chức năng — dùng chung cho thanh điều hướng dạng pill
const NAV_ITEMS = [
  {
    value: "div_01_content_table_to_practice",
    icon: "bi-table",
    label: "Chọn bài học",
    step: "1",
  },
  // {
  //   value: "div_01_prac_ghep_am",
  //   icon: "bi-music-note-beamed",
  //   label: "Ghép âm",
  // },
  // { value: "div_01_content_to_learn", icon: "bi-book", label: "Nội dung" },
  // {
  //   value: "div_01_prac_luyen_am",
  //   icon: "bi-chat-square-text",
  //   label: "Nguyên tắc ghép âm",
  // },
  // { value: "div_01_prac_hoc_thuoc", icon: "bi-lightbulb", label: "Mẫu câu" },
    // {
    //   value: "div_01_prac_phuongphaphoc",
    //   icon: "bi-mortarboard",
    //   label: "Phương pháp học",
    // },
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
  const [CMDlist, setCMDlist] = useState("Hi how are you");
  const [StartToGetData, setStartToGetData] = useState(false);
  const navigate = useNavigate();

  // ── Popup "Ghép âm" (thay cho trang full-width cũ) ─────────────────────
  const [showGhepAm, setShowGhepAm] = useState(false);
  const [ghepAmTableLabel, setGhepAmTableLabel] = useState("");
  // Bấm vào 1 ô trong bảng câu (LessonTableSection/MauCauSection) gọi hàm
  // này để MỞ POPUP — tableLabel chỉ để hiển thị "đang mở từ bảng nào" trên
  // tiêu đề popup (Tab 3 giờ là trò chơi xáo trộn từ của CÂU ĐANG CHỌN, không
  // còn cần danh sách rows của cả bảng nữa).
  const handleOpenGhepAm = (tableLabel) => {
    setGhepAmTableLabel(tableLabel || "");
    setShowGhepAm(true);
  };

  // Tiến trình luyện tập trong phiên hiện tại (mất khi tải lại trang) —
  // NÂNG LÊN từ PracticeGhepAmModal.js (trước đây là state cục bộ trong đó)
  // để LessonTableSection/MauCauSection cũng đọc được, phục vụ tô màu TOÀN
  // BỘ lịch sử các câu đã luyện ở bảng câu (mục tiêu: làm xong chụp hình lại
  // chứng minh đã làm bài tập) — "Chỉ 2 màu: đọc đúng + sắp xếp đúng".
  // Nhóm theo TỪNG BÀI HỌC (currentIndex) để khi chuyển sang bài khác không
  // bị dính màu của câu bài trước:
  // { [currentIndex]: { [câu]: { readCorrect, matchCorrect, arrangeCorrect } } }
  const [progressByValue, setProgressByValue] = useState({});
  // Chỉ lấy đúng phần của bài học đang mở — truyền xuống bảng câu để tô màu.
  const currentLessonProgress = useMemo(
    () => progressByValue[currentIndex] || {},
    [progressByValue, currentIndex],
  );

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

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen />;
  }

  return (
    <>
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
            <div className="lh-nav-row">
              {/* Chọn bài học — đặt riêng, kề bên trái nút "Chọn bài học",
                  không phải pill, để phân biệt với các nút điều hướng */}
              <div className="lh-lesson-picker">
                {dataLearning.length > 1 ? (
                  renderContentOftable(
                    dataLearning,
                    currentIndex,
                    setCurrentIndex,
                    navigate,
                    id,
                  )
                ) : (
                  <span className="lh-lesson-picker-name">
                    Bài học: {dataLearning[0]?.SEO?.seo?.metaTitle || ""}
                  </span>
                )}
              </div>

              <nav className="lh-nav" aria-label="Chức năng học tập">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeId === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      className={`lh-pill ${isActive ? "active" : ""}`}
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
                  );
                })}
              </nav>
            </div>

            <div className="d-flex">
              <ContentSection
                dataLearning={dataLearning}
                currentIndex={currentIndex}
              />

              <LessonTableSection
                dataLearning={dataLearning}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
                navigate={navigate}
                id={id}
                onOpenGhepAm={handleOpenGhepAm}
                progressMap={currentLessonProgress}
              />

              <NguyenTacSection />

              <MauCauSection
                dataLearning={dataLearning}
                currentIndex={currentIndex}
                navigate={navigate}
                id={id}
                onOpenGhepAm={handleOpenGhepAm}
                progressMap={currentLessonProgress}
              />

              <PhuongPhapHocSection />

              <CustomLinkSection
                id={id}
                currentIndex={currentIndex}
                dataLearning={dataLearning}
              />

              <ThucHanhSection
                STTPractice={STTPractice}
                dataLearning={dataLearning}
                STTconnectFN={STTconnectFN}
                setSttRoom={setSttRoom}
                id={id}
                currentIndex={currentIndex}
                setSTTPractice={setSTTPractice}
              />
            </div>

            <PracticeGhepAmModal
              show={showGhepAm}
              onClose={() => setShowGhepAm(false)}
              dataLearning={dataLearning}
              currentIndex={currentIndex}
              CMDlist={CMDlist}
              tableLabel={ghepAmTableLabel}
              progressByValue={progressByValue}
              setProgressByValue={setProgressByValue}
            />
          </section>
        </div>
      </HelmetProvider>
    </>
  );
};
export default LearningHub;
