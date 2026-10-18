// SP01 · M2 (N3) — Bộ kiểm tra dữ liệu bài học tự động, theo Quy chuẩn soạn nội dung.
// Trả về danh sách { level: "error" | "warn", q, msg }.
import { normalize, dice, wordMatch, formsOf, matchAnswer } from "./matcher";

const LEVEL_WORDS = { A1: [6, 10], B1: [10, 16], C1: [16, 25] };
const BAD_MAIN = /[^A-Za-z ,.'’\-?]/; // cách nói chính: chỉ chữ, khoảng trắng, , . ' - ?
const BAD_ANY = /[→←*_<>[\]{}|~^=+#@&"]/; // ký hiệu không đọc được (mọi cách nói)
const count = (s) => normalize(s).split(" ").filter(Boolean).length;

export default function validateLesson(lesson) {
  const out = [];
  const add = (level, q, msg) => out.push({ level, q, msg });
  const [min, max] = LEVEL_WORDS[lesson.level] || [1, 99];
  const qs = lesson.questions || [];
  if (qs.length !== 50) add("warn", "-", `Bài có ${qs.length} câu (quy định 50 câu — K5)`);
  const ids = new Set();
  qs.forEach((q) => {
    const id = q.id;
    if (ids.has(id)) add("error", id, "Trùng mã câu hỏi");
    ids.add(id);
    if (!q.question?.text) add("error", id, "Thiếu chữ câu hỏi");
    else if (BAD_MAIN.test(q.question.text)) add("error", id, `Câu hỏi có ký hiệu: "${q.question.text}" (CH4)`);
    const opts = q.options || [];
    if (opts.length !== 4) add("error", id, `Có ${opts.length} đáp án (cần 4)`);
    if (!opts.some((o) => o.key === q.answer)) add("error", id, `Đáp án đúng "${q.answer}" không có trong A–D`);
    if (!q.explanation?.en || !q.explanation?.vi) add("error", id, "Thiếu giải thích EN hoặc VI (K11)");
    const withVariants = opts.filter((o) => (o.variants || []).length).map((o) => o.key);
    if (withVariants.length === 1 && withVariants[0] === q.answer)
      add("error", id, "Chỉ đáp án đúng có cách nói khác → lộ đáp án (CN6)");
    opts.forEach((o) => {
      const n = count(o.text);
      if (n < min || n > max) add("error", id, `Đáp án ${o.key}: ${n} từ (cấp ${lesson.level} cần ${min}–${max}) (DA2)`);
      if (BAD_MAIN.test(o.text) || /\d/.test(o.text)) add("error", id, `Đáp án ${o.key}: cách nói chính có ký hiệu/số (DA1)`);
      if (formsOf(o).length - (o.alt || []).length > 3) add("error", id, `Đáp án ${o.key}: quá 3 cách nói (CN5)`);
      (o.variants || []).forEach((v) => {
        if (BAD_ANY.test(v)) add("error", id, `Đáp án ${o.key}: cách nói khác có ký hiệu không đọc được: "${v}"`);
        if (count(v) > max) add("warn", id, `Đáp án ${o.key}: cách nói khác dài ${count(v)} từ`);
      });
      // Nói bất kỳ cách nào của đáp án này phải chỉ khớp chính nó (DA6, CN4)
      formsOf(o).forEach((f) => {
        const r = matchAnswer(f, opts);
        if (r.status === "match" && r.key !== o.key) add("error", id, `Nói "${f}" (${o.key}) bị chấm thành ${r.key}`);
        else if (r.status !== "match") add("error", id, `Nói "${f}" (${o.key}) không khớp chắc chắn (${r.status})`);
      });
    });
    // Cảnh báo: hai đáp án quá giống nhau
    for (let i = 0; i < opts.length; i++)
      for (let j = i + 1; j < opts.length; j++) {
        const a = normalize(opts[i].text), b = normalize(opts[j].text);
        const s = dice(a, b);
        if (s >= 0.45) add("warn", id, `${opts[i].key} và ${opts[j].key} khá giống nhau (độ giống ${s.toFixed(2)}, từ chung ${wordMatch(a, b).toFixed(2)})`);
      }
  });
  return out;
}
