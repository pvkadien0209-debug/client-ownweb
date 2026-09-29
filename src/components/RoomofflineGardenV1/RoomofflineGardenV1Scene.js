// RoomofflineGardenV1Scene.js
//
// File MỚI — cảnh "quần đảo" 2D cho RoomofflineGardenV1 (chế độ chơi ĐỘC LẬP,
// không phải chế độ đánh Boss của RoomofflineV6). Dùng LẠI PixiJS — đúng thư
// viện/API/phong cách đã dùng ở RoomofflineV6BattleScene.js và file mẫu gốc
// client/src/components/prac_componets/inside_01_components/PixiJS.js
// (KHÔNG sửa 2 file đó, chỉ tham khảo cách viết): <Stage>/<Container>/
// <Graphics draw={fn}>/<Text>, animation bằng STATE REACT thường (KHÔNG dùng
// useTick), và bắt click bằng `onClick` ngay trên <Stage> rồi TỰ TÍNH toán ô
// nào vừa bị bấm — ĐÚNG cách file mẫu PixiJS.js đang làm (KHÔNG dùng
// `interactive`/`pointertap` trên từng Container, codebase chưa dùng cách đó
// bao giờ nên không tự ý đổi phong cách).
//
// Ý TƯỞNG (khác hẳn RoomofflineV6 — xem RoomofflineGardenV1.js đầu file):
// mỗi người chơi luyện ĐỘC LẬP hoàn toàn, không ai ảnh hưởng kết quả của ai,
// nhưng tất cả các "đảo" xếp cạnh nhau thành 1 quần đảo LUÔN HIỂN THỊ CHUNG —
// để không ai thấy cô đơn khi luyện 1 mình. Tương tác xã hội DUY NHẤT là thả
// emoji cổ vũ 👏 (bấm vào đảo người khác), không có thắng/thua, không xếp
// hạng.
//
// players: [{ id, name, stage, isMe }] — thứ tự trong mảng CHÍNH LÀ vị trí
// trên quần đảo (index 0 = ô đầu tiên), GIỮ NGUYÊN thứ tự gardenUsers từ
// server để vị trí từng đảo không bị nhảy lung tung khi có ai đó lớn thêm 1
// mốc (state của con tính theo id, không theo hits/điểm như contributionList
// của V6).
// gridCols: số cột của quần đảo (RoomofflineGardenV1.js quyết định).
// cheerFx: { targetUserId, emoji, ts } | null — vừa có người thả emoji cổ vũ.
// celebrate: { userId, ts } | null — vừa có người hoàn thành đảo (mốc cao
// nhất) — hiệu ứng ăn mừng hiện cho CẢ PHÒNG cùng thấy (đúng lựa chọn khi hỏi
// ý kiến), không chỉ riêng người đó.
// onIslandClick(userId, name): báo lên RoomofflineGardenV1.js khi bấm trúng
// đảo của NGƯỜI KHÁC (không tính đảo của chính mình).

import { useEffect, useRef, useState } from "react";
import { Stage, Container, Text, Graphics } from "@pixi/react";

// Cỡ 1 ô đảo (px). 8 cột là vừa đẹp cho "vài chục người" (tối đa hiển thị
// bên dưới) mà vẫn đủ to để thấy rõ icon + tên trên màn hình 58% bề ngang.
const CELL = 72;

// 4 mốc lớn dần — PHẢI khớp GROWTH_STAGE_THRESHOLDS trong ioGardenV1.js (2
// runtime tách biệt, không import chung được, xem ghi chú ở
// RoomofflineGardenV1.js). Icon CHÍNH LÀ cách thể hiện tiến độ — không cần
// thêm nhân vật/avatar riêng nào khác.
const STAGE_ICONS = ["🌱", "🌿", "🌳", "🌸"];
const MAX_STAGE = STAGE_ICONS.length - 1;

const nameTextStyle = { fontSize: 9, fill: 0x1e293b };
const myNameTextStyle = { fontSize: 9, fill: 0x7c3aed, fontWeight: "bold" };
const iconTextStyle = { fontSize: 30 };
const cheerTextStyle = { fontSize: 20 };

// Giới hạn số đảo hiển thị (an toàn hiệu năng nếu phòng có rất đông người) —
// GIỐNG cách RoomofflineV6BattleScene giới hạn visiblePlayers.
const MAX_VISIBLE_ISLANDS = 60;

const RoomofflineGardenV1Scene = ({
  players,
  gridCols,
  cheerFx,
  celebrate,
  onIslandClick,
}) => {
  const [pulseFrame, setPulseFrame] = useState(0);
  const [flyingCheer, setFlyingCheer] = useState(null); // {index, emoji, startedAt}
  const [celebratingIndex, setCelebratingIndex] = useState(null);
  const lastCheerTsRef = useRef(0);
  const lastCelebrateTsRef = useRef(0);

  const visiblePlayers = (players || []).slice(0, MAX_VISIBLE_ISLANDS);
  const cols = gridCols || 8;
  const rows = Math.max(1, Math.ceil(visiblePlayers.length / cols));
  const width = cols * CELL;
  const height = rows * CELL;

  // Nhịp "thở" nhẹ dùng chung cho hiệu ứng bay lên của emoji cổ vũ + vòng
  // tròn ăn mừng — TÁI HIỆN đúng cách RoomofflineV6BattleScene dùng 1
  // setInterval duy nhất cho nhiều hiệu ứng khác nhau (đỡ phải tạo nhiều
  // interval riêng lẻ).
  useEffect(() => {
    const t = setInterval(() => setPulseFrame((f) => f + 1), 100);
    return () => clearInterval(t);
  }, []);

  // Emoji cổ vũ bay lên trên đảo người vừa được thả — tự biến mất sau ~1.1s.
  useEffect(() => {
    if (!cheerFx || cheerFx.ts === lastCheerTsRef.current) return;
    lastCheerTsRef.current = cheerFx.ts;
    const idx = visiblePlayers.findIndex((p) => p.id === cheerFx.targetUserId);
    if (idx === -1) return;
    setFlyingCheer({ index: idx, emoji: cheerFx.emoji, startedAt: Date.now() });
    const t = setTimeout(() => setFlyingCheer(null), 1100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cheerFx]);

  // Vòng tròn vàng + 🎉 ăn mừng khi có người vừa hoàn thành đảo (mốc cao
  // nhất) — CẢ PHÒNG cùng thấy (đúng lựa chọn khi hỏi ý kiến), không chỉ
  // riêng chủ đảo.
  useEffect(() => {
    if (!celebrate || celebrate.ts === lastCelebrateTsRef.current) return;
    lastCelebrateTsRef.current = celebrate.ts;
    const idx = visiblePlayers.findIndex((p) => p.id === celebrate.userId);
    if (idx === -1) return;
    setCelebratingIndex(idx);
    const t = setTimeout(() => setCelebratingIndex(null), 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrate]);

  // Bấm vào quần đảo — TÁI HIỆN đúng cách handleClick trong file mẫu
  // PixiJS.js: đọc toạ độ thật trên canvas rồi tự chia ô, có tính cả tỉ lệ
  // co giãn (scale) vì <Stage> ở đây có style maxWidth 100% (canvas có thể
  // bị CSS thu nhỏ lại so với kích thước thật width/height truyền vào).
  const handleStageClick = (e) => {
    try {
      if (!e || !e.currentTarget) return;
      const rect = e.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;
      const col = Math.floor(clickX / CELL);
      const row = Math.floor(clickY / CELL);
      const index = row * cols + col;
      const target = visiblePlayers[index];
      if (target && !target.isMe && typeof onIslandClick === "function") {
        onIslandClick(target.id, target.name);
      }
    } catch (error) {
      console.warn("Lỗi khi bấm quần đảo (Garden):", error);
    }
  };

  // Vẽ nền biển + lưới ô — cols/rows hiếm khi đổi (chỉ đổi khi có người
  // vào/ra phòng) nên KHÔNG cần useCallback chặt như bàn cờ Boss (không có
  // animation nào chạy liên tục làm nền phải vẽ lại mỗi khung hình).
  const drawSeaBg = (g) => {
    g.clear();
    g.beginFill(0x0ea5e9);
    g.drawRoundedRect(0, 0, width, height, 12);
    g.endFill();
    g.lineStyle(1, 0x38bdf8, 0.5);
    for (let c = 1; c < cols; c++) {
      g.moveTo(c * CELL, 0);
      g.lineTo(c * CELL, height);
    }
    for (let r = 1; r < rows; r++) {
      g.moveTo(0, r * CELL);
      g.lineTo(width, r * CELL);
    }
  };

  const cheerBob = Math.sin(pulseFrame * 0.5) * 2;
  const celebratePulseAlpha = 0.3 + (Math.sin(pulseFrame * 0.5) + 1) * 0.2;

  return (
    <Stage
      width={width}
      height={height}
      onClick={handleStageClick}
      options={{ backgroundColor: 0x0ea5e9, antialias: true }}
      style={{
        borderRadius: 12,
        display: "block",
        margin: "0 auto",
        maxWidth: "100%",
        maxHeight: "100%",
        cursor: "pointer",
      }}
    >
      <Graphics draw={drawSeaBg} />

      {visiblePlayers.map((p, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const cx = col * CELL + CELL / 2;
        const cy = row * CELL + CELL / 2;
        const stage = Math.max(0, Math.min(MAX_STAGE, p.stage || 0));
        const icon = STAGE_ICONS[stage];
        const isCelebrating = celebratingIndex === index;

        return (
          <Container key={p.id} x={cx} y={cy}>
            {/* Đất đảo — tô đậm dần theo mốc lớn (cát → cỏ), người MỚI bắt
                đầu (mốc 0, hạt giống) vẫn có 1 gò đất nhỏ cho dễ nhận ra ô
                đang trống chờ lớn. */}
            <Graphics
              draw={(g) => {
                g.clear();
                const groundColor = [0xfde68a, 0xbbf7d0, 0x86efac, 0xf9a8d4][
                  stage
                ];
                g.beginFill(groundColor);
                g.drawEllipse(0, CELL / 2 - 14, CELL / 2 - 8, 10);
                g.endFill();
              }}
            />

            {/* Viền vàng đánh dấu ĐẢO CỦA CHÍNH MÌNH — để dễ tìm giữa vài
                chục đảo khác. */}
            {p.isMe && (
              <Graphics
                draw={(g) => {
                  g.clear();
                  g.lineStyle(2, 0x7c3aed, 0.8);
                  g.drawRoundedRect(-CELL / 2 + 4, -CELL / 2 + 4, CELL - 8, CELL - 8, 10);
                }}
              />
            )}

            {/* Vòng tròn vàng nhấp nháy khi vừa hoàn thành đảo (mốc cao
                nhất) — CẢ PHÒNG cùng thấy. */}
            {isCelebrating && (
              <Graphics
                draw={(g) => {
                  g.clear();
                  g.lineStyle(3, 0xfacc15, celebratePulseAlpha + 0.4);
                  g.drawCircle(0, 0, CELL / 2 - 2);
                }}
              />
            )}

            <Text text={icon} anchor={0.5} style={iconTextStyle} />
            {isCelebrating && (
              <Text text="🎉" anchor={0.5} y={-CELL / 2 - 6} style={cheerTextStyle} />
            )}

            <Text
              text={p.name}
              anchor={{ x: 0.5, y: 0 }}
              y={CELL / 2 - 6}
              style={p.isMe ? myNameTextStyle : nameTextStyle}
            />

            {flyingCheer && flyingCheer.index === index && (
              <Text
                text={flyingCheer.emoji}
                anchor={0.5}
                y={-CELL / 2 - 10 - (Date.now() - flyingCheer.startedAt) / 15 + cheerBob}
                alpha={Math.max(0, 1 - (Date.now() - flyingCheer.startedAt) / 1100)}
                style={cheerTextStyle}
              />
            )}
          </Container>
        );
      })}
    </Stage>
  );
};

export default RoomofflineGardenV1Scene;
