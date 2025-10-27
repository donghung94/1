function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const error = document.getElementById("error");

  if (username === "" || password === "") {
    error.textContent = "⚠️ Vui lòng nhập đủ thông tin!";
    return;
  }

  // ✅ Bạn có thể thay bằng dữ liệu thật từ server nếu có
  if (username === "donghung" && password === "123456") {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", username);
    window.location.href = "index.html";
  } else {
    error.textContent = "❌ Sai tài khoản hoặc mật khẩu!";
  }
}

// Khi người dùng đã đăng nhập, tự chuyển về trang chính
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("isLoggedIn") === "true") {
    window.location.href = "index.html";
  }
});
