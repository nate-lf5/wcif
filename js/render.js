// WCIF 2026 - content.js 데이터를 페이지에 그려주는 스크립트
(function () {
  var C = window.WCIF_CONTENT;
  if (!C) return;
  var isEn = (document.documentElement.lang || '').toLowerCase() === 'en';
  var L = isEn ? 'eng' : 'kor';
  var inSub = location.pathname.replace(/\\/g, '/').indexOf('/en/') !== -1;
  function asset(p) {
    return (p && !/^(https?:|data:|\/)/i.test(p) && inSub) ? '../' + p : p;
  }

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

  /* ---------- 0.5 공지 팝업 (메인 페이지 전용) ---------- */
  var isMain = !!document.querySelector('.hero');
  if (isMain && C.popup && C.popup.enabled) {
    var today = new Date().toISOString().slice(0, 10);
    var hidden = false;
    try { hidden = localStorage.getItem('wcif_popup_hide') === today; } catch (e) {}
    if (!hidden) {
      var pp = C.popup, pt = pp[L] || pp.kor;
      var pov = document.createElement('div');
      pov.className = 'site-popup';
      pov.innerHTML =
        '<div class="site-popup-box" role="dialog" aria-modal="true" aria-label="' + esc(pt.title) + '">' +
          '<div class="site-popup-head">' +
            '<span class="site-popup-label">' + esc(pt.label) + '</span>' +
            '<button class="site-popup-x" type="button" aria-label="닫기">×</button>' +
          '</div>' +
          '<div class="site-popup-body">' +
            '<h3>' + esc(pt.title) + '</h3>' +
            (pt.lines || []).map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') +
            (pp.url ? '<a class="btn-primary site-popup-btn" href="' + esc(pp.url) + '">' + esc(pt.btn) + '</a>' : '') +
          '</div>' +
          '<div class="site-popup-foot">' +
            '<label><input type="checkbox" class="site-popup-chk"> ' + esc(pt.hide) + '</label>' +
            '<button class="site-popup-close" type="button">' + esc(pt.close) + '</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(pov);
      function closePopup() {
        if (pov.querySelector('.site-popup-chk').checked) {
          try { localStorage.setItem('wcif_popup_hide', today); } catch (e) {}
        }
        pov.remove();
      }
      pov.querySelector('.site-popup-x').addEventListener('click', closePopup);
      pov.querySelector('.site-popup-close').addEventListener('click', closePopup);
      var popBtn = pov.querySelector('.site-popup-btn');
      if (popBtn) popBtn.addEventListener('click', function () { pov.remove(); });
    }
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
        sHtml += '<li' + (it.time ? '' : ' class="sched-sub"') + '>' +
          '<span class="time">' + esc(it.time) + '</span>' +
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
    var photo = s.img
      ? '<img src="' + esc(asset(s.img)) + '" alt="' + esc(p.name) + '" loading="lazy">'
      : '<div class="ph-fallback">' + esc(p.name.charAt(0)) + '</div>';
    return '<article class="speaker-card" data-name="' + esc(s.kor.name) + '" role="button" tabindex="0">' +
      '<div class="speaker-photo' + (s.noshape ? ' no-shape' : '') + '">' + photo + '</div>' +
      '<div class="speaker-info"><h3>' + esc(p.name) + '</h3><p>' + esc(p.title) + '</p></div>' +
      '</article>';
  }

  // 연사 소개 팝업
  function openSpeakerModal(s) {
    var p = s[L] || s.kor;
    var bio = (C.bios && C.bios[s.kor.name]) || null;
    var bioText = bio ? (isEn ? bio.eng : bio.kor) : p.title;
    var links = (bio && bio.links) || [];
    var linksHtml = '';
    if (links.length) {
      linksHtml = '<div class="sp-modal-links"><div class="sp-modal-links-label">' +
        (isEn ? 'Related Articles' : '관련 기사 및 링크') + '</div>' +
        links.map(function (l) {
          return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.title) + ' ↗</a>';
        }).join('') + '</div>';
    }
    var overlay = document.createElement('div');
    overlay.className = 'sp-modal-overlay';
    overlay.innerHTML =
      '<div class="sp-modal" role="dialog" aria-modal="true" aria-label="' + esc(p.name) + '">' +
        '<button class="sp-modal-close" type="button" aria-label="닫기">×</button>' +
        '<div class="sp-modal-body">' +
          '<div class="sp-modal-photo' + (s.noshape ? ' no-shape' : '') + '">' +
            (s.img ? '<img src="' + esc(asset(s.img)) + '" alt="' + esc(p.name) + '">' : '<div class="ph-fallback" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">' + esc(p.name.charAt(0)) + '</div>') +
          '</div>' +
          '<div class="sp-modal-text">' +
            '<div class="sp-modal-label">' + (isEn ? 'Speaker' : '연사 소개') + '</div>' +
            '<h3>' + esc(p.name) + '</h3>' +
            '<p class="sp-modal-title">' + esc(p.title) + '</p>' +
            '<p class="sp-modal-bio">' + esc(bioText) + '</p>' +
            linksHtml +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    function close() {
      overlay.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('.sp-modal-close').addEventListener('click', close);
    document.addEventListener('keydown', onKey);
  }

  function bindSpeakerClicks(rootEl) {
    if (!rootEl) return;
    rootEl.querySelectorAll('.speaker-card[data-name]').forEach(function (card) {
      var name = card.getAttribute('data-name');
      var s = null;
      C.speakers.forEach(function (x) { if (x.kor.name === name) s = x; });
      if (!s) return;
      card.addEventListener('click', function () { openSpeakerModal(s); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSpeakerModal(s); }
      });
    });
  }

  // 연사 그리드를 가로 스크롤 캐러셀로 변환 (이전/다음 넘기기 버튼)
  function makeCarousel(grid) {
    if (!grid || grid.dataset.carousel) return;
    grid.dataset.carousel = '1';
    grid.classList.add('is-carousel');
    var wrap = document.createElement('div');
    wrap.className = 'speaker-carousel';
    grid.parentNode.insertBefore(wrap, grid);
    wrap.appendChild(grid);

    var prev = document.createElement('button');
    prev.type = 'button'; prev.className = 'carousel-btn prev';
    prev.setAttribute('aria-label', isEn ? 'Previous speakers' : '이전 연사'); prev.innerHTML = '‹';
    var next = document.createElement('button');
    next.type = 'button'; next.className = 'carousel-btn next';
    next.setAttribute('aria-label', isEn ? 'Next speakers' : '다음 연사'); next.innerHTML = '›';
    wrap.appendChild(prev); wrap.appendChild(next);

    function step() {
      var card = grid.querySelector('.speaker-card');
      var w = card ? card.getBoundingClientRect().width : 220;
      var gap = parseFloat(getComputedStyle(grid).columnGap || getComputedStyle(grid).gap) || 24;
      var per = Math.max(1, Math.floor(grid.clientWidth / (w + gap)) - 1);
      return (w + gap) * per;
    }
    prev.addEventListener('click', function () { grid.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { grid.scrollBy({ left: step(), behavior: 'smooth' }); });

    function update() {
      var noScroll = grid.scrollWidth <= grid.clientWidth + 4;
      prev.style.display = next.style.display = noScroll ? 'none' : 'flex';
      var max = grid.scrollWidth - grid.clientWidth - 2;
      prev.disabled = grid.scrollLeft <= 2;
      next.disabled = grid.scrollLeft >= max;
    }
    grid.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    setTimeout(update, 80);
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
    bindSpeakerClicks(spFull);
    makeCarousel(spFull);
  }
  var spFeat = document.getElementById('speakers-featured');
  if (spFeat && C.speakers) {
    var feat = C.speakers.filter(function (s) { return s.featured; });
    if (feat.length === 0) feat = C.speakers.slice(0, 6);
    spFeat.innerHTML = feat.slice(0, 6).map(speakerCard).join('');
    bindSpeakerClicks(spFeat);
    makeCarousel(spFeat);
  }

  /* ---------- 4. 아카이빙 (역대 행사) ---------- */
  var arcRoot = document.getElementById('archive-root');
  if (arcRoot && C.archive) {
    var aHtml = '';
    C.archive.forEach(function (a) {
      var d = a[L] || a.kor;
      var inner;
      if (a.poster) {
        inner = '<img class="arc-poster" src="' + esc(asset(a.poster)) + '" alt="' + esc(a.year) + ' WCIF poster" loading="lazy">' +
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
  function newsList(items, noLink) {
    return items.map(function (n) {
      var inner = '<span class="n-date">' + esc(n.date) + '</span>' +
        '<span class="n-title">' + esc(n[L] || n.kor) + '</span>';
      if (noLink || !n.url) {
        return '<li><div class="n-row">' + inner + '</div></li>';
      }
      return '<li><a href="' + esc(n.url) + '" target="_blank" rel="noopener">' +
        inner + '<span class="n-arrow">↗</span></a></li>';
    }).join('');
  }
  var noticeRoot = document.getElementById('notice-list');
  if (noticeRoot && C.news && C.news.notice) noticeRoot.innerHTML = newsList(C.news.notice, true);
  var pressRoot = document.getElementById('press-list');
  if (pressRoot && C.news && C.news.press) pressRoot.innerHTML = newsList(C.news.press);
})();
