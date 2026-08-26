import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
// import T0_linkApi from "../ulti/T0_linkApi";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import NewListHref from "./A1_Header_href_EslConversation.json";
import HrefImages from "./A1_Header_href_WithImages.json";
import HrefLearnonyoutube from "./A1_Header_href_Learnonyoutube.json";
import Move from "./A0_move";

import levele_img_barlist from "./header_data/hinhanh-lv1-5-5.json";
import words_3000 from "./header_data/3000-words.json";

import a_prac_100 from "./header_data/a_prac_100.json";
import yy1A from "./header_data/yy1A.json";
const coreKnowledgeSets = [
  {
    root: "coreknowledge",
    preName: "",
    name: "Thông tin - Kiến thức về Ghép âm - tách âm",
    link: "ghep-tach-am",
    id: "socapI",
  },
];

const prac_to_work = [
  {
    root: "learninghub",
    preName: "",
    name: "MC Chương trình: Tư vấn và chia sẻ thói quen tốt. (I).",
    link: "mc_about_lesson_peopleshouldpractice",
    id: "socapI",
  },

  {
    root: "learninghub",
    preName: "",
    name: "Luyện tập phỏng vấn theo kịch bản.",
    link: "interview_w_foreign_teacher",
    id: "socapI",
  },
  {
    root: "learninghub",
    preName: "",
    name: "Khái niệm về mô hình doanh nghiệp (Canvas model).",
    link: "t1-canvas-model",
    id: "socapI",
  },
];

const pracEnSets = [
  {
    root: "learninghub",
    preName: "Ghép âm:",
    name: "Làm quen cơ bản",
    link: "ueoai-01",
    id: "socapI",
  },
  {
    root: "learninghub",
    preName: "Ghép âm",
    name: "Beginning training!",
    link: "ga_beginning_training",
    id: "socap1",
  },
  {
    root: "learninghub",
    preName: "Ghép âm",
    name: "Nguyên âm đôi (Full.Table)",
    link: "ket_nguyenamdoi_01",
    id: "socap1",
  },
  {
    root: "learninghub",
    preName: "Ghép âm",
    name: "Nguyên âm đôi (No.Table)",
    link: "ket_nguyenamdoi_01b",
    id: "socap1",
  },
  {
    root: "learninghub",
    preName: "Ghép âm",
    name: "Luyện nghe và lặp lại cụm từ",
    link: "ket_nguyenamdoi_repeat_01A",
    id: "socap1",
  },
  {
    root: "learninghub",
    preName: "Information Framework",
    name: "KET A2-key Speaking Part 1",
    link: "infoFramework_KET_001",
    id: "socap1",
  },
  {
    root: "learninghub",
    preName: "Information Framework",
    name: "KET A2-key Speaking Part 1 (Dịch)",
    link: "infoFramework_KET_001_dich_tv",
    id: "socap1",
  },
  {
    root: "learninghub",
    preName: "Sentence patterns",
    name: "Marie Curie",
    link: "ps_001",
    id: "socap1",
  },
  {
    root: "learninghub",
    preName: "(D) Vỡ lòng",
    name: "40 câu hỏi và trả lời",
    link: "yyy_0a1",
    id: "socapI",
  },
  {
    root: "learninghub",
    preName: "(D) Vỡ lòng",
    name: "Các câu cơ bản ver.01",
    link: "endp01_a",
    id: "socapI",
  },
  {
    root: "learninghub",
    preName: "(D) Vỡ lòng",
    name: "Các câu cơ bản ver.01 (full sentence)",
    link: "endp01_a_full",
    id: "socapI",
  },
  {
    root: "learninghub",
    preName: "(D) Sơ cấp A",
    name: "Chủ đề ăn uống - nhà hàng",
    link: "endpsc_nh_a",
    id: "socapI",
  },

  // {
  //   root: "learninghub",
  //   preName: "(C) Phản xạ: ",
  //   name: "Vỡ lòng",
  //   link: "phanxa_lv1",
  //   id: "socapI",
  // },
  {
    root: "learninghub",
    preName: "(D) Trung cấp: ",
    name: "Công việc tại nhà hàng (A)",
    link: "endp_res_inter_01",
    id: "interI",
  },

  {
    root: "learninghub",
    preName: "TA01:",
    name: "Tiếng anh lớp 1 - NXB Giáo dục",
    link: "ta_01_nxb_giaoduc",
    id: "socapI",
  },
  {
    root: "learninghub",
    preName: "Khóa Sơ cấp:",
    name: "Cùng thực hành nghe nói 10 chủ đề giao tiếp cơ bản",
    link: "elementary-a1-lesson-plan-ver01",
    id: "socapI",
  },
  {
    root: "learninghub",
    preName: "Khóa tiêu chuẩn:",
    name: "Cùng thực hành nghe nói chủ đề: Ăn - Ở - Đi lại",
    link: "restaurant-hotel-travel",
    id: "socapII",
  },
  {
    root: "learninghub",
    preName: "Nội dung:",
    name: "13 kỹ năng cho bạn trẻ: Sống tốt đẹp.",
    link: "lessons-young-people-should-practice",
    id: "socapII",
  },

  {
    root: "learninghub",
    preName: "For parents:",
    name: "Các nội dung thân thuộc với trẻ em",
    link: "parents-and-kids",
    id: "socapII",
  },

  {
    root: "learninghub",
    preName: "Cơ bản:",
    name: "14 chủ đề giao tiếp cơ bản",
    link: "a1_14_basic_subjects",
    id: "socapII",
  },
  {
    root: "learninghub",
    preName: "Kiến thức",
    name: "Khái niệm về mô hình doanh nghiệp (Canvas model).",
    link: "t1-canvas-model",
    id: "socapI",
  },
  {
    root: "learninghub",
    preName: "Rèn luyện tích cực ",
    name: "5 household items (1) [Imgx10x5]",
    link: "a155-household-items",
    id: "socapII",
  },
  {
    root: "learninghub",
    preName: "Rèn luyện tích cực",
    name: "Food and eating [Tbx30x10]",
    link: "esl_food_and_eating",
    id: "socapII",
  },
  {
    root: "learninghub",
    preName: "Rèn luyện tích cực",
    name: "5 summer fruits (1) [Imgx50x5]",
    link: "b1_summer_fruit_01",
    id: "trungcapI",
  },
  {
    root: "learninghub",
    preName: "Rèn luyện tình huống",
    name: "40 tình huống thông dụng",
    link: "yyy_a1",
    id: "socapI",
  },
  {
    root: "learninghub",
    preName: "KET A2 Part 01",
    name: "100 notices and messages",
    link: "yyy_ket_part1",
    id: "socapI",
  },
  {
    root: "learninghub",
    preName: "IELTS aim 6.0",
    name: "Speaking Part 2 | Discussion/Opinion Presentation + 12 tences",
    link: "yyy_speaking_12_tences",
    id: "trungcap1",
  },
  {
    root: "learninghub",
    preName: "Phản xạ nâng cao",
    name: "Luyện phản xạ đặt câu hỏi (1)",
    link: "0a_y1",
    id: "trungcap1",
  },
  {
    root: "learninghub",
    preName: "Phản xạ nâng cao",
    name: "Luyện phản xạ đặt câu hỏi (1a)",
    link: "0a_y1a",
    id: "trungcap1",
  },

  {
    root: "learninghub",
    preName: "Phản xạ nâng cao",
    name: "Luyện bảng tiếng việt (1b)",
    link: "0a_y1b",
    id: "trungcap1",
  },
  {
    root: "learninghub",
    preName: "Phản xạ nâng cao",
    name: "Luyện tổ hợp câu, nhận biết yếu tố mở rộng (1c)",
    link: "0a_y1c",
    id: "trungcap1",
  },
  {
    root: "learninghub",
    preName: "Phản xạ nâng cao",
    name: "Luyện phản xạ đặt câu hỏi (2)",
    link: "0a_y1",
    id: "trungcap1",
  },
  {
    root: "learninghub",
    preName: "Phản xạ nâng cao",
    name: "Luyện phản xạ đặt câu hỏi (2a)",
    link: "0a_y1",
    id: "trungcap1",
  },
  {
    root: "learninghub",
    preName: "Phản xạ nâng cao",
    name: "Luyện phản xạ đặt câu hỏi (2b)",
    link: "0a_y1",
    id: "trungcap1",
  },
  {
    root: "learninghub",
    preName: "Phản xạ nâng cao",
    name: "Luyện phản xạ đặt câu hỏi (3)",
    link: "0a_y1",
    id: "trungcap1",
  },
  {
    root: "learninghub",
    preName: "Phản xạ nâng cao",
    name: "Luyện phản xạ đặt câu hỏi (3a)",
    link: "0a_y1",
    id: "trungcap1",
  },
  {
    root: "learninghub",
    preName: "Phản xạ nâng cao",
    name: "Luyện phản xạ đặt câu hỏi (3b)",
    link: "0a_y1",
    id: "trungcap1",
  },
  {
    root: "learninghub",
    preName: "Learning A2",
    name: "Thực hành nghe, xử lý và lặp lại |Chủ đề: Mô tả với bố cục",
    link: "yyy_mota_bo_cuc_4",
    id: "trungcap1",
  },
];

export default function Header({ sttRoom, STTcfonnectFN }) {
  if (sttRoom) {
    return null;
  }

  return (
    <>
      <style>{`
        .app-header-fixed {
          position: fixed;
          width: 100%;
          height: 8vh;
          top: 0;
          z-index: 1030;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
        }
        .app-header-fixed .navbar {
          background: transparent !important;
          height: 8vh;
          padding-top: 0.25rem;
          padding-bottom: 0.25rem;
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        .app-brand-text {
          font-size: 17px;
          font-weight: 700;
          color: #4f46e5;
          letter-spacing: -0.01em;
        }
        .app-header-fixed .navbar-toggler {
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.35rem 0.6rem;
        }
        .app-header-fixed .navbar-toggler:focus {
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.18);
        }
        .app-header-fixed .nav-link,
        .app-header-fixed .dropdown-toggle {
          color: #1e293b !important;
          font-weight: 500;
          border-radius: 10px;
          padding: 0.5rem 0.9rem !important;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .app-header-fixed .nav-link:hover,
        .app-header-fixed .dropdown-toggle:hover,
        .app-header-fixed .show > .dropdown-toggle {
          background: #eef2ff;
          color: #4f46e5 !important;
        }
        .app-header-fixed .dropdown-menu {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 10px 40px rgba(15, 23, 42, 0.12);
          padding: 0.4rem;
          min-width: 320px;
        }
        .app-header-fixed .dropdown-item {
          border-radius: 10px;
          padding: 0.55rem 0.75rem;
          white-space: normal;
          line-height: 1.45;
          color: #1e293b;
        }
        .app-header-fixed .dropdown-item:hover,
        .app-header-fixed .dropdown-item:focus {
          background: #eef2ff;
          color: #3730a3;
        }
        .app-dd-prename {
          display: inline-block;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 0.72rem;
          font-weight: 600;
          font-style: normal;
          padding: 0.12rem 0.5rem;
          border-radius: 999px;
          margin-right: 0.4rem;
          white-space: nowrap;
          vertical-align: middle;
        }
        /* Menu mở trên mobile: nền trắng đặc, cuộn được */
        @media (max-width: 991.98px) {
          .app-header-fixed .navbar-collapse {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            box-shadow: 0 10px 40px rgba(15, 23, 42, 0.15);
            margin-top: 0.4rem;
            padding: 0.5rem;
            max-height: 80vh;
            overflow-y: auto;
          }
        }
      `}</style>
      <div className="app-header-fixed">
        <div>
          <Navbar bg="light" expand="lg">
            <Navbar.Brand>
              <Link
                to="/"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img
                  src="https://i.postimg.cc/Bv9MGGy8/favicon-ico.png"
                  width={42}
                  height={42}
                  style={{ marginRight: 10, borderRadius: 10 }}
                  alt="Logo PVD"
                />
                <b className="app-brand-text">Môi trường để rèn luyện</b>
              </Link>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mr-auto">
                {returnDropdown(
                  "Học 2",
                  coreKnowledgeSets,
                  { name: "name", link: "link", preName: "preName" },
                  null,
                )}
                {/* {returnDropdown(
                  "Sử dụng tiếng anh",
                  prac_to_work,
                  { name: "name", link: "link", preName: "preName" },
                  null
                )} */}
                {returnDropdown(
                  "Rèn 8",
                  pracEnSets.concat(
                    yy1A,
                    levele_img_barlist,
                    words_3000,
                    a_prac_100,
                  ),
                  { name: "name", link: "link", preName: "preName" },
                  null,
                )}{" "}
                {/* {returnDropdown(
                  "Khác",
                  levele_img_barlist.concat(words_3000, a_prac_100),
                  { name: "name", link: "link", preName: "preName" },
                  null,
                )} */}
                {/* {returnDropdown(
                  "Học 3000 từ với đoạn hội thoại và câu chuyện!",
                  words_3000,
                  { name: "name", link: "link", preName: "preName" },
                  null
                )} */}
                {/* {returnDropdown(
                  "ESL",
                  NewListHref.concat(HrefImages, HrefLearnonyoutube),
                  { name: "name", link: "link", preName: "preName" },
                  null
                )} */}
                {/* {returnDropdown(
                  "Từ vựng và Hình ảnh",
                  HrefImages,
                  { name: "name", link: "link", preName: "preName" },
                  null
                )} */}
                {/* {returnDropdown(
                  "Learn on youtube",
                  HrefLearnonyoutube,
                  { name: "name", link: "link", preName: "preName" },
                  null
                )} */}
                {/* {returnDropdown(
                  "Khác",
                  [
                    {
                      name: "Cấu hình cài đặt",
                      root: "setting",
                      link: "",
                      preName: "",
                    },
                    {
                      name: "Các đường dẫn bài học hôm nay",
                      root: "link",
                      link: "",
                      preName: "",
                    },
                  ],
                  { name: "name", link: "link" },
                  null
                )} */}
              </Nav>
              {/* <Move /> */}
            </Navbar.Collapse>
          </Navbar>
        </div>
      </div>
    </>
  );
}

function returnDropdown(name, inputSets, keysSets, link) {
  return (
    <NavDropdown
      title={name}
      id="basic-nav-dropdown"
      // className="dropup" // Thêm lớp "dropup" để tạo drop-up
    >
      <div
        style={{
          maxHeight: "60vh",
          overflowY: "auto",
          overflowX: "hidden",
          width: "100%",
        }}
      >
        {inputSets.map((e, i) =>
          (() => {
            const urlPath =
              e.root !== null
                ? `/${e.root}/` + e[keysSets.link] + `?ls=0`
                : `/${e[keysSets.link]}?ls=0`;
            return (
              <NavDropdown.Item key={i} as={Link} to={urlPath}>
                {e[keysSets.preName] ? (
                  <span className="app-dd-prename">{e[keysSets.preName]}</span>
                ) : null}
                {e[keysSets.name]}
              </NavDropdown.Item>
            );
          })(),
        )}
      </div>
    </NavDropdown>
  );
}
