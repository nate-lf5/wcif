// WCIF 2026 - content.js 데이터를 페이지에 그려주는 스크립트
(function () {
  var C = window.WCIF_CONTENT;
  if (!C) return;
  var isEn = (document.documentElement.lang || '').toLowerCase() === 'en';
  var L = isEn ? 'eng' : 'kor';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- 0. 글로벌 내비게이션 (To-Be 메뉴 트리) ---------- */
  var NAV = [
    {
      label: { kor: 'About', eng: 'About' }, href: 'about.html',
      children: [
        { label: { kor: '소개', eng: 'Introduction' }, href: 'about.html' },
        { label: { kor: '아카이빙', eng: 'Archive' }, href: 'archive.html' },
        { label: { kor: '주최사', eng: 'Organizer' }, href: 'organizer.html' },
        { label: { kor: '파트너', eng: 'Partners' }, href: 'partners.html' }
      ]
    },
    {
      label: { kor: '프로그램', eng: 'Program' }, href: 'program.html',
      children: [
        { label: { kor: '2026 WCIF', eng: '2026 WCIF' }, href: 'program.html' },
        { label: { kor: 'Future Stage', eng: 'Future Stage' }, href: 'future-stage.html' },
        { label: { kor: 'Hackathon', eng: 'Hackathon' }, href: 'hackathon.html' }
      ]
    },
    {
      label: { kor: 'News', eng: 'News' }, href: 'news.html',
      children: [
        { label: { kor: 'Notice', eng: 'Notice' }, href: 'news.html#notice' },
        { label: { kor: 'Press', eng: 'Press' }, href: 'news.html#press' }
      ]
    }
  ];

  var current = (location.pathname.split('/').pop() || 'index.html');
  var navEl = document.querySelector('.main-nav');
  if (navEl) {
    var html = '';
    NAV.forEach(function (item) {
      var childHtml = '';
      var groupActive = false;
      item.children.forEach(function (c) {
        var file = c.href.split('#')[0];
        var on = (file === current);
        if (on) groupActive = true;
        childHtml += '<a href="' + c.href + '"' + (on ? ' class="sub-on"' : '') + '>' + esc(c.label[L]) + '</a>';
      });
      html += '<div class="nav-item has-sub">' +
        '<a href="' + item.href + '" class="nav-top' + (groupActive ? ' active' : '') + '">' + esc(item.label[L]) + '</a>' +
        '<div class="sub">' + childHtml + '</div>' +
        '</div>';
    });
    navEl.innerHTML = html;
  }

  // 푸터 퀵링크
  var footUl = document.querySelector('.site-footer .footer-grid ul');
  if (footUl) {
    var fl = '';
    NAV.forEach(function (item) {
      item.children.forEach(function (c) {
        fl += '<li><a href="' + c.href + '">' + esc(c.label[L]) + '</a></li>';
      });
    });
    fl += '<li><a href="speakers.html">' + (isEn ? 'Speakers' : '초청연사') + '</a></li>';
    footUl.innerHTML = fl;
    footUl.style.columns = '2';
    footUl.style.columnGap = '2.5rem';
  }

  /* ---------- 1. 하단 고정 플로팅 등록 바 ---------- */
  if (C.registration && C.registration.enabled) {
    var r = C.registration, t = r[L] || r.kor;
    var external = /^https?:/i.test(r.url);
    var bar = document.createElement('div');
    bar.className = 'float-bar';
    bar.innerHTML =
      '<div class="container float-inner">' +
        '<div class="float-text"><span class="hl">' + esc(t.label) + '</span> ' + esc(t.highlight || '') + '</div>' +
        '<div class="float-actions">' +
          '<a class="float-btn" href="' + esc(r.url) + '"' + (external ? ' target="_blank" rel="noopener"' : '') + '>' + esc(t.btn) + '</a>' +
          '<button class="float-close" type="button" aria-label="닫기">×</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(bar);
    document.body.classList.add('has-float');
    bar.querySelector('.float-close').addEventListener('click', function () {
      bar.remove();
      document.body.classList.remove('has-float');
    });
  }

  /* ---------- 2. 프로그램 시간표 ---------- */
  var schedRoot = document.getElementById('schedule-root');
  if (schedRoot && C.schedule) {
    var sHtml = '';
    C.schedule.forEach(function (day) {
      var d = day[L] || day.kor;
      sHtml += '<div class="sched-day">' +
        '<div class="sched-head"><span class="sched-tag">' + esc(d.tag) + '</span><h3>' + esc(d.title) + '</h3></div>' +
        '<ul class="sched-list">';
      (day.items || []).forEach(function (it) {
        var i = it[L] || it.kor;
        sHtml += '<li><span class="time">' + esc(it.time) + '</span>' +
          '<span class="what">' + esc(i.title) + '</span>' +
          '<span class="who">' + esc(i.who || '') + '</span></li>';
      });
      sHtml += '</ul></div>';
    });
    sHtml += '<p class="sched-note">' +
      (isEn ? '* The program is subject to change.' : '* 상기 일정은 행사 사정에 따라 변경될 수 있습니다.') +
      '</p>';
    schedRoot.innerHTML = sHtml;
  }

  /* ---------- 3. 연사 ---------- */
  function speakerCard(s) {
    var p = s[L] || s.kor;
    return '<article class="speaker-card">' +
      '<div class="speaker-photo"><img src="' + esc(s.img) + '" alt="' + esc(p.name) + '" loading="lazy"></div>' +
      '<div class="speaker-info"><h3>' + esc(p.name) + '</h3><p>' + esc(p.title) + '</p></div>' +
      '</article>';
  }
  var spFull = document.getElementById('speakers-root');
  if (spFull && C.speakers) {
    var full = C.speakers.map(speakerCard).join('');
    full += '<article class="speaker-card">' +
      '<div class="speaker-photo"><div class="ph-fallback" style="font-size:1.3rem;letter-spacing:.1em">AND MORE</div></div>' +
      '<div class="speaker-info"><h3>And More</h3><p>' +
      (isEn ? 'More speakers to be announced' : '추가 연사가 공개될 예정입니다') +
      '</p></div></article>';
    spFull.innerHTML = full;
  }
  var spFeat = document.getElementById('speakers-featured');
  if (spFeat && C.speakers) {
    var feat = C.speakers.filter(function (s) { return s.featured; });
    if (feat.length === 0) feat = C.speakers.slice(0, 6);
    spFeat.innerHTML = feat.slice(0, 6).map(speakerCard).join('');
  }

  /* ---------- 4. 아카이빙 (역대 행사) ---------- */
  var arcRoot = document.getElementById('archive-root');
  if (arcRoot && C.archive) {
    var aHtml = '';
    C.archive.forEach(function (a) {
      var d = a[L] || a.kor;
      var inner;
      if (a.poster) {
        inner = '<img class="arc-poster" src="' + esc(a.poster) + '" alt="' + esc(a.year) + ' WCIF poster" loading="lazy">' +
                '<div class="arc-overlay"><div class="arc-year">' + esc(a.year) + '</div><div class="arc-title">' + esc(d.title) + '</div></div>';
      } else {
        inner = '<div class="arc-body">' +
          '<div class="arc-no">' + esc(a.edition) + ' WCIF</div>' +
          '<div class="arc-year">' + esc(a.year) + '</div>' +
          '<div class="arc-title">' + esc(d.title) + '</div>' +
          '<span class="arc-cta">' + (isEn ? 'View →' : '자세히 보기 →') + '</span>' +
          '</div>';
      }
      aHtml += '<a class="arc-tile" href="archive-detail.html?year=' + esc(a.year) + '">' + inner + '</a>';
    });
    arcRoot.innerHTML = aHtml;
  }

  /* ---------- 5. 아카이빙 상세 ---------- */
  var adRoot = document.getElementById('archive-detail-root');
  if (adRoot && C.archive) {
    var qy = (location.search.match(/year=(\d{4})/) || [])[1];
    var entry = null;
    C.archive.forEach(function (a) { if (a.year === qy) entry = a; });
    if (!entry) entry = C.archive[0];
    var ed = entry[L] || entry.kor;
    document.title = entry.year + ' WCIF | ' + ed.title;

    var hd = document.getElementById('ad-year'); if (hd) hd.textContent = entry.year + ' WCIF';
    var ht = document.getElementById('ad-title'); if (ht) ht.textContent = ed.title;
    var he = document.getElementById('ad-edition'); if (he) he.textContent = 'The ' + entry.edition + ' World Cultural Industry Forum';

    var dHtml = '';
    // 주제 설명
    dHtml += '<section class="section"><div class="container">' +
      '<div class="section-label">' + (isEn ? 'Theme' : '주제 설명') + '</div>' +
      '<p class="statement" style="font-size:clamp(1.4rem,3.4vw,2.6rem)">' + esc(ed.title) + '</p>' +
      '<div class="prose" style="margin-top:1.8rem"><p>' + esc(ed.desc) + '</p></div>' +
      '</div></section>';
    // 연사 리스트
    var spk = (entry.speakers && entry.speakers[L]) || [];
    if (spk.length) {
      dHtml += '<section class="section warm"><div class="container">' +
        '<div class="section-label">' + (isEn ? 'Speakers' : '연사 리스트') + '</div>' +
        '<div class="chip-list">' + spk.map(function (n) { return '<span class="chip">' + esc(n) + '</span>'; }).join('') + '</div>' +
        '</div></section>';
    }
    // 영상
    if (entry.videos && entry.videos.length) {
      dHtml += '<section class="section"><div class="container">' +
        '<div class="section-label">' + (isEn ? 'Videos' : '영상') + '</div>' +
        '<div class="video-grid">' +
        entry.videos.map(function (v) {
          return '<div class="video-item"><div class="video-frame">' +
            '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(v.id) + '" title="' + esc(v.title) + '" loading="lazy" allowfullscreen></iframe>' +
            '</div><p>' + esc(v.title) + '</p></div>';
        }).join('') +
        '</div></div></section>';
    }
    // 행사 사진
    dHtml += '<section class="section warm"><div class="container">' +
      '<div class="section-label">' + (isEn ? 'Photos' : '행사 사진') + '</div>';
    if (entry.photos && entry.photos.length) {
      dHtml += '<div class="photo-grid">' + entry.photos.map(function (p) {
        return '<img src="' + esc(p) + '" alt="' + esc(entry.year) + ' WCIF" loading="lazy">';
      }).join('') + '</div>';
    } else {
      dHtml += '<p class="section-desc" style="margin-top:0">' +
        (isEn ? 'Event photos will be uploaded soon.' : '행사 사진이 곧 업로드될 예정입니다.') + '</p>';
    }
    dHtml += '</div></section>';
    adRoot.innerHTML = dHtml;

    // 언어 전환 시 연도 파라미터 유지
    var langA = document.querySelector('.lang-switch a');
    if (langA) langA.href = langA.getAttribute('href').split('?')[0] + location.search;
  }

  /* ---------- 6. NEWS (Notice / Press) ---------- */
  function newsList(items) {
    return items.map(function (n) {
      return '<li><a href="' + esc(n.url) + '" target="_blank" rel="noopener">' +
        '<span class="n-date">' + esc(n.date) + '</span>' +
        '<span class="n-title">' + esc(n[L] || n.kor) + '</span>' +
        '<span class="n-arrow">↗</span></a></li>';
    }).join('');
  }
  var noticeRoot = document.getElementById('notice-list');
  if (noticeRoot && C.news && C.news.notice) noticeRoot.innerHTML = newsList(C.news.notice);
  var pressRoot = document.getElementById('press-list');
  if (pressRoot && C.news && C.news.press) pressRoot.innerHTML = newsList(C.news.press);
})();
