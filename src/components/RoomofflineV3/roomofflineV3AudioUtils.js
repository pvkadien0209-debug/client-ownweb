// roomofflineV3AudioUtils.js
//
// File MỚI, riêng cho RoomofflineV3 — Bước 3: phát audio của 1 từ theo
// `code` trong bảng phiên âm.
//
// Quy ước đường dẫn audio: COPY lại đúng logic buildAudioPath (hàm nội bộ,
// KHÔNG export trong client/src/ulti/ReadMessage_2024.js — không sửa file
// đó) — phần trước dấu "_" đầu tiên trong `code` là tên thư mục con dưới
// /audio/. Ví dụ code = "W3_A2about" → "/audio/W3/W3_A2about.mp3".
//
// Tại thời điểm làm bước này, thư mục public/audio/W3/ CHƯA có sẵn 3141 file
// mp3 thật (đã kiểm tra và báo trước với người dùng). Để bài đố vẫn chạy
// được ngay, và TỰ CHUYỂN sang phát audio thật ngay khi nào các file mp3 đó
// được thêm vào đúng thư mục (không cần sửa code gì thêm), áp dụng ĐÚNG cơ
// chế fallback mà ReadMessage_2024.js đã dùng cho tình huống tương tự: thử
// phát file mp3 thật trước, nếu lỗi (chưa có file/404/không phát được) thì
// tự động đọc bằng TTS server (read_by_Tts — TÁI SỬ DỤNG nguyên, không sửa).

import read_by_Tts from "../../ulti/readMessage_TtsServer";

export function buildWordAudioPath(code) {
  if (!code || typeof code !== "string") return null;
  const prefix = code.includes("_") ? code.split("_")[0] : "";
  return prefix ? `/audio/${prefix}/${code}.mp3` : `/audio/${code}.mp3`;
}

// Phát audio của 1 từ (mục dữ liệu từ bảng phiên âm — cần {code, text}).
// onStart/onEnd: callback để component cha biết lúc nào đang phát (khoá nút
// nghe lại) và lúc nào phát xong (mở khoá lại) — dùng chung cho cả 2 đường:
// audio thật lẫn TTS fallback.
// Trả về đối tượng Audio (hoặc null nếu không có code hợp lệ) để component
// cha có thể lưu lại và .pause() khi cần (đổi câu, unmount,...) — tránh audio
// cũ vẫn phát ngầm khi đã chuyển sang từ khác.
export function playWordAudio(word, { onStart, onEnd } = {}) {
  const path = buildWordAudioPath(word?.code);
  if (!path) {
    if (typeof onEnd === "function") onEnd();
    return null;
  }

  const audio = new Audio(path);
  let fallbackTriggered = false;
  const triggerFallback = () => {
    if (fallbackTriggered) return;
    fallbackTriggered = true;
    console.warn(
      `Chưa có audio thật (${path}) — tạm thời đọc bằng TTS server.`,
    );
    read_by_Tts(
      word?.text,
      () => {
        if (typeof onEnd === "function") onEnd();
      },
      onStart,
      onEnd,
    );
  };

  audio.addEventListener("ended", () => {
    if (typeof onEnd === "function") onEnd();
  });
  audio.addEventListener("error", triggerFallback);
  audio.addEventListener("play", () => {
    if (typeof onStart === "function") onStart();
  });
  audio.play().catch(triggerFallback);

  return audio;
}
