import React, { useEffect, useState, useContext } from "react";
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
import PracticeGhepAmSection from "./LearningHub/sections/PracticeGhepAmSection";
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
              />

              <PracticeGhepAmSection
                id={id}
                currentIndex={currentIndex}
                navigate={navigate}
                params={params}
                choose_a_st={choose_a_st}
                CMDlist={CMDlist}
                dataLearning={dataLearning}
              />

              <NguyenTacSection />

              <MauCauSection
                dataLearning={dataLearning}
                currentIndex={currentIndex}
                navigate={navigate}
                id={id}
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
          </section>
        </div>
      </HelmetProvider>
    </>
  );
};
export default LearningHub;
