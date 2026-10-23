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
export const loadManifest = () => // #163: dùng chung cho trang Video
  (manifest ||= fetch(`${base()}/index.json`)
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({})));

// #116: danh sách tệp trong thư mục Drive (tên → mã tệp), tải một lần.
let driveList = null;
// #165: thư mục DetProMedia có thể chia thư mục con (video / img / audio …) → đọc cả thư mục con (sâu tối đa 2 cấp).
//   Tên tệp vẫn phải là duy nhất: <slug>--w01.mp4, <slug>--w01.jpg …; trùng tên thì lấy tệp sửa gần nhất.
const FOLDER = "application/vnd.google-apps.folder";
// Thư mục âm thanh có hàng chục nghìn mp3, web chưa dùng → bỏ qua để trang mở nhanh.
const SKIP_DIR = /^(audio|am[ -]?thanh|âm thanh)$/i;
export const loadDriveList = () => {
  if (driveList) return driveList;
  const { folderId, apiKey } = DRIVE_VIDEO;
  if (!folderId || !apiKey) return (driveList = Promise.resolve({}));
  const listIn = (parent, token, acc, sub) => {
    const q = encodeURIComponent(`'${parent}' in parents and trashed = false`);
    return fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=nextPageToken,files(id,name,mimeType)&orderBy=modifiedTime desc&pageSize=1000&key=${apiKey}${token ? `&pageToken=${token}` : ""}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => {
        for (const f of d.files || []) {
          if (f.mimeType === FOLDER) SKIP_DIR.test(f.name) || sub.push(f.id);
          else if (!acc[f.name]) acc[f.name] = f.id;
        }
        return d.nextPageToken ? listIn(parent, d.nextPageToken, acc, sub) : sub;
      });
  };
  const walk = (parents, depth, acc) =>
    Promise.all(parents.map((p) => listIn(p, null, acc, []).catch(() => [])))
      .then((subs) => subs.flat())
      .then((next) => (next.length && depth < 2 ? walk(next, depth + 1, acc) : acc));
  return (driveList = walk([folderId], 0, {}).catch(() => ({})));
};

/** Lấy mã tệp Drive từ mã trần hoặc đường dẫn /file/d/<mã>/… hoặc ?id=<mã>. */
export const driveId = (x) => {
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
      setV(id || row.file ? { ...row, drive: id || null, cover: list[`${slug}--w01.jpg`] || null } : null); // #164: ảnh bìa
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
  const poster = v.poster ? `${base()}/${v.poster}` : v.cover || drive ? `https://drive.google.com/thumbnail?id=${v.cover || drive}&sz=w1280` : undefined;
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
