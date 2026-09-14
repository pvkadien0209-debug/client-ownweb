export function kiemtramic() {
  try {
    navigator.permissions
      .query({ name: "microphone" })
      .then(function (permissionStatus) {
        if (permissionStatus.state === "denied") {
          document.getElementById("kiemtramicro").innerHTML =
            '<div class="alert alert-warning"><i class="bi bi-exclamation-triangle me-2"></i>Quyền truy cập micro đã bị từ chối trước đó. Vui lòng cấp quyền lại!</div>';
          navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(function (stream) {
              document.getElementById("kiemtramicro").innerHTML =
                '<div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>Trang web có quyền sử dụng micro!</div>';
              stream.getTracks().forEach((track) => track.stop());
            })
            .catch(function (error) {
              document.getElementById("kiemtramicro").innerHTML =
                '<div class="alert alert-danger"><i class="bi bi-x-circle me-2"></i>Trang web không có quyền sử dụng micro hoặc bạn chưa cấp quyền.</div>';
            });
        } else if (permissionStatus.state === "granted") {
          document.getElementById("kiemtramicro").innerHTML =
            '<div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>Trang web có quyền sử dụng micro!</div>';
        } else {
          navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(function (stream) {
              document.getElementById("kiemtramicro").innerHTML =
                '<div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>Trang web có quyền sử dụng micro!</div>';
              stream.getTracks().forEach((track) => track.stop());
            })
            .catch(function (error) {
              document.getElementById("kiemtramicro").innerHTML =
                '<div class="alert alert-danger"><i class="bi bi-x-circle me-2"></i>Trang web không có quyền sử dụng micro hoặc bạn chưa cấp quyền.</div>';
            });
        }
      });
  } catch (error) {
    console.error("Lỗi khi kiểm tra micro:", error);
  }
}
