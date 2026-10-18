// SP08 · U3 — Nhận giọng nói dùng chung cho Nghe – nói và Hỏi – đáp.
// Cùng cách làm với KnowledgeLesson (SP01 M3 + #045): luôn tạo đối tượng mới, nhả âm thanh trước khi bật mic,
// tự dừng khi im lặng hoặc sau 10 giây, canh giờ micro (thử lại 1 lần rồi mời gõ).
import { useEffect, useRef, useState } from "react";
import { MIC_WATCHDOG_MS } from "./config";
import { releaseAudioForMic } from "./audioPlayer";

const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
export const speechSupported = !!SR;
const MAX_REC_MS = 10000;

const SPEECH_ERRORS = {
  "not-allowed": "Bạn chưa cho phép dùng micro. Bấm biểu tượng ổ khoá trên thanh địa chỉ để cho phép, hoặc chuyển sang Gõ.",
  "service-not-allowed": "Trình duyệt không cho dùng nhận giọng nói. Hãy chuyển sang Gõ.",
  "no-speech": "Chưa nghe thấy gì. Bấm mic rồi nói gần micro hơn.",
  "audio-capture": "Không tìm thấy micro. Kiểm tra micro hoặc chuyển sang Gõ.",
  network: "Nhận giọng nói cần mạng. Kiểm tra kết nối hoặc chuyển sang Gõ.",
};

/**
 * onResult(alternatives: string[]) — các phương án nhận dạng, phương án đầu là khả năng cao nhất.
 */
export default function useSpeechInput(onResult) {
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState(null);
  const recRef = useRef(null);
  const timerRef = useRef(null);
  const watchRef = useRef(null);
  const cbRef = useRef(onResult);
  cbRef.current = onResult;

  const stop = () => {
    clearTimeout(timerRef.current);
    if (recRef.current) recRef.current.stop();
  };

  const abortAll = () => {
    clearTimeout(timerRef.current);
    clearTimeout(watchRef.current);
    const r = recRef.current;
    recRef.current = null;
    if (r) {
      try {
        r.onresult = r.onerror = r.onend = null;
        r.abort();
      } catch {
        /* bỏ qua */
      }
    }
    setRecording(false);
    setInterim("");
  };
  useEffect(() => abortAll, []); // rời trang → tắt mic

  const start = (attempt = 0) => {
    if (!SR || (recRef.current && attempt === 0)) return;
    releaseAudioForMic();
    setError(null);
    setInterim("");
    const rec = new SR();
    let alive = false;
    const markAlive = () => {
      if (alive) return;
      alive = true;
      clearTimeout(watchRef.current);
    };
    rec.onaudiostart = markAlive;
    rec.onspeechstart = markAlive;
    rec.onstart = () => {
      if (!/iPhone|iPad|iPod/.test(navigator.userAgent)) markAlive();
    };
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 3;
    let finals = [];
    let lastInterim = "";
    rec.onresult = (e) => {
      const fin = [];
      let inter = "";
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) fin.push(Array.from(res).map((a) => a.transcript));
        else inter += res[0].transcript;
      }
      markAlive();
      finals = fin;
      lastInterim = inter;
      setInterim((fin.map((f) => f[0]).join(" ") + " " + inter).trim());
    };
    rec.onerror = (e) => {
      markAlive();
      if (e.error !== "aborted") setError(SPEECH_ERRORS[e.error] || "Không nhận được giọng nói. Bấm mic thử lại, hoặc chuyển sang Gõ.");
    };
    rec.onend = () => {
      clearTimeout(timerRef.current);
      clearTimeout(watchRef.current);
      recRef.current = null;
      setRecording(false);
      setInterim("");
      const head = finals.map((f) => f[0]).join(" ").trim() || lastInterim.trim();
      if (!head) return;
      const alts = finals.length === 1 && finals[0].length > 1 ? finals[0].map((s) => s.trim()) : [head];
      cbRef.current(alts);
    };
    recRef.current = rec;
    try {
      rec.start();
      setRecording(true);
      timerRef.current = setTimeout(() => rec.stop(), MAX_REC_MS);
      clearTimeout(watchRef.current);
      watchRef.current = setTimeout(() => {
        if (alive) return;
        abortAll();
        if (attempt === 0) setTimeout(() => startRef.current(1), 250);
        else setError("Micro chưa sẵn sàng (thường gặp trên iPhone ngay sau khi phát âm thanh). Bấm mic lần nữa, hoặc chuyển sang Gõ.");
      }, MIC_WATCHDOG_MS);
    } catch {
      setError("Không bật được micro. Bấm mic thử lại, hoặc chuyển sang Gõ.");
    }
  };
  const startRef = useRef(start);
  startRef.current = start;

  return { supported: speechSupported, recording, interim, error, start: () => start(0), stop, abort: abortAll, clearError: () => setError(null) };
}
