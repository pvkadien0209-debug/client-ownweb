// RoomofflineV5.js
//
// File MỚI HOÀN TOÀN — bài thực hành thứ 5, đặt trong folder riêng
// (components/RoomofflineV5/), KHÔNG sửa bất kỳ dòng nào trong Roomoffline.js,
// RoomofflineV2.js, RoomofflineV3.js, RoomofflineV4.js hay các file khác.
//
// Mục tiêu bài thực hành: "Đọc nghĩa và chọn từ phù hợp" — chiều NGƯỢC LẠI
// với RoomofflineV4: hiển thị NGHĨA (chữ `meaning`, tiếng Việt) làm câu hỏi
// (KHÔNG có audio ở bài này), rồi chọn đúng 1 trong 8 đáp án hiển thị (là
// các TỪ TIẾNG ANH — chữ `text`).
//
// LOGIC GẦN GIỐNG RoomofflineV3.js/V4.js — TÁI SỬ DỤNG lại các phần đã có,
// chỉ khác 2 điểm: (1) không có audio/không cần phát âm — câu hỏi là hiển
// thị text; (2) đáp án là `text` (từ) thay vì `meaning`/GHEPAM. Import lại
// đúng các hàm đã tách sẵn (không copy thêm bản mới) để tránh lệch logic:
//   - interleaveCharacters/parseStringToNumbers/generateRandomArray: từ
//     RoomofflineV2/roomofflineV2DataUtils.js.
//   - extractUniqueWordsFromCards/matchWordsWithBank/getWordBankArray/
//     buildSingleAnswerOptions: từ RoomofflineV3/roomofflineV3WordUtils.js.
//   (Không cần roomofflineV3AudioUtils.js ở bài này vì không có audio.)
//
// LƯU Ý (rút kinh nghiệm từ lỗi đã gặp ở RoomofflineV2.js/V3.js):
//   1) App đang bật React.StrictMode — effect bảo vệ setState-sau-unmount
//      phải đặt lại isMountedRef.current = true NGAY TRONG phần setup.
//   2) Đoạn kiểm tra "đã hoàn thành bài chưa" PHẢI đứng TRƯỚC đoạn kiểm tra
//      "đáp án của câu hiện tại đã dựng xong chưa".

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

// Lấy chuỗi hiển thị (đáp án) cho bài này: chính từ tiếng Anh.
const getTextField = (word) => word?.text;

const RoomofflineV5 = ({ setSttRoom }) => {
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

  // ── Giao diện đố (đọc nghĩa + chọn 1 trong 8 từ) — KHÔNG có audio ─────────
  const [wordBankArray, setWordBankArray] = useState(null);
  const [roundOrder, setRoundOrder] = useState(null);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentOptions, setCurrentOptions] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [correctCountV5, setCorrectCountV5] = useState(0);
  const [wrongCountV5, setWrongCountV5] = useState(0);

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
          console.warn('Failed to parse "a" parameter (V5):', error.message);
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
      console.error("Error fetching data (RoomofflineV5):", error);
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
        console.error("Lỗi tải/khớp bảng phiên âm (RoomofflineV5):", error);
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
          setCorrectCountV5(0);
          setWrongCountV5(0);
        }
      } catch (error) {
        console.error("Lỗi tải toàn bộ bảng phiên âm (RoomofflineV5):", error);
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
      buildSingleAnswerOptions(currentTarget, wordBankArray, getTextField),
    );
    setSelectedText(null);
  }, [currentTarget, wordBankArray]);

  const handleSelectOption = (opt) => {
    if (selectedText) return;
    setSelectedText(opt.text);
    if (opt.correct) {
      setCorrectCountV5((n) => n + 1);
    } else {
      setWrongCountV5((n) => n + 1);
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
            background: "#e0e7ff",
            fontWeight: 700,
            color: "#3730a3",
          }}
        >
          RoomofflineV5 — Đọc nghĩa và chọn từ phù hợp
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
      totalRounds > 0 ? Math.round((correctCountV5 / totalRounds) * 100) : 0;
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
            Đã hoàn thành bài luyện đọc nghĩa & chọn từ!
          </h4>
          <p style={{ color: "#065f46", marginBottom: 0 }}>
            Đúng <b>{correctCountV5}</b> / Sai <b>{wrongCountV5}</b> trên tổng
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

  // Từ tiếng Anh (đáp án) thường ngắn hơn nghĩa → dùng lưới 2 cột như V3;
  // nghĩa (câu hỏi) hiển thị ở khối riêng phía trên, không có nút nghe.
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
          Đúng: <b style={{ color: "#16a34a" }}>{correctCountV5}</b> — Sai:{" "}
          <b style={{ color: "#dc2626" }}>{wrongCountV5}</b>
        </span>
      </div>

      <div
        style={{
          textAlign: "center",
          marginBottom: "1.5rem",
          padding: "1.25rem 1rem",
          borderRadius: 14,
          background: "#e0e7ff",
          border: "1px solid #c7d2fe",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#3730a3",
            fontSize: "1.15rem",
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          {currentTarget?.meaning}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
        }}
      >
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

export default RoomofflineV5;
