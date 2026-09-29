// RoomofflineV6BattleScene.js
//
// File cảnh chiến đấu 2D cho RoomofflineV6 — dùng PixiJS, ĐÚNG phong cách đã
// dùng trong codebase (<Stage>/<Container>/<Graphics draw={fn}>/<Text>,
// animation bằng STATE REACT thường, KHÔNG dùng useTick — tham khảo file mẫu
// gốc client/src/components/prac_componets/inside_01_components/PixiJS.js,
// KHÔNG sửa file đó).
//
// BƯỚC 7 — "Chủ phòng LUÔN là Boss" + hệ Máu/Mana + nhắm mục tiêu (mới nhất,
// GHI ĐÈ HOÀN TOÀN cách BƯỚC 6 vẽ Boss):
//   - KHÔNG còn `bossPos`/`weakPointActive` riêng — Boss giờ CHÍNH LÀ chủ
//     phòng, chỉ là 1 phần tử trong mảng `players` như mọi người khác (có
//     `isBoss:true`), tự di chuyển bằng chính D-pad của họ (xem
//     RoomofflineV6.js). Component này CHỈ VẼ LẠI theo dữ liệu server gửi
//     (ioArenaV6.js), không tự tính toán gì.
//   - Boss được vẽ NỔI BẬT hơn (icon to hơn + vòng máu màu theo % HP còn lại
//     + 👑) để mọi người luôn biết ai là Boss, đang ở đâu, còn bao nhiêu máu.
//   - "Điểm yếu" của BƯỚC 6 (AI tự bật/tắt) đã BỎ HẲN — Boss giờ là người
//     thật tự quyết định hành động, không cần cơ chế cân bằng nhân tạo đó
//     nữa (đã bàn khi hỏi ý kiến).
//   - THÊM: chủ phòng (Boss) cần CHỌN MỤC TIÊU trước khi tấn công 1 học sinh
//     cụ thể (ĐÚNG lựa chọn đã chọn khi hỏi ý kiến — khác cách học sinh tấn
//     công Boss, vì chỉ có 1 Boss nên không cần chọn). Bấm THẲNG vào icon 1
//     học sinh trong tầm trên canvas để chọn — bắt sự kiện `onClick` ngay
//     trên <Stage> rồi TỰ TÍNH ô nào vừa bị bấm, ĐÚNG cách file mẫu gốc
//     PixiJS.js đang làm (KHÔNG dùng `interactive`/`pointertap` trên từng
//     Container — codebase chưa dùng cách đó bao giờ).
//   - THÊM: học sinh có Khiên chắn (`shielded`, mua ở Cửa hàng bằng đơn vị
//     tiêu dùng) được vẽ thêm 1 icon 🛡️ nhỏ.
//   - `hitFx` gộp chung hiệu ứng "vừa bị Boss đánh trúng" cho CẢ 2 trường
//     hợp: tấn công 1 mục tiêu VÀ kỹ năng diện rộng (AOE, trúng nhiều người
//     cùng lúc) — 1 state duy nhất thay vì viết 2 lần logic gần như giống
//     hệt nhau.

import { useCallback, useEffect, useRef, useState } from "react";
import { Stage, Container, Text, Graphics } from "@pixi/react";

// Cỡ 1 ô (px) — giữ nguyên 38px từ BƯỚC 6 (bản đồ hiện trực tiếp trên màn
// hình chính, cần đủ to để dễ bấm chọn mục tiêu).
const CELL = 38;

const bossTextStyle = { fontSize: 30 };
const charTextStyle = { fontSize: 22 };
const nameTextStyle = { fontSize: 8, fill: 0xe2e8f0 };
const badgeTextStyle = { fontSize: 13 };

// players: [{ id, name, icon, isMe, pos:{x,y}, eliminated, isBoss, hp,
// maxHp, shielded }] — CHÍNH XÁC 1 phần tử có isBoss:true (chủ phòng).
// gridSize: số ô mỗi cạnh (10).
// battleStatus: "ongoing" | "won" | "none"
// bossFlash: Boss (chủ phòng) vừa bị mất máu — rung/chớp.
// attackPulse: MÌNH vừa bấm tấn công — nhân vật MÌNH nảy lên (không gửi lên
// server, chỉ hiệu ứng riêng cho chính mình).
// hitFx: { hits: [{ id, blocked }], ts } | null — vừa có người bị Boss đánh
// trúng (1 người khi tấn công đơn, nhiều người khi dùng kỹ năng AOE).
// selectedTargetId: mục tiêu Boss đang chọn (chỉ có ý nghĩa khi isBossView).
// isBossView: đang vẽ cho CHÍNH chủ phòng xem (bật chế độ bấm-chọn-mục-tiêu).
// onPlayerClick(id): báo lên khi bấm trúng 1 người chơi khác trên canvas.
const RoomofflineV6BattleScene = ({
  players,
  gridSize,
  battleStatus,
  bossFlash,
  attackPulse,
  hitFx,
  selectedTargetId,
  isBossView,
  onPlayerClick,
}) => {
  const [pulseFrame, setPulseFrame] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);
  const [hitState, setHitState] = useState(null); // Map id -> blocked
  const lastPulseRef = useRef(attackPulse);
  const lastHitTsRef = useRef(0);

  // Boss "thở" nhẹ khi còn sống — animation-bằng-state-React, ĐÚNG kiểu đã
  // dùng ở file mẫu PixiJS.js (setInterval cập nhật 1 state đếm khung hình).
  useEffect(() => {
    if (battleStatus !== "ongoing") return;
    const t = setInterval(() => setPulseFrame((f) => f + 1), 150);
    return () => clearInterval(t);
  }, [battleStatus]);

  // Nhân vật CỦA MÌNH nảy to hơn 1 chút mỗi khi mình bấm "Tấn công".
  useEffect(() => {
    if (attackPulse === lastPulseRef.current) return;
    lastPulseRef.current = attackPulse;
    setIsBouncing(true);
    const t = setTimeout(() => setIsBouncing(false), 260);
    return () => clearTimeout(t);
  }, [attackPulse]);

  // Vòng tròn đỏ (hoặc icon khiên nếu đỡ được) quanh những người VỪA bị Boss
  // đánh trúng — gộp chung cho cả tấn công đơn lẫn kỹ năng diện rộng (AOE).
  useEffect(() => {
    if (!hitFx || hitFx.ts === lastHitTsRef.current) return;
    lastHitTsRef.current = hitFx.ts;
    const map = new Map((hitFx.hits || []).map((h) => [h.id, !!h.blocked]));
    setHitState(map);
    const t = setTimeout(() => setHitState(null), 500);
    return () => clearTimeout(t);
  }, [hitFx]);

  const size = (gridSize || 10) * CELL;

  // Vẽ nền + lưới ô — gridSize không đổi trong thực tế nên useCallback giữ
  // nguyên tham chiếu hàm giữa các lần render, tránh Graphics vẽ lại mỗi khi
  // pulseFrame tăng (mỗi 150ms) dù lưới không hề thay đổi.
  const drawGridBg = useCallback(
    (g) => {
      const sz = (gridSize || 10) * CELL;
      const n = gridSize || 10;
      g.clear();
      g.beginFill(0x1e1b4b);
      g.drawRoundedRect(0, 0, sz, sz, 12);
      g.endFill();
      g.lineStyle(1, 0x312e81, 0.6);
      for (let i = 1; i < n; i++) {
        g.moveTo(i * CELL, 0);
        g.lineTo(i * CELL, sz);
        g.moveTo(0, i * CELL);
        g.lineTo(sz, i * CELL);
      }
    },
    [gridSize],
  );

  const bossDefeated = battleStatus === "won";
  const bossShake = bossFlash ? (pulseFrame % 2 === 0 ? 3 : -3) : 0;
  const bossBreath = Math.sin(pulseFrame * 0.4) * 2;

  const visiblePlayers = (players || []).slice(0, 20);

  // Bấm vào canvas — TÁI HIỆN đúng cách handleClick trong file mẫu PixiJS.js:
  // đọc toạ độ thật rồi tự chia ô, có tính cả tỉ lệ co giãn (Stage có
  // maxWidth 100% nên có thể bị CSS thu nhỏ so với kích thước thật).
  const handleStageClick = (e) => {
    try {
      if (!isBossView || typeof onPlayerClick !== "function") return;
      if (!e || !e.currentTarget) return;
      const rect = e.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const scaleX = size / rect.width;
      const scaleY = size / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;
      const col = Math.floor(clickX / CELL);
      const row = Math.floor(clickY / CELL);
      const target = visiblePlayers.find(
        (p) =>
          !p.isBoss &&
          !p.eliminated &&
          (p.pos?.x ?? -1) === col &&
          (p.pos?.y ?? -1) === row,
      );
      if (target) onPlayerClick(target.id);
    } catch (error) {
      console.warn("Lỗi khi bấm chọn mục tiêu (V6):", error);
    }
  };

  return (
    <Stage
      width={size}
      height={size}
      onClick={handleStageClick}
      options={{ backgroundColor: 0x1e1b4b, antialias: true }}
      style={{
        borderRadius: 12,
        display: "block",
        margin: "0 auto",
        maxWidth: "100%",
        cursor: isBossView ? "crosshair" : "default",
      }}
    >
      <Graphics draw={drawGridBg} />

      {visiblePlayers.map((p) => {
        const px = p.pos?.x ?? 0;
        const py = p.pos?.y ?? 0;
        const isBoss = !!p.isBoss;
        const cx = px * CELL + CELL / 2 + (isBoss ? bossShake : 0);
        const cy = py * CELL + CELL / 2 + (isBoss ? bossBreath : 0);
        const hitInfo = hitState?.get(p.id);
        const isHit = hitInfo !== undefined;
        const isSelected = isBossView && selectedTargetId === p.id;
        const scale = p.isMe && isBouncing ? 1.3 : isHit && !isBoss ? 1.15 : 1;

        const hpPct =
          isBoss && p.maxHp ? Math.max(0, Math.min(1, p.hp / p.maxHp)) : null;
        let hpRingColor = 0x16a34a;
        if (hpPct !== null) {
          if (hpPct <= 0.6) hpRingColor = 0xf59e0b;
          if (hpPct <= 0.25) hpRingColor = 0xdc2626;
        }

        return (
          <Container
            key={p.id}
            x={cx}
            y={cy}
            alpha={!isBoss && p.eliminated ? 0.35 : 1}
          >
            {/* Vòng máu quanh Boss — màu đổi theo % máu còn lại, để cả phòng
                luôn thấy Boss đang "trụ" được bao lâu mà không cần nhìn
                riêng thanh máu chữ. */}
            {isBoss && hpPct !== null && (
              <Graphics
                draw={(g) => {
                  g.clear();
                  g.lineStyle(3, hpRingColor, 0.9);
                  g.drawCircle(0, 0, CELL / 2 + 4);
                }}
              />
            )}

            {/* Vòng cam nét đứt đánh dấu mục tiêu Boss đang chọn để tấn
                công (chỉ Boss tự thấy rõ, người khác thấy cũng không sao). */}
            {isSelected && (
              <Graphics
                draw={(g) => {
                  g.clear();
                  g.lineStyle(2, 0xf97316, 0.9);
                  g.drawCircle(0, 0, CELL / 2 + 2);
                }}
              />
            )}

            {isHit && (
              <Graphics
                draw={(g) => {
                  g.clear();
                  g.beginFill(hitInfo ? 0x38bdf8 : 0xdc2626, 0.35);
                  g.drawCircle(0, 0, CELL / 2 - 2);
                  g.endFill();
                }}
              />
            )}

            <Text
              text={p.icon || (isBoss ? "👑" : "🙂")}
              anchor={0.5}
              style={isBoss ? bossTextStyle : charTextStyle}
              alpha={isBoss && bossDefeated ? 0.35 : 1}
              rotation={isBoss && bossDefeated ? Math.PI / 2 : 0}
              scale={scale}
            />

            {isHit && hitInfo && (
              <Text text="🛡️" anchor={0.5} y={-(CELL / 2 + 10)} style={badgeTextStyle} />
            )}

            {!isBoss && p.shielded && (
              <Text
                text="🛡️"
                anchor={0.5}
                x={-(CELL / 2 - 6)}
                y={-(CELL / 2 - 6)}
                style={{ fontSize: 12 }}
              />
            )}

            {!isBoss && p.eliminated && (
              <Text
                text="💀"
                anchor={0.5}
                x={CELL / 2 - 6}
                y={-(CELL / 2 - 6)}
                style={{ fontSize: 13 }}
              />
            )}

            {(p.isMe || isBoss) && (
              <Text
                text={isBoss ? `👑 ${p.name}` : p.name}
                anchor={{ x: 0.5, y: 0 }}
                y={CELL / 2 - 2}
                style={nameTextStyle}
              />
            )}
          </Container>
        );
      })}
    </Stage>
  );
};

export default RoomofflineV6BattleScene;
