(() => {
  'use strict';

  /* ================= Íconos ================= */
  const ICONS = {
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    tick: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>',
    cerrar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    asa: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="5.5" cy="3" r="1.4"/><circle cx="10.5" cy="3" r="1.4"/><circle cx="5.5" cy="8" r="1.4"/><circle cx="10.5" cy="8" r="1.4"/><circle cx="5.5" cy="13" r="1.4"/><circle cx="10.5" cy="13" r="1.4"/></svg>',
    copiar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',
    trofeo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M9 20h6"/></svg>',
    plano: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1-5L16 4l4 4L9 19z"/><path d="M14 6l4 4"/></svg>'
  };

  const { EXAMPLE, DECL, LANE_NAMES, LANE_SHORT, WHY_HINT, RADIO, MAX } = window.PACTO;

  const KEY = 'semaforo-pacto-v1';
  const THEME_KEY = 'detective-ia-theme';
  const INFO_KEY = 'semaforo-pacto-aviso';
  const ALL = ['pool', 'g', 'y', 'r'];
  const LANES = ['g', 'y', 'r'];
  const STAMP_KEYS = ['Objetivo', 'Tareas', 'Razones', 'Declaración', 'Evaluación'];

  const $ = (id) => document.getElementById(id);
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => motionQuery.matches;

  /* ================= Almacenamiento (localStorage) ================= */
  const storageOK = (() => {
    try {
      const k = '__semaforo_pacto_test__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  })();

  const emptyState = () => ({ meta: { materia: '', actividad: '', objetivo: '' }, tasks: [], decl: {}, declOtra: '', evaluacion: '', example: false, nextId: 1, updated: null });
  function freshState() {
    const s = emptyState();
    s.tasks = EXAMPLE.map((t, i) => ({ id: 't' + (i + 1), text: t.text, lane: t.lane, why: '' }));
    s.example = true;
    s.nextId = s.tasks.length + 1;
    return s;
  }

  // Valida todo lo que viene del almacenamiento: tipos, largos, carriles e ids conocidos.
  const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
  function parseState(raw) {
    if (!raw) return null;
    try {
      const p = JSON.parse(raw);
      if (!p || typeof p !== 'object' || !Array.isArray(p.tasks)) return null;
      const s = emptyState();
      const m = p.meta && typeof p.meta === 'object' ? p.meta : {};
      s.meta = { materia: str(m.materia, MAX.materia), actividad: str(m.actividad, MAX.actividad), objetivo: str(m.objetivo, MAX.objetivo) };
      const seen = {};
      p.tasks.slice(0, MAX.tasks).forEach((t) => {
        if (!t || typeof t !== 'object') return;
        const text = str(t.text, MAX.task).trim();
        if (!text || typeof t.id !== 'string' || !/^t\d{1,6}$/.test(t.id) || seen[t.id]) return;
        seen[t.id] = true;
        s.tasks.push({ id: t.id, text, lane: ALL.includes(t.lane) ? t.lane : 'pool', why: str(t.why, MAX.why) });
      });
      if (p.decl && typeof p.decl === 'object') DECL.forEach((d) => { if (p.decl[d.id] === true) s.decl[d.id] = true; });
      s.declOtra = str(p.declOtra, MAX.otra);
      s.evaluacion = str(p.evaluacion, MAX.evaluacion);
      s.example = p.example === true;
      s.nextId = s.tasks.reduce((mx, t) => Math.max(mx, Number(t.id.slice(1))), 0) + 1;
      if (typeof p.updated === 'number' && isFinite(p.updated)) s.updated = p.updated;
      return s;
    } catch (e) { return null; /* datos corruptos: se arranca con el ejemplo */ }
  }

  function load() {
    if (!storageOK) return freshState();
    try { return parseState(window.localStorage.getItem(KEY)) || freshState(); } catch (e) { return freshState(); }
  }

  let state = load();
  let persisted = storageOK;
  let saveTimer = 0;

  function save() {
    clearTimeout(saveTimer);
    state.updated = Date.now();
    if (!storageOK) { persisted = false; return; }
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); persisted = true; } catch (e) { persisted = false; }
    renderSaved(true);
  }
  // Al escribir se guarda con una pausa corta, para no parpadear en cada tecla.
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 300); }
  window.addEventListener('pagehide', () => { if (saveTimer) save(); });

  const byId = (id) => state.tasks.find((t) => t.id === id) || null;
  const inLane = (l) => state.tasks.filter((t) => t.lane === l);

  /* ================= Utilidades de animación y avisos ================= */
  function replay(el, cls) {
    if (!el || reduced()) return;
    el.classList.remove(cls);
    void el.offsetWidth; // fuerza reflow para reiniciar la animación
    el.classList.add(cls);
    el.addEventListener('animationend', function done(e) {
      if (e.target !== el) return;
      el.classList.remove(cls);
      el.removeEventListener('animationend', done);
    });
  }

  function setRadio(msg) { $('radio').textContent = msg; }
  function announce(msg) {
    const a = $('announcer');
    a.textContent = '';
    setTimeout(() => { a.textContent = msg; }, 50);
  }

  // Aviso visual, uno a la vez. Los lectores de pantalla reciben el mensaje por #radio o #announcer.
  function toast(icon, title, body) {
    const wrap = $('toasts');
    wrap.textContent = '';
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<i class="toast-grip" aria-hidden="true"></i>' + ICONS[icon] + '<div><strong class="toast-title"></strong><span class="toast-body"></span></div>';
    t.querySelector('.toast-title').textContent = title;
    t.querySelector('.toast-body').textContent = body;
    wrap.appendChild(t);
    let timer = 0;
    let closed = false;
    let startX = 0, startT = 0, dx = 0, dragging = false, moved = false, pid = null;
    const close = () => {
      if (closed) return;
      closed = true;
      clearTimeout(timer);
      if (reduced()) { t.remove(); return; }
      t.classList.add('out');
      t.addEventListener('animationend', () => t.remove());
    };
    // Se cierra a los 5 s; si en ese momento el mouse está encima, espera un poco más.
    const tick = () => {
      let hovered = false;
      try { hovered = t.matches(':hover'); } catch (err) { /* navegador sin :hover */ }
      if (hovered || dragging) timer = setTimeout(tick, 1000); else close();
    };
    const arm = () => { clearTimeout(timer); timer = setTimeout(tick, 5000); };

    // Deslizar hacia un costado para descartar (dedo o mouse).
    t.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true; moved = false; dx = 0; pid = e.pointerId;
      startX = e.clientX; startT = performance.now();
      clearTimeout(timer);
      t.classList.remove('settle');
      t.classList.add('dragging');
      try { t.setPointerCapture(pid); } catch (err) { /* sin captura: sigue funcionando */ }
    });
    t.addEventListener('pointermove', (e) => {
      if (!dragging || e.pointerId !== pid) return;
      dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      t.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 40) + 'deg)';
      t.style.opacity = String(Math.max(0.15, 1 - Math.abs(dx) / (t.offsetWidth * 0.9)));
    });
    const release = (e) => {
      if (!dragging || (e && e.pointerId !== pid)) return;
      dragging = false;
      t.classList.remove('dragging');
      const speed = Math.abs(dx) / Math.max(1, performance.now() - startT); // px/ms
      if (Math.abs(dx) > t.offsetWidth * 0.3 || (Math.abs(dx) > 30 && speed > 0.5)) {
        closed = true;
        clearTimeout(timer);
        t.classList.add('fling');
        t.style.transform = 'translateX(' + (dx > 0 ? 1 : -1) * (t.offsetWidth + 60) + 'px) rotate(' + (dx > 0 ? 8 : -8) + 'deg)';
        t.style.opacity = '0';
        setTimeout(() => t.remove(), reduced() ? 0 : 260);
        return;
      }
      if (!moved) { close(); return; } // un toque simple también lo cierra
      t.classList.add('settle');
      t.style.transform = '';
      t.style.opacity = '';
      arm();
    };
    t.addEventListener('pointerup', release);
    t.addEventListener('pointercancel', (e) => { moved = true; release(e); });
    arm();
  }

  /* ================= Construcción fija del DOM ================= */
  const stampsEl = $('stamps');
  const checklistEl = $('checklist');
  STAMP_KEYS.forEach((k, i) => {
    const li = document.createElement('li');
    li.innerHTML = '<button type="button" class="stamp" id="stamp-' + i + '"><span class="mark" aria-hidden="true">' + ICONS.tick + '</span><span class="stamp-label"></span><span class="sr-only" id="stamp-st-' + i + '"></span></button>';
    li.querySelector('.stamp-label').textContent = k;
    li.querySelector('button').addEventListener('click', () => goTo(i));
    stampsEl.appendChild(li);

    const cl = document.createElement('li');
    cl.id = 'cl-' + i;
    cl.innerHTML = '<span class="mark" aria-hidden="true">' + ICONS.tick + '</span><span><span id="cl-t-' + i + '"></span><small id="cl-s-' + i + '"></small><button type="button" class="go" id="cl-go-' + i + '">Ir a completar</button></span>';
    cl.querySelector('.go').addEventListener('click', () => goTo(i));
    checklistEl.appendChild(cl);
  });

  // Lleva a lo primero que falta para conseguir cada sello.
  function goTo(i) {
    const firstPool = document.querySelector('#drop-pool .task .mv');
    const emptyWhy = Array.from(document.querySelectorAll('.task .why')).find((w) => !w.value.trim());
    const target = [
      () => $('f-objetivo'),
      () => firstPool || $('new-task'),
      () => emptyWhy || firstPool || $('new-task'),
      () => DECL.map((d) => $('decl-' + d.id)).find((c) => !c.checked) || $('decl-' + DECL[0].id),
      () => $('f-eval')
    ][i]();
    target.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
    target.focus({ preventScroll: true });
    replay(target.closest('.task, .check') || target, 'spot');
  }

  const declBox = $('decl-list');
  DECL.forEach((d) => {
    const lab = document.createElement('label');
    lab.className = 'check';
    lab.htmlFor = 'decl-' + d.id;
    lab.innerHTML = '<input type="checkbox" id="decl-' + d.id + '"><span class="box" aria-hidden="true">' + ICONS.tick + '</span><span class="t"></span>';
    lab.querySelector('.t').textContent = d.label;
    lab.querySelector('input').addEventListener('change', (e) => {
      if (e.target.checked) state.decl[d.id] = true; else delete state.decl[d.id];
      save(); renderDerived();
    });
    declBox.appendChild(lab);
  });

  $('copy-icon').innerHTML = ICONS.copiar;

  // Si la herramienta está incrustada en el LMS, ofrecer abrirla aparte.
  let framed = false;
  try { framed = window.self !== window.top; } catch (e) { framed = true; }
  const selfUrl = window.location.href.split('#')[0];
  $('newtab').href = selfUrl;
  $('notice-link').href = selfUrl;
  $('frame-link').href = selfUrl;
  if (framed) $('topbar').hidden = false;
  // Sin almacenamiento: aviso de alerta. Incrustada pero con almacenamiento: aviso informativo,
  // porque algunos navegadores lo borran igual al cerrar. El modo incógnito no se puede detectar
  // de forma confiable (los navegadores lo ocultan a propósito), por eso se aclara en el pie.
  // Uso normal: recordatorio de dónde se guarda, hasta que la persona lo cierra. En incógnito
  // el cierre no se recuerda entre sesiones, así que vuelve a aparecer cada vez.
  const seenInfo = () => { try { return window.localStorage.getItem(INFO_KEY) === '1'; } catch (e) { return false; } };
  if (!storageOK) $('storage-notice').hidden = false;
  else if (framed) $('frame-notice').hidden = false;
  else if (!seenInfo()) $('info-notice').hidden = false;
  $('info-ok').addEventListener('click', () => {
    try { window.localStorage.setItem(INFO_KEY, '1'); } catch (e) { /* sin almacenamiento: se oculta solo esta vez */ }
    $('info-notice').hidden = true;
    $('f-materia').focus({ preventScroll: true });
  });

  // Al terminar la entrada se quita .reveal para que otras animaciones no la reinicien.
  [['.reveal', 'reveal', 'fade-up'], ['.stamp-big.intro', 'intro', 'stamp-slam']].forEach(([sel, cls, anim]) => document.querySelectorAll(sel).forEach((el) => {
    el.addEventListener('animationend', function off(e) {
      if (e.target !== el || e.animationName !== anim) return;
      el.classList.remove(cls);
      el.removeEventListener('animationend', off);
    });
  }));

  // El panel de sellos es fijo: su alto real define cuánto margen deja el desplazamiento.
  const hud = $('hud');
  const syncHud = () => document.documentElement.style.setProperty('--hud-h', Math.round(hud.getBoundingClientRect().height) + 'px');
  if ('ResizeObserver' in window) new ResizeObserver(syncHud).observe(hud); else syncHud();

  /* ================= Tarjetas de tarea ================= */
  function makeTask(t) {
    const c = document.createElement('div');
    c.className = 'task';
    c.dataset.id = t.id;
    c.innerHTML =
      '<div class="task-top">' +
        '<span class="grip" draggable="true" aria-hidden="true" title="Arrastrar">' + ICONS.asa + '</span>' +
        '<span class="task-text"></span>' +
        '<button type="button" class="rm" title="Quitar">' + ICONS.cerrar + '</button>' +
      '</div>' +
      '<div class="moves" role="group"></div>';
    c.querySelector('.task-text').textContent = t.text;
    c.querySelector('.rm').setAttribute('aria-label', 'Quitar la tarea: ' + t.text);
    const moves = c.querySelector('.moves');
    moves.setAttribute('aria-label', 'Clasificar: ' + t.text);
    LANES.forEach((l) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mv';
      b.dataset.to = l;
      b.setAttribute('aria-pressed', String(t.lane === l));
      b.setAttribute('aria-label', LANE_NAMES[l] + ': ' + t.text);
      b.textContent = LANE_SHORT[l];
      moves.appendChild(b);
    });
    if (t.lane !== 'pool') {
      const why = document.createElement('input');
      why.type = 'text';
      why.className = 'why';
      why.maxLength = MAX.why;
      why.value = t.why;
      why.setAttribute('aria-label', WHY_HINT[t.lane] + ' Tarea: ' + t.text);
      why.placeholder = WHY_HINT[t.lane];
      const miss = document.createElement('span');
      miss.className = 'why-miss';
      miss.setAttribute('aria-hidden', 'true');
      miss.textContent = 'Falta el porqué';
      c.appendChild(miss);
      c.appendChild(why);
    }
    return c;
  }

  function renderBoard() {
    ALL.forEach((l) => {
      const box = $('drop-' + l);
      box.textContent = '';
      const list = inLane(l);
      if (!list.length) {
        const e = document.createElement('p');
        e.className = 'empty';
        e.textContent = l === 'pool'
          ? (state.tasks.length ? 'No quedan tareas sin clasificar.' : 'Todavía no hay tareas. Agregá la primera acá abajo.')
          : 'Arrastrá o asigná tareas acá.';
        box.appendChild(e);
      } else {
        list.forEach((t) => box.appendChild(makeTask(t)));
      }
      const count = $('count-' + l);
      if (count.textContent !== String(list.length)) { count.textContent = String(list.length); replay(count, 'bump'); }
    });
    $('example-note').hidden = !state.example;
  }

  const taskEl = (id) => document.querySelector('.task[data-id="' + id + '"]');

  // Mueve una tarea y devuelve el foco a su botón, que se reconstruyó en el carril nuevo.
  function moveTask(t, lane, byKeyboard, focusBtn) {
    if (t.lane === lane) return;
    t.lane = lane;
    setRadio(RADIO[lane]);
    save(); renderBoard(); renderDerived();
    const el = taskEl(t.id);
    if (!el) return;
    replay(el, 'arrive');
    if (focusBtn) {
      const b = el.querySelector('.mv[data-to="' + focusBtn + '"]');
      if (b) b.focus({ preventScroll: !byKeyboard });
    }
  }

  const board = $('step-2');
  board.addEventListener('click', (e) => {
    const card = e.target.closest('.task');
    if (!card) return;
    const t = byId(card.dataset.id);
    if (!t) return;
    const byKeyboard = e.detail === 0;
    const mv = e.target.closest('.mv');
    if (mv) {
      const l = mv.dataset.to;
      moveTask(t, t.lane === l ? 'pool' : l, byKeyboard, l);
      return;
    }
    if (e.target.closest('.rm')) {
      const siblings = Array.from(document.querySelectorAll('.task'));
      const at = siblings.indexOf(card);
      const neighbor = siblings[at + 1] || siblings[at - 1];
      const neighborId = neighbor ? neighbor.dataset.id : null;
      state.tasks = state.tasks.filter((x) => x.id !== t.id);
      setRadio('Quitaste la tarea: ' + t.text + '.');
      save(); renderBoard(); renderDerived();
      const next = neighborId && taskEl(neighborId);
      (next ? next.querySelector('.rm') : $('new-task')).focus({ preventScroll: !byKeyboard });
    }
  });
  board.addEventListener('input', (e) => {
    if (!e.target.classList.contains('why')) return;
    const card = e.target.closest('.task');
    const t = card && byId(card.dataset.id);
    if (!t) return;
    t.why = e.target.value.slice(0, MAX.why);
    saveSoon(); renderDerived();
  });

  /* ================= Arrastrar y soltar (mouse) ================= */
  board.addEventListener('dragstart', (e) => {
    const grip = e.target.closest && e.target.closest('.grip');
    const card = grip && grip.closest('.task');
    if (!card) return;
    try {
      e.dataTransfer.setData('text/plain', card.dataset.id);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setDragImage(card, 12, 12);
    } catch (err) { /* navegador sin dataTransfer completo */ }
    card.classList.add('dragging');
  });
  board.addEventListener('dragend', () => {
    document.querySelectorAll('.dragging, .over').forEach((el) => el.classList.remove('dragging', 'over'));
  });
  document.querySelectorAll('#pool-box, .lane').forEach((zone) => {
    const lane = zone.dataset.lane;
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('over'); });
    zone.addEventListener('dragleave', (e) => { if (!zone.contains(e.relatedTarget)) zone.classList.remove('over'); });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('over');
      let id = '';
      try { id = e.dataTransfer.getData('text/plain'); } catch (err) { /* sin datos */ }
      const t = byId(id);
      if (t) moveTask(t, lane, false, null);
    });
  });

  /* ================= Campos de texto ================= */
  const FIELDS = [
    ['f-materia', () => state.meta.materia, (v) => { state.meta.materia = v; }],
    ['f-actividad', () => state.meta.actividad, (v) => { state.meta.actividad = v; }],
    ['f-objetivo', () => state.meta.objetivo, (v) => { state.meta.objetivo = v; }],
    ['f-decl-otra', () => state.declOtra, (v) => { state.declOtra = v; }],
    ['f-eval', () => state.evaluacion, (v) => { state.evaluacion = v; }]
  ];
  FIELDS.forEach(([id, , set]) => {
    const el = $(id);
    el.addEventListener('input', () => { set(el.value); saveSoon(); renderDerived(); });
    el.addEventListener('change', () => { if (saveTimer) save(); });
  });
  function fillFields() {
    FIELDS.forEach(([id, get]) => { const el = $(id); if (document.activeElement !== el) el.value = get(); });
    DECL.forEach((d) => { $('decl-' + d.id).checked = !!state.decl[d.id]; });
  }

  /* ================= Agregar y reiniciar ================= */
  const newTask = $('new-task');
  const addErr = $('add-err');
  const clearAddErr = () => { addErr.textContent = ''; newTask.removeAttribute('aria-invalid'); };
  newTask.addEventListener('input', clearAddErr);
  $('add-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = newTask.value.trim();
    if (!v || state.tasks.length >= MAX.tasks) {
      addErr.textContent = v ? 'Llegaste al máximo de tareas. Quitá alguna para agregar otra.' : 'Escribí la tarea antes de agregarla.';
      newTask.setAttribute('aria-invalid', 'true');
      newTask.focus();
      return;
    }
    clearAddErr();
    const t = { id: 't' + state.nextId, text: v, lane: 'pool', why: '' };
    state.tasks.push(t);
    state.nextId += 1;
    newTask.value = '';
    setRadio('Tarea agregada: ' + v + '. Elegí su color.');
    save(); renderBoard(); renderDerived();
    replay(taskEl(t.id), 'arrive');
    newTask.focus();
  });

  // Botones de dos toques: el primero arma, el segundo confirma. Se desarma solo a los 4 s.
  function armed(btn, idle, confirm, run) {
    let timer = 0;
    const disarm = () => { btn.dataset.armed = ''; btn.textContent = idle; };
    btn.addEventListener('click', (e) => {
      if (btn.dataset.armed === '1') {
        clearTimeout(timer);
        disarm();
        run(e.detail === 0);
      } else {
        btn.dataset.armed = '1';
        btn.textContent = confirm;
        timer = setTimeout(disarm, 4000);
      }
    });
  }

  armed($('clear-btn'), 'Empezar de cero', 'Tocá de nuevo para quitar el ejemplo', (byKeyboard) => {
    const keep = state.meta;
    state = emptyState();
    state.meta = keep;
    prevOk = null; // sin festejos al vaciar
    save(); fillFields(); renderBoard(); renderDerived();
    setRadio('Quitaste el ejemplo. Agregá las tareas de tu actividad.');
    newTask.focus({ preventScroll: !byKeyboard });
  });

  armed($('reset'), 'Reiniciar semáforo', 'Tocá de nuevo para borrar todo', () => {
    state = freshState();
    prevOk = null;
    save();
    FIELDS.forEach(([id]) => { $(id).value = ''; });
    fillFields(); renderBoard(); renderDerived();
    setRadio('Semáforo reiniciado. Volvieron las tareas de ejemplo.');
    toast('plano', 'Semáforo reiniciado', 'Tu avance se borró de este navegador.');
  });

  /* ================= Derivados: balance, aviso, sellos, lista de control, borrador ================= */
  function decls() {
    const out = DECL.filter((d) => state.decl[d.id]).map((d) => d.label);
    if (state.declOtra.trim()) out.push(state.declOtra.trim());
    return out;
  }

  function buildText() {
    const L = ['PACTO DE USO DE IA'];
    if (state.meta.materia.trim()) L.push('Materia y año: ' + state.meta.materia.trim());
    if (state.meta.actividad.trim()) L.push('Actividad: ' + state.meta.actividad.trim());
    L.push('Objetivo de aprendizaje: ' + (state.meta.objetivo.trim() || '[completar]'));
    LANES.forEach((l) => {
      const list = inLane(l);
      L.push('', LANE_NAMES[l].toUpperCase());
      if (!list.length) L.push('- (ninguna tarea)');
      list.forEach((t) => L.push('- ' + t.text + (t.why.trim() ? '. Por qué: ' + t.why.trim() : '')));
    });
    const pend = inLane('pool');
    if (pend.length) {
      L.push('', 'SIN CLASIFICAR');
      pend.forEach((t) => L.push('- ' + t.text));
    }
    L.push('', 'CÓMO SE DECLARA EL USO DE IA');
    const d = decls();
    if (!d.length) L.push('- [completar]');
    d.forEach((x) => L.push('- ' + x));
    L.push('', 'CÓMO SE EVALÚA', state.evaluacion.trim() || '[completar]');
    return L.join('\n');
  }

  let prevOk = null;

  function renderDerived() {
    const g = inLane('g').length, y = inLane('y').length, r = inLane('r').length, p = inLane('pool').length;
    const classified = g + y + r;
    const first = prevOk === null;

    // Barra de balance
    [['g', g], ['y', y], ['r', r]].forEach(([l, n]) => { $('bar-' + l).style.width = (classified ? n / classified * 100 : 0) + '%'; });
    $('bar').setAttribute('aria-label', 'Tareas clasificadas: ' + g + ' en verde, ' + y + ' en amarillo, ' + r + ' en rojo, ' + p + ' sin clasificar');

    // Aviso
    let msg;
    if (classified < 3) msg = 'Clasificá al menos tres tareas para ver cómo queda el equilibrio de tu pacto.';
    else if (r === 0) msg = 'No dejaste ninguna tarea sin IA. Preguntate qué parte del objetivo tiene que practicar el estudiante por su cuenta.';
    else if (g + y === 0) msg = 'Dejaste todo sin IA. Preguntate si hay alguna tarea donde pueda acompañar sin reemplazar el pensamiento del estudiante.';
    else if (g / classified > 0.7) msg = 'Casi todo quedó en verde. Revisá si el estudiante sigue practicando la habilidad que planteaste en el objetivo.';
    else msg = 'Buen equilibrio. Ahora asegurate de explicar el porqué de cada decisión: es lo que permite defender tu pacto.';
    const withWhy = state.tasks.filter((t) => t.lane !== 'pool' && t.why.trim()).length;
    const noWhy = classified - withWhy;
    if (classified >= 3 && r > 0 && g + y > 0 && g / classified <= 0.7) {
      msg = noWhy
        ? 'Buen equilibrio. Para el sello Razones te falta escribir el porqué en ' + noWhy + ' tarea' + (noWhy === 1 ? '' : 's') + ': es el campo punteado debajo de los botones de color.'
        : 'Buen equilibrio, y cada decisión tiene su porqué: eso es lo que permite defender tu pacto.';
    }
    if (p > 0 && classified >= 3) msg += ' Quedan ' + p + ' tarea' + (p === 1 ? '' : 's') + ' por clasificar.';
    $('nudge').textContent = msg;

    // Lista de control
    const items = [
      { ok: state.meta.objetivo.trim().length >= 15, t: 'Objetivo de aprendizaje claro', s: 'Pertinencia pedagógica' },
      { ok: classified > 0 && p === 0 && r > 0 && (g + y) > 0, t: 'Definiste qué hace la IA y qué queda para el estudiante', s: 'Tareas clasificadas, con al menos una tarea con IA y una sin IA' },
      { ok: classified > 0 && withWhy === classified, t: 'Explicaste el porqué de cada decisión (' + withWhy + ' de ' + classified + ')', s: 'Uso crítico de la IA, con razones' },
      { ok: decls().length > 0, t: 'Definiste cómo se declara el uso de IA', s: 'Transparencia' },
      { ok: state.evaluacion.trim().length >= 15, t: 'Definiste cómo se evalúa', s: 'Evaluabilidad' }
    ];
    const okNow = items.map((it) => it.ok);
    const total = okNow.filter(Boolean).length;
    const complete = total === items.length;

    let fresh = -1;
    items.forEach((it, i) => {
      const st = $('stamp-' + i);
      st.classList.toggle('got', it.ok);
      $('stamp-st-' + i).textContent = it.ok ? ': sello conseguido' : ': pendiente, ir a completar';
      $('cl-go-' + i).hidden = it.ok;
      if (!first && it.ok && !prevOk[i]) { fresh = i; replay(st, 'pop'); }
      const cl = $('cl-' + i);
      cl.classList.toggle('got', it.ok);
      $('cl-t-' + i).textContent = it.t;
      $('cl-s-' + i).textContent = it.s + (it.ok ? ' · listo' : ' · pendiente');
    });
    $('hud-n').textContent = String(total);
    $('hud-sr').textContent = ': ' + total + ' de ' + items.length;

    // Pasos: número que pasa a tilde, estado en texto y marca del paso en curso
    const stepOk = [okNow[0], okNow[1] && okNow[2], okNow[3] && okNow[4], complete];
    const prevStep = first ? null : [prevOk[0], prevOk[1] && prevOk[2], prevOk[3] && prevOk[4], prevOk.every(Boolean)];
    const current = stepOk.indexOf(false);
    stepOk.forEach((ok, i) => {
      const n = i + 1;
      const el = $('step-' + n);
      el.classList.toggle('done', ok);
      el.classList.toggle('current', i === current);
      const pill = $('pill-' + n);
      pill.textContent = ok ? 'Listo' : (i === current ? 'En curso' : 'Pendiente');
      const seal = $('seal-' + n);
      if (ok !== seal.classList.contains('is-check')) {
        seal.classList.toggle('is-check', ok);
        seal.innerHTML = ok ? ICONS.check : String(n);
      }
      if (prevStep && ok && !prevStep[i]) { replay(seal, 'pop'); replay(pill, 'stamped'); }
    });

    // Sello del expediente
    const stamp = $('stamp');
    stamp.textContent = complete ? 'BORRADOR LISTO' : 'EN BORRADOR';
    stamp.classList.toggle('closed', complete);
    if (!first) {
      const was = prevOk.every(Boolean);
      if (complete !== was) { stamp.classList.remove('intro'); replay(stamp, 'slam'); }
      if (complete && !was) {
        setRadio('Expediente completo. Copiá el borrador y entregalo en el aula para desbloquear el Nivel 4.');
        toast('trofeo', 'Expediente completo', 'Conseguiste los cinco sellos. Copiá el borrador y entregalo en el aula.');
      } else if (okNow.some((ok, i) => !ok && prevOk[i])) {
        const lost = okNow.findIndex((ok, i) => !ok && prevOk[i]);
        setRadio('El sello ' + STAMP_KEYS[lost] + ' volvió a pendiente. Tocalo para ver qué falta.');
      } else if (fresh >= 0) {
        setRadio('Sello conseguido: ' + STAMP_KEYS[fresh] + '. Te ' + (items.length - total === 1 ? 'falta 1.' : 'faltan ' + (items.length - total) + '.'));
      }
    }
    prevOk = okNow;

    const text = buildText();
    $('result').value = text;
    $('print-out').textContent = text;
  }

  /* ================= Guardado visible ================= */
  const fmt = (() => {
    try { return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return null; }
  })();
  function renderSaved(flash) {
    const el = $('saved');
    if (!persisted) {
      el.textContent = 'No se está guardando en este navegador';
      el.classList.add('off');
      return;
    }
    el.classList.remove('off');
    el.textContent = state.updated
      ? 'Guardado en este navegador · ' + (fmt ? fmt.format(new Date(state.updated)) : new Date(state.updated).toLocaleString())
      : 'Tu avance se guarda automáticamente';
    if (flash) replay(el, 'flash');
  }

  /* ================= Copiar ================= */
  let copyTimer = 0;
  $('copy-btn').addEventListener('click', () => {
    const ta = $('result');
    const st = $('copy-status');
    const done = (ok) => {
      if (!ok) {
        ta.focus(); ta.select();
        st.textContent = 'Seleccioné el texto. Copialo con el atajo de tu dispositivo.';
        return;
      }
      st.textContent = 'Borrador copiado. Pegalo en la plantilla del aula.';
      $('copy-icon').innerHTML = ICONS.check;
      $('copy-label').textContent = 'Copiado';
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => {
        $('copy-icon').innerHTML = ICONS.copiar;
        $('copy-label').textContent = 'Copiar borrador';
      }, 2500);
    };
    // Dentro de un iframe o sin HTTPS puede no haber portapapeles moderno: se prueba el método anterior.
    const legacy = () => {
      let ok = false;
      try { ta.focus(); ta.select(); ok = document.execCommand('copy'); } catch (e) { ok = false; }
      done(ok);
    };
    try { navigator.clipboard.writeText(ta.value).then(() => done(true), legacy); } catch (e) { legacy(); }
  });

  /* ================= Tema claro / oscuro ================= */
  const themeBtn = $('theme-toggle');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const savedTheme = () => document.documentElement.getAttribute('data-theme');
  const currentTheme = () => savedTheme() || (systemDark.matches ? 'dark' : 'light');

  function renderTheme() {
    const cur = currentTheme();
    themeBtn.dataset.current = cur;
    const label = cur === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    themeBtn.setAttribute('aria-label', label);
    themeBtn.title = label;
    // La barra del navegador en el celular acompaña el tema elegido.
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      m.setAttribute('content', cur === 'dark' ? '#10171E' : '#E9EDF1');
    });
  }

  themeBtn.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    if (!reduced()) {
      root.classList.add('theme-anim');
      setTimeout(() => root.classList.remove('theme-anim'), 400);
    }
    root.setAttribute('data-theme', next);
    try { window.localStorage.setItem(THEME_KEY, next); } catch (e) { /* sin almacenamiento: dura hasta cerrar */ }
    renderTheme();
    replay(themeBtn, 'spin');
    announce(next === 'dark' ? 'Modo oscuro activado.' : 'Modo claro activado.');
  });
  // Si no eligió un tema, sigue al sistema en vivo.
  const onSystem = () => { if (!savedTheme()) renderTheme(); };
  if (systemDark.addEventListener) systemDark.addEventListener('change', onSystem);
  else if (systemDark.addListener) systemDark.addListener(onSystem);
  renderTheme();

  // Sincroniza si la herramienta está abierta en otra pestaña.
  window.addEventListener('storage', (e) => {
    if (e.key === THEME_KEY) {
      if (e.newValue === 'light' || e.newValue === 'dark') document.documentElement.setAttribute('data-theme', e.newValue);
      else document.documentElement.removeAttribute('data-theme');
      renderTheme();
      return;
    }
    if (e.key !== KEY) return;
    // Si se está escribiendo el porqué de una tarea, no se reconstruye el tablero debajo del cursor.
    const typing = document.activeElement && document.activeElement.classList.contains('why');
    state = parseState(e.newValue) || freshState();
    prevOk = null;
    fillFields();
    if (!typing) renderBoard();
    renderDerived();
    renderSaved(false);
  });

  fillFields();
  renderBoard();
  renderDerived();
  renderSaved(false);
})();
