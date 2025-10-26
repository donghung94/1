import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, signOut 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { 
  getFirestore, doc, setDoc, onSnapshot 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔧 Cấu hình Firebase (giữ nguyên của bạn)
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

// 🔐 Đăng nhập người dùng
export async function loginUser(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    const userRef = doc(db, "login_requests", user.uid);

    // 🚨 Mỗi lần đăng nhập đều tạo yêu cầu mới
    await setDoc(userRef, {
      email: user.email,
      device: navigator.userAgent,
      status: "pending",
      requestTime: new Date().toISOString()
    });

    alert("⏳ Đang chờ admin duyệt đăng nhập...");

    // 🔍 Lắng nghe realtime khi admin duyệt
    let handled = false;
    onSnapshot(userRef, (docSnap) => {
      const data = docSnap.data();
      if (!data || handled) return;

      if (data.status === "approved") {
        handled = true;
        alert("✅ Admin đã duyệt, bạn được phép vào hệ thống!");
        // 🧹 Reset trạng thái để lần sau phải duyệt lại
        setDoc(userRef, { status: "used" }, { merge: true });
        location.href = "index.html";
      } 
      else if (data.status === "rejected") {
        handled = true;
        alert("❌ Yêu cầu bị từ chối. Liên hệ admin.");
        signOut(auth);
      }
    });

  } catch (err) {
    console.error("❌ Lỗi đăng nhập:", err);
    alert("Đăng nhập thất bại: " + err.message);
  }
}

// 🚪 Đăng xuất
export async function logout() {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await signOut(auth);
    location.href = "login.html";
  } catch (err) {
    console.error("🚨 Lỗi khi đăng xuất:", err);
  }
}
