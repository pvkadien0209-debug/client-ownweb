import React, { useMemo, useState } from "react";
import { socket } from "../App";

/* ============================================================
   TÁCH DỮ LIỆU BTJSON

   Ví dụ:
   BTJSON{"type":"gheptu","data":"HOw do you do"}
============================================================ */
function extractBaitapData(rawText) {
  if (!rawText || typeof rawText !== "string") return null;

  const markerIndex = rawText.indexOf("BTJSON");

  if (markerIndex === -1) return null;

  const afterMarker = rawText.slice(markerIndex + "BTJSON".length).trim();

  const firstBracket = afterMarker.search(/[{[]/);

  if (firstBracket === -1) return null;

  const jsonCandidate = afterMarker.slice(firstBracket);

  try {
    return JSON.parse(jsonCandidate);
  } catch (err) {
    console.error("ChatBaitap: không parse được BTJSON:", err);
    return null;
  }
}

/* ============================================================
   TRỘN MẢNG
============================================================ */
function shuffleArray(array) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

/* ============================================================
   GỬI THÔNG BÁO HOÀN THÀNH
============================================================ */
function emitCompletedMessage() {
  try {
    if (!socket || typeof socket.emit !== "function") {
      return;
    }

    let idDinhDanh = null;
    let nameDinhDanh = null;

    try {
      idDinhDanh = localStorage.getItem("dinhDanh");
      nameDinhDanh = localStorage.getItem("nameDinhDanh");
    } catch (e) {
      // Không làm gì nếu localStorage không dùng được
    }

    const displayName =
      nameDinhDanh ||
      (idDinhDanh ? String(idDinhDanh).slice(0, 4) : "") ||
      "Anonymous";

    socket.emit("messageReg", {
      text: "Đã hoàn thành bài tập ghép từ!",
      time: String(displayName),
      type: "text",
      id: idDinhDanh || null,
    });
  } catch (socketError) {
    console.error("Lỗi gửi thông báo hoàn thành bài tập:", socketError);
  }
}

/* ============================================================
   BÀI TẬP GHÉP TỪ
============================================================ */
function GheptuCard({ data }) {
  const originalText = typeof data === "string" ? data.trim() : "";

  /* ----------------------------------------------------------
     Tách câu thành các từ
     
     "HOw do you do"
     =>
     ["HOw", "do", "you", "do"]
  ---------------------------------------------------------- */
  const originalWords = useMemo(() => {
    return originalText
      .split(" ")
      .map((word) => word.trim())
      .filter(Boolean);
  }, [originalText]);

  /* ----------------------------------------------------------
     Tạo danh sách từ có ID riêng.
     
     ID chỉ dùng để React nhận diện từng từ.
     Kiểm tra đúng/sai vẫn dựa vào word.
  ---------------------------------------------------------- */
  const createWords = () => {
    return originalWords.map((word, index) => ({
      id: `${index}-${word}`,
      word,
    }));
  };

  /* ----------------------------------------------------------
     Danh sách từ được trộn
  ---------------------------------------------------------- */
  const [words, setWords] = useState(() => shuffleArray(createWords()));

  /* ----------------------------------------------------------
     Các từ đã chọn
  ---------------------------------------------------------- */
  const [selectedWords, setSelectedWords] = useState([]);

  /* ----------------------------------------------------------
     Vị trí đang báo sai
  ---------------------------------------------------------- */
  const [wrongIndex, setWrongIndex] = useState(null);

  /* ----------------------------------------------------------
     Đã hoàn thành hay chưa
  ---------------------------------------------------------- */
  const [completed, setCompleted] = useState(false);

  /* ==========================================================
     CHỌN MỘT TỪ
  ========================================================== */
  const handleWordClick = (item) => {
    try {
      if (completed) return;

      /*
        Vị trí tiếp theo cần điền
      */
      const currentIndex = selectedWords.length;

      /*
        Từ đúng cần có tại vị trí này
      */
      const correctWord = originalWords[currentIndex];

      /*
        Nếu chọn sai → báo ngay
      */
      if (item.word !== correctWord) {
        setWrongIndex(currentIndex);

        setTimeout(() => {
          setWrongIndex(null);
        }, 1200);

        return;
      }

      /*
        Nếu đúng → thêm từ vào kết quả
      */
      const newSelectedWords = [...selectedWords, item];

      setSelectedWords(newSelectedWords);

      /*
        Đã chọn đủ tất cả từ
      */
      if (newSelectedWords.length === originalWords.length) {
        const resultText = newSelectedWords.map((item) => item.word).join(" ");

        /*
          Kiểm tra lần cuối toàn bộ câu
        */
        if (resultText === originalText) {
          setCompleted(true);

          emitCompletedMessage();
        }
      }
    } catch (error) {
      console.error("Lỗi khi chọn từ:", error);
    }
  };

  /* ==========================================================
     BẤM VÀO TỪ ĐÃ CHỌN ĐỂ BỎ TỪ
  ========================================================== */
  const handleSelectedWordClick = (index) => {
    try {
      if (completed) return;

      /*
        Xóa từ tại vị trí được bấm.
        
        Ví dụ:
        [How] [do] [you] [do]

        Bấm [do]:

        [How] [you] [do]
      */
      const newSelectedWords = selectedWords.filter((_, i) => i !== index);

      setSelectedWords(newSelectedWords);

      setWrongIndex(null);
    } catch (error) {
      console.error("Lỗi khi bỏ từ:", error);
    }
  };

  /* ==========================================================
     RESET
  ========================================================== */
  const handleReset = () => {
    try {
      setSelectedWords([]);

      setWrongIndex(null);

      setCompleted(false);

      setWords(shuffleArray(createWords()));
    } catch (error) {
      console.error("Lỗi khi reset bài tập:", error);
    }
  };

  /* ----------------------------------------------------------
     Các từ chưa được chọn
  ---------------------------------------------------------- */
  const remainingWords = words.filter(
    (item) => !selectedWords.some((selected) => selected.id === item.id),
  );

  /* ----------------------------------------------------------
     Câu hiện tại
  ---------------------------------------------------------- */
  const currentText = selectedWords.map((item) => item.word).join(" ");

  /* ----------------------------------------------------------
     Nếu không có dữ liệu
  ---------------------------------------------------------- */
  if (!originalText) {
    return (
      <div className="gheptu-card">
        <div className="gheptu-error">Không có nội dung bài tập.</div>
      </div>
    );
  }

  return (
    <div className="gheptu-card">
      {/* ======================================================
          TIÊU ĐỀ
      ====================================================== */}

      <div className="gheptu-title">Bài tập ghép từ</div>

      <div className="gheptu-instruction">
        Hãy chọn các từ theo đúng thứ tự để tạo thành câu.
      </div>

      {/* ======================================================
          CÂU ĐANG GHÉP
      ====================================================== */}

      <div className="gheptu-result-label">Câu của bạn:</div>

      <div
        className={`gheptu-result ${
          completed ? "gheptu-result-completed" : ""
        }`}
      >
        {selectedWords.length === 0 ? (
          <span className="gheptu-placeholder">Bấm vào từ bên dưới...</span>
        ) : (
          selectedWords.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`gheptu-selected-word ${
                wrongIndex === index ? "gheptu-selected-wrong" : ""
              }`}
              onClick={() => handleSelectedWordClick(index)}
              title="Bấm để bỏ từ này"
            >
              {item.word}
            </button>
          ))
        )}
      </div>

      {/* ======================================================
          THÔNG BÁO SAI
      ====================================================== */}

      {wrongIndex !== null && (
        <div className="gheptu-error">❌ Chưa đúng, hãy thử từ khác!</div>
      )}

      {/* ======================================================
          DANH SÁCH TỪ
      ====================================================== */}

      {!completed && (
        <>
          <div className="gheptu-words-label">Chọn từ:</div>

          <div className="gheptu-words">
            {remainingWords.map((item) => (
              <button
                key={item.id}
                type="button"
                className="gheptu-word-btn"
                onClick={() => handleWordClick(item)}
              >
                {item.word}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ======================================================
          HOÀN THÀNH
      ====================================================== */}

      {completed && (
        <div className="gheptu-success">
          <div className="gheptu-success-title">🎉 Chúc mừng!</div>

          <div>Bạn đã hoàn thành bài tập!</div>

          <div className="gheptu-success-answer">{currentText}</div>
        </div>
      )}

      {/* ======================================================
          RESET
      ====================================================== */}

      {!completed && (
        <button
          type="button"
          className="gheptu-reset-btn"
          onClick={handleReset}
        >
          ↻ Làm lại
        </button>
      )}
    </div>
  );
}

/* ============================================================
   QUESTION CARD — BÀI TRẮC NGHIỆM CŨ
============================================================ */
function QuestionCard({ index, question }) {
  const [selected, setSelected] = useState(null);

  const questionText =
    question.question ||
    question.cau_hoi ||
    question.text ||
    `Câu ${index + 1}`;

  const options = question.options || question.dap_an || question.choices || [];

  const correctIndex =
    question.answer ?? question.correct ?? question.dapAnDung ?? null;

  const hasAnswered = selected !== null;

  return (
    <div className="baitap-question-card">
      <div className="baitap-question-title">
        <span className="baitap-question-num">Câu {index + 1}.</span>{" "}
        {questionText}
      </div>

      <div className="baitap-options">
        {options.map((opt, i) => {
          const isCorrect = correctIndex !== null && i === Number(correctIndex);

          const isSelected = selected === i;

          let cls = "baitap-option-btn";

          if (hasAnswered) {
            if (isCorrect) {
              cls += " baitap-option-correct";
            } else if (isSelected) {
              cls += " baitap-option-wrong";
            }
          } else if (isSelected) {
            cls += " baitap-option-active";
          }

          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={hasAnswered}
              onClick={() => setSelected(i)}
            >
              <span className="baitap-option-letter">
                {String.fromCharCode(65 + i)}
              </span>

              <span>{typeof opt === "string" ? opt : opt.text || ""}</span>
            </button>
          );
        })}
      </div>

      {hasAnswered && correctIndex !== null && (
        <div
          className={`baitap-feedback ${
            selected === Number(correctIndex)
              ? "baitap-feedback-ok"
              : "baitap-feedback-no"
          }`}
        >
          {selected === Number(correctIndex)
            ? "Chính xác!"
            : `Chưa đúng — đáp án đúng là ${String.fromCharCode(
                65 + Number(correctIndex),
              )}.`}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   COMPONENT CHÍNH
============================================================ */
export default function ChatBaitap({ data }) {
  const parsed = useMemo(() => extractBaitapData(data), [data]);

  /* ==========================================================
     NẾU LÀ BÀI GHÉP TỪ
     
     BTJSON{
       "type":"gheptu",
       "data":"HOw do you do"
     }
  ========================================================== */

  if (parsed && parsed.type === "gheptu") {
    return (
      <div className="baitap-wrap">
        <GheptuCard data={parsed.data} />

        <style>{`
          /* ==================================================
             CONTAINER
          ================================================== */

          .baitap-wrap {
            padding: 20px;
          }

          /* ==================================================
             GHÉP TỪ
          ================================================== */

          .gheptu-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
          }

          .gheptu-title {
            font-size: 1.05rem;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 5px;
          }

          .gheptu-instruction {
            color: #64748b;
            font-size: 0.9rem;
            margin-bottom: 15px;
          }

          .gheptu-result-label,
          .gheptu-words-label {
            font-size: 0.88rem;
            font-weight: 700;
            color: #475569;
            margin-bottom: 7px;
          }

          /* ==================================================
             Ô KẾT QUẢ
          ================================================== */

          .gheptu-result {
            min-height: 56px;
            border: 2px dashed #cbd5e1;
            background: #fff;
            border-radius: 10px;
            padding: 8px;
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 7px;
            margin-bottom: 10px;
          }

          .gheptu-placeholder {
            color: #94a3b8;
            font-size: 0.9rem;
          }

          /* ==================================================
             TỪ ĐÃ CHỌN
          ================================================== */

          .gheptu-selected-word {
            display: inline-flex;
            align-items: center;
            border: 1px solid #7dd3fc;
            background: #e0f2fe;
            color: #0369a1;
            border-radius: 7px;
            padding: 7px 11px;
            font-weight: 600;
            cursor: pointer;
            transition:
              transform 0.15s,
              background 0.15s;
          }

          .gheptu-selected-word:hover {
            background: #bae6fd;
            transform: translateY(-1px);
          }

          /* ==================================================
             TỪ SAI
          ================================================== */

          .gheptu-selected-wrong {
            border-color: #ef4444;
            background: #fee2e2;
            color: #dc2626;
            animation: gheptu-shake 0.25s;
          }

          @keyframes gheptu-shake {
            0% {
              transform: translateX(0);
            }

            25% {
              transform: translateX(-4px);
            }

            50% {
              transform: translateX(4px);
            }

            75% {
              transform: translateX(-4px);
            }

            100% {
              transform: translateX(0);
            }
          }

          /* ==================================================
             THÔNG BÁO SAI
          ================================================== */

          .gheptu-error {
            color: #dc2626;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 10px;
          }

          /* ==================================================
             DANH SÁCH TỪ
          ================================================== */

          .gheptu-words {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 15px;
          }

          .gheptu-word-btn {
            border: 1px solid #cbd5e1;
            background: #fff;
            color: #1e293b;
            border-radius: 8px;
            padding: 8px 13px;
            cursor: pointer;
            font-size: 0.95rem;
            font-weight: 600;
            transition:
              transform 0.12s,
              border-color 0.12s,
              background 0.12s;
          }

          .gheptu-word-btn:hover {
            border-color: #0ea5e9;
            background: #f0f9ff;
            transform: translateY(-1px);
          }

          .gheptu-word-btn:active {
            transform: translateY(0);
          }

          /* ==================================================
             HOÀN THÀNH
          ================================================== */

          .gheptu-result-completed {
            border-style: solid;
            border-color: #86efac;
            background: #f0fdf4;
          }

          .gheptu-success {
            text-align: center;
            padding: 15px;
            margin-top: 10px;
            border-radius: 10px;
            background: #f0fdf4;
            border: 1px solid #86efac;
            color: #15803d;
            font-weight: 600;
          }

          .gheptu-success-title {
            font-size: 1.15rem;
            font-weight: 800;
            margin-bottom: 4px;
          }

          .gheptu-success-answer {
            margin-top: 8px;
            font-weight: 700;
          }

          /* ==================================================
             RESET
          ================================================== */

          .gheptu-reset-btn {
            border: 1px solid #cbd5e1;
            background: #fff;
            color: #475569;
            border-radius: 7px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 0.9rem;
          }

          .gheptu-reset-btn:hover {
            background: #f1f5f9;
          }

          /* ==================================================
             TRẮC NGHIỆM CŨ
          ================================================== */

          .baitap-question-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px 16px;
            margin-bottom: 14px;
          }

          .baitap-question-title {
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 10px;
            font-size: 1.02rem;
          }

          .baitap-question-num {
            color: #0ea5e9;
          }

          .baitap-options {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .baitap-option-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            text-align: left;
            border: 2px solid #cbd5e1;
            background: #fff;
            border-radius: 10px;
            padding: 8px 12px;
            cursor: pointer;
            font-size: 0.95rem;
            transition:
              border-color 0.15s,
              background 0.15s;
          }

          .baitap-option-btn:disabled {
            cursor: default;
          }

          .baitap-option-letter {
            flex-shrink: 0;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: #e2e8f0;
            color: #334155;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
          }

          .baitap-option-active {
            border-color: #0ea5e9;
            background: #f0f9ff;
          }

          .baitap-option-correct {
            border-color: #22c55e;
            background: #f0fdf4;
          }

          .baitap-option-correct
            .baitap-option-letter {
            background: #22c55e;
            color: #fff;
          }

          .baitap-option-wrong {
            border-color: #ef4444;
            background: #fef2f2;
          }

          .baitap-option-wrong
            .baitap-option-letter {
            background: #ef4444;
            color: #fff;
          }

          .baitap-feedback {
            margin-top: 10px;
            font-weight: 700;
            font-size: 0.9rem;
          }

          .baitap-feedback-ok {
            color: #16a34a;
          }

          .baitap-feedback-no {
            color: #dc2626;
          }

          /* ==================================================
             RAW FALLBACK
          ================================================== */

          .baitap-raw-fallback {
            white-space: pre-wrap;
            word-break: break-word;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 14px;
            font-size: 0.9rem;
            color: #334155;
          }

          .baitap-empty {
            text-align: center;
            color: #64748b;
            font-style: italic;
            padding: 24px 0;
          }
        `}</style>
      </div>
    );
  }

  /* ==========================================================
     BÀI TRẮC NGHIỆM CŨ
  ========================================================== */

  const questions = Array.isArray(parsed)
    ? parsed
    : parsed && Array.isArray(parsed.questions)
      ? parsed.questions
      : null;

  return (
    <div className="baitap-wrap">
      <style>{`
        .baitap-wrap {
          padding: 20px;
        }

        .baitap-raw-fallback {
          white-space: pre-wrap;
          word-break: break-word;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px;
          font-size: 0.9rem;
          color: #334155;
        }

        .baitap-empty {
          text-align: center;
          color: #64748b;
          font-style: italic;
          padding: 24px 0;
        }

        .baitap-question-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 14px;
        }

        .baitap-question-title {
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 10px;
          font-size: 1.02rem;
        }

        .baitap-question-num {
          color: #0ea5e9;
        }

        .baitap-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .baitap-option-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
          border: 2px solid #cbd5e1;
          background: #fff;
          border-radius: 10px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 0.95rem;
        }

        .baitap-option-btn:disabled {
          cursor: default;
        }

        .baitap-option-letter {
          flex-shrink: 0;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #334155;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
        }

        .baitap-option-active {
          border-color: #0ea5e9;
          background: #f0f9ff;
        }

        .baitap-option-correct {
          border-color: #22c55e;
          background: #f0fdf4;
        }

        .baitap-option-correct
          .baitap-option-letter {
          background: #22c55e;
          color: #fff;
        }

        .baitap-option-wrong {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .baitap-option-wrong
          .baitap-option-letter {
          background: #ef4444;
          color: #fff;
        }

        .baitap-feedback {
          margin-top: 10px;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .baitap-feedback-ok {
          color: #16a34a;
        }

        .baitap-feedback-no {
          color: #dc2626;
        }
      `}</style>

      {!data ? (
        <p className="baitap-empty">Không có dữ liệu bài tập.</p>
      ) : questions && questions.length > 0 ? (
        questions.map((q, i) => <QuestionCard key={i} index={i} question={q} />)
      ) : (
        <div className="baitap-raw-fallback">{data}</div>
      )}
    </div>
  );
}
