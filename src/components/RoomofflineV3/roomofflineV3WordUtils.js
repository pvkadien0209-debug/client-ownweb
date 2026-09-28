// roomofflineV3WordUtils.js
//
// File MỚI, riêng cho RoomofflineV3 — Bước 2: trích từ vựng từ dữ liệu bài
// học (fsp/qs/aw) rồi khớp với bảng phiên âm 3141 từ
// (public/jsonData/w3000UEOAIO/w3000UEOAI.json).
//
// Ghi chú về hiệu năng (đã bàn với người dùng trước khi làm):
//   - Bảng 3141 từ (~597KB) được tải LAZY qua fetch (KHÔNG import tĩnh vào
//     bundle) — chỉ tải khi RoomofflineV3 thực sự cần, và CHỈ TẢI 1 LẦN cho
//     cả phiên làm việc (cache ở biến module-level `wordBankPromise` +
//     `wordBankMapCache` bên dưới) — mở nhiều bài học khác nhau trong cùng 1
//     lần load app không phải tải lại.
//   - Dựng sẵn 1 Map (text viết thường → mục dữ liệu) ngay sau khi tải xong,
//     để tra cứu từng từ là O(1) thay vì duyệt lại mảng 3141 phần tử mỗi lần.
//   - Số từ trích ra từ 1 bài học chỉ vài chục câu ngắn (fsp/qs/aw của các
//     thẻ đã nạp) — tokenize + tra Map cho từng từ là việc rất nhẹ, không
//     đáng lo về hiệu năng dù có thực hiện lại mỗi khi đổi bài học.

const WORD_BANK_URL = "/jsonData/w3000UEOAIO/w3000UEOAI.json";

// Tách 1 chuỗi câu thành các từ tiếng Anh đơn lẻ, viết thường, bỏ dấu câu
// (giữ lại dấu nháy đơn trong từ kiểu "don't"/"it's").
export function tokenizeToWords(str) {
  if (!str || typeof str !== "string") return [];
  return str
    .toLowerCase()
    .replace(/[^a-z\s']/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^'+|'+$/g, "")) // bỏ dấu nháy đơn thừa ở đầu/cuối
    .filter(Boolean);
}

// Trích TẤT CẢ các từ xuất hiện trong 1 "thẻ luyện tập" (1 phần tử của
// DataPracticingCharactor) — đúng 3 nguồn theo yêu cầu: fsp (câu gợi ý),
// data[].qs (các câu trả lời chấp nhận được), data[].aw (các câu xác nhận).
export function extractWordsFromCard(card) {
  const words = [];
  if (card?.fsp) words.push(...tokenizeToWords(card.fsp));
  if (Array.isArray(card?.data)) {
    card.data.forEach((d) => {
      if (Array.isArray(d?.qs)) {
        d.qs.forEach((q) => words.push(...tokenizeToWords(q)));
      }
      if (Array.isArray(d?.aw)) {
        d.aw.forEach((a) => words.push(...tokenizeToWords(a)));
      }
    });
  }
  return words;
}

// Trích từ vựng KHÔNG TRÙNG LẶP từ toàn bộ danh sách thẻ luyện tập đã nạp
// cho bài học hiện tại (DataPracticingCharactor).
export function extractUniqueWordsFromCards(cards) {
  const set = new Set();
  (Array.isArray(cards) ? cards : []).forEach((card) => {
    extractWordsFromCard(card).forEach((w) => set.add(w));
  });
  return Array.from(set);
}

// Tải bảng phiên âm — LAZY + CACHE (chỉ tải 1 lần/phiên, xem ghi chú đầu
// file). Nếu lỗi thì xoá cache promise để lần gọi sau được thử tải lại
// (tránh bị "kẹt" ở promise lỗi vĩnh viễn nếu chỉ là lỗi mạng tạm thời).
let wordBankPromise = null;
export function loadWordBankRaw() {
  if (!wordBankPromise) {
    wordBankPromise = fetch(WORD_BANK_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Không tải được bảng phiên âm (HTTP lỗi)");
        return res.json();
      })
      .catch((error) => {
        wordBankPromise = null;
        throw error;
      });
  }
  return wordBankPromise;
}

// Dựng (và cache) Map tra cứu nhanh: text viết thường → mục dữ liệu đầy đủ
// {text, UK, US, UKGHEPAM, USGHEPAM, code, stt}.
let wordBankMapCache = null;
export async function getWordBankMap() {
  if (wordBankMapCache) return wordBankMapCache;
  const data = await loadWordBankRaw();
  const map = new Map();
  (Array.isArray(data) ? data : []).forEach((entry) => {
    if (entry?.text) map.set(entry.text.toLowerCase(), entry);
  });
  wordBankMapCache = map;
  return map;
}

// So khớp danh sách từ (đã trích từ bài học) với bảng phiên âm — trả về
// đúng các mục TÌM THẤY (giữ nguyên dữ liệu gốc của bảng phiên âm), theo
// đúng thứ tự từ xuất hiện lần đầu trong bài học. KHÔNG độn thêm từ ngoài
// bài học nếu số lượng khớp được ít — đúng quyết định đã thống nhất.
export async function matchWordsWithBank(words) {
  const map = await getWordBankMap();
  const matched = [];
  (Array.isArray(words) ? words : []).forEach((w) => {
    const entry = map.get(w);
    if (entry) matched.push(entry);
  });
  return matched;
}

// BƯỚC 3: lấy TOÀN BỘ mảng gốc của bảng phiên âm — dùng làm nguồn NHIỄU cho
// giao diện đố (nhiễu lấy từ toàn bộ 3141 từ, không giới hạn trong số từ đã
// khớp được của riêng bài học). Dùng lại đúng loadWordBankRaw() nên KHÔNG
// fetch thêm lần nào nữa nếu getWordBankMap() đã tải trước đó (và ngược lại).
let wordBankArrayCache = null;
export async function getWordBankArray() {
  if (wordBankArrayCache) return wordBankArrayCache;
  const data = await loadWordBankRaw();
  wordBankArrayCache = Array.isArray(data) ? data : [];
  return wordBankArrayCache;
}

// Dựng đúng `totalOptions` (mặc định 8) đáp án hiển thị cho 1 từ mục tiêu:
//   - Đáp án ĐÚNG: UKGHEPAM và USGHEPAM của từ mục tiêu — nếu 2 dạng khác
//     nhau thì CẢ 2 đều hiển thị (chiếm 2 ô), giống hệt nhau thì chỉ 1 ô
//     (đúng yêu cầu "chỉ cần chọn 1 trong 2 đúng").
//   - Đáp án NHIỄU: lấy ngẫu nhiên từ TOÀN BỘ bảng phiên âm (loại trừ chính
//     từ mục tiêu), mỗi lượt lấy ngẫu nhiên 1 trong 2 dạng UK/US của mục
//     nhiễu đó — bỏ qua nếu trùng chuỗi đã có (tránh 2 ô hiển thị giống hệt
//     nhau, kể cả trùng ngẫu nhiên với chính đáp án đúng).
export function buildQuizOptions(target, allEntries, totalOptions = 8) {
  const correctForms = Array.from(
    new Set([target?.UKGHEPAM, target?.USGHEPAM].filter(Boolean)),
  );
  const usedTexts = new Set(correctForms);
  const options = correctForms.map((text) => ({ text, correct: true }));

  const pool = (Array.isArray(allEntries) ? allEntries : []).filter(
    (e) => e?.code !== target?.code,
  );
  // Giới hạn số lần thử để không lặp vô hạn nếu chẳng may pool quá nhỏ/trùng
  // nhiều — với 3141 từ trong bảng thì gần như không bao giờ chạm giới hạn.
  let guard = 0;
  const guardLimit = totalOptions * 50;
  while (options.length < totalOptions && pool.length > 0 && guard < guardLimit) {
    guard++;
    const candidate = pool[Math.floor(Math.random() * pool.length)];
    const form = Math.random() < 0.5 ? candidate.UKGHEPAM : candidate.USGHEPAM;
    if (!form || usedTexts.has(form)) continue;
    usedTexts.add(form);
    options.push({ text: form, correct: false });
  }

  // Xáo trộn thứ tự hiển thị (Fisher-Yates) — không để đáp án đúng luôn ở
  // đầu danh sách.
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

// Dựng đáp án cho dạng đố "1 đáp án đúng duy nhất" — KHÁC buildQuizOptions ở
// trên (dành riêng cho GHEPAM, có thể có 2 dạng đúng UK/US). Dùng CHUNG cho
// RoomofflineV4 (nghe → chọn nghĩa: getField = (w) => w.meaning) và
// RoomofflineV5 (đọc nghĩa → chọn từ: getField = (w) => w.text) — tái sử
// dụng đúng 1 hàm thay vì viết lại 2 lần cho 2 bài, tránh lệch logic về sau.
// `getField` lấy ra CHUỖI HIỂN THỊ từ 1 mục dữ liệu bảng phiên âm.
export function buildSingleAnswerOptions(
  target,
  allEntries,
  getField,
  totalOptions = 8,
) {
  const correctText = getField(target);
  if (!correctText) return [];
  const usedTexts = new Set([correctText]);
  const options = [{ text: correctText, correct: true }];

  const pool = (Array.isArray(allEntries) ? allEntries : []).filter(
    (e) => e?.code !== target?.code,
  );
  let guard = 0;
  const guardLimit = totalOptions * 50;
  while (options.length < totalOptions && pool.length > 0 && guard < guardLimit) {
    guard++;
    const candidate = pool[Math.floor(Math.random() * pool.length)];
    const text = getField(candidate);
    if (!text || usedTexts.has(text)) continue;
    usedTexts.add(text);
    options.push({ text, correct: false });
  }

  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}
