// PracticeGhepAmModal.js
//
// File MỚI — thay cho PracticeGhepAmSection.js (file cũ VẪN GIỮ NGUYÊN,
// không sửa, chỉ không còn được import/render ở LearningHub.js nữa — đúng
// quy tắc "tránh ảnh hưởng logic cũ, tạo file mới dù có dùng lại logic").
//
// Lịch sử điều chỉnh (giữ lại để dễ hiểu vì sao code trông như vậy):
//   1) Trang "Ghép âm" (trước đây là 1 section full-width) → POPUP 85vw x
//      85vh, mở ngay tại chỗ khi bấm vào 1 ô trong bảng câu.
//   2) Nội dung cũ được GIỮ NGUYÊN (câu đang luyện, ô phiên âm, thẻ tham
//      khảo, 4 bước, Dictaphone, kiểm tra âm thanh/mic, Gửi link/Copy
//      link/Bài tập ghép từ #1) nhưng chia thành 3 tab.
//   3) ĐIỀU CHỈNH LẦN NÀY (theo phản hồi mới nhất):
//      - Dictaphone (RegcognitionV2024-05-NG_FOR_TEACHING.js — KHÔNG được
//        sửa vì dùng chung với LearningHub_prac_st_only.js) tự nó có 4 tab
//        NỘI BỘ riêng: "Luyện đọc", "Nghe", "Xem hướng dẫn", "Bảng Ghép âm".
//        3 tab con "Nghe/Xem hướng dẫn/Bảng Ghép âm" đó giờ được dựng LẠI
//        độc lập (tái dùng đúng các component/hàm Dictaphone cũng đang dùng:
//        read_by_Tts, YouTubeVideoSearch, BangUEOAI — KHÔNG đụng Dictaphone)
//        và đặt vào Tab 1 dưới dạng accordion gọn (đóng sẵn, bấm mới mở) để
//        đỡ phải dò qua tab lồng tab. Tab 2 giờ chỉ còn đúng phần "Luyện đọc"
//        (Dictaphone) — vẫn hiện đủ 4 tab nội bộ của Dictaphone vì không thể
//        tách phần đó ra khỏi component cũ mà không sửa file cũ, nhưng vì
//        Nghe/Xem hướng dẫn/Bảng Ghép âm đã có sẵn ở Tab 1 nên gần như không
//        cần bấm vào 3 tab con đó trong Dictaphone nữa.
//      - Tab 3 "Sắp xếp câu" ĐỔI Ý NGHĨA hoàn toàn: KHÔNG còn là sắp xếp lại
//        thứ tự các câu trong bảng nữa, mà là XÁO TRỘN các từ trong câu ĐANG
//        CHỌN (CMDlist) để người học tự sắp xếp lại thành câu hoàn chỉnh —
//        vẫn dùng nút mũi tên ↑/↓ cho từng từ (giữ đúng kiểu thao tác đã chọn
//        trước đó), không kéo-thả.
//      - Thu gọn UI: các phần tham khảo (hướng dẫn video, bảng ghép âm, 4
//        bước) chuyển thành accordion đóng sẵn để giảm scroll, các nút gom
//        gọn lại ở chân popup.
//      - Thẻ "Thông tin tham khảo" RÚT GỌN CÒN ĐÚNG 2 DÒNG: dòng 1 chỉ gồm
//        các icon (Dịch thô/Phiên âm UK/Phiên âm US + icon xóa), bấm 1 icon
//        để CHỌN — dòng 2 hiện nội dung của mục đang chọn kèm nút "+" để dán
//        vào ô phiên âm. Mặc định chọn sẵn "Dịch thô" (nghĩa tiếng Việt).
//        similarityMatcher.js KHÔNG export dữ liệu thô (chỉ trả JSX dựng
//        sẵn) nên không dùng được cho bố cục mới này — thay vào đó dùng lại
//        đúng `ipRef` (kết quả của findIpaReference trong ghepAmProgress.js,
//        vốn đã SAO CHÉP đúng logic so khớp bên trong similarityMatcher.js)
//        để tự dựng UI. Có tự set lại nội dung #DeCode (dùng cho Gửi
//        link/Copy link) giống hệt định dạng similarityMatcher.js đã làm.
//      - Tab 2 "Speech to text" CHỈ CÒN "Luyện đọc" — không cần tab nội bộ
//        nào nữa (khác ý (2) ở trên: Dictaphone không còn được gọi trực tiếp
//        ở Tab 2). Trước đó phải ẩn 3 tab con của Dictaphone bằng CSS
//        !important + tự bấm hộ nút "Luyện đọc" sau khi mount (Dictaphone
//        mặc định mở tab "Bảng Ghép âm") — cách này gượng ép nên đã BỎ HẲN.
//        Thay vào đó, LuyenDocPanel.js (file MỚI) SAO CHÉP lại đúng nội dung
//        + logic case 1 của Dictaphone (không có cách nào import case 1 hay
//        các phần nội bộ ViewRes/isMobileDevice của nó vì không được export),
//        KHÔNG có tab bar, và sửa đúng 1 điểm: nút "XONG GỬI KẾT QUẢ" đặt
//        ngoài điều kiện `listening` nên LUÔN HIỂN THỊ kể cả khi đã tắt mic.
//
// Không sửa/không đụng vào: similarityMatcher.js, micCheck.js, Dictaphone
// (RegcognitionV2024-05-NG_FOR_TEACHING.js), ReadMessage_2024.js,
// YouTubeVideoSearch.js, A1_BangUEOAI.js, App.js — Dictaphone và
// similarityMatcher.js không còn được GỌI trực tiếp ở file này nữa (đã có
// bản sao/tự dựng riêng — LuyenDocPanel.js và khối "Thông tin tham khảo")
// nhưng file gốc vẫn giữ nguyên, không sửa — PracticeGhepAmSection.js cũ và
// LearningHub_prac_st_only.js vẫn dùng chúng bình thường.
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSpeechRecognition } from "react-speech-recognition";
import ReadMessage from "../../../ulti/ReadMessage_2024";
import read_by_Tts from "../../../ulti/readMessage_TtsServer";
import { socket } from "../../../App";
import { kiemtramic } from "../utils/micCheck";
import YouTubeVideoSearch from "../YouTubeVideoSearch";
import BangUEOAI from "../../A1_BangUEOAI";
import LuyenDocPanel from "./LuyenDocPanel";
import {
  findIpaReference,
  isReadCorrect,
  isMatchCorrect,
  shuffleSentenceWords,
  isArrangedCorrectly,
} from "../utils/ghepAmProgress";

const TABS = [
  { id: 1, icon: "bi-lightbulb", label: "Hướng dẫn" },
  { id: 2, icon: "bi-mic", label: "Speech to text" },
  { id: 3, icon: "bi-list-ol", label: "Sắp xếp câu" },
];

// Thẻ "Thông tin tham khảo" rút gọn — mỗi icon đại diện 1 trường trong ipRef
// (kết quả findIpaReference). Mặc định chọn "IPA-02" (nghĩa tiếng Việt).
const REFERENCE_FIELDS = [
  { key: "IPA-02", icon: "bi-translate", label: "Nghĩa (dịch thô)" },
  { key: "IPA-03", icon: "bi-globe-europe-africa", label: "Phiên âm UK" },
  { key: "IPA-04", icon: "bi-globe-americas", label: "Phiên âm US" },
];

// Nhóm "Bảng Ghép âm (quy tắc) / Video hướng dẫn / Gợi ý 4 bước" — trước đây
// là 3 accordion xếp chồng, nay chuyển thành 1 hàng NÚT TAB (giống kiểu tab
// chính ở trên) để bấm chọn nhanh hơn, chỉ hiện đúng 1 nội dung tại 1 thời
// điểm. "Quy tắc" đặt đầu tiên/mặc định chọn sẵn (giữ đúng ưu tiên trước đó).
const GUIDE_TABS = [
  { key: "rules", icon: "bi-grid-3x3-gap", label: "Quy tắc" },
  { key: "video", icon: "bi-camera-video", label: "Video" },
  { key: "steps", icon: "bi-lightbulb", label: "4 bước" },
];

// Accordion gọn — đóng sẵn theo mặc định, dùng cho các phần tham khảo trong
// Tab 1 (video hướng dẫn / 4 bước) để giảm scroll. iconOnly = true: chỉ hiện
// icon đại diện (không hiện chữ tiêu đề — vẫn giữ `title` làm tooltip HTML
// khi rê chuột) để thu gọn tối đa theo yêu cầu "icon đại diện được rồi".
function Accordion({ title, icon, defaultOpen = false, iconOnly = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="gam-accordion">
      <button
        type="button"
        className="gam-accordion-header"
        title={iconOnly ? title : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        {iconOnly ? (
          <i className={`bi ${icon}`}></i>
        ) : (
          <span>
            <i className={`bi ${icon} me-2`}></i>
            {title}
          </span>
        )}
        <i className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
      </button>
      {open ? <div className="gam-accordion-body">{children}</div> : null}
    </div>
  );
}

export default function PracticeGhepAmModal({
  show,
  onClose,
  dataLearning,
  currentIndex,
  CMDlist,
  tableLabel,
  // Tiến trình luyện tập trong phiên hiện tại — NÂNG LÊN LearningHub.js (thay
  // vì state cục bộ ở đây như trước) để LessonTableSection/MauCauSection
  // cũng đọc được, phục vụ tô màu TOÀN BỘ lịch sử các câu đã luyện ở bảng câu
  // (để chụp hình chứng minh đã làm bài). Nhóm theo TỪNG BÀI HỌC
  // (currentIndex) để khi chuyển sang bài khác không bị dính màu của câu bài
  // trước (câu trùng chữ giữa 2 bài, nếu có, sẽ không tô nhầm bài kia):
  // { [currentIndex]: { [câu]: { readCorrect, matchCorrect, arrangeCorrect } } }
  progressByValue,
  setProgressByValue,
}) {
  // Mount-once + class "open" — giữ popup trong DOM sau lần mở đầu tiên để
  // CSS transition chạy mượt cả lúc đóng, không chỉ lúc mở.
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  useEffect(() => {
    if (show) setHasOpenedOnce(true);
  }, [show]);

  // Tab đang chọn — popup không unmount sau lần mở đầu nên tự nhớ lại khi mở
  // lại trong cùng phiên.
  const [activeTab, setActiveTab] = useState(1);

  const ipList = dataLearning?.[currentIndex]?.HDTB?.IP;
  const ipRef = useMemo(
    () => findIpaReference(CMDlist, ipList),
    [CMDlist, ipList],
  );

  // ── Thẻ "Thông tin tham khảo" rút gọn còn 2 dòng: dòng icon để CHỌN mục
  // (Dịch thô/Phiên âm UK/Phiên âm US), dòng nội dung hiện giá trị của mục
  // đang chọn + nút "+" dán vào ô phiên âm. Mặc định chọn "Dịch thô" (nghĩa
  // tiếng Việt); đổi câu (CMDlist) thì chọn lại về mặc định.
  const [activeRefKey, setActiveRefKey] = useState("IPA-02");
  useEffect(() => {
    setActiveRefKey("IPA-02");
  }, [CMDlist]);

  // Nhóm nút tab "Quy tắc / Video / 4 bước" ở cột phải Tab 1 — mặc định
  // chọn "Quy tắc" (xem GUIDE_TABS).
  const [activeGuideTab, setActiveGuideTab] = useState("rules");

  // appendToTextarea/clearTextareaById: SAO CHÉP lại 2 helper thao tác DOM
  // đang nằm bên trong similarityMatcher.js (không export ra để tái dùng) —
  // giữ đúng hành vi cũ (dán nối vào cuối, focus lại con trỏ / xóa + focus).
  const appendToTextarea = (text) => {
    if (!text) return;
    const textarea = document.getElementById("clearClassForTable");
    if (textarea) {
      const current = textarea.value || "";
      textarea.value = current ? current + " " + text : text;
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    }
  };
  const clearTextareaById = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.value = "";
      el.focus();
    }
  };

  // Giữ đúng hành vi cũ: similarityMatcher.js từng ghi nội dung #DeCode mỗi
  // khi tìm được mục tham khảo khớp, để footer (Gửi link/Copy link) đọc làm
  // "note". Nay tự set lại đúng định dạng đó ("IPA-02zzzIPA-03zzzIPA-04") từ
  // ipRef để hành vi Gửi link/Copy link không đổi.
  useEffect(() => {
    const decodeElement = document.getElementById("DeCode");
    if (!decodeElement) return;
    decodeElement.textContent = ipRef
      ? `${ipRef["IPA-02"] || ""}zzz${ipRef["IPA-03"] || ""}zzz${ipRef["IPA-04"] || ""}`
      : "";
  }, [ipRef]);

  // BUG PHÁT HIỆN KHI RÀ LẠI LOGIC: ô nhập phiên âm (#clearClassForTable) là
  // input KHÔNG kiểm soát (uncontrolled — không có `value=`), nên nội dung gõ
  // dở cho câu CŨ vẫn còn nguyên khi đổi sang câu MỚI trong cùng popup, dễ
  // khiến người học tưởng nhầm đang gõ cho câu mới; nút "Bài tập ghép từ #1"
  // cũng đọc thẳng nội dung ô này nên có thể gửi nhầm nội dung của câu trước.
  // Xoá ngay khi đổi câu — KHÔNG gọi .focus() (khác clearTextareaById) để
  // tránh tự cướp focus mỗi lần đổi câu.
  useEffect(() => {
    const textarea = document.getElementById("clearClassForTable");
    if (textarea) textarea.value = "";
  }, [CMDlist]);

  // ── Tab 1: bố cục 2 CỘT NGANG có thể KÉO GIÃN rộng/hẹp (yêu cầu "sắp xếp
  // theo hàng ngang có thể tùy chỉnh rộng hẹp để linh hoạt sử dụng và dễ
  // nhìn"). Cột trái = phần luyện tập chính (câu đang luyện/nghe/nhập phiên
  // âm/thẻ tham khảo); cột phải = tài liệu tham khảo phụ (3 accordion: 4
  // bước, video, bảng ghép âm). tab1LeftPct là % chiều rộng cột trái, kéo
  // thanh chia (.gam-tab1-resizer) để đổi tỉ lệ, giới hạn 30–75% để tránh co
  // hẹp quá mức 1 bên; bấm đúp thanh chia để về lại tỉ lệ mặc định. Trên
  // điện thoại CSS tự chuyển về xếp dọc (xem @media trong LearningHub.css).
  const [tab1LeftPct, setTab1LeftPct] = useState(56);
  const tab1SplitRef = useRef(null);
  const isResizingTab1Ref = useRef(false);
  useEffect(() => {
    const clamp = (v) => Math.min(75, Math.max(30, v));
    const moveTo = (clientX) => {
      if (!isResizingTab1Ref.current || !tab1SplitRef.current) return;
      const rect = tab1SplitRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      setTab1LeftPct(clamp(((clientX - rect.left) / rect.width) * 100));
    };
    const onMouseMove = (e) => moveTo(e.clientX);
    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) moveTo(e.touches[0].clientX);
    };
    const stopResize = () => {
      isResizingTab1Ref.current = false;
      document.body.style.cursor = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopResize);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", stopResize);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopResize);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stopResize);
    };
  }, []);
  const startTab1Resize = () => {
    isResizingTab1Ref.current = true;
    document.body.style.cursor = "col-resize";
  };
  const resetTab1Split = () => setTab1LeftPct(56);

  // ── Tab 1: tự động chấm "ghép đúng" khi gõ / rời khỏi ô phiên âm ─────────
  const matchDebounceRef = useRef(null);
  const runMatchCheck = (text) => {
    if (!CMDlist) return;
    const ok = isMatchCorrect(text, ipRef);
    setProgressByValue((prev) => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        [CMDlist]: { ...prev[currentIndex]?.[CMDlist], matchCorrect: ok },
      },
    }));
  };
  const handleTextareaChange = (e) => {
    const value = e.target.value;
    if (matchDebounceRef.current) clearTimeout(matchDebounceRef.current);
    matchDebounceRef.current = setTimeout(() => runMatchCheck(value), 600);
  };
  const handleTextareaBlur = (e) => runMatchCheck(e.target.value);

  // ── Tab 1: "🔊 Nghe máy đọc" — bản gọn của tab "Nghe" bên trong Dictaphone
  // (dùng lại đúng read_by_Tts mà Dictaphone cũng dùng), có khoá khi đang bật
  // mic (listening) để tránh mic tự thu lại tiếng máy đọc.
  const { listening } = useSpeechRecognition();
  const [isSpeaking, setIsSpeaking] = useState(false);
  // BUG PHÁT HIỆN KHI RÀ LẠI LOGIC: trước đây `isSpeaking` tắt sau đúng 3000ms
  // cố định (setTimeout), chỉ là ước lượng — không khớp thời lượng audio thật
  // (câu dài phát lâu hơn 3s, câu ngắn phát xong sớm hơn 3s). Ngoài ra
  // `isSpeaking` trước đây CHỈ được Tab 1 dùng để tự khoá nút "Nghe" của
  // chính nó — Tab 2 ("Bắt đầu" nói) hoàn toàn không biết máy đang đọc, nên
  // nếu bấm "Nghe" ở Tab 1 rồi LẬP TỨC chuyển sang Tab 2 bấm "Bắt đầu" trong
  // lúc máy vẫn đang đọc, mic sẽ tự thu lại tiếng đọc của máy và có thể tự
  // chấm "đọc đúng" dù người học chưa nói gì.
  //
  // SỬA: dùng đúng cặp callback disableButton/enableButton mà read_by_Tts đã
  // hỗ trợ sẵn (đúng quy ước dùng ở ReadMessage_2024.js) — bật/tắt isSpeaking
  // CHÍNH XÁC theo lúc audio thật sự bắt đầu/kết thúc phát (không đoán nữa),
  // và truyền isSpeaking xuống cả LuyenDocPanel (Tab 2) để khoá nút "Bắt đầu"
  // trong đúng khoảng thời gian máy đang đọc, dù người dùng đang ở tab nào.
  const handleListenTts = () => {
    if (listening || isSpeaking || !CMDlist) return;
    read_by_Tts(
      CMDlist,
      () => {},
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
    );
  };

  // ── Tab 2: chấm "đọc đúng >65%" — CHỈ chấm khi bấm nút "Xong, gửi kết quả"
  // (LuyenDocPanel.js gọi qua prop onFinishReading, truyền đúng transcript
  // tại thời điểm bấm) — bỏ hẳn kiểu tự động chấm nền theo dõi transcript
  // liên tục như trước, cho logic đơn giản, dễ theo dõi hơn.
  const saveReadCorrectIfMatch = useCallback(
    (text) => {
      if (!CMDlist) return;
      if (isReadCorrect(text, CMDlist)) {
        setProgressByValue((prev) => ({
          ...prev,
          [currentIndex]: {
            ...prev[currentIndex],
            [CMDlist]: { ...prev[currentIndex]?.[CMDlist], readCorrect: true },
          },
        }));
      }
    },
    [CMDlist, currentIndex, setProgressByValue],
  );

  // ── Tab 3: trò chơi xếp câu — CHẠM để chọn/bỏ từ (thay vì bấm ↑/↓ đổi chỗ
  // từng từ liền kề như trước — cách cũ khó dùng khi cần dời từ đi xa).
  // `wordPool`: các từ CHƯA chọn (thứ tự xáo trộn) — chạm 1 từ để đưa vào
  // cuối câu đang ghép. `answerWords`: các từ ĐÃ chọn, đúng theo thứ tự chạm
  // — chạm lại 1 từ ở đây để bỏ nó ra (trả về wordPool). Xáo lại mỗi khi đổi
  // câu đang luyện.
  const [wordPool, setWordPool] = useState([]);
  const [answerWords, setAnswerWords] = useState([]);
  useEffect(() => {
    setWordPool(shuffleSentenceWords(CMDlist));
    setAnswerWords([]);
  }, [CMDlist]);
  const reshuffle = () => {
    setWordPool(shuffleSentenceWords(CMDlist));
    setAnswerWords([]);
  };
  const pickWord = (item) => {
    setWordPool((prev) => prev.filter((w) => w.id !== item.id));
    setAnswerWords((prev) => [...prev, item]);
  };
  const unpickWord = (item) => {
    setAnswerWords((prev) => prev.filter((w) => w.id !== item.id));
    setWordPool((prev) => [...prev, item]);
  };
  const arrangedOk = useMemo(
    () => isArrangedCorrectly(answerWords, CMDlist),
    [answerWords, CMDlist],
  );
  useEffect(() => {
    if (!CMDlist || !arrangedOk) return;
    setProgressByValue((prev) => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        [CMDlist]: { ...prev[currentIndex]?.[CMDlist], arrangeCorrect: true },
      },
    }));
  }, [arrangedOk, CMDlist, currentIndex]);

  const currentProgress = progressByValue[currentIndex]?.[CMDlist] || {};

  if (!hasOpenedOnce) return null;

  // ── Nút Gửi link / Copy link — SAO CHÉP nguyên hành vi từ
  // PracticeGhepAmSection.js bản cũ (đọc trực tiếp window.location.search)
  // để vẫn hoạt động đúng bên trong popup.
  const handleSendLink = () => {
    try {
      const idDinhDanh = localStorage.getItem("dinhDanh");
      const nameDinhDanh = localStorage.getItem("nameDinhDanh") || "";
      const decodeElement = document.getElementById("DeCode");
      const DeCodeText = decodeElement ? decodeElement.textContent : "";
      const urlParams = new URLSearchParams(window.location.search);
      const stParam = urlParams.get("st") || "";
      const fullURL =
        window.location.origin +
        "/pracst?st=" +
        stParam +
        "&&note=" +
        encodeURIComponent(DeCodeText);
      const groupChatID = localStorage.getItem("groupChat") || "all";
      socket.emit("message", {
        text: "LUYỆN TẬP CÂU: " + stParam + fullURL,
        time: nameDinhDanh || (idDinhDanh ? idDinhDanh.slice(0, 4) : ""),
        group: groupChatID,
      });
    } catch (error) {
      console.error("Lỗi khi gửi link thực hành:", error);
    }
  };

  const handleCopyLink = (e) => {
    try {
      const decodeElement = document.getElementById("DeCode");
      const DeCodeText = decodeElement ? decodeElement.textContent : "";
      const urlParams = new URLSearchParams(window.location.search);
      const stParam = urlParams.get("st") || "";
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
          button.innerHTML = '<i class="bi bi-check-lg me-2"></i>Đã sao chép!';
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
  };

  const handleSendGhepTuExercise = () => {
    try {
      const element = document.getElementById("clearClassForTable");
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
      const getCurrent = localStorage.getItem("groupChat") || "all";
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
  };

  return (
    <div
      className={`gam-modal-backdrop ${show ? "open" : ""}`}
      onClick={onClose}
    >
      <div className="gam-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="gam-modal-header">
          <h2 className="gam-modal-title">
            <i className="bi bi-music-note-beamed me-2"></i>
            Ghép âm
            {tableLabel ? (
              <span className="text-muted small ms-2">— bảng {tableLabel}</span>
            ) : null}
          </h2>
          <button
            type="button"
            className="gam-modal-close"
            onClick={onClose}
            title="Đóng"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="gam-tabbar" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`gam-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`bi ${tab.icon} me-1`}></i>
              {tab.label}
              {tab.id === 1 && currentProgress.matchCorrect ? (
                <i className="bi bi-check-circle-fill ms-1" style={{ color: "#9333ea" }}></i>
              ) : null}
              {tab.id === 2 && currentProgress.readCorrect ? (
                <i className="bi bi-check-circle-fill ms-1" style={{ color: "#eab308" }}></i>
              ) : null}
              {tab.id === 3 && currentProgress.arrangeCorrect ? (
                <i className="bi bi-check-circle-fill ms-1" style={{ color: "#16a34a" }}></i>
              ) : null}
            </button>
          ))}
        </div>

        <div className="gam-tab-body">
          {/* ── Tab 1: Hướng dẫn — bố cục 2 cột ngang, kéo thanh chia giữa để
              tùy chỉnh rộng/hẹp (cột trái: luyện tập chính; cột phải: tài
              liệu tham khảo). Điện thoại: CSS tự chuyển về xếp dọc. ── */}
          <div className={activeTab === 1 ? "" : "gam-tab-panel-hidden"}>
            <div className="gam-tab1-split" ref={tab1SplitRef}>
              <div className="gam-tab1-col" style={{ width: `${tab1LeftPct}%` }}>
                <div className="info-card gam-compact-card">
                  <div className="text-muted small mb-1 d-flex align-items-center flex-wrap gap-2">
                    <span>
                      <i className="bi bi-chat-quote me-1"></i>Câu đang luyện
                    </span>
                    {currentProgress.matchCorrect ? (
                      <span className="badge" style={{ background: "#9333ea" }}>
                        <i className="bi bi-check-lg"></i> Ghép đúng
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary py-0 px-2 ms-auto"
                      disabled={listening || isSpeaking || !CMDlist}
                      onClick={handleListenTts}
                      title="Nghe máy đọc câu này"
                    >
                      <i className="bi bi-volume-up-fill me-1"></i>
                      {isSpeaking ? "Đang đọc…" : "Nghe"}
                    </button>
                  </div>
                  <h1 id="getCMDLIST" className="practice-sentence">
                    {CMDlist}
                  </h1>
                </div>

                <textarea
                  className="textarea-practice w-100 gam-compact-textarea"
                  id="clearClassForTable"
                  rows="3"
                  placeholder="Nhập phiên âm tại đây…"
                  onChange={handleTextareaChange}
                  onBlur={handleTextareaBlur}
                ></textarea>

                {ipRef ? (
                  <div className="gam-ref-compact">
                    <div className="gam-ref-icons">
                      {REFERENCE_FIELDS.map((f) => (
                        <button
                          key={f.key}
                          type="button"
                          className={`gam-ref-icon-btn ${
                            activeRefKey === f.key ? "active" : ""
                          }`}
                          title={f.label}
                          onClick={() => setActiveRefKey(f.key)}
                        >
                          <i className={`bi ${f.icon}`}></i>
                        </button>
                      ))}
                      <button
                        type="button"
                        className="gam-ref-icon-btn gam-ref-clear-btn ms-auto"
                        title="Xóa nội dung ô phiên âm"
                        onClick={() => clearTextareaById("clearClassForTable")}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                    <div className="gam-ref-value-row">
                      <strong
                        className="gam-ref-value-text"
                        title={ipRef[activeRefKey] || ""}
                      >
                        {ipRef[activeRefKey] || "—"}
                      </strong>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-info py-0 px-1"
                        title="Dán vào ô phiên âm"
                        onClick={() => appendToTextarea(ipRef[activeRefKey])}
                      >
                        <i className="bi bi-plus-lg"></i>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div
                className="gam-tab1-resizer"
                onMouseDown={startTab1Resize}
                onTouchStart={startTab1Resize}
                onDoubleClick={resetTab1Split}
                title="Kéo để chỉnh rộng/hẹp — bấm đúp để về mặc định"
              >
                <i className="bi bi-grip-vertical"></i>
              </div>

              <div
                className="gam-tab1-col"
                style={{ width: `${100 - tab1LeftPct}%` }}
              >
                {/* "Quy tắc / Video / 4 bước" — nhóm nút tab, bấm để chọn
                    nhanh, chỉ hiện đúng 1 nội dung. Mặc định "Quy tắc". */}
                <div className="gam-subtab-bar">
                  {GUIDE_TABS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      className={`gam-subtab-btn ${
                        activeGuideTab === t.key ? "active" : ""
                      }`}
                      onClick={() => setActiveGuideTab(t.key)}
                    >
                      <i className={`bi ${t.icon} me-1`}></i>
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="gam-subtab-panel">
                  {activeGuideTab === "rules" ? <BangUEOAI /> : null}
                  {activeGuideTab === "video" ? (
                    <YouTubeVideoSearch nameSeach={CMDlist} />
                  ) : null}
                  {activeGuideTab === "steps" ? (
                    <>
                      <h6 className="mb-2 fw-bold">
                        <i className="bi bi-lightbulb me-2"></i>4 bước: Đoán –
                        Tra – Tìm – Ghép
                      </h6>
                      <p className="small text-muted mb-2">
                        "Tìm" là tìm đầu tiên · Đọc giữ nhịp theo quy tắc 4
                        ngón bàn tay phải
                      </p>
                      <div className="vowel-guide">
                        <h5 style={{ color: "#4f46e5", margin: 0 }}>
                          <strong>U – E – O – A – i – Ơ</strong>
                        </h5>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* ── Tab 2: Speech to text — CHỈ LÀ "Luyện đọc", không còn tab nội
              bộ nào nữa. Dùng LuyenDocPanel.js (file MỚI, sao chép + chỉnh từ
              case 1 của Dictaphone — xem ghi chú đầu file đó) thay vì
              <Dictaphone CMDlist={CMDlist} /> — bỏ hẳn cách ẩn tab bằng CSS +
              tự bấm hộ nút trước đây (không cần nữa vì component mới này vốn
              không có tab). Nút "XONG GỬI KẾT QUẢ" trong đó luôn hiển thị kể
              cả khi đã tắt mic. ── */}
          <div className={activeTab === 2 ? "" : "gam-tab-panel-hidden"}>
            <LuyenDocPanel
              CMDlist={CMDlist}
              readCorrectSaved={currentProgress.readCorrect}
              onFinishReading={saveReadCorrectIfMatch}
              isActive={show && activeTab === 2}
              // Khoá nút "Bắt đầu" trong lúc Tab 1 đang phát TTS (xem ghi chú
              // ở handleListenTts) — tránh mic tự thu lại tiếng máy đọc dù
              // người dùng đã chuyển sang Tab 2.
              isSpeaking={isSpeaking}
            />
            <Accordion title="Kiểm tra thiết bị" icon="bi-gear">
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
            </Accordion>
          </div>

          {/* ── Tab 3: trò chơi xếp câu — CHẠM để chọn/bỏ từ ── */}
          <div className={activeTab === 3 ? "" : "gam-tab-panel-hidden"}>
            <div className="gam-reorder-legend">
              Chạm vào từng từ theo đúng thứ tự để ghép thành câu — chạm lại
              vào từ đã chọn để bỏ ra.
            </div>
            {arrangedOk ? (
              <div className="gam-scramble-success">
                <i className="bi bi-check-circle-fill me-2"></i>
                Chính xác! Bạn đã sắp xếp đúng câu.
              </div>
            ) : null}

            <div className="gam-scramble-section-label">Câu của bạn</div>
            <div className="gam-scramble-answer-row">
              {answerWords.length === 0 ? (
                <span className="gam-scramble-answer-empty">
                  Chạm từ bên dưới để bắt đầu…
                </span>
              ) : (
                answerWords.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className="gam-scramble-chip gam-scramble-answer-chip"
                    title="Chạm để bỏ từ này ra"
                    onClick={() => unpickWord(item)}
                  >
                    <span className="gam-scramble-word">{item.word}</span>
                  </button>
                ))
              )}
            </div>

            <div className="gam-scramble-section-label">Chọn từ</div>
            <div className="gam-scramble-row">
              {wordPool.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="gam-scramble-chip gam-scramble-pool-chip"
                  title="Chạm để thêm vào câu"
                  onClick={() => pickWord(item)}
                >
                  <span className="gam-scramble-word">{item.word}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary mt-2"
              onClick={reshuffle}
            >
              <i className="bi bi-shuffle me-1"></i>Xáo lại
            </button>
          </div>
        </div>

        {/* ── Chân popup: nút điều khiển chung, hiện ở mọi tab ── */}
        <div className="gam-modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-modern btn-gradient-info"
          >
            <i className="bi bi-x-lg me-2"></i>Đóng
          </button>
          <button
            type="button"
            onClick={handleSendLink}
            className="btn btn-modern btn-gradient-warning"
          >
            <i className="bi bi-share me-2"></i>Gửi link
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className="btn btn-modern btn-gradient-info"
          >
            <i className="bi bi-clipboard me-2"></i>Copy link
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-info py-0 px-1"
            title="Gửi bài tập"
            onClick={handleSendGhepTuExercise}
          >
            Bài tập ghép từ #1
          </button>
        </div>
        <i id="DeCode" className="d-none"></i>
      </div>
    </div>
  );
}
