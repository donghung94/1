import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyALblbqW_VrZh2r7sPJ8Q6XT2fGbk0dsFg",
  projectId: "donghung-3208d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const list = document.getElementById("userList");

const snap = await getDocs(collection(db, "users"));

let users = [];

snap.forEach(doc => {
  const data = doc.data();
  const count = data.devices ? data.devices.length : 0;

  users.push({
    uid: doc.id,
    email: data.email || "no-email",
    count
  });
});

// 🔥 sắp xếp từ nhiều thiết bị → ít
users.sort((a, b) => b.count - a.count);

// render
list.innerHTML = "";
users.forEach(u => {
  list.innerHTML += `
    <div style="border:1px solid #ccc;margin:6px;padding:6px">
      <b>${u.email}</b><br>
      UID: ${u.uid}<br>
      📱 Thiết bị: <b>${u.count}</b>
    </div>
  `;
});
