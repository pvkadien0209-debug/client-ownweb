// SP03 · BV2 — Một chuỗi bài viết: /articles/:series
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { loadArticlesIndex, isPublished, articlePath } from "./articleData";
import "./KnowledgeLesson.css";
import "./KnowledgePages.css";

export default function SeriesPage() {
  const { series } = useParams();
  const [s, setS] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    setS(null);
    setError(false);
    loadArticlesIndex()
      .then((idx) => {
        const found = idx.series.find((x) => x.slug === series);
        found ? setS(found) : setError(true);
      })
      .catch(() => setError(true));
  }, [series]);

  if (error)
    return (
      <main className="hkt-page"><div className="hkt-wrap">
        <h1>Không tìm thấy chuỗi bài viết này</h1>
        <p><Link to="/articles">Xem tất cả bài viết</Link></p>
      </div></main>
    );
  if (!s) return <main className="hkt-page"><div className="hkt-wrap"><p className="hkt-message-inline">Đang tải…</p></div></main>;

  return (
    <main className="hkt-page">
      <Helmet>
        <title>{`${s.title.vi} — Bài viết`}</title>
        <meta name="description" content={`Chuỗi ${s.articles.length} bài viết về ${s.title.vi.toLowerCase()}.`} />
      </Helmet>
      <div className="hkt-wrap">
        <nav className="hkt-crumbs" aria-label="Vị trí">
          <Link to="/articles">Bài viết</Link>
        </nav>
        <header className="hkt-topic-head">
          <div>
            <h1>{s.title.vi}</h1>
            <p className="hkt-topic-en" lang="en">{s.title.en} · {s.articles.length} bài</p>
          </div>
        </header>
        <ol className="hkt-lessons">
          {s.articles.map((a, i) => {
            const inner = (
              <>
                <span className="hkt-lesson-no">Bài {i + 1}</span>
                <span className="hkt-lesson-title">{a.title}</span>
                <span className="hkt-lesson-meta">
                  {isPublished(a) ? (
                    <>{a.readingMinutes ? `${a.readingMinutes} phút đọc` : "Đọc"}{a.status === "draft" ? " · Bản nháp" : ""}</>
                  ) : (
                    <span className="hkt-soon">Sắp có</span>
                  )}
                </span>
              </>
            );
            return (
              <li key={a.slug}>
                {isPublished(a) ? (
                  <Link className="hkt-lesson" to={articlePath(s.slug, a.slug)}>{inner}</Link>
                ) : (
                  <div className="hkt-lesson is-soon" aria-disabled="true">{inner}</div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </main>
  );
}
