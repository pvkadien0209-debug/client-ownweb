// #163 — Trang "Video": tất cả video tóm tắt bài đã có (thư mục Drive DetProMedia + public/videos/dp/index.json),
// mỗi video có đường dẫn vào bài học. Không tự phát: bấm ảnh mới mở khung xem.
// Tên tệp trên Drive: <slug>--w01.mp4 (render từ my-sta-video) → tìm bài theo slug trong mục lục bài (loadUnitsIndex).
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Play, ArrowRight, Search } from "lucide-react";
import KtShell from "./KtShell";
import { loadUnitsIndex, unitPath, topicColor, lowerFirst } from "./unitData";
import { loadManifest, loadDriveList, driveId } from "./UnitVideo";
import { VongDetLoading } from "./VongDet";

const fold = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

function VideoCard({ v, idx }) {
  const [open, setOpen] = useState(false);
  const [noThumb, setNoThumb] = useState(false);
  const thumb = v.drive ? `https://drive.google.com/thumbnail?id=${v.drive}&sz=w640` : null;
  const title = v.u?.title || v.slug;
  return (
    <article className="kt-vcard">
      <div className="kt-vcard-media">
        {open ? (
          <iframe src={`https://drive.google.com/file/d/${v.drive}/preview`} title={`Video: ${title}`} allow="autoplay; fullscreen" allowFullScreen />
        ) : (
          <button
            type="button"
            className="kt-vcard-cover"
            onClick={() => setOpen(true)}
            style={{ background: v.t ? topicColor(idx, v.t.slug) : "#334155" }}
            aria-label={`Xem video: ${title}`}
          >
            {thumb && !noThumb && <img src={thumb} alt="" loading="lazy" onError={() => setNoThumb(true)} />}
            {(noThumb || !thumb) && <span className="kt-vcard-ph">{title}</span>}
            <span className="kt-vcard-play" aria-hidden="true">
              <Play size={18} fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      <div className="kt-vcard-body">
        {v.t && <span className="kt-vcard-topic">{v.t.title?.vi || v.t.title}</span>}
        <h3 lang={v.u ? undefined : "en"}>{title}</h3>
        {(v.u?.audienceTitle || v.t?.audienceTitle) && <p className="kt-vcard-who">Dành cho {lowerFirst(v.u?.audienceTitle || v.t.audienceTitle)}</p>}
        {v.u ? (
          <Link className="kt-vcard-link" to={unitPath(v.u.audience, v.u.slug)}>
            Vào bài học <ArrowRight size={14} aria-hidden="true" />
          </Link>
        ) : (
          <span className="kt-vcard-who">Chưa gắn với bài nào</span>
        )}
      </div>
    </article>
  );
}

export default function VideosPage() {
  const [idx, setIdx] = useState(null);
  const [list, setList] = useState(null);
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("");

  useEffect(() => {
    let live = true;
    Promise.all([loadUnitsIndex().catch(() => null), loadDriveList(), loadManifest()]).then(([i, drive, man]) => {
      if (!live) return;
      setIdx(i);
      // slug → bài đầu tiên trong mục lục (theo thứ tự nhánh / chủ đề / bài)
      const where = {};
      let order = 0;
      (i?.branches || []).forEach((b) =>
        b.topics.forEach((t) =>
          t.units.forEach((u) => {
            order++;
            if (!where[u.slug]) where[u.slug] = { u, t, b, order };
            const k = `${u.audience}/${u.slug}`;
            if (!where[k]) where[k] = where[u.slug];
          })
        )
      );
      const out = {};
      Object.entries(drive || {}).forEach(([name, id]) => {
        const m = name.match(/^(.+)--w01\.mp4$/);
        if (m && !out[m[1]]) out[m[1]] = { slug: m[1], drive: id, ...(where[m[1]] || {}) };
      });
      Object.entries(man || {}).forEach(([k, row]) => {
        const id = driveId(row?.drive);
        const slug = k.split("/").pop();
        if (id && !out[slug]) out[slug] = { slug, drive: id, ...(where[k] || where[slug] || {}) };
      });
      setList(Object.values(out).sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9) || a.slug.localeCompare(b.slug)));
    });
    return () => {
      live = false;
    };
  }, []);

  const topics = useMemo(() => {
    const seen = new Map();
    (list || []).forEach((v) => v.t && !seen.has(v.t.slug) && seen.set(v.t.slug, v.t.title?.vi || v.t.title));
    return [...seen];
  }, [list]);

  const shown = useMemo(() => {
    const words = fold(q).split(/\s+/).filter(Boolean);
    return (list || []).filter(
      (v) =>
        (!topic || v.t?.slug === topic) &&
        words.every((w) => fold(`${v.u?.title} ${v.u?.titleEn} ${v.t?.title?.vi || v.t?.title} ${v.slug}`).includes(w))
    );
  }, [list, q, topic]);

  return (
    <KtShell active="videos">
      <Helmet>
        <title>Video tóm tắt bài học</title>
      </Helmet>
      <h1 className="kt-h1">Video</h1>
      <p className="kt-lead">
        Video tóm tắt các bài đã có{list ? ` — ${list.length} video` : ""}. Bấm ảnh để xem, bấm “Vào bài học” để đọc bài và luyện tập.
      </p>
      {!list && <VongDetLoading size={28} />}
      {list && !list.length && <p className="kt-muted">Chưa có video nào.</p>}
      {list && list.length > 0 && (
        <>
          <div className="kt-vbar">
            <label className="kt-vsearch">
              <Search size={16} aria-hidden="true" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên bài, chủ đề…" aria-label="Tìm video" />
            </label>
            {topics.length > 1 && (
              <select value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Lọc theo chủ đề">
                <option value="">Tất cả chủ đề ({list.length})</option>
                {topics.map(([slug, name]) => (
                  <option key={slug} value={slug}>
                    {name}
                  </option>
                ))}
              </select>
            )}
            <span className="kt-muted">{shown.length} video</span>
          </div>
          <div className="kt-vgrid">
            {shown.map((v) => (
              <VideoCard key={v.slug} v={v} idx={idx} />
            ))}
          </div>
          {!shown.length && <p className="kt-muted">Không thấy video phù hợp.</p>}
        </>
      )}
    </KtShell>
  );
}
