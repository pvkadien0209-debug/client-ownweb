// ghepAmProgress.js
//
// File MỚI — các hàm chấm điểm dùng riêng cho popup "Ghép âm"
// (PracticeGhepAmModal.js). KHÔNG import/sửa gì từ similarityMatcher.js hay
// Dictaphone (RegcognitionV2024-05-NG_FOR_TEACHING.js) — theo đúng quy tắc
// "tránh ảnh hưởng logic cũ, file nào cũng tạo mới dù có dùng lại logic".
//
// findIpaReference: SAO CHÉP lại đúng logic so khớp đang nằm BÊN TRONG hàm
// StringSimilarityMatcher ở similarityMatcher.js (hàm nội bộ đó không export
// ra để tái dùng) — so CMDlist (câu đang luyện) với từng "IPA-01" trong
// HDTB.IP, ngưỡng 0.9 giữ nguyên như bản gốc.
import { compareTwoStrings } from "string-similarity";

export function findIpaReference(cmdList, ipList, threshold = 0.9) {
  if (!cmdList || !Array.isArray(ipList)) return null;
  let best = null;
  let bestScore = threshold;
  ipList.forEach((entry) => {
    const score = compareTwoStrings(cmdList, entry?.["IPA-01"] || "");
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  });
  return best;
}

// "Đọc đúng >65%": so transcript giọng nói với câu đang luyện (CMDlist) —
// ngưỡng 0.65 theo đúng yêu cầu người dùng.
export function isReadCorrect(transcript, target, threshold = 0.65) {
  if (!transcript || !target) return false;
  const score = compareTwoStrings(
    transcript.toLowerCase().trim(),
    target.toLowerCase().trim(),
  );
  return score > threshold;
}

// "Ghép đúng" (tự động, không cần bấm gì): so nội dung đã gõ trong ô phiên
// âm với IPA-03 (UK) / IPA-04 (US) của mục tham khảo tìm được qua
// findIpaReference — lấy giá trị giống nhau CAO NHẤT trong 2 cái. Ngưỡng 0.9
// giữ nguyên mức "độ tin cậy cao" đã dùng sẵn trong dự án (giống ngưỡng của
// similarityMatcher.js) thay vì tự đặt ra 1 con số mới.
export function isMatchCorrect(typedText, ipEntry, threshold = 0.9) {
  if (!typedText || !ipEntry) return false;
  const guess = typedText.toLowerCase().trim();
  if (!guess) return false;
  const ipa03 = (ipEntry["IPA-03"] || "").toLowerCase().trim();
  const ipa04 = (ipEntry["IPA-04"] || "").toLowerCase().trim();
  const score03 = ipa03 ? compareTwoStrings(guess, ipa03) : 0;
  const score04 = ipa04 ? compareTwoStrings(guess, ipa04) : 0;
  return Math.max(score03, score04) > threshold;
}

// Dùng cho Tab 3 (trò chơi sắp xếp câu): tách câu đang luyện thành từng từ,
// xáo trộn ngẫu nhiên (Fisher-Yates) để người học sắp xếp lại. Thử lại tối đa
// vài lần nếu xáo ra đúng y hệt thứ tự gốc (chỉ có thể xảy ra khi câu quá
// ngắn) để tránh trường hợp "câu đố" hiện ra đã đúng sẵn.
export function shuffleSentenceWords(sentence) {
  const words = (sentence || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, id) => ({ id, word }));
  if (words.length <= 1) return words;
  let shuffled = words;
  for (let attempt = 0; attempt < 6; attempt++) {
    shuffled = [...words];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const same = shuffled.every((item, idx) => item.id === words[idx].id);
    if (!same) break;
  }
  return shuffled;
}

// So thứ tự các từ đã sắp xếp (mảng {id, word}) với câu gốc — TRUE nếu đúng
// nguyên văn thứ tự.
export function isArrangedCorrectly(arrangedWords, sentence) {
  const original = (sentence || "").trim().split(/\s+/).filter(Boolean);
  if (!Array.isArray(arrangedWords) || arrangedWords.length !== original.length) {
    return false;
  }
  return arrangedWords.every((item, idx) => item.word === original[idx]);
}
