// ===========================
// 🔥 Firebase cấu hình cơ bản
// ===========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { 
  getFirestore, doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ⚙️ Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyALblbqW_VrZh2r7sPJ8Q6XT2fGbk0dsFg",
  authDomain: "donghung-3208d.firebaseapp.com",
  projectId: "donghung-3208d",
  storageBucket: "donghung-3208d.firebasestorage.app",
  messagingSenderId: "753379492663",
  appId: "1:753379492663:web:baff34f2c0bac00e02d0b2",
  measurementId: "G-06PF7MH1P0"
};

// 🚀 Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// =======================================================
// 🔐 LOGIN — chỉ cho phép 1 thiết bị duy nhất online
// =======================================================
export async function loginUser(email, password) {
  try {
    console.log("🚀 Đang đăng nhập...");
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    console.log("✅ Firebase Auth thành công:", user.email);

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const currentDevice = navigator.userAgent; // định danh thiết bị

    // 🔍 Kiểm tra Firestore trước khi redirect
    if (snap.exists()) {
      const data = snap.data();
      console.log("📄 Dữ liệu hiện tại:", data);

      // ⚠️ Nếu phát hiện thiết bị khác đang login
      if (data.activeDevice && data.activeDevice !== currentDevice) {
        await signOut(auth);
        alert("⚠️ Tài khoản này đang đăng nhập ở thiết bị khác.\nVui lòng đăng xuất thiết bị kia trước!");
        return; // ❌ Không vào index
      }

      // ✅ Nếu cùng thiết bị → cập nhật lại thời gian
      await setDoc(userRef, {
        email: user.email,
        activeDevice: currentDevice,
        lastLogin: new Date().toISOString()
      }, { merge: true });

    } else {
      // 🆕 Tạo mới user document
      await setDoc(userRef, {
        email: user.email,
        activeDevice: currentDevice,
        lastLogin: new Date().toISOString()
      });
    }

    console.log("📡 Đã cập nhật activeDevice:", currentDevice);
    location.href = "index.html"; // ✅ chỉ chuyển khi hợp lệ

  } catch (err) {
    console.error("❌ Lỗi đăng nhập:", err);
    alert("Đăng nhập thất bại: " + err.message);
  }
}

// =======================================================
// 🚪 LOGOUT — xoá activeDevice khi đăng xuất
// =======================================================
export async function logout() {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { activeDevice: null }, { merge: true });
    await signOut(auth);
    console.log("👋 Đã đăng xuất, xoá activeDevice thành công");
    location.href = "login.html";
  } catch (err) {
    console.error("🚨 Lỗi khi đăng xuất:", err);
  }
}
