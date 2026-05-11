const $ = (id) => document.getElementById(id);

const storage = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function nowText() {
  const d = new Date();
  return d.toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });
}

/* 가족 소개 */
$("familyForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const list = storage.get("familyList");
  const photo = await readFileAsDataURL($("familyPhoto").files[0]);

  list.unshift({
    photo,
    name: $("familyName").value.trim(),
    role: $("familyRole").value.trim(),
    intro: $("familyIntro").value.trim(),
    date: nowText()
  });

  storage.set("familyList", list);
  e.target.reset();
  renderFamily();
});

function renderFamily() {
  const list = storage.get("familyList");
  const box = $("familyList");

  if (!list.length) {
    box.innerHTML = `<div class="empty">아직 등록된 가족 소개가 없습니다.<br>왼쪽 입력창에서 가족 사진과 소개글을 저장해 보세요.</div>`;
    $("mainPreview").style.backgroundImage = "";
    $("mainPreview").textContent = "우리 가족";
    return;
  }

  const firstPhoto = list.find(item => item.photo)?.photo;
  if (firstPhoto) {
    $("mainPreview").style.backgroundImage = `url('${firstPhoto}')`;
    $("mainPreview").textContent = "";
  }

  box.innerHTML = list.map((item, index) => `
    <article class="profile-card">
      ${item.photo ? `<img src="${item.photo}" alt="${item.name} 사진">` : `<img src="assets/family-placeholder.svg" alt="기본 가족 이미지">`}
      <div class="body">
        <h3>${escapeHtml(item.name || "이름 없음")}</h3>
        <span class="badge">${escapeHtml(item.role || "가족")}</span>
        <p>${escapeHtml(item.intro || "소개글이 없습니다.")}</p>
        <button class="btn danger full" onclick="deleteFamily(${index})">삭제</button>
      </div>
    </article>
  `).join("");
}

function deleteFamily(index) {
  const list = storage.get("familyList");
  list.splice(index, 1);
  storage.set("familyList", list);
  renderFamily();
}

function clearFamily() {
  if (confirm("가족 소개를 모두 삭제할까요?")) {
    localStorage.removeItem("familyList");
    renderFamily();
  }
}

/* 사진첩 */
$("galleryForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const list = storage.get("galleryList");
  const photo = await readFileAsDataURL($("galleryPhoto").files[0]);

  list.unshift({
    photo,
    title: $("galleryTitle").value.trim(),
    desc: $("galleryDesc").value.trim(),
    date: nowText()
  });

  storage.set("galleryList", list);
  e.target.reset();
  renderGallery();
});

function renderGallery() {
  const list = storage.get("galleryList");
  const box = $("galleryList");

  if (!list.length) {
    box.innerHTML = `<div class="empty">아직 등록된 사진이 없습니다.<br>가족 여행, 생일, 일상 사진을 올려 보세요.</div>`;
    return;
  }

  box.innerHTML = list.map((item, index) => `
    <article class="photo-card">
      <img src="${item.photo}" alt="${escapeHtml(item.title)}">
      <div>
        <h3>${escapeHtml(item.title || "사진 제목")}</h3>
        <p>${escapeHtml(item.desc || "사진 설명이 없습니다.")}</p>
        <button class="btn danger full" onclick="deleteGallery(${index})">삭제</button>
      </div>
    </article>
  `).join("");
}

function deleteGallery(index) {
  const list = storage.get("galleryList");
  list.splice(index, 1);
  storage.set("galleryList", list);
  renderGallery();
}

function clearGallery() {
  if (confirm("사진첩을 모두 삭제할까요?")) {
    localStorage.removeItem("galleryList");
    renderGallery();
  }
}

/* 가족 채팅 */
$("chatForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const list = storage.get("chatMessages");
  list.push({
    name: $("chatName").value.trim(),
    text: $("chatText").value.trim(),
    date: nowText()
  });

  storage.set("chatMessages", list);
  $("chatText").value = "";
  renderChat();
});

function renderChat() {
  const list = storage.get("chatMessages");
  const box = $("chatMessages");

  if (!list.length) {
    box.innerHTML = `<div class="empty">아직 채팅이 없습니다.<br>가족에게 첫 인사를 남겨 보세요.</div>`;
    return;
  }

  box.innerHTML = list.map(item => `
    <div class="msg">
      <strong>${escapeHtml(item.name || "가족")}</strong>
      <small>${escapeHtml(item.date)}</small>
      <p>${escapeHtml(item.text)}</p>
    </div>
  `).join("");

  box.scrollTop = box.scrollHeight;
}

function clearChat() {
  if (confirm("채팅 내용을 모두 삭제할까요?")) {
    localStorage.removeItem("chatMessages");
    renderChat();
  }
}

/* 초대 문구 */
function copyInvite() {
  const text = $("inviteText");
  text.select();
  text.setSelectionRange(0, 99999);

  navigator.clipboard?.writeText(text.value)
    .then(() => alert("초대 문구가 복사되었습니다."))
    .catch(() => {
      document.execCommand("copy");
      alert("초대 문구가 복사되었습니다.");
    });
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

renderFamily();
renderGallery();
renderChat();
