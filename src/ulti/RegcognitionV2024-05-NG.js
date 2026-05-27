import React from "react";
import stringSimilarity from "string-similarity";
import ReadMessage from "./ReadMessageMp3_2026";

/* ════════════════════════════════════════════════════════════════════
   Dictaphone — chỉ xử lý check logic
   KHÔNG có speech-to-text, KHÔNG có mic UI
   Đọc input từ #dtphTranscript.textContent → gọi check()
════════════════════════════════════════════════════════════════════ */
const Dictaphone = ({ CMDlist, GENDER, setScore, addElementIfNotExist }) => {
  /* ── Đọc text từ DOM ─────────────────────────────────────────── */
  const getInput = () =>
    document.getElementById("dtphTranscript")?.textContent?.trim() || "";

  /* ── Check ───────────────────────────────────────────────────── */
  function check(input) {
    const objTR = findBest(input, CMDlist, 0.4);

    if (!objTR || !objTR.qs) {
      ReadMessage(
        GENDER === 1 ? [{ id: "sorryFemale" }] : [{ id: "sorryMale" }],
      );
      return;
    }

    const awArr = objTR.aw || [];
    const aw01Arr = objTR.aw01 || [];
    const idx = Math.floor(Math.random() * (awArr.length || 1));
    const answer = awArr[idx];
    const audio = aw01Arr[idx];

    if (answer) ReadMessage(audio?.id ? [{ id: audio.id }] : undefined);

    if (objTR.action?.[0]) {
      if (objTR.action[0] === "WRONG") {
        const btn = document.getElementById("btnBoQua");
        if (btn) btn.click();
        else if (typeof setScore === "function") setScore((S) => S - 2);
      } else if (typeof addElementIfNotExist === "function") {
        addElementIfNotExist(objTR.action[0]);
      }
    }
  }

  /* ── Render: hidden DOM anchor + trigger button ──────────────── */
  return (
    <div style={{ display: "" }}>
      <div id="dtphTranscript" />
      <button id="checkBTN" onClick={() => check(getInput())} />
    </div>
  );
};

export default Dictaphone;

/* ══════════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════════ */

function findBest(statement, cmdList, threshold) {
  if (!statement || !Array.isArray(cmdList)) return null;
  const normStatement = statement;

  let maxSim = -1;
  let best = null;

  for (const obj of cmdList) {
    for (const q of obj.qs || []) {
      const sim = stringSimilarity.compareTwoStrings(normStatement, q);
      if (sim >= threshold && sim > maxSim) {
        maxSim = sim;
        best = obj;
        if (sim === 1) return best;
      }
    }
  }

  return best;
}
