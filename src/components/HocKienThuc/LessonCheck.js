// SP01 · M2 (N3) — Trang kiểm tra dữ liệu bài cho người soạn / người duyệt.
// /knowledge/:branch/:topic/:lesson/check — không có trong menu, không cho Google lập chỉ mục.
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { loadLesson, lessonPath } from "./knowledgeData";
import validateLesson from "./validateLesson";
import "./KnowledgeLesson.css";
import "./KnowledgePages.css";

export default function LessonCheck() {
  const { branch, topic, lesson } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    loadLesson(branch, topic, lesson).then(setData).catch(() => setError(true));
  }, [branch, topic, lesson]);

  const issues = data ? validateLesson(data) : [];
  const errors = issues.filter((x) => x.level === "error");
  const warns = issues.filter((x) => x.level === "warn");
  const quiz = lessonPath(branch, topic, lesson, "quiz");
  const qNo = (id) => parseInt(String(id).replace(/\D/g, ""), 10);

  return (
    <main className="hkt-page">
      <Helmet>
        <title>Kiểm tra dữ liệu bài</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="hkt-wrap">
        <nav className="hkt-crumbs" aria-label="Vị trí">
          <Link to={lessonPath(branch, topic, lesson)}>Về trang bài</Link>
        </nav>
        <h1>Kiểm tra dữ liệu: {data?.title?.vi || lesson}</h1>
        {error && <p>Không tải được bài học.</p>}
        {!data && !error && <p className="hkt-muted">Đang kiểm tra…</p>}
        {data && (
          <>
            <p className={`hkt-check-sum ${errors.length ? "is-bad" : "is-ok"}`}>
              {data.questions.length} câu · <strong>{errors.length} lỗi</strong> · {warns.length} cảnh báo
              {!errors.length && " — đạt quy chuẩn soạn nội dung"}
            </p>
            <p className="hkt-muted">
              Lỗi phải sửa trước khi xuất bản. Cảnh báo là chỗ nên xem lại (ví dụ hai đáp án khá giống nhau). Quy tắc: DetPro/noi-dung/QUY-CHUAN-SOAN-NOI-DUNG.md
            </p>
            {[["Lỗi", errors], ["Cảnh báo", warns]].map(([label, list]) =>
              list.length ? (
                <section key={label}>
                  <h2 className="hkt-h2">{label}</h2>
                  <ul className="hkt-check-list">
                    {list.map((x, i) => (
                      <li key={i} className={x.level === "error" ? "is-bad" : ""}>
                        {x.q !== "-" ? (
                          <Link to={`${quiz}?q=${qNo(x.q)}`}>{x.q}</Link>
                        ) : (
                          <span>Cả bài</span>
                        )}{" "}
                        {x.msg}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null
            )}
          </>
        )}
      </div>
    </main>
  );
}
