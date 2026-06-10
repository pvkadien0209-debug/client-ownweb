import React, { useState } from "react";

// Data files (trong thực tế sẽ là các file JSON riêng biệt)
const homeContent = {
  hero: {
    title: "Khóa thực hành tiếng anh",
    highlight: "10.000 LƯỢT NGHE NÓI",
    subtitle: "Sức mạnh của thực hành",
  },
  sections: [
    {
      id: "practice-power",
      title: "Sức mạnh của thực hành",
      content: [
        'Ông bà ta thường nói: "Quen tay hay việc" hay "Trăm hay không bằng quen tay". Câu nói này nhấn mạnh rằng, dù lý thuyết có giỏi đến đâu, cũng không thể sánh bằng sự thành thạo nhờ thực hành liên tục.',
        "Việc học nghe và nói tiếng Anh cũng không ngoại lệ. Dù học lý thuyết nhiều đến đâu, nếu không thực sự thực hành nghe và nói, kết quả đạt được sẽ khó lòng như mong đợi.",
        "Với chúng tôi, con số 10.000 lượt luyện tập là một cột mốc quan trọng. Nó đánh dấu sự chuyển mình từ cảm giác tự ti, không thể giao tiếp tiếng Anh, sang sự tự tin, sẵn sàng trao đổi một cách tự nhiên bằng ngôn ngữ này.",
      ],
    },
    {
      id: "four-steps",
      title: "4 Bước Để Hình Thành Kỹ Năng Nghe Nói!",
      highlight: "Đạt được 10.000 lượt nghe nói",
      steps: [
        {
          title: "Bước 1: Chia nhỏ kỹ năng",
          content:
            'Tập trung vào kỹ năng cơ bản và cốt lõi nhất. Thay vì "học nghe nói", hãy tập trung vào "Ghép âm và tách âm".',
          note: "Trong quá trình học tiếng Anh, nhiều người thường băn khoăn vì sao họ có thể hiểu từ vựng và ngữ pháp nhưng vẫn không thể nghe hiểu hay nói chuyện tự nhiên. Bí quyết nằm ở kỹ năng cơ bản nhất nhưng cũng quan trọng nhất: ghép âm và tách âm.",
        },
        {
          title: "Bước 2: Học đủ để thực hành",
          content:
            "Học nhanh các nguyên tắc và phương pháp nền tảng. Không dành quá nhiều thời gian cho lý thuyết, tập trung vào những gì cần thiết để bắt đầu thực hành ngay.",
        },
        {
          title: "Bước 3: Loại bỏ các rào cản",
          content: "Có hai loại rào cản chính cần vượt qua:",
          barriers: [
            "Rào cản khách quan: Không có môi trường luyện tập phù hợp hoặc môi trường hiện tại gặp nhiều vấn đề không thuận lợi.",
            "Rào cản chủ quan: Thiếu tập trung, lười biếng, cảm giác chán nản, sợ hãi thất bại hoặc không thể kiên trì.",
          ],
          note: "Hiểu được những thách thức này, chúng tôi đã phát triển và áp dụng các phương pháp hỗ trợ để giúp bạn dễ dàng vượt qua mọi rào cản.",
        },
        {
          title: "Bước 4: Luyện tập lặp lại",
          content: "Luyện tập hiệu quả theo chu trình:",
          cycle:
            "Luyện tập → Ghi nhận phản hồi → Sửa chữa, tinh chỉnh → Luyện tập tiếp tục.",
          note: "Lặp lại chu trình này một cách đều đặn và có định hướng cho đến khi đạt được mục tiêu 10.000 lượt thực hành. Đây chính là chìa khóa để xây dựng sự thành thạo và tự tin với kỹ năng bạn đang rèn luyện.",
        },
      ],
    },
    {
      id: "common-people",
      title: "Nếu bạn là người bình thường?",
      highlight: 'Khóa thực hành "bình dân", "không năng khiếu".',
      subtitle: "Đơn Giản - Thực Dụng - Hiệu Quả",
      features: [
        {
          title: '"Bình dân"',
          content:
            'Khóa học tập trung vào các nguyên tắc "đơn giản", "dễ sử dụng" và "bình dân" thay vì các yếu tố "hoa mỹ" hay "học thuật". Mục tiêu chính là giúp bạn thực hành nhiều và tiến bộ nhanh. Chúng tôi ưu tiên tính thực tế, giúp người học nắm bắt kỹ năng nghe nói hiệu quả mà không bị áp lực bởi sự phức tạp của ngôn ngữ học thuật.',
        },
        {
          title: '"Không năng khiếu"',
          content:
            'Phương pháp học tập trung vào các kỹ năng cơ bản nhất, đơn giản và có thể lặp đi lặp lại. Không yêu cầu "có khiếu học tiếng anh", chỉ cần bạn làm đúng và đủ, kết quả sẽ tự động đến.',
        },
      ],
    },
  ],
  contact: {
    title: "Làm thế nào để tham gia khóa thực hành?",
    highlight: "Liên hệ qua zalo 0918 284 482 để được tư vấn khóa thực hành.",
  },
};

const knowGhepAmContent = {
  hero: {
    title: "Bạn đã phân biệt được?",
    highlight: "Ghép âm - Phân tách âm và Gán nghĩa cho âm",
  },
  sections: [
    {
      id: "language-nature",
      title: "Bản chất của ngôn ngữ nghe nói và quá trình học hiệu quả",
      content: [
        'Ngôn ngữ nghe nói thực chất được hình thành từ một số "âm thanh cơ bản" được "ghép lại thành nhiều tổ hợp" theo các "nguyên tắc xác định". Mỗi tổ hợp âm thanh sau đó được "gán một ý nghĩa cụ thể", giúp chúng ta giao tiếp và truyền tải thông tin.',
      ],
      processes: [
        'Khi nói: Là quá trình "ghép âm" để tạo thành từ, câu có nghĩa.',
        'Khi nghe: Là quá trình "tách âm", phân tích các tổ hợp âm thanh, sau đó "so chiếu âm thanh với ý nghĩa" để hiểu được nội dung.',
      ],
      example:
        'Ví dụ: Bạn có thể nghe và lặp lại "tít tít te te", nhưng nếu chưa "gán một ý nghĩa", bạn sẽ không hiểu. Tuy nhiên, nếu cụm âm đó được gán nghĩa là "có ở nhà không", bạn sẽ lập tức hiểu khi nghe và có thể sử dụng để trao đổi với người nào cũng hiểu nó.',
    },
    {
      id: "three-steps",
      title: "3 Bước để GHÉP ÂM từ phiên âm quốc tế!",
      highlight: "Ghép âm - Phân tách âm",
      steps: [
        {
          title: "Bước 1: Xác định nguyên âm chính",
          content: "Lấy ví dụ từ Pet /pɛt/ nghĩa là con thú cưng.",
          note: "Nguyên âm chính của từ này là /ɛ/",
        },
        {
          title: "Bước 2: Ghép nguyên âm về phía trước; giữ lại phía sau",
          example: {
            word: "pɛt",
            breakdown: "pɛ (-t)",
            explanation:
              'Phần trước gọi là "phần âm chính" (là phần nối nguyên âm chính với các phụ âm phía trước). Phần sau gọi là "phần âm dấu" hoặc "phần xu hướng âm" (là phần các âm còn lại).',
          },
        },
        {
          title: "Bước 3: Đọc lên thành tiếng",
          rules: [
            "Phần âm chính: Đọc to, dài hơn.",
            "Phần âm dấu: Đọc nhỏ, nhẹ, âm gió.",
          ],
          note: "Phần âm chính và phần âm dấu gắn kết với nhau bằng xu hướng của âm. Không phải là đọc âm ɛ và t mà là từ ɛ về t.",
        },
        {
          title: "Bước 4: Tinh chỉnh, sửa chửa",
          content:
            "Kết hợp với việc nghe từ điển để sửa chửa lại sao cho phù hợp với cách phát âm của từng người đảm bảo tính thực dụng và chính xác tương đối. Vừa dễ sử dụng mà không bị khó hiểu.",
        },
      ],
    },
    {
      id: "ueoai",
      title: "Lấy đơn giản làm sức mạnh?",
      highlight: "UỂ OẢI Ơ",
      subtitle: 'Nguyên tắc 80/20 - "Làm ít, đạt hiệu quả cao".',
      phonetics: {
        basic: [
          { letter: "U", sounds: ["uː", "ʊ"] },
          { letter: "E", sounds: ["e", "ɛ"] },
          { letter: "O", sounds: ["ɒ", "ɔː"] },
          { letter: "A", sounds: ["ɑː", "æ", "ʌ"] },
          { letter: "I", sounds: ["iː", "ɪ"] },
          { letter: "Ơ", sounds: ["ɜː", "ə"] },
        ],
        diphthongs: [
          { ipa: "eɪ", simple: "Ei" },
          { ipa: "aɪ", simple: "Ai" },
          { ipa: "ɔɪ", simple: "Oi" },
          { ipa: "əʊ", simple: "Ơu" },
          { ipa: "aʊ", simple: "Au" },
          { ipa: "ɪə", simple: "I-ơ" },
          { ipa: "eə", simple: "E-ơ" },
          { ipa: "ʊə", simple: "U-ơ" },
        ],
      },
      principles: [
        {
          title: '"Đủ đơn giản, bình dị cho Bình dân"',
          content:
            'Chúng ta có thể ghi nhớ "UỂ OẢI Ơ" trong vòng vài giây và hiểu và sử dụng nó trong vòng 30 phút. Chỉ với chừng đó chúng ta có thể giải quyết 70-80% việc ghép và tách âm trong tiếng anh.',
        },
        {
          title: '"Không mâu thuẫn với 44 âm IPA"',
          content:
            'Sau khi thuần thục với UEOAI-Ơ bạn hoàn toàn có thể học tiếp để thuần thục "44 âm ipa", nhằm hoàn thiện khả năng phát âm của mình.',
        },
      ],
    },
    {
      id: "mastery",
      title: "Khi nào thì rành?",
      highlight: "Khi Nào Được Tính Là Rành Ghép Âm – Phân Tách Âm?",
      subtitle: "NGHE – NÓI không còn tốn sức:",
      phases: [
        {
          title: "Giai đoạn đầu: Tập trung cao độ và mệt mỏi",
          points: [
            "Tốn sức khi mới tập ghép âm: Cơ miệng chưa quen với việc phát âm chính xác, bạn có thể cảm thấy mỏi hoặc căng cơ khi thực hiện các âm liên tục.",
            "Giống như mới tập lái xe: Sự tập trung cao độ và thao tác chưa quen.",
            "Tâm lý căng thẳng: Vì chưa thành thạo, bạn dễ lo lắng khi phát âm sai hoặc không tách được âm.",
          ],
        },
        {
          title: "Giai đoạn sau: Rành ghép âm – phân tách âm",
          points: [
            "Kỹ năng tự động hóa: Việc ghép âm khi nói hoặc tách âm khi nghe trở thành phản xạ tự nhiên.",
            "Không còn mỏi cơ hay căng thẳng: Cơ quan phát âm đã quen với việc tạo âm chuẩn.",
            "Thư giãn và thoải mái hơn: Bạn có thể thực hiện các kỹ năng này ngay cả trong môi trường ồn ào.",
            "Hiểu ngữ nghĩa tự nhiên: Sau khi phân tách âm, việc gán nghĩa cho cụm từ diễn ra tự động.",
          ],
        },
      ],
    },
  ],
};

function ModernLandingPage() {
  const [activeTab, setActiveTab] = useState("home");

  const styles = {
    container: {
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      lineHeight: 1.7,
      color: "#1e293b",
      background: "#f6f7fb",
      minHeight: "100vh",
      padding: "2rem 0",
    },
    tabNav: {
      display: "flex",
      justifyContent: "center",
      gap: "0.5rem",
      marginBottom: "3rem",
      background: "#ffffff",
      padding: "0.5rem",
      borderRadius: "16px",
      boxShadow:
        "0 1px 3px rgba(15, 23, 42, 0.06), 0 6px 18px rgba(15, 23, 42, 0.05)",
      border: "1px solid #e2e8f0",
      maxWidth: "400px",
      margin: "0 auto 3rem auto",
    },
    tabBtn: {
      padding: "0.75rem 1.5rem",
      borderRadius: "12px",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontWeight: "500",
      transition: "all 0.2s ease",
      fontSize: "0.95rem",
      color: "#64748b",
    },
    tabBtnActive: {
      background: "#4f46e5",
      color: "white",
      boxShadow: "0 2px 10px rgba(79, 70, 229, 0.3)",
    },
    content: {
      maxWidth: "1100px",
      margin: "0 auto",
      padding: "1.5rem",
    },
    hero: {
      textAlign: "center",
      marginBottom: "3rem",
      padding: "3rem 2rem",
      background:
        "radial-gradient(900px 400px at 85% -10%, rgba(255,255,255,0.12), transparent 60%), linear-gradient(150deg, #312e81 0%, #4f46e5 100%)",
      borderRadius: "24px",
      boxShadow: "0 20px 60px rgba(79, 70, 229, 0.2)",
    },
    heroTitle: {
      fontSize: "clamp(1.75rem, 5vw, 3rem)",
      fontWeight: "800",
      color: "white",
      marginBottom: "1rem",
      letterSpacing: "-0.02em",
    },
    highlight: {
      background: "rgba(255, 255, 255, 0.12)",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      color: "white",
      padding: "1.1rem 1.75rem",
      borderRadius: "16px",
      fontSize: "clamp(1.1rem, 3vw, 1.6rem)",
      fontWeight: "800",
      margin: "1.5rem auto 0",
      maxWidth: "640px",
      letterSpacing: "0.02em",
    },
    highlightInSection: {
      background: "#eef2ff",
      border: "1px solid #c7d2fe",
      color: "#3730a3",
      padding: "1rem 1.5rem",
      borderRadius: "14px",
      fontSize: "clamp(1.05rem, 2.5vw, 1.35rem)",
      fontWeight: "700",
      margin: "1.5rem 0",
      textAlign: "center",
    },
    section: {
      background: "#ffffff",
      borderRadius: "20px",
      padding: "clamp(1.5rem, 4vw, 2.75rem)",
      marginBottom: "2rem",
      boxShadow:
        "0 1px 3px rgba(15, 23, 42, 0.06), 0 6px 18px rgba(15, 23, 42, 0.05)",
      border: "1px solid #e2e8f0",
    },
    sectionTitle: {
      fontSize: "clamp(1.4rem, 4vw, 2rem)",
      fontWeight: "800",
      color: "#1e293b",
      marginBottom: "1.5rem",
      textAlign: "center",
      letterSpacing: "-0.01em",
    },
    stepTitle: {
      color: "#4f46e5",
      fontSize: "1.2rem",
      fontWeight: "700",
      marginBottom: "0.75rem",
    },
    text: {
      fontSize: "1.05rem",
      color: "#475569",
      marginBottom: "1.25rem",
      lineHeight: 1.75,
    },
    note: {
      background: "#eef2ff",
      padding: "1.1rem 1.35rem",
      borderRadius: "12px",
      borderLeft: "4px solid #4f46e5",
      fontStyle: "italic",
      color: "#3730a3",
      marginTop: "0.75rem",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginBottom: "1.75rem",
      background: "white",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
      border: "1px solid #e2e8f0",
    },
    tableHeader: {
      background: "#4f46e5",
      color: "white",
      fontWeight: "700",
    },
    tableCell: {
      padding: "0.85rem 0.5rem",
      textAlign: "center",
      borderBottom: "1px solid #e2e8f0",
      fontSize: "1rem",
    },
    contactSection: {
      background: "linear-gradient(150deg, #065f46 0%, #059669 100%)",
      color: "white",
      textAlign: "center",
      padding: "clamp(2rem, 5vw, 3rem)",
      borderRadius: "20px",
      marginTop: "2.5rem",
      boxShadow: "0 20px 60px rgba(5, 150, 105, 0.2)",
    },
    list: {
      paddingLeft: "1.5rem",
      marginBottom: "1.25rem",
    },
    listItem: {
      marginBottom: "0.7rem",
      fontSize: "1.05rem",
      color: "#475569",
      lineHeight: 1.7,
    },
  };

  const renderHomeContent = () => (
    <div>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>{homeContent.hero.title}</h1>
        <div style={styles.highlight}>{homeContent.hero.highlight}</div>
      </div>

      {homeContent.sections.map((section, index) => (
        <div key={section.id} style={styles.section}>
          <h2 style={styles.sectionTitle}>{section.title}</h2>

          {section.highlight && (
            <div style={styles.highlightInSection}>{section.highlight}</div>
          )}

          {section.content &&
            section.content.map((paragraph, i) => (
              <p key={i} style={styles.text}>
                {paragraph}
              </p>
            ))}

          {section.steps &&
            section.steps.map((step, i) => (
              <div key={i} style={{ marginBottom: "2rem" }}>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.text}>{step.content}</p>
                {step.barriers && (
                  <ul style={styles.list}>
                    {step.barriers.map((barrier, j) => (
                      <li key={j} style={styles.listItem}>
                        <strong>{barrier.split(":")[0]}:</strong>{" "}
                        {barrier.split(":")[1]}
                      </li>
                    ))}
                  </ul>
                )}
                {step.cycle && (
                  <p
                    style={{
                      ...styles.text,
                      textAlign: "center",
                      fontWeight: "bold",
                      color: "#4f46e5",
                    }}
                  >
                    {step.cycle}
                  </p>
                )}
                {step.note && <div style={styles.note}>{step.note}</div>}
              </div>
            ))}

          {section.features &&
            section.features.map((feature, i) => (
              <div key={i} style={{ marginBottom: "2rem" }}>
                <h3 style={styles.stepTitle}>{feature.title}</h3>
                <p style={styles.text}>{feature.content}</p>
              </div>
            ))}
        </div>
      ))}

      <div style={styles.contactSection}>
        <h2
          style={{ fontSize: "1.75rem", marginBottom: "1rem", fontWeight: 800 }}
        >
          {homeContent.contact.title}
        </h2>
        <div style={{ fontSize: "1.25rem", fontWeight: "600" }}>
          {homeContent.contact.highlight}
        </div>
      </div>
    </div>
  );

  const renderKnowGhepAmContent = () => (
    <div>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>{knowGhepAmContent.hero.title}</h1>
        <div style={styles.highlight}>{knowGhepAmContent.hero.highlight}</div>
      </div>

      {knowGhepAmContent.sections.map((section, index) => (
        <div key={section.id} style={styles.section}>
          <h2 style={styles.sectionTitle}>{section.title}</h2>

          {section.highlight && (
            <div style={styles.highlightInSection}>{section.highlight}</div>
          )}

          {section.subtitle && (
            <h3
              style={{
                ...styles.stepTitle,
                textAlign: "center",
                fontSize: "1.35rem",
              }}
            >
              {section.subtitle}
            </h3>
          )}

          {section.content &&
            section.content.map((paragraph, i) => (
              <p key={i} style={styles.text}>
                {paragraph}
              </p>
            ))}

          {section.processes && (
            <ul style={styles.list}>
              {section.processes.map((process, i) => (
                <li key={i} style={styles.listItem}>
                  <strong>{process.split(":")[0]}:</strong>{" "}
                  {process.split(":")[1]}
                </li>
              ))}
            </ul>
          )}

          {section.example && <div style={styles.note}>{section.example}</div>}

          {section.steps &&
            section.steps.map((step, i) => (
              <div key={i} style={{ marginBottom: "2rem" }}>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.text}>{step.content}</p>
                {step.note && <div style={styles.note}>{step.note}</div>}
                {step.example && (
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      padding: "1rem 1.25rem",
                      borderRadius: "12px",
                      margin: "1rem 0",
                    }}
                  >
                    <p>
                      <strong>Từ:</strong> {step.example.word}
                    </p>
                    <p>
                      <strong>Phân tích:</strong> {step.example.breakdown}
                    </p>
                    <p>{step.example.explanation}</p>
                  </div>
                )}
                {step.rules && (
                  <ul style={styles.list}>
                    {step.rules.map((rule, j) => (
                      <li key={j} style={styles.listItem}>
                        <strong>{rule.split(":")[0]}:</strong>{" "}
                        {rule.split(":")[1]}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

          {section.phonetics && (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    {section.phonetics.basic.map((item, i) => (
                      <td key={i} style={styles.tableCell}>
                        {item.letter}
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {section.phonetics.basic.map((item, i) => (
                      <td key={i} style={styles.tableCell}>
                        {item.sounds.map((sound, j) => (
                          <div key={j}>{sound}</div>
                        ))}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>

              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    {section.phonetics.diphthongs.map((item, i) => (
                      <td key={i} style={styles.tableCell}>
                        {item.ipa}
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {section.phonetics.diphthongs.map((item, i) => (
                      <td key={i} style={styles.tableCell}>
                        {item.simple}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {section.principles &&
            section.principles.map((principle, i) => (
              <div key={i} style={{ marginBottom: "2rem" }}>
                <h3 style={styles.stepTitle}>{principle.title}</h3>
                <p style={styles.text}>{principle.content}</p>
              </div>
            ))}

          {section.phases &&
            section.phases.map((phase, i) => (
              <div key={i} style={{ marginBottom: "2rem" }}>
                <h3 style={styles.stepTitle}>{phase.title}</h3>
                <ul style={styles.list}>
                  {phase.points.map((point, j) => (
                    <li key={j} style={styles.listItem}>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      ))}
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={{ height: "10vh" }}></div>
      {/* <div style={styles.tabNav}>
        <button
          style={{
            ...styles.tabBtn,
            ...(activeTab === "home" ? styles.tabBtnActive : {}),
          }}
          onClick={() => setActiveTab("home")}
        >
          (1) Thực hành
        </button>
        <button
          style={{
            ...styles.tabBtn,
            ...(activeTab === "ghepam" ? styles.tabBtnActive : {}),
          }}
          onClick={() => setActiveTab("ghepam")}
        >
          (2) Ghép Âm
        </button>
      </div> */}

      <div style={styles.content}>
        {renderHomeContent()}

        <hr style={{ border: "none", margin: "2rem 0" }} />
        {renderKnowGhepAmContent()}
        {/* {activeTab === "home" && }
        {activeTab === "ghepam" &&} */}
      </div>
    </div>
  );
}

export default ModernLandingPage;
