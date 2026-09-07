import React, { useState, useEffect } from "react";
import { compareTwoStrings } from "string-similarity";

const YouTubeVideoSearch = ({ nameSeach = "How old are you?" }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bestMatch, setBestMatch] = useState(null);
  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState(nameSeach);
  const [inputSearch, setInputSearch] = useState(nameSeach);

  const PLAYLIST_ID_HD = "PLC0acE0qMKOkBpb7YJl4sgVhP2OGJmzQS";
  const API_KEY = "AIzaSyBWBxqpLe4z7BFwmuDegv82QH7ZTofrO-o";
  const STORAGE_KEY = "youtube_playlist_cache";
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 ngày

  // Lưu dữ liệu vào localStorage với expired time
  const saveToLocalStorage = (data) => {
    const cacheData = {
      data: data,
      timestamp: Date.now(),
      expires: Date.now() + CACHE_DURATION,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
  };

  // Lấy dữ liệu từ localStorage và kiểm tra expired
  const getFromLocalStorage = () => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      if (Date.now() > cacheData.expires) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error("Lỗi khi đọc localStorage:", error);
      return null;
    }
  };

  // Tìm video tương tự nhất
  const findBestMatch = (videos, searchTerm) => {
    if (!videos || videos.length === 0) return null;

    let bestVideo = null;
    let highestScore = 0;

    videos.forEach((video) => {
      // So sánh với title và titleSort
      const titleScore = compareTwoStrings(
        searchTerm.toLowerCase(),
        video.title.toLowerCase(),
      );
      const titleSortScore = compareTwoStrings(
        searchTerm.toLowerCase(),
        video.titleSort.toLowerCase(),
      );

      // Lấy điểm cao nhất
      const maxScore = Math.max(titleScore, titleSortScore);

      if (maxScore > highestScore) {
        highestScore = maxScore;
        bestVideo = { ...video, similarity: maxScore };
      }
    });

    return bestVideo;
  };

  // Tìm top matches và suggestions
  const findTopMatches = (videos, searchTerm) => {
    if (!videos || videos.length === 0) {
      return { bestMatch: null, suggestions: [] };
    }

    let scoredVideos = [];

    videos.forEach((video) => {
      // So sánh với title và titleSort
      const titleScore = compareTwoStrings(
        searchTerm.toLowerCase(),
        video.title.toLowerCase(),
      );
      const titleSortScore = compareTwoStrings(
        searchTerm.toLowerCase(),
        video.titleSort.toLowerCase(),
      );

      // Lấy điểm cao nhất
      const maxScore = Math.max(titleScore, titleSortScore);

      if (maxScore > 0.1) {
        // Chỉ lấy video có độ tương tự > 10%
        scoredVideos.push({ ...video, similarity: maxScore });
      }
    });

    // Sắp xếp theo độ tương tự giảm dần
    scoredVideos.sort((a, b) => b.similarity - a.similarity);

    // Tách bestMatch và suggestions
    const bestMatch = scoredVideos.length > 0 ? scoredVideos[0] : null;
    const suggestions = scoredVideos.slice(1, 5); // Lấy tối đa 4 video gợi ý

    return { bestMatch, suggestions };
  };

  // Xử lý khi click vào video gợi ý
  const handleSuggestionClick = (video) => {
    setBestMatch(video);
    // Scroll to top để hiển thị video được chọn
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fetch dữ liệu playlist với pagination để lấy tất cả video
  const fetchPlaylistVideos = async () => {
    try {
      setLoading(true);

      // Kiểm tra localStorage trước
      const cachedData = getFromLocalStorage();
      if (cachedData) {
        console.log("Sử dụng dữ liệu từ cache");
        setVideos(cachedData);
        return cachedData;
      }

      console.log("Fetch dữ liệu từ API - Lấy tất cả video");
      let allVideos = [];
      let nextPageToken = null;
      let pageCount = 0;

      do {
        pageCount++;
        console.log(`Đang tải trang ${pageCount}...`);

        let apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${PLAYLIST_ID_HD}&part=snippet&maxResults=50`;
        if (nextPageToken) {
          apiUrl += `&pageToken=${nextPageToken}`;
        }

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Thêm video từ trang hiện tại
        if (data.items && data.items.length > 0) {
          allVideos = [...allVideos, ...data.items];
        }

        // Lấy token cho trang tiếp theo
        nextPageToken = data.nextPageToken;

        // Hiển thị tiến trình
        console.log(`Đã tải ${allVideos.length} video từ ${pageCount} trang`);
      } while (nextPageToken);

      console.log(
        `Hoàn thành! Tổng cộng ${allVideos.length} video từ ${pageCount} trang`,
      );

      // Xử lý dữ liệu
      const processedVideos = allVideos.map((item) => {
        const title = item.snippet.title;
        const videoId = item.snippet.resourceId.videoId;
        const embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;

        let titleSort = title;
        const match = title.match(/\|(.*?)\|/);
        if (match) {
          titleSort = match[1].trim();
        }

        return {
          title: title,
          embedCode: embedCode,
          titleSort: titleSort,
          videoId: videoId,
        };
      });

      // Lưu vào localStorage
      saveToLocalStorage(processedVideos);
      setVideos(processedVideos);
      setError(null);

      return processedVideos;
    } catch (error) {
      console.error("Lỗi khi tải danh sách phát:", error);
      setError(
        "Không thể tải danh sách video. Vui lòng kiểm tra lại API key và playlist ID.",
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Effect để fetch dữ liệu khi component mount
  useEffect(() => {
    fetchPlaylistVideos();
  }, []);

  // Effect để tìm video tương tự khi có dữ liệu hoặc searchTerm thay đổi
  useEffect(() => {
    if (videos.length > 0 && searchTerm) {
      const { bestMatch, suggestions } = findTopMatches(videos, searchTerm);
      setBestMatch(bestMatch);
      setSuggestedVideos(suggestions);
    }
  }, [videos, searchTerm]);

  // Xử lý tìm kiếm
  const handleSearch = () => {
    setSearchTerm(inputSearch);
  };

  // Xử lý nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <div>Đang tải tất cả video từ playlist...</div>
        <div style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
          Vui lòng chờ, đang tải từng trang dữ liệu...
        </div>
      </div>
    );
  }

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>Lỗi: {error}</div>;
  }

  return (
    <div style={{ padding: "2px", fontFamily: "Arial, sans-serif" }}>
      {/* Ô tìm kiếm */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={inputSearch}
          onChange={(e) => setInputSearch(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập từ khóa tìm kiếm..."
          style={{
            padding: "10px",
            fontSize: "16px",
            width: "400px",
            marginRight: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Tìm kiếm
        </button>
      </div>

      {/* Hiển thị kết quả tìm kiếm */}
      {bestMatch ? (
        <div style={{ marginBottom: "20px", color: "black" }}>
          <h3>
            Video phù hợp nhất (Độ tương tự:{" "}
            {(bestMatch.similarity * 100).toFixed(1)}%)
          </h3>

          {/* Embed video */}
          <div style={{ marginTop: "15px" }}>
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${bestMatch.videoId}`}
              frameBorder="0"
              allowFullScreen
              title={bestMatch.title}
            ></iframe>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>Tiêu đề:</strong> {bestMatch.title}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>Tiêu đề rút gọn:</strong> {bestMatch.titleSort}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>Video ID:</strong> {bestMatch.videoId}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: "20px", color: "#666" }}>
          {videos.length > 0
            ? "Không tìm thấy video phù hợp"
            : "Chưa có dữ liệu video"}
        </div>
      )}

      {/* Video gợi ý */}
      {suggestedVideos.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ marginBottom: "15px", color: "#333" }}>
            📹 Video gợi ý khác ({suggestedVideos.length})
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {suggestedVideos.map((video, index) => (
              <div
                key={video.videoId}
                onClick={() => handleSuggestionClick(video)}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "15px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.15)";
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                  e.currentTarget.style.backgroundColor = "#fff";
                }}
              >
                {/* Video info */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#333",
                      marginBottom: "4px",
                    }}
                  >
                    {video.titleSort}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#999",
                    }}
                  >
                    #{index + 2} phù hợp nhất
                  </div>
                </div>

                {/* Similarity badge and click hint */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {(video.similarity * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    👆 Click để xem
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thông tin cache */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "10px",
          borderRadius: "4px",
          fontSize: "14px",
          color: "#666",
          marginBottom: "20px",
        }}
      >
        <strong>Thông tin:</strong> Dữ liệu được lưu cache trong 1 ngày.
        <br />
        <strong>Tổng số video:</strong> {videos.length} video
        {getFromLocalStorage() && (
          <span style={{ color: "#28a745" }}>
            <br />✓ Đang sử dụng dữ liệu từ cache (tiết kiệm thời gian tải)
          </span>
        )}
        {!getFromLocalStorage() && videos.length > 0 && (
          <span style={{ color: "#007bff" }}>
            <br />✓ Đã tải toàn bộ {videos.length} video từ API
          </span>
        )}
      </div>
    </div>
  );
};

export default YouTubeVideoSearch;
