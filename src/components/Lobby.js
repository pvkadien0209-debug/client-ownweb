import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { socket } from "../App";
import "bootstrap/dist/css/bootstrap.min.css";

const Lobby = ({
  STTconnectFN,
  setSttRoom,
  fileName,
  objList,
  objListDefault,
  custom,
  id,
  currentIndex,
}) => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState(
    Math.random().toString(36).substring(2, 7)
  );

  const [roomList, setRoomList] = useState([]);
  const [timeDefault, setTimeDefault] = useState(120);
  const [tableView, setTableView] = useState("Normal");
  const [pracMode, setPracMode] = useState("Normal");
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [QuickRoom, setQuickRoom] = useState(true);
  const paramSet = useParams();
  const locationSet = useLocation();
  useEffect(() => {
    console.log(paramSet, locationSet);
  }, [paramSet, locationSet]);

  useEffect(() => {
    const defaultIndices = objListDefault.map((item) => objList.indexOf(item));
    setSelectedIndices(defaultIndices);
  }, [objListDefault, objList]);

  function randomBoolean() {
    return Math.floor(Math.random() * 7) + 2;
  }

  function randomOneOrTwo() {
    return Math.random() >= 0.5 ? 1 : 2;
  }

  const handleCreateRoom = () => {
    const finalObjList =
      custom && selectedIndices.length > 0
        ? shuffleArray(
            objList.filter((_, index) => selectedIndices.includes(index))
          )
        : objListDefault;
    const objInformationOfGame = {
      objList: finalObjList,
      fileName,
      interleaving: randomOneOrTwo(),
      reverse: randomBoolean(),
      timeDefault,
      roomName,
      IdHost: socket.id,
      tableView,
      pracMode,
    };
    socket.emit("createRoom", objInformationOfGame, (newRoomCode) => {
      navigate(`/room/${newRoomCode}`);
    });
  };

  const handleCreateRoomOffline = () => {
    if (id) {
      navigate(`/roomoffline/${id}/${currentIndex}`);
    } else {
      navigate(`/roomoffline/elementary-a1-lesson-plan/0`);
    }

    // const finalObjList =
    //   custom && selectedIndices.length > 0
    //     ? shuffleArray(
    //         objList.filter((_, index) => selectedIndices.includes(index))
    //       )
    //     : objListDefault;
    // const objInformationOfGame = {
    //   objList: finalObjList,
    //   fileName,
    //   interleaving: randomOneOrTwo(),
    //   reverse: randomBoolean(),
    //   timeDefault,
    //   roomName,
    //   IdHost: socket.id,
    //   tableView,
    //   pracMode,
    // };
    // socket.emit("createRoom", objInformationOfGame, (newRoomCode) => {

    // });
  };

  // Mới thêm — không đổi handleCreateRoomOffline ở trên: dẫn sang bản
  // RoomofflineV2 (route riêng, file riêng), giữ nguyên logic điều hướng cũ.
  const handleCreateRoomOfflineV2 = () => {
    if (id) {
      navigate(`/roomofflineV2/${id}/${currentIndex}`);
    } else {
      navigate(`/roomofflineV2/elementary-a1-lesson-plan/0`);
    }
  };

  const handleJoinRoom = (roomCode) => {
    if (roomCode.trim()) {
      navigate(`/room/${roomCode}`);
    }
  };

  useEffect(() => {
    setSttRoom(false);
    socket.emit("getRoomList");
    socket.on("roomListUpdate", (updatedRoomList) => {
      setRoomList(updatedRoomList);
    });
    return () => socket.off("roomListUpdate");
  }, []);

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const selectAll = () => {
    const allIndices = objList.map((_, index) => index);
    setSelectedIndices(allIndices);
  };

  const deselectAll = () => {
    setSelectedIndices([]);
  };

  if (QuickRoom) {
    return (
      <div
        className="container mt-4"
        style={{
          border: "1px solid green",
          borderRadius: "10px",
          padding: "1%",
          textAlign: "center",
          width: "50%",
          minWidth: "300px",
        }}
      >
        <b>Kỹ năng là đích đến, thực hành là con đường, kỷ luật là động lực.</b>
        <br />
        <i>
          Học vừa đủ sau đó hành động lặp đi lặp lại là chìa khóa biến mọi thứ
          thành kỹ năng.
        </i>
        <hr />
        <div className="row">
          <div className="col-6">
            {" "}
            <button
              style={{ width: "150px", height: "150px" }}
              className="btn btn-primary mb-4"
              onClick={handleCreateRoomOffline}
            >
              <b>Vào thực hành</b>
            </button>
          </div>
          <div className="col-6">
            {" "}
            <button
              style={{ width: "150px", height: "150px" }}
              className="btn btn-outline-primary mb-4"
              onClick={handleCreateRoomOfflineV2}
            >
              <b>Vào thực hành Ver 2.0</b>
            </button>
          </div>
          {/* <div className="col-6">
            {" "}
            <button
              style={{ width: "150px", height: "150px" }}
              className="btn btn-outline-primary mb-4"
              onClick={() => {
                setQuickRoom(false);
              }}
            >
              <b>Tùy chỉnh một phòng thực hành chung </b>
            </button>
          </div> */}
        </div>
      </div>
    );
  }
  return (
    <div
      className="container mt-4"
      style={{
        border: "1px solid green",
        borderRadius: "10px",
        padding: "5%",
      }}
    >
      {STTconnectFN === 1 ? (
        <div>
          <div className="row">
            <div className="col-4">
              <h1 className="mb-4">Lobby | Sảnh</h1>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter room name | Nhập tên phòng"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary mb-4"
                onClick={handleCreateRoom}
                disabled={
                  roomName.length <= 2 ||
                  (custom && selectedIndices.length === 0)
                }
              >
                {roomName.length <= 2 ? (
                  <i>Nhập tên phòng/Tạo phòng tập</i>
                ) : (
                  <i>Create Room | Tạo phòng</i>
                )}
              </button>
            </div>
            <div className="col-8">
              <div className="row mb-3">
                <div className="col-4">
                  <label htmlFor="timeSelect">Time | Thời gian (s) : </label>
                  <select
                    id="timeSelect"
                    className="form-control"
                    value={timeDefault}
                    onChange={(e) => setTimeDefault(Number(e.target.value))}
                  >
                    {Array.from({ length: 28 }, (_, i) => 10 + i * 10).map(
                      (time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="col-4">
                  <label htmlFor="tableView">Hiển thị Bảng: </label>
                  <select
                    id="tableView"
                    className="form-control"
                    value={tableView}
                    onChange={(e) => setTableView(e.target.value)}
                  >
                    {["Normal", "Hide"].map((view, iview) => (
                      <option key={view} value={view}>
                        {["Bình thường", "Ẩn bảng"][iview]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-4">
                  <label htmlFor="pracMode">Chế độ luyện tập: </label>
                  <select
                    id="pracMode"
                    className="form-control"
                    value={pracMode}
                    onChange={(e) => setPracMode(e.target.value)}
                  >
                    {["Normal", "By host", "One by one"].map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {custom && (
                <div
                  style={{
                    border: "1px solid green",
                    borderRadius: "5px",
                    padding: "15px",
                  }}
                >
                  <h4>Chọn phần thực hành:</h4>
                  <button
                    className="btn btn-outline-primary mb-2 mr-1"
                    onClick={selectAll}
                  >
                    Chọn hết
                  </button>
                  <button
                    className="btn btn-outline-primary mb-2 ml-2"
                    onClick={deselectAll}
                  >
                    Hủy chọn hết
                  </button>
                  <div>
                    {objList.map((item, index) => (
                      <label
                        key={index}
                        style={{ display: "inline-block", marginRight: "10px" }}
                      >
                        <input
                          type="checkbox"
                          style={{ transform: "scale(1.8)" }}
                          checked={selectedIndices.includes(index)}
                          onChange={() => {
                            setSelectedIndices((prev) =>
                              prev.includes(index)
                                ? prev.filter((i) => i !== index)
                                : [...prev, index]
                            );
                          }}
                        />{" "}
                        Bài {index + 1}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <hr />
          <div className="row">
            {roomList
              .filter((room) => !room.allReady)
              .map((room) => (
                <div className="col-md-4 mb-4" key={room.roomCode}>
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">{room.roomInfo.roomName}</h5>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleJoinRoom(room.roomCode)}
                      >
                        Join | Tham gia
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : STTconnectFN === 2 ? (
        <div>
          <h1>Chưa kết nối được</h1>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      ) : (
        <h1>Đang kết nối với server, vui lòng đợi giây lát . . .</h1>
      )}
    </div>
  );
};

export default Lobby;
