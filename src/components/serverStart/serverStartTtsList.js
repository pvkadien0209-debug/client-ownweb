import React, { useState, useRef } from "react";
import LinkAPI from "../../ulti/T0_linkApi";

// ─── Download helper ──────────────────────────────────────────────────────────
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Detect lang for preview badge ───────────────────────────────────────────
function resolveLang(itemLang, globalLang) {
  if (itemLang && /^en$/i.test(String(itemLang).trim())) return "EN";
  return globalLang === "en" ? "EN" : "VI";
}

// ─── Slider Row component ────────────────────────────────────────────────────
function SliderRow({ label, name, value, min, max, step, onChange, hint }) {
  return (
    <div style={s.sliderRow}>
      <div style={s.sliderLabel}>
        <span style={s.sliderName}>{label}</span>
        <span style={s.sliderValue}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(name, parseFloat(e.target.value))}
        style={s.slider}
      />
      <span style={s.sliderHint}>{hint}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TTSFromFileButton() {
  const [items, setItems] = useState([]);
  const [fileName, setFileName] = useState("");
  const [logs, setLogs] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  // ── Audio params state ────────────────────────────────────────────────────
  const [params, setParams] = useState({
    speedRate: 1.1, // 0.5 – 2.0
    pitchShift: 1.4, // 0.5 – 2.0
    volume: 2.0, // 0.1 – 5.0
    slow: false, // Google TTS slow mode
    lang: "vi", // default language
  });

  const fileInputRef = useRef(null);
  const abortRef = useRef(false);

  const log = (msg, type = "info") => {
    const icon =
      { info: "ℹ️", success: "✅", error: "❌", warn: "⚠️" }[type] || "•";
    setLogs((p) => [
      ...p,
      { msg, type, icon, time: new Date().toLocaleTimeString() },
    ]);
  };

  const updateParam = (key, val) => setParams((p) => ({ ...p, [key]: val }));

  // ── File picker ───────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setLogs([]);
    setItems([]);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) throw new Error("JSON phải là một mảng []");
        const valid = parsed.filter((item, i) => {
          if (!item.code || !item.text) {
            log(`Item [${i}] thiếu "code" hoặc "text", bỏ qua.`, "warn");
            return false;
          }
          return true;
        });
        setItems(valid);
        const enCount = valid.filter((it) =>
          /^en$/i.test(String(it.lang || "")),
        ).length;
        log(
          `Đọc file thành công: ${valid.length} items (${enCount} EN / ${valid.length - enCount} VI)`,
          "success",
        );
      } catch (err) {
        log(`Lỗi parse JSON: ${err.message}`, "error");
        setItems([]);
      }
    };
    reader.readAsText(file, "utf-8");
  };

  // ── Generate & download all ───────────────────────────────────────────────
  const handleGenerateAll = async () => {
    if (!items.length) {
      log("Chưa có dữ liệu.", "warn");
      return;
    }
    abortRef.current = false;
    setProcessing(true);
    setProgress({ done: 0, total: items.length });
    log(
      `Bắt đầu ${items.length} items | speed=${params.speedRate} pitch=${params.pitchShift} vol=${params.volume} slow=${params.slow} lang=${params.lang}`,
      "info",
    );

    let ok = 0,
      fail = 0;
    for (let i = 0; i < items.length; i++) {
      if (abortRef.current) {
        log("Đã dừng.", "warn");
        break;
      }
      const item = items[i];
      const langLabel = resolveLang(item.lang, params.lang);
      log(`[${i + 1}/${items.length}] ${langLabel} · ${item.code}`, "info");

      try {
        const resp = await fetch(`${LinkAPI}ttslistTV/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: item.code,
            text: item.text,
            lang: item.lang || params.lang, // item-level lang → server resolves
            speedRate: params.speedRate,
            pitchShift: params.pitchShift,
            volume: params.volume,
            slow: params.slow,
          }),
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${resp.status}`);
        }
        const blob = await resp.blob();
        downloadBlob(blob, `${item.code}.mp3`);
        ok++;
        log(`Downloaded: ${item.code}.mp3`, "success");
      } catch (err) {
        fail++;
        log(`Lỗi ${item.code}: ${err.message}`, "error");
      }

      setProgress({ done: i + 1, total: items.length });
      if (i < items.length - 1 && !abortRef.current)
        await new Promise((r) => setTimeout(r, 300));
    }

    log(
      `Xong: ${ok} thành công, ${fail} thất bại.`,
      fail > 0 ? "warn" : "success",
    );
    setProcessing(false);
  };

  const handleStop = () => {
    abortRef.current = true;
    log("Yêu cầu dừng...", "warn");
  };
  const handleClear = () => {
    setItems([]);
    setFileName("");
    setLogs([]);
    setProgress({ done: 0, total: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleReset = () =>
    setParams({
      speedRate: 1.1,
      pitchShift: 1.4,
      volume: 2.0,
      slow: false,
      lang: "vi",
    });

  const pct =
    progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.wrap}>
      <h2 style={s.title}>🎵 TTS From JSON File</h2>

      {/* ── File picker ── */}
      <div style={s.row}>
        <label style={s.fileLabel}>
          📂 Chọn file .txt / .json
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.json"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>
        {fileName && <span style={s.fileName}>{fileName}</span>}
      </div>

      {/* ── Audio params panel ── */}
      <div style={s.panel}>
        <div style={s.panelHeader}>
          <span>⚙️ Audio Parameters</span>
          <button onClick={handleReset} style={s.resetBtn}>
            ↺ Reset
          </button>
        </div>

        <SliderRow
          label="Speed (atempo)"
          name="speedRate"
          value={params.speedRate}
          min={0.5}
          max={2.0}
          step={0.05}
          onChange={updateParam}
          hint="0.5=chậm · 1.0=chuẩn · 2.0=nhanh"
        />
        <SliderRow
          label="Pitch shift"
          name="pitchShift"
          value={params.pitchShift}
          min={0.5}
          max={2.0}
          step={0.05}
          onChange={updateParam}
          hint="<1=thấp hơn · 1=chuẩn · >1=cao hơn"
        />
        <SliderRow
          label="Volume (gain)"
          name="volume"
          value={params.volume}
          min={0.1}
          max={5.0}
          step={0.1}
          onChange={updateParam}
          hint="1=gốc · 2=×2 · 5=×5 (limiter tự bật khi >2)"
        />

        <div style={s.toggleRow}>
          {/* Slow mode */}
          <label style={s.toggleLabel}>
            <div
              onClick={() => updateParam("slow", !params.slow)}
              style={{
                ...s.toggle,
                backgroundColor: params.slow ? "#a6e3a1" : "#313244",
              }}
            >
              <div
                style={{
                  ...s.toggleKnob,
                  transform: params.slow
                    ? "translateX(18px)"
                    : "translateX(2px)",
                }}
              />
            </div>
            <span style={{ color: params.slow ? "#a6e3a1" : "#6c7086" }}>
              🐢 Slow mode {params.slow ? "(ON)" : "(OFF)"}
            </span>
          </label>

          {/* Default language */}
          <div style={s.langGroup}>
            <span style={s.langLabel}>🌐 Default lang:</span>
            {["vi", "en"].map((l) => (
              <button
                key={l}
                onClick={() => updateParam("lang", l)}
                style={{
                  ...s.langBtn,
                  ...(params.lang === l ? s.langBtnActive : {}),
                }}
              >
                {l === "vi" ? "🇻🇳 VI" : "🇬🇧 EN"}
              </button>
            ))}
          </div>
        </div>

        {/* Live preview of params */}
        <div style={s.paramPreview}>
          speed <b>{params.speedRate}</b> · pitch <b>{params.pitchShift}</b> ·
          vol <b>{params.volume}</b>
          {params.volume > 2 && (
            <span style={{ color: "#f9e2af" }}> · limiter ON</span>
          )}
          · slow <b>{params.slow ? "yes" : "no"}</b> · lang{" "}
          <b>{params.lang.toUpperCase()}</b>
        </div>
      </div>

      {/* ── Items preview ── */}
      {items.length > 0 && (
        <div style={s.preview}>
          <div style={{ marginBottom: 6, fontWeight: "bold" }}>
            📋 {items.length} items:
          </div>
          {items.slice(0, 6).map((item, i) => {
            const lang = resolveLang(item.lang, params.lang);
            return (
              <div key={i} style={s.previewItem}>
                <span
                  style={{
                    ...s.badge,
                    backgroundColor: lang === "EN" ? "#89b4fa44" : "#a6e3a144",
                  }}
                >
                  {lang}
                </span>
                <span style={s.code}>{item.code}</span>
                <span style={s.text}>{item.text}</span>
              </div>
            );
          })}
          {items.length > 6 && (
            <div style={s.more}>… và {items.length - 6} items nữa</div>
          )}
        </div>
      )}

      {/* ── Progress bar ── */}
      {progress.total > 0 && (
        <div style={s.progressWrap}>
          <div style={s.progressBg}>
            <div style={{ ...s.progressFill, width: `${pct}%` }} />
          </div>
          <span style={s.progressText}>
            {progress.done} / {progress.total} ({pct}%)
          </span>
        </div>
      )}

      {/* ── Buttons ── */}
      <div style={s.btnRow}>
        <button
          onClick={handleGenerateAll}
          disabled={processing || items.length === 0}
          style={{
            ...s.btn,
            ...s.btnPrimary,
            opacity: processing || items.length === 0 ? 0.5 : 1,
          }}
        >
          {processing ? "⏳ Đang xử lý..." : "▶️ Bắt đầu TTS & Download"}
        </button>
        {processing && (
          <button onClick={handleStop} style={{ ...s.btn, ...s.btnStop }}>
            ⏹ Dừng
          </button>
        )}
        <button
          onClick={handleClear}
          disabled={processing}
          style={{ ...s.btn, ...s.btnClear }}
        >
          🗑 Xóa
        </button>
      </div>

      {/* ── Logs ── */}
      {logs.length > 0 && (
        <div style={s.logBox}>
          {logs.map((l, i) => (
            <div key={i} style={{ ...s.logItem, color: logColor(l.type) }}>
              <span style={s.logTime}>{l.time}</span>
              <span>
                {l.icon} {l.msg}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const logColor = (t) =>
  ({ success: "#a6e3a1", error: "#f38ba8", warn: "#f9e2af", info: "#89b4fa" })[
    t
  ] || "#cdd6f4";

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  wrap: {
    margin: "4% auto",
    padding: 32,
    backgroundColor: "#1e1e2e",
    borderRadius: 14,
    color: "#e0e0e0",
    fontFamily: "monospace",
    maxWidth: 760,
  },
  title: { marginBottom: 20, fontSize: 20, color: "#cba6f7" },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  fileLabel: {
    padding: "8px 16px",
    backgroundColor: "#313244",
    borderRadius: 8,
    cursor: "pointer",
    border: "1px solid #45475a",
    userSelect: "none",
  },
  fileName: { color: "#a6e3a1", fontSize: 13 },

  // Panel
  panel: {
    backgroundColor: "#181825",
    border: "1px solid #45475a",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    fontWeight: "bold",
    color: "#cba6f7",
  },
  resetBtn: {
    padding: "3px 10px",
    backgroundColor: "#313244",
    border: "1px solid #45475a",
    borderRadius: 6,
    color: "#cdd6f4",
    cursor: "pointer",
    fontSize: 12,
  },

  // Slider
  sliderRow: { marginBottom: 10 },
  sliderLabel: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  sliderName: { color: "#89dceb", fontSize: 12 },
  sliderValue: { color: "#cba6f7", fontWeight: "bold", fontSize: 12 },
  slider: { width: "100%", accentColor: "#cba6f7", cursor: "pointer" },
  sliderHint: { color: "#6c7086", fontSize: 11 },

  // Toggles
  toggleRow: {
    display: "flex",
    gap: 20,
    alignItems: "center",
    marginTop: 12,
    flexWrap: "wrap",
  },
  toggleLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    userSelect: "none",
    fontSize: 13,
  },
  toggle: {
    width: 40,
    height: 22,
    borderRadius: 11,
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  toggleKnob: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    backgroundColor: "#fff",
    transition: "transform 0.2s",
  },
  langGroup: { display: "flex", alignItems: "center", gap: 6 },
  langLabel: { fontSize: 13, color: "#6c7086" },
  langBtn: {
    padding: "4px 12px",
    border: "1px solid #45475a",
    borderRadius: 6,
    cursor: "pointer",
    backgroundColor: "#313244",
    color: "#cdd6f4",
    fontSize: 12,
  },
  langBtnActive: {
    backgroundColor: "#cba6f7",
    color: "#1e1e2e",
    border: "1px solid #cba6f7",
  },

  paramPreview: {
    marginTop: 10,
    fontSize: 12,
    color: "#6c7086",
    backgroundColor: "#11111b",
    borderRadius: 6,
    padding: "6px 10px",
  },

  // Preview
  preview: {
    backgroundColor: "#181825",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    border: "1px solid #45475a",
  },
  previewItem: {
    display: "flex",
    gap: 8,
    padding: "4px 0",
    borderBottom: "1px solid #313244",
    alignItems: "center",
  },
  badge: {
    fontSize: 10,
    fontWeight: "bold",
    padding: "2px 6px",
    borderRadius: 4,
    color: "#cdd6f4",
    minWidth: 26,
    textAlign: "center",
  },
  code: { color: "#89dceb", minWidth: 145, fontWeight: "bold", fontSize: 12 },
  text: {
    color: "#cdd6f4",
    fontSize: 12,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: 380,
  },
  more: { color: "#6c7086", fontSize: 12, marginTop: 6 },

  // Progress
  progressWrap: { marginBottom: 16 },
  progressBg: {
    height: 10,
    backgroundColor: "#313244",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#cba6f7",
    borderRadius: 5,
    transition: "width 0.3s ease",
  },
  progressText: { fontSize: 12, color: "#6c7086" },

  // Buttons
  btnRow: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  btn: {
    padding: "10px 20px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 14,
  },
  btnPrimary: { backgroundColor: "#cba6f7", color: "#1e1e2e" },
  btnStop: { backgroundColor: "#f38ba8", color: "#1e1e2e" },
  btnClear: { backgroundColor: "#45475a", color: "#cdd6f4" },

  // Log
  logBox: {
    backgroundColor: "#11111b",
    borderRadius: 8,
    padding: 12,
    maxHeight: 260,
    overflowY: "auto",
    border: "1px solid #313244",
  },
  logItem: { display: "flex", gap: 10, fontSize: 12, marginBottom: 4 },
  logTime: { color: "#6c7086", minWidth: 65 },
};
