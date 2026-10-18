import { useEffect, useState } from "react";

// State có nhớ trong localStorage. Mọi đọc/ghi đều bọc try/catch:
// trình duyệt chặn storage thì vẫn chạy bình thường với giá trị mặc định.
export default function useStoredState(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? defaultValue : JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* bỏ qua */
    }
  }, [key, value]);
  return [value, setValue];
}
