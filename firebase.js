import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, signOut 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { 
  getFirestore, doc, setDoc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/* ================== CONFIG ================== */
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
function getDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
}

/* ================== LOGIN ================== */
export async function loginUser(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    const deviceId = getDeviceId();

    // lưu user (merge để không ghi đè)
    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        lastLogin: Date.now()
      },
      { merge: true }
    );

    // lưu thiết bị đăng nhập
    await setDoc(
      doc(db, "users", user.uid, "devices", deviceId),
      {
        deviceId,
        userAgent: navigator.userAgent,
        lastLogin: Date.now()
      },
      { merge: true }
    );

    location.href = "index.html";
  } catch (err) {
    alert("Đăng nhập thành công");
    console.error(err);
  }
}

/* ================== LOGOUT ================== */
export async function logout() {
  try {
    await signOut(auth);
    location.href = "login.html";
  } catch (err) {
    console.error(err);
  }
}
