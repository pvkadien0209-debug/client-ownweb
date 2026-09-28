// RoomofflineV4.js
//
// File MỚI HOÀN TOÀN — bài thực hành thứ 4, đặt trong folder riêng
// (components/RoomofflineV4/), KHÔNG sửa bất kỳ dòng nào trong Roomoffline.js,
// RoomofflineV2.js, RoomofflineV3.js hay các file khác.
//
// Mục tiêu bài thực hành: "Nghe và chọn nghĩa phù hợp" — nghe phát âm 1 từ
// (lấy trong chính bài học đang luyện, đối chiếu với bảng phiên âm 3141 từ
// public/jsonData/w3000UEOAIO/w3000UEOAI.json), rồi chọn đúng 1 trong 8 đáp
// án hiển thị (là các chuỗi `meaning` — nghĩa/cách dùng tiếng Việt). Khác
// RoomofflineV3 (có thể có 2 dạng đúng UK/US), ở đây MỖI TỪ CHỈ CÓ 1 nghĩa
// đúng duy nhất.
//
// LOGIC GẦN GIỐNG RoomofflineV3.js — TÁI SỬ DỤNG lại các phần đã có, chỉ
// thay phần "dựng đáp án" (buildSingleAnswerOptions thay cho buildQuizOptions
// đặc thù GHEPAM), tránh 2 bản logic cùng 1 việc (tải bài học, trích/khớp từ
// vựng, phát audio) bị lệch nhau theo thời gian:
//   - interleaveCharacters/parseStringToNumbers/generateRandomArray: import
//     lại từ RoomofflineV2/roomofflineV2DataUtils.js (đã dùng cho cả V2, V3).
//   - extractUniqueWordsFromCards/matchWordsWithBank/getWordBankArray/
//     buildSingleAnswerOptions: import lại từ RoomofflineV3/
//     roomofflineV3WordUtils.js (buildSingleAnswerOptions là hàm MỚI thêm
//     vào file này khi làm V4 — dùng chung được cho cả V4 lẫn V5).
//   - playWordAudio: import lại từ RoomofflineV3/roomofflineV3AudioUtils.js
//     (thử phát mp3 thật theo `code`, tự fallback sang TTS nếu chưa có file).
//
// LƯU Ý (rút kinh nghiệm từ lỗi đã gặp ở RoomofflineV2.js/V3.js):
//   1) App đang bật React.StrictMode (client/src/index.js) — effect bảo vệ
//      setState-sau-unmount phải đặt lại isMountedRef.current = true NGAY
//      TRONG phần setup (không chỉ dựa vào giá trị khởi tạo useRef), nếu
//      không sẽ bị kẹt ở false vĩnh viễn sau lượt mount/unmount/mount giả
//      lập của StrictMode ở môi trường dev.
//   2) Đoạn kiểm tra "đã hoàn thành bài chưa" PHẢI đứng TRƯỚC đoạn kiểm tra
//      "đáp án của câu hiện tại đã dựng xong chưa" — vì khi đã luyện hết,
//      currentTarget/currentOptions CHỦ ĐÍCH là null (hết câu để hỏi), không
//      phải "chưa chuẩn bị xong".

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
  buildSingleAnswerOptions,
} from "../RoomofflineV3/roomofflineV3WordUtils";
import { playWordAudio } from "../RoomofflineV3/roomofflineV3AudioUtils";

// Lấy chuỗi hiển thị (đáp án) cho bài này: nghĩa tiếng Việt của từ.
const getMeaningField = (word) => word?.meaning;

const RoomofflineV4 = ({ setSttRoom }) => {
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

  // ── Trích từ vựng (fsp/qs/aw) rồi khớp với bảng phiên âm 3141 từ ──────────
  const [eligibleWords, setEligibleWords] = useState(null);
  const [wordBankError, setWordBankError] = useState(null);

  // ── Giao diện đố (nghe audio + chọn 1 trong 8 nghĩa) ──────────────────────
  const [wordBankArray, setWordBankArray] = useState(null);
  const [roundOrder, setRoundOrder] = useState(null);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentOptions, setCurrentOptions] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [correctCountV4, setCorrectCountV4] = useState(0);
  const [wrongCountV4, setWrongCountV4] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const activeAudioRef = useRef(null);

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
          console.warn('Failed to parse "a" parameter (V4):', error.message);
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
      console.error("Error fetching data (RoomofflineV4):", error);
      if (isMountedRef.current) setFetchError(error.message);
    }
  };

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
        console.error("Lỗi tải/khớp bảng phiên âm (RoomofflineV4):", error);
        if (!cancelled && isMountedRef.current) {
          setWordBankError(error.message);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [DataPracticingCharactor]);

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
          setCorrectCountV4(0);
          setWrongCountV4(0);
        }
      } catch (error) {
        console.error("Lỗi tải toàn bộ bảng phiên âm (RoomofflineV4):", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eligibleWords]);

  const currentTarget = useMemo(() => {
    if (!eligibleWords || !roundOrder) return null;
    if (currentRoundIndex >= roundOrder.length) return null;
    return eligibleWords[roundOrder[currentRoundIndex]];
  }, [eligibleWords, roundOrder, currentRoundIndex]);

  useEffect(() => {
    if (!currentTarget || !wordBankArray) {
      setCurrentOptions(null);
      return;
    }
    setCurrentOptions(
      buildSingleAnswerOptions(currentTarget, wordBankArray, getMeaningField),
    );
    setSelectedText(null);
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      setIsPlayingAudio(false);
    };
  }, [currentTarget, wordBankArray]);

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

  const handleSelectOption = (opt) => {
    if (selectedText) return;
    setSelectedText(opt.text);
    if (opt.correct) {
      setCorrectCountV4((n) => n + 1);
    } else {
      setWrongCountV4((n) => n + 1);
    }
  };

  const handleNextRound = () => {
    setCurrentRoundIndex((i) => i + 1);
  };

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
            background: "#fef3c7",
            fontWeight: 700,
            color: "#92400e",
          }}
        >
          RoomofflineV4 — Nghe và chọn nghĩa phù hợp
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

  // Kiểm tra "hoàn thành chưa" PHẢI đứng TRƯỚC kiểm tra currentOptions/
  // currentTarget bên dưới (xem ghi chú đầu file — bug đã gặp và sửa ở V3).
  if (currentRoundIndex >= roundOrder.length) {
    const totalRounds = roundOrder.length;
    const accuracyPct =
      totalRounds > 0 ? Math.round((correctCountV4 / totalRounds) * 100) : 0;
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
            Đã hoàn thành bài luyện nghe & chọn nghĩa!
          </h4>
          <p style={{ color: "#065f46", marginBottom: 0 }}>
            Đúng <b>{correctCountV4}</b> / Sai <b>{wrongCountV4}</b> trên tổng
            số <b>{totalRounds}</b> câu ({accuracyPct}% chính xác)
          </p>
        </div>
      </div>
    );
  }

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

  // Nghĩa dài hơn nhiều so với phiên âm (V3) → dùng danh sách 1 cột thay vì
  // lưới 2 cột, để chữ không bị bó hẹp/khó đọc.
  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "sans-serif",
        maxWidth: 640,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
          color: "#475569",
        }}
      >
        <span>
          Câu {currentRoundIndex + 1}/{roundOrder.length}
        </span>
        <span>
          Đúng: <b style={{ color: "#16a34a" }}>{correctCountV4}</b> — Sai:{" "}
          <b style={{ color: "#dc2626" }}>{wrongCountV4}</b>
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
            background: isPlayingAudio ? "#a7b0be" : "#d97706",
            color: "#fff",
            fontSize: "2rem",
            cursor: isPlayingAudio ? "not-allowed" : "pointer",
          }}
        >
          <i
            className={`bi ${isPlayingAudio ? "bi-volume-up" : "bi-volume-up-fill"}`}
          ></i>
        </button>
        <p style={{ color: "#64748b", marginTop: 8 }}>
          {isPlayingAudio
            ? "Đang phát…"
            : "Bấm để nghe từ, rồi chọn đúng nghĩa bên dưới"}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: 10,
                border: `2px solid ${border}`,
                background,
                color: "#1e293b",
                fontSize: "1rem",
                fontWeight: 500,
                lineHeight: 1.4,
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

export default RoomofflineV4;
