// SP03 — Dữ liệu bài viết: public/jsonData/articles/index.json + <chuỗi>/<bài>.md (Markdown có phần thông tin đầu file).
const base = () => `${process.env.PUBLIC_URL || ""}/jsonData/articles`;
let indexPromise = null;
const mdCache = new Map();

export function loadArticlesIndex() {
  if (!indexPromise) {
    indexPromise = fetch(`${base()}/index.json`)
      .then((r) => {
        if (!r.ok) throw new Error("not-found");
        return r.json();
      })
      .catch((e) => {
        indexPromise = null;
        throw e;
      });
  }
  return indexPromise;
}

/** Tách phần thông tin đầu file (--- key: value ---) khỏi nội dung Markdown. */
export function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  m[1].split(/\r?\n/).forEach((line) => {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
  });
  return { meta, body: text.slice(m[0].length) };
}

export function loadArticle(series, slug) {
  const key = `${series}/${slug}`;
  if (!mdCache.has(key)) {
    mdCache.set(
      key,
      fetch(`${base()}/${key}.md`)
        .then((r) => {
          // CRA trả index.html (200) khi không có file → kiểm tra nội dung
          if (!r.ok) throw new Error("not-found");
          return r.text();
        })
        .then((t) => {
          if (/^\s*<!doctype html/i.test(t)) throw new Error("not-found");
          return parseFrontmatter(t);
        })
        .catch((e) => {
          mdCache.delete(key);
          throw e;
        })
    );
  }
  return mdCache.get(key);
}

export const isPublished = (a) => a.status && a.status !== "planned";
export const articlePath = (series, slug) => `/articles/${series}/${slug}`;
