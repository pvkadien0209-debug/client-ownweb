// SP03 · BV2 — Tất cả chuỗi bài viết: /articles
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { loadArticlesIndex, isPublished } from "./articleData";
import "./KnowledgeLesson.css";
import "./KnowledgePages.css";

export default function ArticlesHome() {
  const [idx, setIdx] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    loadArticlesIndex().then(setIdx).catch(() => setError(true));
  }, []);
  return (
    <main className="hkt-page">
      <Helmet>
        <title>Bài viết — Học kiến thức qua nghe nói tiếng Anh</title>
        <meta name="description" content="Các chuỗi bài viết kiến thức thực tế: phỏng vấn xin việc, giao tiếp công sở, sinh viên ra trường, khoa học, du lịch, ẩm thực… kèm cụm từ tiếng Anh hữu ích." />
      </Helmet>
      <div className="hkt-wrap">
        <header className="hkt-hero">
          <h1>Bài viết</h1>
          <p>Đọc kiến thức theo từng chuỗi. Cuối mỗi bài có đường vào bài học để luyện bằng nghe nói tiếng Anh.</p>
        </header>
        {error && <p className="hkt-message-inline">Chưa tải được danh sách bài viết. Thử tải lại trang.</p>}
        {!idx && !error && <p className="hkt-message-inline">Đang tải…</p>}
        <ul className="hkt-topics">
          {idx?.series.map((s) => {
            const ready = s.articles.filter(isPublished).length;
            return (
              <li key={s.slug}>
                <Link className={`hkt-topic${ready ? "" : " is-quiet"}`} to={`/articles/${s.slug}`}>
                  <span className="hkt-topic-title">{s.title.vi}</span>
                  <span className="hkt-topic-en" lang="en">{s.title.en}</span>
                  <span className={ready ? "hkt-topic-meta" : "hkt-soon"}>
                    {ready ? `${ready}/${s.articles.length} bài đã có` : `${s.articles.length} bài · sắp có`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
