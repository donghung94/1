import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyALblbqW_VrZh2r7sPJ8Q6XT2fGbk0dsFg",
  authDomain: "donghung-3208d.firebaseapp.com",
  projectId: "donghung-3208d",
  storageBucket: "donghung-3208d.firebasestorage.app",
  messagingSenderId: "753379492663",
  appId: "1:753379492663:web:baff34f2c0bac00e02d0b2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tbody = document.getElementById("tbody");
const refreshBtn = document.getElementById("refreshBtn");

/* ================= LOAD DATA ================= */
async function loadUsers() {
  tbody.innerHTML = `<tr><td colspan="6">⏳ Đang tải dữ liệu...</td></tr>`;

  const q = query(
    collection(db, "users"),
    orderBy("deviceCount", "desc")
  );

  const snap = await getDocs(q);
  tbody.innerHTML = "";

  let idx = 1;

  snap.forEach(docSnap => {
    const d = docSnap.data();
    const devices = d.devices || {};
    const deviceCount = d.deviceCount || 0;
    const warn = deviceCount >= 2;

    const tr = document.createElement("tr");
    if (warn) tr.classList.add("warn");

    tr.innerHTML = `
      <td>${idx++}</td>
      <td>${d.email || "(no email)"}</td>
      <td><b>${deviceCount}</b></td>
      <td>
        <span class="badge ${warn ? "warn" : "ok"}">
          ${warn ? "⚠️ Chia sẻ" : "✅ Bình thường"}
        </span>
      </td>
      <td>
        ${Object.values(devices).map(v =>
          `<div class="device">📱 ${v.ua}</div>`
        ).join("")}
      </td>
      <td>
        ${d.lastLogin ? new Date(d.lastLogin).toLocaleString() : "-"}
      </td>
    `;

    tbody.appendChild(tr);
  });

  if (!tbody.children.length) {
    tbody.innerHTML = `<tr><td colspan="6">Không có dữ liệu</td></tr>`;
  }
}

refreshBtn.onclick = loadUsers;
loadUsers();
