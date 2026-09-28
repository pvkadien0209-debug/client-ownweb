// RoomofflineV3.js
//
// File MỚI HOÀN TOÀN — bài thực hành thứ 3, đặt trong folder riêng
// (components/RoomofflineV3/), KHÔNG sửa bất kỳ dòng nào trong Roomoffline.js,
// RoomofflineV2.js hay các file khác.
//
// Mục tiêu bài thực hành: "Nghe và chọn phiên âm đúng" — nghe phát âm 1 từ
// (lấy trong chính bài học đang luyện, đối chiếu với bảng phiên âm 3141 từ
// public/jsonData/w3000UEOAIO/w3000UEOAI.json), rồi chọn đúng 1 trong 8 đáp
// án hiển thị (là các chuỗi UKGHEPAM/USGHEPAM). Chỉ cần chọn trúng 1 trong 2
// dạng UK/US của từ đó là được — nếu 2 dạng khác nhau, CẢ 2 đều hiển thị
// trong 8 đáp án (chiếm 2 ô); nếu giống hệt nhau thì chỉ chiếm 1 ô.
//
// BƯỚC 1 (đã xong — khung sườn): tái sử dụng ĐÚNG luồng LẤY DỮ LIỆU bài học
// giống RoomofflineV2.js (đọc :roomCode/:currentIndex từ URL, màn hình nhập
// tên/kiểm tra mic DataPracticeComponent — TÁI SỬ DỤNG nguyên, không sửa —
// rồi fetchTitle → fetch JSON bài học → interleaveCharacters). Vì luồng này
// cần cho CẢ V2 lẫn V3 và đã được tách thành module riêng
// (roomofflineV2DataUtils.js) khi làm V2, nên V3 IMPORT lại đúng module đó
// thay vì copy thêm 1 bản nữa — tránh 2 bản logic cùng 1 việc bị lệch nhau
// theo thời gian (khác với các hàm nội bộ không export của Roomoffline.js/
// B101_FINAL_PROJECTS.js, nơi bắt buộc phải copy vì không có gì để import).
//
// BƯỚC 2 (đã xong): ngay khi có dữ liệu bài học, trích từ vựng (không trùng
// lặp) từ fsp/data[].qs/data[].aw của các thẻ đã nạp, khớp với bảng phiên âm
// 3141 từ (tải lazy + cache — xem roomofflineV3WordUtils.js) → eligibleWords.
//
// BƯỚC 3 (đã xong): giao diện đố thật — mỗi câu hỏi phát audio của 1 từ
// trong eligibleWords (thử file mp3 thật theo `code`, tự fallback sang TTS
// nếu chưa có file — xem roomofflineV3AudioUtils.js), hiển thị 8 đáp án
// (UKGHEPAM/USGHEPAM đúng của từ đó — cả 2 nếu khác nhau — + nhiễu ngẫu
// nhiên từ toàn bộ bảng phiên âm — xem buildQuizOptions), chấm điểm khi bấm
// chọn (chỉ chấm 1 lần/câu), hết danh sách thì hiện màn hình tổng kết.
//
// LƯU Ý (rút kinh nghiệm từ lỗi đã gặp ở RoomofflineV2.js): app đang bật
// React.StrictMode (client/src/index.js) — effect bảo vệ setState-sau-unmount
// phải đặt lại isMountedRef.current = true NGAY TRONG phần setup (không chỉ
// dựa vào giá trị khởi tạo useRef), nếu không sẽ bị kẹt ở false vĩnh viễn sau
// lượt mount/unmount/mount giả lập của StrictMode ở môi trường dev.

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import DataPracticeComponent from "../pracPages/C_RoomOffline_LAYDULIEUTH";
import {
  interleaveCharacters,
  parseStringToNumbers,
  generateRandomArray,
} from "../RoomofflineV2/roomofflineV2DataUtils";
import {
  extractUniqueWordsFromCards,
  matchWordsWithBank,
  getWordBankArray,
  buildQuizOptions,
} from "./roomofflineV3WordUtils";
import { playWordAudio } from "./roomofflineV3AudioUtils";

const RoomofflineV3 = ({ setSttRoom }) => {
  const { roomCode, currentIndex } = useParams();
  const locationSet = useLocation();
  const params = new URLSearchParams(locationSet.search);

  const [roomInfo] = useState({
    fileName: roomCode,
    objList: [0, 1, 2, 3, 4, 5, 6],
    reverse: 1,
  });
  const [StartToGetData, setStartToGetData] = useState(false);
  const [DataPracticingCharactor, setDataPracticingCharactor] = useState(null);
  const [DataPracticingOverRoll, setDataPracticingOverRoll] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // ── BƯỚC 2: trích từ vựng (fsp/qs/aw) rồi khớp với bảng phiên âm 3141 từ ──
  // eligibleWords = null lúc đang tải/khớp; mảng (có thể rỗng) khi xong.
  const [eligibleWords, setEligibleWords] = useState(null);
  const [wordBankError, setWordBankError] = useState(null);

  // ── BƯỚC 3: giao diện đố (nghe audio + chọn 1 trong 8 đáp án) ─────────────
  const [wordBankArray, setWordBankArray] = useState(null); // toàn bộ bảng — nguồn nhiễu
  const [roundOrder, setRoundOrder] = useState(null); // thứ tự đã xáo trộn (index vào eligibleWords)
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentOptions, setCurrentOptions] = useState(null); // [{text, correct}]
  const [selectedText, setSelectedText] = useState(null);
  const [correctCountV3, setCorrectCountV3] = useState(0);
  const [wrongCountV3, setWrongCountV3] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const activeAudioRef = useRef(null); // audio đang phát — để .pause() khi đổi câu/unmount

  // Bảo vệ fetchTitle (async) khỏi setState sau khi component đã unmount —
  // xem ghi chú ở đầu file về bug đã gặp ở RoomofflineV2.js: PHẢI đặt lại
  // = true ngay trong setup, không chỉ dựa vào giá trị khởi tạo useRef(true).
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (typeof setSttRoom === "function") setSttRoom(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Lấy dữ liệu (ĐÚNG luồng như RoomofflineV2.js) ─────────────────────────
  const fetchTitle = async () => {
    try {
      let response;
      if (roomInfo.fileName.charAt(1) === "z") {
        response = await fetch(`/jsonData/forseo/${roomInfo.fileName}.json`);
      } else {
        response = await fetch(`/jsonData/${roomInfo.fileName}.json`);
      }
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      if (!isMountedRef.current) return;
      setDataPracticingOverRoll(data);

      let firstList = [currentIndex || 0];
      const aParam = params.get("a");
      if (aParam === "all") {
        firstList = Array.from({ length: data.length }, (_, i) => i);
      } else if (aParam) {
        try {
          const newList = parseStringToNumbers(aParam);
          if (newList && newList.length > 0) firstList = newList;
        } catch (error) {
          console.warn('Failed to parse "a" parameter (V3):', error.message);
        }
      }
      const random = params.get("random") === "true";

      const get_data = interleaveCharacters(
        data,
        firstList,
        params.get("b"),
        params.get("up"),
        random,
        params.get("fsp"),
      );
      if (!isMountedRef.current) return;
      setDataPracticingCharactor(get_data.interleaveCharacters_DATA);
    } catch (error) {
      console.error("Error fetching data (RoomofflineV3):", error);
      if (isMountedRef.current) setFetchError(error.message);
    }
  };

  // BƯỚC 2: ngay khi có DataPracticingCharactor, trích từ vựng từ fsp/qs/aw
  // của các thẻ đã nạp rồi khớp với bảng phiên âm 3141 từ (tải lazy + cache,
  // xem roomofflineV3WordUtils.js). Cờ `cancelled` cục bộ (thêm cùng
  // isMountedRef) để nếu effect này chạy lại (bài học đổi) trước khi lần
  // khớp trước kịp xong thì kết quả CŨ không ghi đè nhầm lên kết quả MỚI.
  useEffect(() => {
    if (!DataPracticingCharactor) return;
    let cancelled = false;
    (async () => {
      try {
        const words = extractUniqueWordsFromCards(DataPracticingCharactor);
        const matched = await matchWordsWithBank(words);
        if (!cancelled && isMountedRef.current) {
          setEligibleWords(matched);
        }
      } catch (error) {
        console.error("Lỗi tải/khớp bảng phiên âm (RoomofflineV3):", error);
        if (!cancelled && isMountedRef.current) {
          setWordBankError(error.message);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [DataPracticingCharactor]);

  // BƯỚC 3a: ngay khi có danh sách từ hợp lệ (eligibleWords, không rỗng),
  // tải toàn bộ bảng phiên âm (dùng lại đúng cache đã tải ở Bước 2, KHÔNG
  // fetch thêm lần nào — xem getWordBankArray trong roomofflineV3WordUtils.js)
  // để làm nguồn nhiễu, rồi xáo trộn thứ tự các câu hỏi (generateRandomArray
  // — TÁI SỬ DỤNG đúng hàm đã dùng cho RoomofflineV2, không viết lại).
  useEffect(() => {
    if (!eligibleWords || eligibleWords.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const all = await getWordBankArray();
        if (!cancelled && isMountedRef.current) {
          setWordBankArray(all);
          setRoundOrder(generateRandomArray(eligibleWords.length, true));
          setCurrentRoundIndex(0);
          setCorrectCountV3(0);
          setWrongCountV3(0);
        }
      } catch (error) {
        console.error("Lỗi tải toàn bộ bảng phiên âm (RoomofflineV3):", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eligibleWords]);

  // Từ mục tiêu của câu hỏi hiện tại (hoặc null nếu chưa sẵn sàng/đã hết bài).
  const currentTarget = useMemo(() => {
    if (!eligibleWords || !roundOrder) return null;
    if (currentRoundIndex >= roundOrder.length) return null;
    return eligibleWords[roundOrder[currentRoundIndex]];
  }, [eligibleWords, roundOrder, currentRoundIndex]);

  // BƯỚC 3b: mỗi khi sang câu mới (currentRoundIndex đổi), dựng lại 8 đáp án
  // cho từ mục tiêu của câu đó, reset lựa chọn đã chọn. Cleanup: dừng audio
  // đang phát dở của câu TRƯỚC (nếu người dùng bấm "Câu tiếp theo" trong lúc
  // audio chưa phát xong) — tránh audio cũ vẫn kêu khi đã sang câu mới; cùng
  // cleanup này chạy khi unmount hẳn (đóng trang giữa chừng) để tắt hẳn audio.
  useEffect(() => {
    if (!currentTarget || !wordBankArray) {
      setCurrentOptions(null);
      return;
    }
    setCurrentOptions(buildQuizOptions(currentTarget, wordBankArray));
    setSelectedText(null);
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      setIsPlayingAudio(false);
    };
  }, [currentTarget, wordBankArray]);

  // Bấm "Nghe từ"/"Nghe lại" — dừng audio cũ (nếu còn) trước khi phát audio
  // mới, tránh 2 audio cùng phát chồng lên nhau nếu bấm liên tục.
  const handlePlayAudio = () => {
    if (!currentTarget) return;
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
    }
    activeAudioRef.current = playWordAudio(currentTarget, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  // Chấm điểm — CHỈ chấm 1 lần cho mỗi câu (bấm chọn rồi thì khoá lại, đúng
  // tinh thần "chấm khi bấm nút, logic đơn giản" đã áp dụng cho LearningHub).
  const handleSelectOption = (opt) => {
    if (selectedText) return;
    setSelectedText(opt.text);
    if (opt.correct) {
      setCorrectCountV3((n) => n + 1);
    } else {
      setWrongCountV3((n) => n + 1);
    }
  };

  const handleNextRound = () => {
    setCurrentRoundIndex((i) => i + 1);
  };

  // ── Màn hình cấu hình / lấy dữ liệu (tái sử dụng component cũ) ────────────
  if (!StartToGetData) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f9f9f9",
        }}
      >
        <div
          style={{
            width: "100%",
            textAlign: "center",
            padding: "8px 0",
            background: "#ccffe6",
            fontWeight: 700,
            color: "#065f46",
          }}
        >
          RoomofflineV3 — Bước 1 (khung sườn: kiểm tra tải dữ liệu bài học)
        </div>
        <DataPracticeComponent
          roomCode={roomCode}
          currentIndex={currentIndex}
          setStartToGetData={setStartToGetData}
          fetchTitle={fetchTitle}
        />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#b91c1c" }}>
        Lỗi tải dữ liệu bài học: {fetchError}
      </div>
    );
  }

  if (!DataPracticingCharactor) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
        Đang tải dữ liệu bài học…
      </div>
    );
  }

  if (wordBankError) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#b91c1c" }}>
        Lỗi tải bảng phiên âm: {wordBankError}
      </div>
    );
  }

  if (eligibleWords === null) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
        Đang tải bảng phiên âm và khớp từ vựng…
      </div>
    );
  }

  if (eligibleWords.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#b45309" }}>
        Bài học này không có từ nào khớp với bảng phiên âm — không đủ dữ liệu
        để tạo bài đố cho bài này.
      </div>
    );
  }

  if (!roundOrder) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
        Đang chuẩn bị câu hỏi…
      </div>
    );
  }

  // BUG ĐÃ SỬA: đoạn kiểm tra "hoàn thành chưa" này PHẢI đứng TRƯỚC đoạn
  // kiểm tra "đã có currentOptions/currentTarget chưa" bên dưới — vì khi đã
  // luyện hết tất cả các câu, currentTarget (useMemo) và currentOptions
  // (effect theo currentTarget) đều CHỦ ĐÍCH trả về null (hết câu để hỏi,
  // không phải "chưa chuẩn bị xong"). Trước đây thứ tự bị ngược nên khi
  // luyện xong, code luôn dừng lại ở màn hình "Đang chuẩn bị câu hỏi…" và
  // KHÔNG BAO GIỜ chạy tới đoạn hiện banner "Đã hoàn thành" bên dưới.
  if (currentRoundIndex >= roundOrder.length) {
    const totalRounds = roundOrder.length;
    const accuracyPct =
      totalRounds > 0 ? Math.round((correctCountV3 / totalRounds) * 100) : 0;
    return (
      <div style={{ padding: "2rem", maxWidth: 480, margin: "0 auto" }}>
        <div
          style={{
            textAlign: "center",
            borderRadius: 14,
            padding: "2rem 1.5rem",
            background: "#dcfce7",
            border: "1px solid #86efac",
          }}
        >
          <i
            className="bi bi-check-circle-fill"
            style={{ fontSize: "3rem", color: "#16a34a" }}
          ></i>
          <h4 style={{ margin: "0.75rem 0 0.25rem", color: "#065f46" }}>
            Đã hoàn thành bài luyện phát âm!
          </h4>
          <p style={{ color: "#065f46", marginBottom: 0 }}>
            Đúng <b>{correctCountV3}</b> / Sai <b>{wrongCountV3}</b> trên tổng
            số <b>{totalRounds}</b> câu ({accuracyPct}% chính xác)
          </p>
        </div>
      </div>
    );
  }

  // Còn câu hỏi (chưa hoàn thành) nhưng đáp án của câu hiện tại chưa dựng
  // xong kịp (effect ở trên chưa chạy xong) — chờ 1 nhịp, KHÔNG liên quan gì
  // tới màn hình hoàn thành ở trên (đã tách riêng, kiểm tra trước đoạn này).
  if (!currentOptions || !currentTarget) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
        Đang chuẩn bị câu hỏi…
      </div>
    );
  }

  const selectedOption = selectedText
    ? currentOptions.find((o) => o.text === selectedText)
    : null;

  // BƯỚC 3: giao diện đố thật — nghe audio + chọn 1 trong 8 đáp án.
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", color: "#475569" }}>
        <span>
          Câu {currentRoundIndex + 1}/{roundOrder.length}
        </span>
        <span>
          Đúng: <b style={{ color: "#16a34a" }}>{correctCountV3}</b> — Sai:{" "}
          <b style={{ color: "#dc2626" }}>{wrongCountV3}</b>
        </span>
      </div>

      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={handlePlayAudio}
          disabled={isPlayingAudio}
          title="Nghe từ"
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "none",
            background: isPlayingAudio ? "#a7b0be" : "#7c3aed",
            color: "#fff",
            fontSize: "2rem",
            cursor: isPlayingAudio ? "not-allowed" : "pointer",
          }}
        >
          <i className={`bi ${isPlayingAudio ? "bi-volume-up" : "bi-volume-up-fill"}`}></i>
        </button>
        <p style={{ color: "#64748b", marginTop: 8 }}>
          {isPlayingAudio ? "Đang phát…" : "Bấm để nghe từ, rồi chọn đúng phiên âm bên dưới"}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {currentOptions.map((opt) => {
          const isSelected = selectedText === opt.text;
          const showResult = !!selectedText;
          let background = "#fff";
          let border = "#cbd5e1";
          if (showResult && opt.correct) {
            background = "#dcfce7";
            border = "#16a34a";
          } else if (showResult && isSelected && !opt.correct) {
            background = "#fee2e2";
            border = "#dc2626";
          }
          return (
            <button
              key={opt.text}
              type="button"
              onClick={() => handleSelectOption(opt)}
              disabled={!!selectedText}
              style={{
                padding: "14px 8px",
                borderRadius: 10,
                border: `2px solid ${border}`,
                background,
                color: "#1e293b",
                fontSize: "1.1rem",
                fontWeight: 600,
                cursor: selectedText ? "default" : "pointer",
              }}
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      {selectedOption ? (
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <p
            style={{
              fontWeight: 700,
              color: selectedOption.correct ? "#16a34a" : "#dc2626",
            }}
          >
            {selectedOption.correct ? "✅ Chính xác!" : "❌ Chưa đúng"}
          </p>
          <button
            type="button"
            onClick={handleNextRound}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              background: "#16a34a",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Câu tiếp theo →
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default RoomofflineV3;
