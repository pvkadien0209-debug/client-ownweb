// Dùng chung cho các nút/bảng điều hướng sang màn "Ghép âm"
// (trước đây đoạn này bị lặp lại y hệt ở 4 chỗ: 3 lần trong
// LessonTableSection và 1 lần trong MauCauSection)
export function buildGhepAmUrl(id, currentIndex, value) {
  return `/learninghub/${id}?ls=${currentIndex}&&scrollY=${
    window.scrollY
  }&&id=div_01_prac_ghep_am&&st=${value
    .toString()
    .split(" ")
    .join("-")}`;
}
