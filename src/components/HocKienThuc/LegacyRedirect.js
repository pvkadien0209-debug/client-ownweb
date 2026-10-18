// U3-Q2 (#061): bỏ 200 bài viết cũ và 13 bài học 50 câu cũ — đường dẫn cũ chuyển thẳng sang bài mới.
//   /articles                       → /for (tất cả người nghe)
//   /articles/<chuỗi>               → /for/<người-nghe của chuỗi>
//   /articles/<chuỗi>/<bài>         → /for/<người-nghe>/<bài>   (bảng chuyển trong units/index.json → legacy)
//   /knowledge/<nhánh>/<chủ-đề>/<bài-học>/…  → /knowledge/<nhánh>/<chủ-đề> (trang chủ đề với chuỗi bài mới)
// File dữ liệu cũ (jsonData/knowledge/**/lesson-N.json, jsonData/articles/**) và code cũ vẫn còn trên máy, chỉ không còn đường vào.
import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { loadUnitsIndex, audiencePath } from "./unitData";

export function ArticlesRedirect() {
  const { series, slug } = useParams();
  const [to, setTo] = useState(null);
  useEffect(() => {
    if (!series) return setTo("/for");
    loadUnitsIndex()
      .then((idx) => {
        const lg = idx.legacy || {};
        if (slug && lg.articles?.[`${series}/${slug}`]) setTo(`/for/${lg.articles[`${series}/${slug}`]}`);
        else if (lg.series?.[series]) setTo(audiencePath(lg.series[series]));
        else setTo("/for");
      })
      .catch(() => setTo("/for"));
  }, [series, slug]);
  if (!to)
    return (
      <main className="hkt-page">
        <p className="hkt-message-inline">Đang chuyển sang bài mới…</p>
      </main>
    );
  return <Navigate to={to} replace />;
}

export function OldLessonRedirect() {
  const { branch, topic } = useParams();
  return <Navigate to={`/knowledge/${branch}/${topic}`} replace />;
}
