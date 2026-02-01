import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/* ================== FIREBASE CONFIG ================== */
const firebaseConfig = {
  apiKey: "AIzaSyALblbqW_VrZh2r7sPJ8Q6XT2fGbk0dsFg",
  authDomain: "donghung-3208d.firebaseapp.com",
  projectId: "donghung-3208d",
  storageBucket: "donghung-3208d.firebasestorage.app",
  messagingSenderId: "753379492663",
  appId: "1:753379492663:web:baff34f2c0bac00e02d0b2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/* ================== DEVICE ID ================== */
// 1 thiết bị = 1 id cố định (lưu localStorage)
function getDeviceId() {
  let id = localStorage.getItem("DEVICE_ID");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("DEVICE_ID", id);
  }
  return id;
}

/* ================== LOGIN ================== */
export async function loginUser(email, password) {
  const deviceId = getDeviceId();
  const ua = navigator.userAgent;

  const cred = await signInWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  const now = Date.now();

  if (!snap.exists()) {
    // 🆕 User mới
    await setDoc(userRef, {
      email: user.email,
      devices: {
        [deviceId]: { ua, lastLogin: now }
      },
      deviceCount: 1,
      lastLogin: now
    });
  } else {
    const data = snap.data();
    const devices = data.devices || {};

    // ➕ Thêm / cập nhật thiết bị
    devices[deviceId] = { ua, lastLogin: now };

    await updateDoc(userRef, {
      devices,
      deviceCount: Object.keys(devices).length,
      lastLogin: now
    });
  }

  location.href = "index.html";
}

/* ================== LOGOUT ================== */
export async function logout() {
  await signOut(auth);
  location.href = "login.html";
}
