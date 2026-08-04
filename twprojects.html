<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>디디222</title>
  <style>
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      background: #ffffff;
      color: #0f1419;
      font-family: Arial, "Noto Sans KR", sans-serif;
    }
    a { color: inherit; text-decoration: none; }
    button { font: inherit; }
    .page {
      width: 100%;
      max-width: 760px;
      min-height: 100vh;
      margin: 0 auto;
      border-left: 1px solid #eff3f4;
      border-right: 1px solid #eff3f4;
      background: #ffffff;
    }
    .top-bar {
      height: 66px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      border-bottom: 1px solid #eff3f4;
      background: rgba(255,255,255,.96);
      position: sticky;
      top: 0;
      z-index: 20;
      backdrop-filter: blur(10px);
    }
    .back-button {
      width: 38px;
      height: 38px;
      margin-right: 28px;
      border: 0;
      border-radius: 50%;
      background: transparent;
      font-size: 27px;
      line-height: 1;
      cursor: pointer;
    }
    .back-button:hover { background: #eff3f4; }
    .top-profile-name { font-size: 22px; font-weight: 800; line-height: 1; }
    .verified {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      margin-left: 4px;
      border-radius: 50%;
      background: #1d9bf0;
      color: #fff;
      font-size: 13px;
      vertical-align: 2px;
      flex-shrink: 0;
    }
    .top-icons {
      margin-left: auto;
      display: flex;
      gap: 20px;
      align-items: center;
      font-size: 25px;
    }
    .banner {
      width: 100%;
      aspect-ratio: 3 / 1;
      background-image: url("https://i.ibb.co/zh1Hwmq1/ge.png");
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
    }
    .profile-area { position: relative; padding: 0 20px 22px; }
    .profile-photo {
      width: 176px;
      height: 176px;
      margin-top: -88px;
      border: 5px solid #fff;
      border-radius: 50%;
      overflow: hidden;
      background: #eee;
      position: relative;
      z-index: 2;
    }
    .profile-photo img { width: 100%; height: 100%; display: block; object-fit: cover; }
    .profile-actions { position: absolute; top: 16px; right: 20px; margin: 0; z-index: 3; }
    .follow-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 132px;
      height: 48px;
      padding: 0 25px;
      border: 1px solid #0f1419;
      border-radius: 999px;
      background: #0f1419;
      color: #fff;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      transition: .15s ease;
    }
    .follow-button:hover { background: #272c30; }
    .profile-text { margin-top: 24px; }
    .profile-name { display: flex; align-items: center; font-size: 26px; font-weight: 800; line-height: 1.2; }
    .username { margin-top: 4px; color: #536471; font-size: 19px; }
    .bio { margin-top: 10px; margin-bottom: 5px; font-size: 18px; line-height: 1.4; }
    .profile-info { margin-top: 5px; color: #536471; font-size: 17px; line-height: 1.55; }
    .profile-info div + div { margin-top: 3px; }
    .profile-info a { color: #1d9bf0; }
    .profile-info a:hover { text-decoration: underline; }

    .tabs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      border-bottom: 1px solid #eff3f4;
      border-top: 1px solid #eff3f4;
    }
    .tab {
      position: relative;
      padding: 18px 8px;
      border: 0;
      background: transparent;
      text-align: center;
      color: #536471;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    }
    .tab:hover { background: #f7f9f9; }
    .tab.active { color: #0f1419; font-weight: 800; }
    .tab.active::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 58px;
      height: 4px;
      border-radius: 999px;
      background: #1d9bf0;
      transform: translateX(-50%);
    }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }

    .post {
      display: grid;
      grid-template-columns: 54px 1fr;
      gap: 12px;
      padding: 18px 20px;
      border-bottom: 1px solid #eff3f4;
    }
    .post-avatar { width: 54px; height: 54px; border-radius: 50%; object-fit: cover; }
    .post-main { min-width: 0; }
    .post-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      margin-bottom: 7px;
      font-size: 16px;
    }
    .post-name { font-weight: 800; }
    .post-username, .post-date { color: #536471; }
    .post-content { font-size: 17px; line-height: 1.55; white-space: normal; word-break: keep-all; }
    .post-title { display: block; margin-bottom: 4px; font-size: 19px; font-weight: 800; }
    .hashtags { display: block; margin-top: 8px; color: #1d9bf0; }
    .post-image {
      width: 100%;
      height: auto;
      margin-top: 12px;
      border: 1px solid #cfd9de;
      border-radius: 16px;
      display: block;
      background: #f7f9f9;
    }
    a .post-image { transition: opacity .15s ease; }
    a:hover .post-image { opacity: .92; }
    .post-actions {
      display: flex;
      justify-content: space-between;
      max-width: 440px;
      margin-top: 16px;
      color: #536471;
      font-size: 18px;
    }
    .post-actions span { cursor: pointer; }
    .post-actions span:hover { color: #1d9bf0; }

    .media-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
      padding: 2px;
      background: #fff;
    }
    .media-item {
      position: relative;
      overflow: hidden;
      background: #eff3f4;
    }
    .media-item img {
      width: 100%;
      height: auto;
      display: block;
      transition: transform .18s ease, opacity .18s ease;
    }
    .media-item[href]:hover img { transform: scale(1.025); opacity: .93; }
    .replies-empty {
      padding: 52px 20px;
      color: #536471;
      text-align: center;
      font-size: 16px;
    }

    @media (max-width: 600px) {
      .page { border: 0; }
      .top-bar { height: 58px; padding: 0 14px; }
      .top-profile-name { font-size: 19px; }
      .banner { aspect-ratio: 2.6 / 1; }
      .profile-area { padding: 0 16px 20px; }
      .profile-photo { width: 124px; height: 124px; margin-top: -62px; border-width: 4px; }
      .profile-actions { top: 12px; right: 16px; margin: 0; }
      .follow-button { min-width: 100px; height: 40px; padding: 0 19px; font-size: 15px; }
      .profile-text { margin-top: 20px; }
      .profile-name { font-size: 23px; }
      .username, .bio { font-size: 16px; }
      .profile-info { font-size: 15px; }
      .post { grid-template-columns: 45px 1fr; gap: 10px; padding: 16px 14px; }
      .post-avatar { width: 45px; height: 45px; }
      .post-content { font-size: 15px; }
      .post-title { font-size: 17px; }
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="top-bar">
      <button type="button" class="back-button" aria-label="뒤로 가기" onclick="history.back()">←</button>
      <div class="top-profile-name">디디222 <span class="verified">✓</span></div>
      <div class="top-icons" aria-hidden="true"><span>◒</span><span>⌕</span></div>
    </header>

    <section class="banner"></section>

    <section class="profile-area">
      <div class="profile-photo">
        <img src="https://i.ibb.co/wNDzQjSS/didicomi-masterpiece-best-quality-absurdres-1woman-bright-pin-8f1f2efa-013c-4a67-b63f-e2f559ab25b9-2.png" alt="디디222 프로필 사진">
      </div>
      <div class="profile-actions">
        <a class="follow-button" href="https://x.com/soldidi9548" target="_blank" rel="noopener noreferrer">Follow</a>
      </div>
      <div class="profile-text">
        <div class="profile-name">디디222 <span class="verified">✓</span></div>
        <div class="username">@soldidi9548</div>
        <div class="bio">성인 여성</div>
        <div class="profile-info">
          <div>멜팅 | 스테이지 | 잉크챗 | 모아리</div>
          <div>🔗 <a href="https://soldidi9548.github.io" target="_blank" rel="noopener noreferrer">soldidi9548.github.io</a></div>
        </div>
      </div>
    </section>

    <nav class="tabs" aria-label="프로필 콘텐츠 탭">
      <button class="tab active" type="button" data-tab="posts">Posts</button>
      <button class="tab" type="button" data-tab="replies">Replies</button>
      <button class="tab" type="button" data-tab="media">Media</button>
    </nav>

    <section id="posts" class="tab-panel active">
      <article class="post">
        <img class="post-avatar" src="https://i.ibb.co/wNDzQjSS/didicomi-masterpiece-best-quality-absurdres-1woman-bright-pin-8f1f2efa-013c-4a67-b63f-e2f559ab25b9-2.png" alt="">
        <div class="post-main">
          <div class="post-header"><span class="post-name">디디222</span><span class="verified">✓</span><span class="post-username">@soldidi9548</span><span class="post-date">· now</span></div>
          <div class="post-content">
            <span class="post-title">아르카디아 정신의학 연구센터</span>
            기억은 치료 과정에서 일시적으로 사라질 수 있습니다.
            <span class="hashtags">#추리 #피폐 #공포 #탈출</span>
          </div>
          <a href="https://moari.chat/characters/-id-?id=019fa8c2-2b84-767b-818f-35a7d2678d1e" target="_blank" rel="noopener noreferrer">
            <img class="post-image" src="https://i.ibb.co/DfDsNHS8/image.png" alt="아르카디아 정신의학 연구센터 이미지">
          </a>
          <div class="post-actions"><span>♡</span><span>⇄</span><span>♡</span><span>⌁</span></div>
        </div>
      </article>

      <article class="post">
        <img class="post-avatar" src="https://i.ibb.co/wNDzQjSS/didicomi-masterpiece-best-quality-absurdres-1woman-bright-pin-8f1f2efa-013c-4a67-b63f-e2f559ab25b9-2.png" alt="">
        <div class="post-main">
          <div class="post-header"><span class="post-name">디디222</span><span class="verified">✓</span><span class="post-username">@soldidi9548</span><span class="post-date">· now</span></div>
          <div class="post-content">
            <span class="post-title">ARÉN</span>
            "뭘 그렇게 놀라? 인어 처음 봐?"
            <span class="hashtags">#판타지 #로맨스 #일상 #코믹 #수인</span>
          </div>
          <a href="https://moari.chat/characters/-id-?id=019fb380-a700-78a4-bd5c-25bd8a4c8d2e" target="_blank" rel="noopener noreferrer">
            <img class="post-image" src="https://i.ibb.co/sptRsJcX/image.png" alt="ARÉN 프로젝트 이미지">
          </a>
          <div class="post-actions"><span>♡</span><span>⇄</span><span>♡</span><span>⌁</span></div>
        </div>
      </article>

      <article class="post">
        <img class="post-avatar" src="https://i.ibb.co/wNDzQjSS/didicomi-masterpiece-best-quality-absurdres-1woman-bright-pin-8f1f2efa-013c-4a67-b63f-e2f559ab25b9-2.png" alt="">
        <div class="post-main">
          <div class="post-header"><span class="post-name">디디222</span><span class="verified">✓</span><span class="post-username">@soldidi9548</span><span class="post-date">· now</span></div>
          <div class="post-content">
            <span class="post-title">STAY WITH: LOVE</span>
            7일간의 사랑, N개의 진실.
            <span class="hashtags">#연애프로그램 #시뮬레이션 #일상 #힐링 #로맨스</span>
          </div>
          <a href="https://inkchat.ai/character/eec425c2-8e33-4b18-8202-c32ee003d732" target="_blank" rel="noopener noreferrer">
            <img class="post-image" src="https://i.ibb.co/hTCc4kk/image.png" alt="STAY WITH LOVE 프로젝트 이미지">
          </a>
          <div class="post-actions"><span>♡</span><span>⇄</span><span>♡</span><span>⌁</span></div>
        </div>
      </article>

      <article class="post">
        <img class="post-avatar" src="https://i.ibb.co/wNDzQjSS/didicomi-masterpiece-best-quality-absurdres-1woman-bright-pin-8f1f2efa-013c-4a67-b63f-e2f559ab25b9-2.png" alt="">
        <div class="post-main">
          <div class="post-header"><span class="post-name">디디222</span><span class="verified">✓</span><span class="post-username">@soldidi9548</span><span class="post-date">· now</span></div>
          <div class="post-content">
            <span class="post-title">Magical Girl: ???</span>
            어느 날 갑자기 마법소녀가 되었다.
            <span class="hashtags">#판타지 #청춘 #성장 #히빌</span>
          </div>
          <img class="post-image" src="https://i.ibb.co/tphS6ggT/image.png" alt="Magical Girl 프로젝트 이미지">
          <div class="post-actions"><span>♡</span><span>⇄</span><span>♡</span><span>⌁</span></div>
        </div>
      </article>

      <article class="post">
        <img class="post-avatar" src="https://i.ibb.co/wNDzQjSS/didicomi-masterpiece-best-quality-absurdres-1woman-bright-pin-8f1f2efa-013c-4a67-b63f-e2f559ab25b9-2.png" alt="">
        <div class="post-main">
          <div class="post-header"><span class="post-name">디디222</span><span class="verified">✓</span><span class="post-username">@soldidi9548</span><span class="post-date">· now</span></div>
          <div class="post-content">
            <span class="post-title">에스텔 제국</span>
            어느 날 갑자기 로판 세계관에 퐁당!
            <span class="hashtags">#로맨스판타지 #다인물</span>
          </div>
          <a href="https://t.melting.chat/tklgnc" target="_blank" rel="noopener noreferrer">
            <img class="post-image" src="https://i.ibb.co/CsbqYRyF/image.png" alt="에스텔 제국 프로젝트 이미지">
          </a>
          <div class="post-actions"><span>♡</span><span>⇄</span><span>♡</span><span>⌁</span></div>
        </div>
      </article>
    </section>

    <section id="replies" class="tab-panel">
      <div class="replies-empty">아직 표시할 답글이 없습니다.</div>
    </section>

    <section id="media" class="tab-panel">
      <div class="media-grid">
        <a class="media-item" href="https://moari.chat/characters/-id-?id=019fa8c2-2b84-767b-818f-35a7d2678d1e" target="_blank" rel="noopener noreferrer" aria-label="아르카디아 열기">
          <img src="https://i.ibb.co/DfDsNHS8/image.png" alt="아르카디아 정신의학 연구센터">
        </a>
        <a class="media-item" href="https://moari.chat/characters/-id-?id=019fb380-a700-78a4-bd5c-25bd8a4c8d2e" target="_blank" rel="noopener noreferrer" aria-label="인어 ARÉN 열기">
          <img src="https://i.ibb.co/sptRsJcX/image.png" alt="ARÉN">
        </a>
        <a class="media-item" href="https://inkchat.ai/character/eec425c2-8e33-4b18-8202-c32ee003d732" target="_blank" rel="noopener noreferrer" aria-label="연애프로그램 열기">
          <img src="https://i.ibb.co/hTCc4kk/image.png" alt="STAY WITH LOVE">
        </a>
        <div class="media-item">
          <img src="https://i.ibb.co/tphS6ggT/image.png" alt="Magical Girl">
        </div>
        <a class="media-item" href="https://t.melting.chat/tklgnc" target="_blank" rel="noopener noreferrer" aria-label="에스텔 제국 열기">
          <img src="https://i.ibb.co/CsbqYRyF/image.png" alt="에스텔 제국">
        </a>
      </div>
    </section>
  </main>

  <script>
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach((item) => item.classList.toggle('active', item === tab));
        panels.forEach((panel) => panel.classList.toggle('active', panel.id === target));
      });
    });
  </script>
</body>
</html>
