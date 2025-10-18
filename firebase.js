// ✅ firebase.js - cấu hình Firebase cho web app Đồng Hùng

// Import từ CDN thay vì import module (để chạy trực tiếp trên trình duyệt)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ⚙️ Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyALblbqW_VrZh2r7sPJ8Q6XT2fGbk0dsFg",
  authDomain: "donghung-3208d.firebaseapp.com",
  projectId: "donghung-3208d",
  storageBucket: "donghung-3208d.firebasestorage.app",
  messagingSenderId: "753379492663",
  appId: "1:753379492663:web:baff34f2c0bac00e02d0b2",
  measurementId: "G-06PF7MH1P0"
};

// 🔥 Khởi tạo Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
