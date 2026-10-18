// SP03 · BV2 — Trang bài viết: /articles/:series/:slug
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";
import { loadArticle, loadArticlesIndex, isPublished, articlePath } from "./articleData";
import MiniMarkdown, { parseBlocks, headingId } from "./MiniMarkdown";
import { stopAudio } from "./audioPlayer";
import "./KnowledgeLesson.css";
import "./KnowledgePages.css";

export default function ArticlePage() {
  const { series, slug } = useParams();
  const [art, setArt] = useState(null);
  const [seriesData, setSeriesData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setArt(null);
    setError(false);
    window.scrollTo(0, 0);
    loadArticle(series, slug).then(setArt).catch(() => setError(true));
    loadArticlesIndex()
      .then((idx) => setSeriesData(idx.series.find((x) => x.slug === series) || null))
      .catch(() => {});
    return () => stopAudio();
  }, [series, slug]);

  const blocks = useMemo(() => (art ? parseBlocks(art.body) : []), [art]);
  const toc = blocks.filter((b) => b.type === "h2");
  // #044 — Bài viết ba phần: MỞ ĐẦU (trước mục ## đầu tiên) · THÂN BÀI · KẾT LUẬN (mục "## Kết luận")
  const firstH2 = blocks.findIndex((b) => b.type === "h2");
  const intro = firstH2 > 0 ? blocks.slice(0, firstH2) : [];
  const kStart = blocks.findIndex((b) => b.type === "h2" && b.text.trim() === "Kết luận");
  const kEnd = kStart >= 0 ? (() => { const n = blocks.findIndex((b, i) => i > kStart && b.type === "h2"); return n < 0 ? blocks.length : n; })() : -1;
  const body = blocks.slice(Math.max(firstH2, 0), kStart >= 0 ? kStart : blocks.length);
  const conclusion = kStart >= 0 ? blocks.slice(kStart, kEnd) : [];
  const after = kStart >= 0 ? blocks.slice(kEnd) : [];

  if (error)
    return (
      <main className="hkt-page"><div className="hkt-wrap">
        <h1>Bài viết này chưa có</h1>
        <p><Link to={`/articles/${series}`}>Về chuỗi bài viết</Link></p>
      </div></main>
    );
  if (!art) return <main className="hkt-page"><div className="hkt-wrap"><p className="hkt-message-inline">Đang tải…</p></div></main>;

  const { meta } = art;
  const lessonUrl = meta.lesson ? `/knowledge/${meta.lesson}` : null;
  const others = (seriesData?.articles || []).filter((a) => a.slug !== slug);

  return (
    <main className="hkt-page">
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description || ""} />
      </Helmet>
      <div className="hkt-wrap hkt-article-wrap">
        <nav className="hkt-crumbs" aria-label="Vị trí">
          <Link to="/articles">Bài viết</Link>
          <span aria-hidden="true">›</span>
          <Link to={`/articles/${series}`}>{seriesData?.title?.vi || series}</Link>
        </nav>
        <header className="hkt-art-head">
          <h1>{meta.title}</h1>
          {meta.description && <p className="hkt-art-lead">{meta.description}</p>}
          {meta.status === "draft" && <span className="hkt-soon">Bản nháp — chờ duyệt</span>}
        </header>

        {toc.length > 2 && (
          <nav className="hkt-toc" aria-label="Mục lục">
            <p>Trong bài này</p>
            <ul>
              {toc.map((h, i) => (
                <li key={i}><a href={`#${headingId(h.text)}`}>{h.text}</a></li>
              ))}
            </ul>
          </nav>
        )}

        <article className="hkt-prose">
          {intro.length > 0 && (
            <div className="hkt-art-intro">
              <MiniMarkdown blocks={intro} />
            </div>
          )}
          <MiniMarkdown blocks={body} />
          {conclusion.length > 0 && (
            <section className="hkt-art-conclusion" aria-label="Kết luận">
              <MiniMarkdown blocks={conclusion} />
            </section>
          )}
          {after.length > 0 && <MiniMarkdown blocks={after} />}
        </article>

        {lessonUrl && (
          <aside className="hkt-cta">
            <p>Luyện kiến thức này bằng nghe nói</p>
            <Link className="hkt-btn hkt-btn--primary" to={lessonUrl}>
              Vào bài học <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </aside>
        )}

        {others.length > 0 && (
          <section className="hkt-related">
            <h2 className="hkt-h2">Cùng chuỗi: {seriesData.title.vi}</h2>
            <ul>
              {others.slice(0, 6).map((a) => (
                <li key={a.slug}>
                  {isPublished(a) ? (
                    <Link to={articlePath(series, a.slug)}>{a.title}</Link>
                  ) : (
                    <span className="hkt-muted">{a.title} <span className="hkt-soon">Sắp có</span></span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
