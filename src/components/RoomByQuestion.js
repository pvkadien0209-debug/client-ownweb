import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import stringSimilarity from "string-similarity";

/* ════════════════════════════════════════════════════════════════════
   RoomByQuestion — trang cho route MỚI:

     <Route
       path="/roombyquestion/:roomCode/:currentIndex"
       element={<RoomByQuestion />}
     />

   Đây là bản ĐƠN GIẢN HÓA của RoomOffline.js, đáp ứng đúng 5 yêu cầu:

   1) Vẫn fetch dữ liệu bằng ĐÚNG cơ chế cũ:
        - "z" ở vị trí thứ 2 của roomCode → /jsonData/forseo/{roomCode}.json
        - ngược lại                        → /jsonData/{roomCode}.json
      NHƯNG không còn gọi `interleaveCharacters()` (hàm cũ có bước
      `getArrayElements(..., numberCut, numberGetPerOne)` — bước này RANDOM
      hoá 1 số cắt (numberCut) rồi xoay vòng + cắt bớt mảng, cộng thêm
      `generateRandomArray` để tạo thứ tự hiển thị). Ở đây thay bằng
      `flattenAllQuestions()` bên dưới: duyệt & lấy TOÀN BỘ
      data_all → charactor[] → data[] theo đúng thứ tự gốc trong JSON,
      không cắt, không random.
   2) Mỗi câu hỏi hiển thị dạng danh sách; `fsp`/`qs` là nút bấm để NGHE,
      phát file mp3 tĩnh — dùng lại chính xác quy ước dựng đường dẫn file
      trong `playAudio()` của ReadMessage_2024.js:
        - có dấu "_"      → /audio/{phầnTrướcDấu_}/{filename}.mp3
        - bắt đầu bằng "B" (không có "_") → /audio/T1A1/{filename}.mp3
        - còn lại          → /audio/{filename}.mp3
      (xem hàm `buildAudioUrl` bên dưới — KHÔNG gọi lại `playAudio()` gốc
      vì hàm đó bị buộc chặt với các nút DOM cũ như RegButton/BtnFsp/
      sttStopBTN, không cần cho trang đơn giản này).
   3) Bấm vào 1 câu → mở hộp Speech-to-Text để trả lời. Đúng → đánh dấu
      hoàn thành + Điểm đúng; sai → +Điểm sai (không khoá, trả lời lại
      được). Điểm & tiến trình lưu localStorage riêng theo từng roomCode.
   3a) Nút nhỏ Hiện/Ẩn "Bảng" (chế độ xem nhanh toàn bộ câu, không cần trả
      lời — giữ lại tinh thần màn hình "qstable" cũ). Khi Bảng đang mở là
      lớp phủ cố định (position: fixed), khoá cuộn trang nền — CHỈ tắt
      được bằng chính nút đó.
   4) Bố cục tối giản, ưu tiên điện thoại: danh sách dọc, nút to, overlay
      full-screen, không dùng nhiều cột.
   5) Chỉ hiển thị "Sẵn sàng lắng nghe" khi mic đã thật sự khởi động
      (`listening === true` từ react-speech-recognition, tức sau khi
      engine bắn sự kiện onstart) — không hiển thị lạc quan ngay khi vừa
      bấm nút.

   CẦN THÊM VÀO ROUTER (App.js hoặc file khai báo Route hiện có), đặt gần
   Route của /roomoffline/:
     <Route
       path="/roombyquestion/:roomCode/:currentIndex"
       element={<RoomByQuestion />}
     />
════════════════════════════════════════════════════════════════════ */

const MATCH_THRESHOLD = 0.72; // ngưỡng coi là trả lời đúng
const STT_LANG = "en-US";

/* ── Chuẩn hoá text trước khi so khớp ─────────────────────────────── */
function normalizeText(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[.?!,]/g, "")
    .replace(/\s+/g, " ");
}

/* ── Dựng URL mp3 tĩnh — SAO Y quy ước trong playAudio() của
   ReadMessage_2024.js, chỉ bỏ phần disableButton/enableButton vì trang
   này không dùng các nút DOM cũ (RegButton, BtnFsp, sttStopBTN...).
──────────────────────────────────────────────────────────────────── */
function buildAudioUrl(filename) {
  if (!filename || typeof filename !== "string") return null;
  let base = "/audio/";
  if (filename.includes("_")) {
    base += filename.split("_")[0] + "/";
  } else if (filename.startsWith("B")) {
    base += "T1A1/";
  }
  return `${base}${filename}.mp3`;
}

/* ── localStorage helpers (tự chứa, không phụ thuộc file khác) ────── */
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // bỏ qua lỗi quota / private mode
  }
}

/* ── Duyệt TOÀN BỘ data_all → charactor[] → data[], KHÔNG cắt/không
   random — đúng yêu cầu 1 ("lấy đầy đủ, không sort").
   `topicIndexFilter`: nếu truyền vào 1 số hợp lệ, chỉ lấy đúng topic đó
   (dùng khi URL có :currentIndex và người dùng muốn xem riêng 1 phần);
   để trống / null → lấy TẤT CẢ topic trong file JSON.
──────────────────────────────────────────────────────────────────── */
function flattenAllQuestions(dataAll, topicIndexFilter) {
  const rows = [];
  if (!Array.isArray(dataAll)) return rows;

  dataAll.forEach((topic, topicIndex) => {
    if (
      topicIndexFilter !== null &&
      topicIndexFilter !== undefined &&
      topicIndex !== topicIndexFilter
    ) {
      return;
    }
    const charactorList = Array.isArray(topic?.charactor)
      ? topic.charactor
      : [];
    charactorList.forEach((group, groupIndex) => {
      const items = Array.isArray(group?.data) ? group.data : [];
      items.forEach((item, itemIndex) => {
        rows.push({
          key: `${topicIndex}-${groupIndex}-${itemIndex}`,
          topicIndex,
          groupIndex,
          itemIndex,
          group,
          item,
        });
      });
    });
  });
  return rows; // đúng thứ tự gốc trong JSON, đầy đủ 100%
}

/* ════════════════════════════════════════════════════════════════════
   Nút audio (mp3 tĩnh)
════════════════════════════════════════════════════════════════════ */
function AudioButton({ label, entry }) {
  const [playing, setPlaying] = useState(false);
  const url = buildAudioUrl(entry?.id);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (!url) return;
    try {
      const audio = new Audio(url);
      setPlaying(true);
      audio.onended = () => setPlaying(false);
      audio.onerror = () => setPlaying(false);
      audio.play().catch(() => setPlaying(false));
    } catch {
      setPlaying(false);
    }
  };

  return (
    <button
      type="button"
      className={`rbq-audio-btn ${playing ? "rbq-audio-playing" : ""}`}
      onClick={handlePlay}
      disabled={!url}
      title={url ? "Bấm để nghe" : "Chưa có file audio"}
    >
      <i
        className={`bi ${playing ? "bi-volume-up-fill" : "bi-play-circle-fill"}`}
      />
      <span className="rbq-audio-label">{label}</span>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════
   COMPONENT CHÍNH — trang cho route /roombyquestion/:roomCode/:currentIndex
════════════════════════════════════════════════════════════════════ */
const RoomByQuestion = () => {
  const { roomCode, currentIndex } = useParams();
  const navigate = useNavigate();

  const [rawData, setRawData] = useState(null);
  const [loadError, setLoadError] = useState(false);

  const [boardOpen, setBoardOpen] = useState(false);
  const [scoreCorrect, setScoreCorrect] = useState(0);
  const [scoreWrong, setScoreWrong] = useState(0);
  const [doneMap, setDoneMap] = useState({});
  const [openKey, setOpenKey] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const {
    transcript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const CORRECT_KEY = `rbq_correct_${roomCode}`;
  const WRONG_KEY = `rbq_wrong_${roomCode}`;
  const DONE_KEY = `rbq_done_${roomCode}`;

  /* ── 1) Fetch dữ liệu — ĐÚNG cơ chế cũ (forseo / thường theo roomCode) */
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoadError(false);
      try {
        const isSeo = roomCode && roomCode.charAt(1) === "z";
        const url = isSeo
          ? `/jsonData/forseo/${roomCode}.json`
          : `/jsonData/${roomCode}.json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Network response was not ok");
        const json = await res.json();
        if (!cancelled) setRawData(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("Lỗi tải dữ liệu roombyquestion:", err);
        if (!cancelled) setLoadError(true);
      }
    }
    if (roomCode) loadData();
    return () => {
      cancelled = true;
    };
  }, [roomCode]);

  /* Không sort / không cắt — lấy đầy đủ toàn bộ topic trong file JSON */
  const rows = useMemo(() => flattenAllQuestions(rawData, null), [rawData]);
  const totalCount = rows.length;

  /* ── Nạp điểm & tiến trình đã lưu theo roomCode ─────────────────── */
  useEffect(() => {
    setScoreCorrect(readJSON(CORRECT_KEY, 0));
    setScoreWrong(readJSON(WRONG_KEY, 0));
    setDoneMap(readJSON(DONE_KEY, {}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  /* ── Khoá cuộn trang nền khi Bảng đang mở (yêu cầu 3a) ───────────── */
  useEffect(() => {
    if (!boardOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [boardOpen]);

  useEffect(() => {
    if (!boardOpen && openKey) {
      SpeechRecognition.stopListening();
      setOpenKey(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardOpen]);

  const persistScore = useCallback(
    (correct, wrong, done) => {
      writeJSON(CORRECT_KEY, correct);
      writeJSON(WRONG_KEY, wrong);
      writeJSON(DONE_KEY, done);
    },
    [CORRECT_KEY, WRONG_KEY, DONE_KEY],
  );

  const handleResetProgress = () => {
    setScoreCorrect(0);
    setScoreWrong(0);
    setDoneMap({});
    persistScore(0, 0, {});
  };

  /* ── 3) Bấm câu → mở hộp STT để trả lời ─────────────────────────── */
  const startAnswering = (row) => {
    if (doneMap[row.key]) return;
    resetTranscript();
    setLastResult(null);
    setOpenKey(row.key);
    try {
      SpeechRecognition.startListening({
        continuous: false,
        language: STT_LANG,
      });
    } catch {
      // trình duyệt không hỗ trợ / bị chặn quyền mic
    }
  };

  const cancelAnswering = () => {
    SpeechRecognition.stopListening();
    setOpenKey(null);
  };

  const submitAnswer = (row) => {
    SpeechRecognition.stopListening();
    const said = normalizeText(transcript);
    const targets = Array.isArray(row.item?.qs) ? row.item.qs : [];
    const best = targets.reduce(
      (max, q) =>
        Math.max(
          max,
          stringSimilarity.compareTwoStrings(said, normalizeText(q)),
        ),
      0,
    );
    const isCorrect = best >= MATCH_THRESHOLD;

    if (isCorrect) {
      const nextDone = { ...doneMap, [row.key]: true };
      const nextCorrect = scoreCorrect + 1;
      setDoneMap(nextDone);
      setScoreCorrect(nextCorrect);
      persistScore(nextCorrect, scoreWrong, nextDone);
    } else {
      const nextWrong = scoreWrong + 1;
      setScoreWrong(nextWrong);
      persistScore(scoreCorrect, nextWrong, doneMap);
    }
    setLastResult({ key: row.key, correct: isCorrect });
    setOpenKey(null);
  };

  const doneCount = Object.keys(doneMap).length;

  /* ── 5) Trạng thái mic hiển thị ──────────────────────────────────── */
  const starting = Boolean(openKey) && !listening;
  const ready =
    Boolean(openKey) &&
    listening &&
    browserSupportsSpeechRecognition &&
    isMicrophoneAvailable;

  let micStatusText = "";
  if (!browserSupportsSpeechRecognition) {
    micStatusText = "Trình duyệt không hỗ trợ nhận dạng giọng nói";
  } else if (starting) {
    micStatusText = "Đang khởi động micro…";
  } else if (ready) {
    micStatusText = "🎙️ Sẵn sàng lắng nghe…";
  } else {
    micStatusText = "Đang chờ micro…";
  }

  return (
    <div className="rbq-page">
      <style>{`
        .rbq-page { min-height: 100vh; background: #0f172a; color: #f1f5f9; }
        .rbq-topbar {
          position: sticky; top: 0; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          gap: 8px; padding: 10px 12px;
          background: #1e293b; border-bottom: 1px solid rgba(148,163,184,0.25);
        }
        .rbq-back-btn {
          border: none; background: rgba(148,163,184,0.18); color: #f1f5f9;
          border-radius: 8px; width: 36px; height: 36px; font-size: 1rem;
        }
        .rbq-title { font-size: 0.9rem; font-weight: 800; }
        .rbq-stats { font-size: 0.72rem; color: #94a3b8; display: flex; gap: 8px; }
        .rbq-chip { padding: 2px 7px; border-radius: 999px; }
        .rbq-chip-total { background: rgba(148,163,184,0.18); }
        .rbq-chip-correct { background: rgba(34,197,94,0.18); color: #86efac; }
        .rbq-chip-wrong { background: rgba(239,68,68,0.18); color: #fca5a5; }

        .rbq-toggle-btn {
          position: fixed; right: 14px; bottom: 14px; z-index: 60;
          display: flex; align-items: center; gap: 6px;
          padding: 10px 14px; border: none; border-radius: 999px;
          background: linear-gradient(135deg, #6366f1, #4338ca); color: #fff;
          font-weight: 700; font-size: 0.8rem;
          box-shadow: 0 4px 14px rgba(67,56,202,0.45); cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        .rbq-toggle-btn:active { transform: scale(0.95); }
        .rbq-toggle-badge { background: rgba(255,255,255,0.25); border-radius: 999px; padding: 1px 7px; font-size: 0.72rem; }

        .rbq-overlay {
          position: fixed; inset: 0; z-index: 59; background: #0f172a;
          display: flex; flex-direction: column;
        }
        .rbq-overlay-header {
          flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
          gap: 8px; padding: 10px 12px; background: #1e293b;
          border-bottom: 1px solid rgba(148,163,184,0.25);
        }
        .rbq-icon-btn {
          border: none; background: rgba(148,163,184,0.18); color: #f1f5f9;
          border-radius: 8px; width: 34px; height: 34px; font-size: 0.9rem; cursor: pointer;
        }
        .rbq-close-btn { background: rgba(239,68,68,0.85); }

        .rbq-list { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 10px 10px 90px; }
        .rbq-empty { color: #94a3b8; font-size: 0.85rem; text-align: center; padding: 40px 10px; }

        .rbq-group-title {
          margin: 14px 4px 6px; font-size: 0.72rem; font-weight: 800;
          letter-spacing: 0.03em; text-transform: uppercase; color: #94a3b8;
          display: flex; align-items: center; gap: 6px;
        }
        .rbq-row {
          background: #1e293b; border: 1px solid rgba(148,163,184,0.15);
          border-radius: 12px; margin-bottom: 8px; overflow: hidden;
        }
        .rbq-row-done { border-color: rgba(34,197,94,0.5); }
        .rbq-row-main { display: flex; align-items: center; gap: 8px; padding: 8px; cursor: pointer; }
        .rbq-row-index {
          flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%;
          background: rgba(148,163,184,0.2); color: #cbd5e1; font-size: 0.68rem;
          font-weight: 700; display: flex; align-items: center; justify-content: center;
        }
        .rbq-audio-btn {
          flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px;
          border: none; background: rgba(99,102,241,0.15); color: #e0e7ff;
          border-radius: 10px; padding: 9px 12px; font-size: 0.86rem; font-weight: 600;
          text-align: left; cursor: pointer;
        }
        .rbq-audio-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .rbq-audio-btn i { font-size: 1.1rem; flex-shrink: 0; }
        .rbq-audio-playing { background: rgba(99,102,241,0.35); }
        .rbq-audio-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rbq-row-check { color: #4ade80; font-size: 1.2rem; flex-shrink: 0; }

        .rbq-answer-box { padding: 10px; border-top: 1px solid rgba(148,163,184,0.15); background: rgba(15,23,42,0.6); }
        .rbq-answer-status { font-size: 0.78rem; font-weight: 700; color: #a5b4fc; margin-bottom: 6px; }
        .rbq-answer-transcript {
          min-height: 40px; background: rgba(255,255,255,0.05); border-radius: 8px;
          padding: 8px; font-size: 0.95rem; color: #f1f5f9; margin-bottom: 8px; word-break: break-word;
        }
        .rbq-answer-actions { display: flex; gap: 8px; }
        .rbq-btn { flex: 1; border: none; border-radius: 9px; padding: 9px 0; font-weight: 700; font-size: 0.82rem; cursor: pointer; }
        .rbq-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .rbq-btn-ghost { background: rgba(148,163,184,0.2); color: #e2e8f0; }
        .rbq-btn-primary { background: linear-gradient(135deg,#34d399,#059669); color: #052e1d; }
        .rbq-result-flash { font-size: 0.74rem; font-weight: 700; padding: 0 10px 8px; }
        .rbq-result-correct { color: #4ade80; }
        .rbq-result-wrong { color: #f87171; }

        .rbq-hero { padding: 40px 20px; text-align: center; }
        .rbq-hero-title { font-size: 1.2rem; font-weight: 800; margin-bottom: 8px; }
        .rbq-hero-text { font-size: 0.85rem; color: #94a3b8; margin-bottom: 20px; }
        .rbq-hero-btn {
          border: none; border-radius: 999px; padding: 13px 24px;
          background: linear-gradient(135deg,#6366f1,#4338ca); color: #fff;
          font-weight: 800; font-size: 0.9rem; cursor: pointer;
        }
      `}</style>

      {/* ══ TOP BAR ══ */}
      <div className="rbq-topbar">
        <button
          type="button"
          className="rbq-back-btn"
          onClick={() => navigate(-1)}
          title="Quay lại"
        >
          <i className="bi bi-arrow-left" />
        </button>
        <div>
          <div className="rbq-title">Phòng {roomCode}</div>
          <div className="rbq-stats">
            <span className="rbq-chip rbq-chip-total">
              Hoàn thành {doneCount}/{totalCount}
            </span>
            <span className="rbq-chip rbq-chip-correct">
              Đúng {scoreCorrect}
            </span>
            <span className="rbq-chip rbq-chip-wrong">Sai {scoreWrong}</span>
          </div>
        </div>
        <button
          type="button"
          className="rbq-icon-btn"
          title="Xóa tiến trình"
          onClick={handleResetProgress}
        >
          <i className="bi bi-arrow-counterclockwise" />
        </button>
      </div>

      {/* ══ Màn hình chờ khi chưa mở Bảng ══ */}
      {!boardOpen && (
        <div className="rbq-hero">
          {loadError && (
            <div className="rbq-hero-text" style={{ color: "#fca5a5" }}>
              Không tải được dữ liệu cho phòng "{roomCode}". Kiểm tra lại đường
              dẫn /jsonData/{roomCode}.json.
            </div>
          )}
          {!loadError && rawData === null && (
            <div className="rbq-hero-text">Đang tải dữ liệu…</div>
          )}
          {!loadError && rawData !== null && (
            <>
              <div className="rbq-hero-title">Sẵn sàng luyện tập?</div>
              <div className="rbq-hero-text">
                {totalCount} câu — bấm "Mở bảng câu hỏi" để bắt đầu nghe và trả
                lời.
              </div>
              <button
                type="button"
                className="rbq-hero-btn"
                onClick={() => setBoardOpen(true)}
              >
                Mở bảng câu hỏi
              </button>
            </>
          )}
        </div>
      )}

      {/* ══ Nút nhỏ Hiện/Ẩn bảng (yêu cầu 3a) ══ */}
      <button
        type="button"
        className="rbq-toggle-btn"
        onClick={() => setBoardOpen((v) => !v)}
      >
        <i className={`bi ${boardOpen ? "bi-x-lg" : "bi-list-check"}`} />
        {boardOpen ? "Ẩn bảng" : "Bảng câu hỏi"}
        {!boardOpen && totalCount > 0 && (
          <span className="rbq-toggle-badge">
            {doneCount}/{totalCount}
          </span>
        )}
      </button>

      {/* ══ Bảng — chỉ đóng được bằng nút, không đóng khi cuộn/chạm ra ngoài ══ */}
      {boardOpen && (
        <div className="rbq-overlay">
          <div className="rbq-overlay-header">
            <div>
              <div className="rbq-title">Bảng câu hỏi</div>
              <div className="rbq-stats">
                <span className="rbq-chip rbq-chip-total">
                  Hoàn thành {doneCount}/{totalCount}
                </span>
                <span className="rbq-chip rbq-chip-correct">
                  Đúng {scoreCorrect}
                </span>
                <span className="rbq-chip rbq-chip-wrong">
                  Sai {scoreWrong}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="rbq-icon-btn rbq-close-btn"
              title="Ẩn bảng"
              onClick={() => setBoardOpen(false)}
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="rbq-list">
            {totalCount === 0 && (
              <div className="rbq-empty">Chưa có dữ liệu câu hỏi.</div>
            )}

            {rows.map((row, idx) => {
              const isNewGroup =
                idx === 0 ||
                rows[idx - 1].topicIndex !== row.topicIndex ||
                rows[idx - 1].groupIndex !== row.groupIndex;
              const isDone = Boolean(doneMap[row.key]);
              const isOpen = openKey === row.key;
              const qsText = Array.isArray(row.item?.qs)
                ? row.item.qs[0]
                : row.item?.qs;
              const qsAudioEntry =
                (Array.isArray(row.item?.qs01) && row.item.qs01[0]) ||
                (Array.isArray(row.group?.fspSets) && row.group.fspSets[0]) ||
                null;

              return (
                <React.Fragment key={row.key}>
                  {isNewGroup && (
                    <div className="rbq-group-title">
                      <i className="bi bi-bookmark-fill" />
                      {row.group?.fsp || `Nhóm ${row.groupIndex + 1}`}
                    </div>
                  )}
                  <div className={`rbq-row ${isDone ? "rbq-row-done" : ""}`}>
                    <div
                      className="rbq-row-main"
                      onClick={() => (isOpen ? null : startAnswering(row))}
                    >
                      <span className="rbq-row-index">{row.itemIndex + 1}</span>
                      <AudioButton
                        label={qsText || "(không có câu hỏi)"}
                        entry={qsAudioEntry}
                      />
                      {isDone && (
                        <i className="bi bi-check-circle-fill rbq-row-check" />
                      )}
                    </div>

                    {isOpen && (
                      <div
                        className="rbq-answer-box"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="rbq-answer-status">{micStatusText}</div>
                        <div className="rbq-answer-transcript">
                          {transcript || "…"}
                        </div>
                        <div className="rbq-answer-actions">
                          <button
                            type="button"
                            className="rbq-btn rbq-btn-ghost"
                            onClick={cancelAnswering}
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            className="rbq-btn rbq-btn-primary"
                            disabled={!transcript.trim()}
                            onClick={() => submitAnswer(row)}
                          >
                            Nộp câu trả lời
                          </button>
                        </div>
                      </div>
                    )}

                    {!isOpen && lastResult?.key === row.key && (
                      <div
                        className={`rbq-result-flash ${
                          lastResult.correct
                            ? "rbq-result-correct"
                            : "rbq-result-wrong"
                        }`}
                      >
                        {lastResult.correct
                          ? "✔ Chính xác!"
                          : "✘ Chưa đúng, thử lại nhé."}
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomByQuestion;
