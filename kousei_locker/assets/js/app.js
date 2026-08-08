(() => {
  'use strict';

  const students = Array.isArray(window.KOUSEI_STUDENTS) ? window.KOUSEI_STUDENTS : [];
  const config = window.KOUSEI_FIREBASE_CONFIG || {};
  const configured = config.apiKey && !config.apiKey.includes('PASTE_');

  let db = null;
  let storage = null;
  let activeStudent = null;
  let activeListenerRef = null;
  let activeListenerFn = null;

  const grid = document.getElementById('lockerGrid');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const modal = document.getElementById('lockerModal');
  const closeButton = document.getElementById('modalClose');
  const giftList = document.getElementById('giftList');
  const giftCount = document.getElementById('giftCount');
  const giftForm = document.getElementById('giftForm');
  const giftImage = document.getElementById('giftImage');
  const giftMessage = document.getElementById('giftMessage');
  const imagePreview = document.getElementById('imagePreview');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const charCount = document.getElementById('charCount');
  const formStatus = document.getElementById('formStatus');
  const sendButton = document.getElementById('sendButton');
  const toast = document.getElementById('toast');

  if (configured) {
    try {
      if (!firebase.apps.length) firebase.initializeApp(config);
      db = firebase.database();
      storage = firebase.storage();
    } catch (error) {
      console.error(error);
    }
  }

  function safeText(value) {
    return String(value ?? '');
  }

  function lockerLabel(student) {
    return `${student.grade}-${student.className}`;
  }

  function renderLockers(query = '') {
    const q = query.trim().toLowerCase();
    const filtered = students.filter(s => {
      const haystack = [s.nameJP, s.nameKR, s.gender, s.grade, s.className, `${s.grade}학년 ${s.className}반`]
        .join(' ').toLowerCase();
      return !q || haystack.includes(q);
    });

    const sortedStudents = [...filtered].sort((a, b) => {
      const gradeCompare = Number(a.grade) - Number(b.grade);
      if (gradeCompare !== 0) return gradeCompare;
      const classCompare = String(a.className || '').localeCompare(String(b.className || ''), 'en');
      if (classCompare !== 0) return classCompare;
      return String(a.nameJP || '').localeCompare(String(b.nameJP || ''), 'ja');
    });

    grid.replaceChildren();
    const cards = document.createElement('div');
    cards.className = 'locker-gender-grid locker-all-grid';

    sortedStudents.forEach(student => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'locker-card';
      button.innerHTML = `
        <div class="locker-door-top">
          <span class="locker-no">${lockerLabel(student)}</span>
          <span class="locker-vents" aria-hidden="true"><i></i><i></i><i></i></span>
        </div>
        <div class="locker-door-body">
          <span class="locker-handle" aria-hidden="true"></span>
          <div class="locker-name-jp"></div>
          <div class="locker-name-ko"></div>
          <div class="locker-meta"></div>
        </div>
        <div class="locker-open">사물함 열기 <span>→</span></div>`;
      button.querySelector('.locker-name-jp').textContent = student.nameJP;
      button.querySelector('.locker-name-ko').textContent = student.nameKR;
      button.querySelector('.locker-meta').textContent = `${student.grade}학년 ${student.className}반 · ${student.age}`;
      button.addEventListener('click', () => openLocker(student));
      cards.appendChild(button);
    });

    grid.appendChild(cards);
    emptyState.hidden = sortedStudents.length !== 0;
  }

  function openLocker(student) {
    activeStudent = student;
    document.getElementById('lockerPlate').textContent = lockerLabel(student);
    document.getElementById('lockerTitle').textContent = student.nameJP;
    document.getElementById('lockerSub').textContent = `${student.nameKR} · ${student.grade}학년 ${student.className}반 · ${student.age}`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    resetForm();
    listenForGifts(student);
  }

  function closeLocker() {
    stopGiftListener();
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    activeStudent = null;
  }

  function stopGiftListener() {
    if (activeListenerRef && activeListenerFn) activeListenerRef.off('value', activeListenerFn);
    activeListenerRef = null;
    activeListenerFn = null;
  }

  function listenForGifts(student) {
    stopGiftListener();
    if (!db) {
      giftCount.textContent = '–';
      giftList.innerHTML = `<div class="setup-warning"><strong>Firebase 연결 전입니다.</strong><span>assets/js/firebase-config.js에 Web API Key를 넣으면 선물이 실시간으로 표시됩니다.</span></div>`;
      return;
    }

    giftList.innerHTML = '<div class="loading">사물함을 확인하고 있습니다…</div>';
    const ref = db.ref(`lockerMessages/${student.lockerId}`);
    const listener = snapshot => {
      const rows = [];
      snapshot.forEach(child => rows.push({ id: child.key, ...child.val() }));
      rows.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
      renderGifts(rows);
    };
    ref.on('value', listener, error => {
      console.error(error);
      giftList.innerHTML = '<div class="error-state">사물함을 불러오지 못했습니다.</div>';
    });
    activeListenerRef = ref;
    activeListenerFn = listener;
  }

  function renderGifts(rows) {
    giftCount.textContent = rows.length;
    giftList.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement('div');
      empty.className = 'locker-empty';
      empty.innerHTML = '<span>🎁</span><strong>아직 도착한 선물이 없습니다.</strong><p>첫 번째 익명 선물을 남겨 보세요.</p>';
      giftList.appendChild(empty);
      return;
    }

    rows.forEach(row => {
      const article = document.createElement('article');
      article.className = 'gift-card';
      const imageWrap = document.createElement('div');
      imageWrap.className = 'gift-image';
      const img = document.createElement('img');
      img.src = safeText(row.imageUrl);
      img.alt = '익명 선물 이미지';
      img.loading = 'lazy';
      img.addEventListener('click', () => window.open(img.src, '_blank', 'noopener'));
      imageWrap.appendChild(img);

      const body = document.createElement('div');
      body.className = 'gift-body';
      const top = document.createElement('div');
      top.className = 'gift-topline';
      const anon = document.createElement('strong');
      anon.textContent = 'ANONYMOUS GIFT';
      const time = document.createElement('time');
      time.textContent = formatDate(row.createdAt);
      top.append(anon, time);
      const message = document.createElement('p');
      message.textContent = safeText(row.message);
      body.append(top, message);
      article.append(imageWrap, body);
      giftList.appendChild(article);
    });
  }

  function formatDate(timestamp) {
    const date = new Date(Number(timestamp));
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('ko-KR', { month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' }).format(date);
  }

  function resetForm() {
    giftForm.reset();
    imagePreview.hidden = true;
    imagePreview.removeAttribute('src');
    uploadPlaceholder.hidden = false;
    charCount.textContent = '0 / 500';
    formStatus.textContent = '';
    formStatus.className = 'form-status';
    sendButton.disabled = false;
  }

  giftImage.addEventListener('change', () => {
    const file = giftImage.files && giftImage.files[0];
    if (!file) {
      imagePreview.hidden = true;
      uploadPlaceholder.hidden = false;
      return;
    }
    if (!file.type.startsWith('image/')) {
      giftImage.value = '';
      showToast('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      giftImage.value = '';
      showToast('이미지는 최대 5MB까지 가능합니다.');
      return;
    }
    imagePreview.src = URL.createObjectURL(file);
    imagePreview.hidden = false;
    uploadPlaceholder.hidden = true;
  });

  giftMessage.addEventListener('input', () => {
    charCount.textContent = `${giftMessage.value.length} / 500`;
  });

  giftForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!activeStudent) return;
    if (!db || !storage) {
      formStatus.textContent = 'Firebase Web API Key를 먼저 설정해 주세요.';
      formStatus.className = 'form-status error';
      return;
    }

    const file = giftImage.files && giftImage.files[0];
    const message = giftMessage.value.trim();
    if (!file || !message) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      showToast('이미지 형식이나 용량을 확인해 주세요.');
      return;
    }

    sendButton.disabled = true;
    formStatus.textContent = '선물을 사물함에 넣고 있습니다…';
    formStatus.className = 'form-status working';

    try {
      const ext = (file.name.split('.').pop() || 'img').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'img';
      const filename = `${Date.now()}-${cryptoRandom()}.${ext}`;
      const path = `locker-gifts/${activeStudent.lockerId}/${filename}`;
      const fileRef = storage.ref(path);
      const uploadResult = await fileRef.put(file, { contentType: file.type });
      const imageUrl = await uploadResult.ref.getDownloadURL();

      const messageRef = db.ref(`lockerMessages/${activeStudent.lockerId}`).push();
      await messageRef.set({
        message,
        imageUrl,
        createdAt: Date.now()
      });

      resetForm();
      showToast(`${activeStudent.nameKR}의 사물함에 선물을 남겼습니다. 🎁`);
    } catch (error) {
      console.error(error);
      formStatus.textContent = error && error.code === 'storage/unauthorized'
        ? 'Storage 규칙 때문에 업로드가 거부되었습니다. 규칙 게시 여부를 확인해 주세요.'
        : '선물을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.';
      formStatus.className = 'form-status error';
      sendButton.disabled = false;
    }
  });

  function cryptoRandom() {
    if (window.crypto && window.crypto.getRandomValues) {
      const arr = new Uint32Array(2);
      window.crypto.getRandomValues(arr);
      return `${arr[0].toString(36)}${arr[1].toString(36)}`;
    }
    return Math.random().toString(36).slice(2, 12);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  searchInput.addEventListener('input', () => renderLockers(searchInput.value));
  closeButton.addEventListener('click', closeLocker);
  modal.addEventListener('click', event => { if (event.target === modal) closeLocker(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('open')) closeLocker(); });

  renderLockers();
})();
