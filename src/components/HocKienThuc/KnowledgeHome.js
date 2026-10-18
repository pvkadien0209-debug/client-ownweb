// SP02 · P1 — Trang tất cả chủ đề: /knowledge — SP09 (#063, Đ2): thẻ chủ đề có ảnh bìa, theo nhánh (A-Q1).
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import KtShell from "./KtShell";
import { TopicCard } from "./HomeKnowledge";
import { loadUnitsIndex } from "./unitData";

export default function KnowledgeHome() {
  const [idx, setIdx] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    loadUnitsIndex().then(setIdx).catch(() => setError(true));
  }, []);
  useEffect(() => {
    // #nhánh từ trang chủ ("Xem tất cả … chủ đề")
    const id = window.location.hash.slice(1);
    if (idx && id) document.getElementById(id)?.scrollIntoView();
  }, [idx]);

  return (
    <KtShell active="topics">
      <Helmet>
        <title>Tất cả chủ đề — học kiến thức qua câu hỏi nghe nói tiếng Anh</title>
        <meta name="description" content="Chọn một chủ đề kiến thức thực tế: công việc, đời sống sinh viên, kỹ năng, kinh doanh nhỏ, du lịch… Mỗi chủ đề 10 bài, mỗi bài một bài viết và 40 câu hỏi." />
      </Helmet>
      <h1 className="kt-h1">Tất cả chủ đề</h1>
      <p className="kt-lead">Mỗi chủ đề là một chuỗi 10 bài viết cho một hoàn cảnh cụ thể. Mỗi bài có 40 câu hỏi để luyện bằng nghe và nói tiếng Anh.</p>
      {error && <p className="kt-muted">Chưa tải được danh sách chủ đề. Thử tải lại trang.</p>}
      {!idx && !error && <p className="kt-muted">Đang tải…</p>}
      {idx?.branches.map((b) => (
        <section key={b.slug} id={b.slug}>
          <div className="kt-row-head">
            <h2>{b.title.vi}</h2>
          </div>
          <div className="kt-tiles is-grid">
            {b.topics.map((t) => (
              <TopicCard key={t.slug} idx={idx} topic={{ ...t, branch: b.slug, branchTitle: b.title }} />
            ))}
          </div>
        </section>
      ))}
    </KtShell>
  );
}
