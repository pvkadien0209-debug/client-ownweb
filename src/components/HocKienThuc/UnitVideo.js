// SP10 · #098 — Video tóm tắt bài (khuôn W, 16:9) đặt dưới tên bài, không tự phát (VQ9, VW-Q).
// Danh sách video: public/videos/dp/index.json  { "<audience>/<slug>": { file, poster, duration } }
// Video do my-sta-video (CSK004) render; bài chưa có video thì không hiện gì.
// #115: video nhúng từ Google Drive (thư mục chia sẻ "bất cứ ai có đường liên kết"): dòng manifest ghi
//   "drive": "<mã tệp>" hoặc nguyên đường dẫn https://drive.google.com/file/d/<mã>/view → phát bằng khung xem của Drive.
import React, { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { DRIVE_VIDEO } from "./config";

const base = () => `${process.env.PUBLIC_URL || ""}/videos/dp`;
let manifest = null;
const loadManifest = () =>
  (manifest ||= fetch(`${base()}/index.json`)
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({})));

// #116: danh sách tệp trong thư mục Drive (tên → mã tệp), tải một lần. Trùng tên thì lấy tệp sửa gần nhất.
let driveList = null;
const loadDriveList = () => {
  if (driveList) return driveList;
  const { folderId, apiKey } = DRIVE_VIDEO;
  if (!folderId || !apiKey) return (driveList = Promise.resolve({}));
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const page = (token, acc) =>
    fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=nextPageToken,files(id,name)&orderBy=modifiedTime desc&pageSize=1000&key=${apiKey}${token ? `&pageToken=${token}` : ""}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => {
        for (const f of d.files || []) if (!acc[f.name]) acc[f.name] = f.id;
        return d.nextPageToken ? page(d.nextPageToken, acc) : acc;
      });
  return (driveList = page(null, {}).catch(() => ({})));
};

/** Lấy mã tệp Drive từ mã trần hoặc đường dẫn /file/d/<mã>/… hoặc ?id=<mã>. */
const driveId = (x) => {
  if (!x) return null;
  const m = String(x).match(/\/file\/d\/([\w-]{10,})/) || String(x).match(/[?&]id=([\w-]{10,})/);
  return m ? m[1] : /^[\w-]{10,}$/.test(x) ? x : null;
};

export default function UnitVideo({ audience, slug, title }) {
  const [v, setV] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    let live = true;
    setV(null);
    setOpen(false);
    // Thứ tự: dòng "drive" trong index.json → tệp cùng tên <slug>--w01.mp4 trong thư mục Drive → dòng "file" (video thử)
    Promise.all([loadManifest(), loadDriveList()]).then(([m, list]) => {
      if (!live) return;
      const row = m[`${audience}/${slug}`] || {};
      const id = row.drive || list[`${slug}--w01.mp4`];
      setV(id || row.file ? { ...row, drive: id || null } : null);
    });
    return () => {
      live = false;
    };
  }, [audience, slug]);

  useEffect(() => {
    if (open) ref.current?.play().catch(() => {});
  }, [open]);

  if (!v) return null;
  const drive = driveId(v.drive);
  if (!drive && !v.file) return null;
  const src = drive ? `https://drive.google.com/file/d/${drive}/preview` : `${base()}/${v.file}`;
  const poster = v.poster ? `${base()}/${v.poster}` : drive ? `https://drive.google.com/thumbnail?id=${drive}&sz=w1280` : undefined;
  return (
    <figure className="kt-uvideo">
      {open && drive ? (
        <iframe src={src} title={`Video tóm tắt: ${title}`} allow="autoplay; fullscreen" allowFullScreen loading="lazy" />
      ) : open ? (
        <video ref={ref} src={src} poster={poster} controls playsInline preload="metadata" aria-label={`Video tóm tắt: ${title}`} />
      ) : (
        <button type="button" className="kt-uvideo-cover" onClick={() => setOpen(true)} aria-label={`Xem video tóm tắt${v.duration ? ` (${v.duration})` : ""}`}>
          {poster && <img src={poster} alt="" loading="lazy" />}
          <span className="kt-uvideo-play">
            <Play size={28} aria-hidden="true" fill="currentColor" />
          </span>
          <span className="kt-uvideo-tag">▶ Xem tóm tắt{v.duration ? ` · ${v.duration}` : ""}</span>
        </button>
      )}
      <figcaption>{drive ? "Video tóm tắt bài" : "Video tóm tắt bài · chưa có giọng đọc (bản thử)"}</figcaption>
    </figure>
  );
}
