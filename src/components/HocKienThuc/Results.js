// SP01 · M5 + SP02 · P4 — Bảng kết quả một bài: dùng ở cuối màn hình làm bài và ở phần "Kết quả của tôi".
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Repeat, Check, X } from "lucide-react";
import { wrongIndexes } from "./knowledgeData";

/** Nút có bước xác nhận ngay trên trang (không dùng hộp thoại của trình duyệt). */
export function ConfirmButton({ children, question, confirmLabel, onConfirm, className = "hkt-btn" }) {
  const [asking, setAsking] = useState(false);
  if (!asking)
    return (
      <button type="button" className={className} onClick={() => setAsking(true)}>
        {children}
      </button>
    );
  return (
    <span className="hkt-confirm" role="group" aria-label={question}>
      <span>{question}</span>
      <button type="button" className="hkt-btn hkt-btn--danger" onClick={onConfirm}>
        {confirmLabel}
      </button>
      <button type="button" className="hkt-btn" onClick={() => setAsking(false)}>
        Huỷ
      </button>
    </span>
  );
}

export default function Results({ questions, progress, quizPath, backTo, onRetryWrong, onRestart, onContinue }) {
  const total = questions.length;
  const { done = 0, correct = 0 } = progress;
  const wrong = wrongIndexes(progress, questions);
  const pct = done ? Math.round((correct / done) * 100) : 0;
  const unfinished = done < total;
  return (
    <div className="hkt-results">
      <div className="hkt-score">
        <p className="hkt-score-big">
          <strong>{correct}</strong>/{total}
        </p>
        <p className="hkt-score-sub">
          {unfinished ? `Đã làm ${done}/${total} câu · ` : ""}đúng {pct}% số câu đã làm
        </p>
        <p className="hkt-score-counts">
          <span className="is-right"><Check size={16} /> {correct} đúng</span>
          <span className="is-wrong"><X size={16} /> {done - correct} sai</span>
        </p>
      </div>

      <div className="hkt-result-actions">
        {onContinue && (
          <button type="button" className="hkt-btn hkt-btn--primary" onClick={onContinue}>
            Làm tiếp
          </button>
        )}
        {wrong.length > 0 && (
          <button type="button" className={`hkt-btn${unfinished ? "" : " hkt-btn--primary"}`} onClick={onRetryWrong}>
            <Repeat size={18} /> Làm lại {wrong.length} câu sai
          </button>
        )}
        <ConfirmButton question="Xoá kết quả cũ và làm lại từ câu 1?" confirmLabel="Xoá và làm lại" onConfirm={onRestart}>
          <RotateCcw size={18} /> Làm lại từ đầu
        </ConfirmButton>
        {backTo && (
          <Link className="hkt-btn" to={backTo}>
            Về trang bài
          </Link>
        )}
      </div>

      {wrong.length > 0 ? (
        <>
          <h2 className="hkt-h2">Các câu bạn trả lời sai</h2>
          <ol className="hkt-wrong-list">
            {wrong.map((i) => {
              const q = questions[i];
              const a = progress.answers[q.id];
              const chosen = q.options.find((o) => o.key === a.chosen);
              const right = q.options.find((o) => o.key === q.answer);
              return (
                <li key={q.id}>
                  <p className="hkt-wl-q" lang="en">
                    <span className="hkt-wl-no">Câu {i + 1}.</span> {q.question.text}
                  </p>
                  <p className="hkt-wl-a is-wrong">
                    <X size={15} /> Bạn chọn {a.chosen}: <span lang="en">{chosen?.text}</span>
                  </p>
                  <p className="hkt-wl-a is-right">
                    <Check size={15} /> Đáp án đúng {q.answer}: <span lang="en">{right?.text}</span>
                  </p>
                  {q.explanation?.vi && <p className="hkt-wl-why">{q.explanation.vi}</p>}
                  {quizPath && (
                    <Link className="hkt-link" to={`${quizPath}?q=${i + 1}`}>
                      Làm lại câu này
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      ) : (
        done > 0 && <p className="hkt-muted">Bạn chưa trả lời sai câu nào. Rất tốt!</p>
      )}
    </div>
  );
}
