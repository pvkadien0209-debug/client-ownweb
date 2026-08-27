function Banner({ children }) {
  return (
    <div
      style={{
        borderRadius: "12px",
        padding: "14px 20px",
        backgroundColor: "#1d4ed8",
        color: "#fff",
        fontSize: "22px",
        fontWeight: 900,
        textAlign: "center",
        margin: "16px auto",
        maxWidth: "600px",
      }}
    >
      <h1 style={{ margin: 0 }}>{children}</h1>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        lineHeight: 1.6,
        fontSize: "16px",
        padding: "20px",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {title && (
        <h2
          style={{ color: "#333", textAlign: "center", marginBottom: "16px" }}
        >
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <h3 style={{ color: "#1d4ed8", marginBottom: "8px" }}>{title}</h3>
      <div style={{ color: "#555" }}>{children}</div>
    </div>
  );
}

const cellStyle = { padding: "6px 10px", border: "1px solid #ddd" };
const tableStyle = {
  borderCollapse: "collapse",
  width: "100%",
  marginBottom: "12px",
};

function BangUEOAI() {
  return (
    <>
      <table style={tableStyle}>
        <thead>
          <tr>
            {["U", "E", "O", "A", "I", "Ơ"].map((h) => (
              <td key={h} style={{ ...cellStyle, fontWeight: "bold" }}>
                {h}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={cellStyle}>
              uː
              <br />ʊ
            </td>
            <td style={cellStyle}>
              e<br />ɛ
            </td>
            <td style={cellStyle}>
              ɒ<br />
              ɔː
            </td>
            <td style={cellStyle}>
              ɑː
              <br />æ<br />ʌ
            </td>
            <td style={cellStyle}>
              iː
              <br />ɪ
            </td>
            <td style={cellStyle}>
              ɜː
              <br />ə
            </td>
          </tr>
        </tbody>
      </table>

      <table style={tableStyle}>
        <thead>
          <tr>
            {["eɪ", "aɪ", "ɔɪ", "əʊ", "aʊ", "ɪə", "eə", "ʊə"].map((h) => (
              <td key={h} style={{ ...cellStyle, fontWeight: "bold" }}>
                {h}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {["Ei", "Ai", "Oi", "Ơu", "Au", "I-ơ", "E-ơ", "U-ơ"].map((v) => (
              <td key={v} style={cellStyle}>
                {v}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </>
  );
}

function NguyenTacghepam() {
  return (
    <>
      <Banner>UỂ OẢI Ơ</Banner>

      <Card title='Nguyên tắc 80/20 - "Làm ít, đạt hiệu quả cao".'>
        <BangUEOAI />

        <Section title='1. "Đủ đơn giản, bình dị cho Bình dân"'>
          <p>
            <b>Chúng ta có thể:</b>
            <br />
            <b>+ Ghi nhớ "UỂ OẢI Ơ" trong vòng vài giây.</b>
            <br />
            <b>+ Hiểu và sử dụng nó trong vòng 30 phút.</b>
            <br />
            Chỉ với chừng đó chúng ta có thể giải quyết <b>70-80%</b> việc ghép
            và tách âm trong tiếng anh.
            <br />
            <i>
              <b style={{ color: "#1d4ed8" }}>
                "Dùng công sức nhỏ để đạt hiệu quả to."
              </b>
            </i>
            <br />
            Thay vì dùng nhiều tháng để thông thạo 44 âm IPA, hãy học "Uể oải
            ơ".
            <br />
            <strong>
              Điều này sẽ giúp bạn nhanh chóng nắm được vừa đủ và nhanh chóng
              bước vào giai đoạn thực hành - tiến bộ. Càng nhanh chóng thực hành
              - cải thiện - lặp lại, bạn sẽ càng sớm đến đích, chứ không phải là
              học lý thuyết.
            </strong>
          </p>
        </Section>

        <Section title='2. "Không mâu thuẫn với 44 âm IPA"'>
          <p>
            Sau khi thuần thục với UEOAI-Ơ bạn hoàn toàn có thể học tiếp để
            thuần thục <strong>"44 âm ipa",</strong> nhằm hoàn thiện khả năng
            phát âm của mình.
          </p>
          <p>
            Chúng tôi luôn cổ vũ điều đó và sẽ hướng dẫn dần dần trong quá trình
            thực hành khi thấy các bạn đã nhuần nhuyễn UEOAI-Ơ.{" "}
            <strong>Tuy nhiên lời khuyên của chúng tôi luôn là:</strong> ban
            đầu, hãy tập trung vào "UỂ OẢI Ơ" và cố gắng thực hành 10.000 lượt
            với phương pháp đơn giản này. Quá tham lam hoàn hảo một điểm nhỏ có
            thể dẫn đến làm chậm quá trình hình thành kĩ năng tổng thể.
          </p>
        </Section>
      </Card>

      <Banner>"Ghép âm - Tách âm" là LÕI của "Phát âm"</Banner>

      <Card title="3 Bước để GHÉP ÂM từ phiên âm IPA!">
        <Section title="Bước 1: Xác định nguyên âm chính (1 hoặc nhiều trong Ue oai ơ).">
          <p>
            Lấy ví dụ từ <strong>Pet /pɛt/</strong> nghĩa là con thú cưng.
          </p>
          <p style={{ fontStyle: "italic" }}>
            Nguyên âm chính của từ này là <b>/ɛ/</b>
          </p>
        </Section>

        <Section title="Bước 2: Ghép nguyên âm về phía trước; giữ lại phía sau.">
          <p>
            Từ: <span style={{ fontSize: "26px" }}>p</span>
            <span style={{ fontSize: "26px", color: "red" }}>ɛ</span>
            <span style={{ fontSize: "26px" }}>t</span>
            <br />
            Ta có <span style={{ fontSize: "40px" }}>pɛ</span>{" "}
            <span style={{ fontSize: "26px" }}>(-t)</span>
            <br />
            <span style={{ fontSize: "40px" }}>pɛ</span>
            <br />+ Phần trước gọi là "phần âm chính" (là phần nối nguyên âm
            chính với các phụ âm phía trước).
            <br />
            <span style={{ fontSize: "26px" }}>(-t)</span>
            <br />+ Phần sau gọi là "phần âm dấu" (là phần các âm còn lại).
          </p>
        </Section>

        <Section title="Bước 3: Đọc lên thành tiếng, theo xu hướng âm từ trái sang phải, từ âm chính sang âm dấu.">
          <ul style={{ paddingLeft: "20px", margin: "0 0 8px" }}>
            <li>
              <strong>Phần âm chính:</strong> Đọc to, dài hơn.
            </li>
            <li>
              <strong>Phần âm dấu:</strong> Đọc nhỏ, nhẹ, âm gió.
            </li>
          </ul>
          <p>
            + Phần âm chính và phần âm dấu gắn kết với nhau bằng xu hướng của
            âm.
            <br />
            Không phải là đọc âm{" "}
            <span style={{ fontSize: "26px", color: "red" }}>ɛ</span> và{" "}
            <span style={{ fontSize: "26px", color: "red" }}>t</span> mà là từ{" "}
            <span style={{ fontSize: "26px", color: "red" }}>ɛ</span> về{" "}
            <span style={{ fontSize: "26px", color: "red" }}>t</span>.
          </p>
          <p>
            + Âm dấu là một xu hướng của âm, không nhất thiết phát ra thành
            tiếng và khác với âm thanh đuôi t/d
          </p>
        </Section>

        <Section title="Bước bổ sung (nếu cần): Tinh chỉnh, sửa chửa">
          <p>
            Kết hợp với việc nghe từ điển để sửa chửa lại sao cho phù hợp với
            cách phát âm của từng người đảm bảo tính thực dụng và chính xác
            tương đối. Vừa dễ sử dụng mà không bị khó hiểu cho người nghe khác.
          </p>
        </Section>
      </Card>
    </>
  );
}

export default NguyenTacghepam;
