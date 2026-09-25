// roomofflineV2AnswerMatcher.js
//
// File MỚI — tách riêng cho RoomofflineV2, KHÔNG import/sửa gì từ
// RegcognitionV2024-05-NG.js hay B101_FINAL_PROJECTS.js.
//
// Đây là bước "việc lớn nhất" trong lần kiểm tra toàn diện: chuyển cơ chế
// chấm điểm của RoomofflineV2 từ so toàn câu (compareTwoStrings đơn giản với
// currentItem.fsp) sang ĐÚNG cơ chế multi-answer của bản cũ, dựa trên
// currentItem.submit (danh sách "tag" cần thu thập đủ) và currentItem.data
// (danh sách các mục {qs, aw, aw01, action} — câu trả lời được so với từng
// biến thể qs, khớp thì đẩy action[0] vào PushAW).
//
// findBest: sao chép nguyên logic từ hàm nội bộ (không export) cùng tên
// trong client/src/ulti/RegcognitionV2024-05-NG.js.
// checkArrays: sao chép nguyên logic từ hàm nội bộ (không export) cùng tên
// trong client/src/components/pracPages/B101_FINAL_PROJECTS.js.
//
// Lý do phải copy thay vì import: các hàm gốc không được export, và mục tiêu
// là "các file đều tạo mới dù có dùng lại logic để dễ sửa đổi" — sửa ở đây sẽ
// không ảnh hưởng gì tới 2 file bản cũ.

import stringSimilarity from "string-similarity";

function countWordsInStatement(str) {
  return str.trim().split(/\s+/).length;
}

// Tìm mục (trong currentItem.data) có "qs" khớp nhất với câu vừa nói/gõ.
// threshold: ngưỡng độ giống tối thiểu (bản cũ dùng 0.5).
// minLengthRatio: câu nói phải có ít nhất (minLengthRatio * số từ của qs) từ
// thì mới được xét, tránh câu quá ngắn khớp nhầm với câu dài (bản cũ dùng 0.7).
export function findBest(statement, cmdList, threshold = 0.5, minLengthRatio = 0.7) {
  if (!statement || !Array.isArray(cmdList)) return null;
  const normStatement = statement.toLowerCase();
  const statementWordCount = countWordsInStatement(normStatement);
  let maxSim = -1;
  let best = null;
  for (const obj of cmdList) {
    for (const q of obj.qs || []) {
      if (!q) continue;
      const normQ = q.toLowerCase();
      const qWordCount = countWordsInStatement(normQ);
      if (statementWordCount / qWordCount < minLengthRatio) continue;
      const sim = stringSimilarity.compareTwoStrings(normStatement, normQ);
      if (sim >= threshold && sim > maxSim) {
        maxSim = sim;
        best = obj;
        if (sim === 1) {
          best._sim = sim;
          return best;
        }
      }
    }
  }
  if (best) best._sim = maxSim;
  return best;
}

// Theo yêu cầu "biểu đồ cột độ giống": chỉ dùng để LẤY SỐ cho biểu đồ (không
// dùng để quyết định đúng/sai — việc đó vẫn là findBest ở trên, giữ nguyên
// không đổi) — trả về độ giống CAO NHẤT tìm được so với tất cả biến thể qs,
// dù có vượt ngưỡng threshold của findBest hay không (để cả câu trả lời sai/
// không khớp cũng có 1 con số để xếp vào biểu đồ).
export function bestSimilarityScore(statement, cmdList, minLengthRatio = 0.7) {
  if (!statement || !Array.isArray(cmdList)) return 0;
  const normStatement = statement.toLowerCase();
  const statementWordCount = countWordsInStatement(normStatement);
  let maxSim = 0;
  for (const obj of cmdList) {
    for (const q of obj.qs || []) {
      if (!q) continue;
      const normQ = q.toLowerCase();
      const qWordCount = countWordsInStatement(normQ);
      if (statementWordCount / qWordCount < minLengthRatio) continue;
      const sim = stringSimilarity.compareTwoStrings(normStatement, normQ);
      if (sim > maxSim) maxSim = sim;
    }
  }
  return maxSim;
}

// So sánh danh sách "tag" cần có (submitArr = currentItem.submit) với danh
// sách "tag" đã thu thập được (pushAwArr) — TÁI HIỆN đúng logic checkArrays
// trong B101_FINAL_PROJECTS.js bản cũ:
//   1 = ĐÚNG hoàn toàn (đủ hết submit, tối đa 1 tag thừa/sai)
//   2 = SAI nhiều (từ 2 tag thừa/sai trở lên) → chuyển câu khác
//   3 = có tag sai nhưng CHƯA đủ hết submit → trừ điểm nhưng vẫn ở lại câu này
//   0 = chưa đủ, chưa có gì sai → chờ tiếp
export function checkArrays(submitArr, pushAwArr) {
  if (!Array.isArray(submitArr) || !Array.isArray(pushAwArr)) return 0;
  const allInArray02 = submitArr.every((e) => pushAwArr.includes(e));
  const extra = pushAwArr.filter((e) => !submitArr.includes(e));
  if (extra.length >= 2) return 2;
  if (extra.length > 0 && !allInArray02) return 3;
  if (allInArray02 && extra.length < 2) return 1;
  return 0;
}
