(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const cfg = window.BIRTHDAY_CONFIG;
  const preview = new URLSearchParams(location.search).get('preview') === '1';
  let forceLocked = false, stage = 0, cleanup = () => {}, awake = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Áudio sutil via Web Audio API (sem arquivos externos) ── */
  let audioCtx = null, soundOn = true;
  try {
    const saved = localStorage.getItem('reino-sound');
    if (saved !== null) soundOn = saved === '1';
  } catch (_) {}

  function ensureAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {}
    }
    if (audioCtx?.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function tone(freq, dur, type = 'sine', vol = 0.08, delay = 0) {
    if (!soundOn) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function sfxClick() { tone(520, 0.06, 'triangle', 0.05); }
  function sfxCatch() { tone(660, 0.12, 'sine', 0.07); tone(880, 0.15, 'sine', 0.04, 0.06); }
  function sfxMatch() { tone(523, 0.1, 'sine', 0.07); tone(659, 0.12, 'sine', 0.06, 0.08); tone(784, 0.18, 'sine', 0.05, 0.16); }
  function sfxWin() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'sine', 0.07, i * 0.1));
  }
  function sfxMiss() { tone(220, 0.15, 'triangle', 0.04); }

  const soundBtn = $('#sound-toggle');
  function syncSoundBtn() {
    if (!soundBtn) return;
    soundBtn.classList.toggle('on', soundOn);
    soundBtn.classList.toggle('off', !soundOn);
    soundBtn.setAttribute('aria-label', soundOn ? 'Desativar sons' : 'Ativar sons');
    soundBtn.title = soundOn ? 'Som ligado' : 'Som desligado';
  }
  syncSoundBtn();
  soundBtn?.addEventListener('click', () => {
    soundOn = !soundOn;
    try { localStorage.setItem('reino-sound', soundOn ? '1' : '0'); } catch (_) {}
    syncSoundBtn();
    if (soundOn) sfxClick();
  });

  /* ── Confetes ── */
  const confettiCanvas = $('#confetti-canvas');
  const cctx = confettiCanvas?.getContext('2d');
  let confettiParts = [], confettiRaf = 0;

  function resizeConfetti() {
    if (!confettiCanvas) return;
    confettiCanvas.width = innerWidth;
    confettiCanvas.height = innerHeight;
  }
  resizeConfetti();
  addEventListener('resize', resizeConfetti);

  function burstConfetti(count = 60) {
    if (reduced || !cctx) return;
    const colors = ['#ecc782', '#f2d59b', '#ffe2a6', '#d6ac62', '#f6ecd7', '#c9e0a8', '#e8bc52'];
    for (let i = 0; i < count; i++) {
      confettiParts.push({
        x: innerWidth * 0.3 + Math.random() * innerWidth * 0.4,
        y: -20 - Math.random() * 60,
        vx: (Math.random() - 0.5) * 8,
        vy: 2 + Math.random() * 5,
        w: 5 + Math.random() * 7,
        h: 3 + Math.random() * 5,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
      });
    }
    if (!confettiRaf) confettiLoop();
  }

  function confettiLoop() {
    if (!cctx) return;
    cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParts = confettiParts.filter(p => p.life > 0 && p.y < innerHeight + 40);
    for (const p of confettiParts) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.vx *= 0.99;
      p.rot += p.vr;
      p.life -= 0.008;
      cctx.save();
      cctx.translate(p.x, p.y);
      cctx.rotate(p.rot);
      cctx.globalAlpha = Math.max(0, p.life);
      cctx.fillStyle = p.color;
      cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cctx.restore();
    }
    if (confettiParts.length) {
      confettiRaf = requestAnimationFrame(confettiLoop);
    } else {
      confettiRaf = 0;
      cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  /* ── Estágios ── */
  const stages = [
    ['BEM-VINDA AO SEU REINO', 'Feliz aniversário, minha princesa.', 'Seu cavaleiro e seu pequeno companheiro prepararam uma aventura para você. Vamos descobrir o que o jardim guarda?', 'Entrar no jardim'],
    ['01 · O JARDIM ENCANTADO', 'Cinco pequenas luzes.', 'Toque nos cinco vaga-lumes para iluminar o caminho. Eles também podem ser alcançados com a tecla Tab.', 'Seguir as luzes'],
    ['02 · MEMÓRIAS DO REINO', 'Nós, em cada detalhe.', 'Encontre os cinco pares. Cada carta guarda um pedacinho de nós.', 'Guardar essas memórias'],
    ['03 · A BUSCA DO PORQUINHO', 'Carinho escondido pelo jardim.', 'Nosso companheirinho escondeu três pequenos presentes. Encontre os símbolos dourados.', 'Levar o carinho comigo'],
    ['04 · UM PERGAMINHO ESPECIAL', 'Uma mensagem em pedacinhos.', 'Toque em dois pedaços para trocar suas posições e montar a frase, da esquerda para a direita.', 'Abrir a carta'],
    ['05 · DE MIM PARA VOCÊ', 'Tem coisas que eu quero te dizer.', '', 'A última surpresa'],
    ['E A HISTÓRIA CONTINUA…', cfg.finalTitle, cfg.finalMessage, 'Viver a aventura outra vez'],
  ];

  function updateGate() {
    const before = window.birthdayUnlocked;
    window.birthdayUnlocked = !forceLocked && (preview || Date.now() >= Date.parse(cfg.unlockAt));
    $('#wake-button').hidden = !window.birthdayUnlocked || awake;
    if (before !== window.birthdayUnlocked) window.refreshSleepScene?.();
  }

  if (preview) {
    $('#preview-bar').hidden = false;
    $('#preview-lock').onclick = () => {
      forceLocked = !forceLocked;
      $('#preview-lock').textContent = forceLocked ? 'Simular aniversário' : 'Ver antes de 09/11';
      if (awake) {
        location.href = './index.html' + (forceLocked ? '' : '?preview=1');
        return;
      }
      updateGate();
    };
  }
  updateGate();
  setInterval(updateGate, 1000);

  $('#wake-button').onclick = () => {
    if (!window.birthdayUnlocked || awake) return;
    awake = true;
    const wakeMusic = $('#wake-music');
    const playback = wakeMusic.play();
    $('#wake-status').textContent = 'Um bocejo… e a magia começa.';
    playback?.catch(error => {
      console.error('Não foi possível reproduzir a música do despertar.', error);
      $('#wake-status').textContent = 'A princesa vai acordar, mas não foi possível iniciar a música.';
    });
    sfxClick();
    ensureAudio();
    $('#wake-button').hidden = true;
    window.startAwakening();
  };

  window.addEventListener('princess-awake', () => {
    if (!awake) return;
    $('#intro').hidden = true;
    $('#adventure').hidden = false;
    show(0);
  });

  $('#restart').onclick = () => {
    if (confirm('Quer voltar ao começo da aventura?')) location.reload();
  };

  $('#continue').onclick = () => {
    sfxClick();
    show(stage === 6 ? 0 : stage + 1);
  };
  $('#skip').onclick = () => {
    sfxClick();
    show(stage + 1);
  };

  function show(n) {
    cleanup();
    cleanup = () => {};
    stage = n;
    const [label, title, copy, action] = stages[n];
    $('#scene-label').textContent = label;
    $('#scene-title').textContent = title;
    $('#intro-copy').textContent = copy;
    $('#game').replaceChildren();
    $('#status').textContent = '';
    $('#continue').textContent = action;
    $('#continue').hidden = false;
    $('#skip').hidden = true;
    $('#chapter-count').textContent = `${n + 1} / 7`;
    const journey = $('.journey');
    if (journey) journey.setAttribute('aria-valuenow', String(n + 1));
    $('#journey-fill').style.width = `${((n + 1) / 7) * 100}%`;
    $('#landscape').style.backgroundPosition =
      n === 3 ? 'left 65%' : n === 5 ? 'right 30%' : 'center 48%';

    // Re-trigger panel animation
    const panel = $('.panel');
    if (panel) {
      panel.style.animation = 'none';
      panel.offsetHeight;
      panel.style.animation = '';
    }

    if (n === 1) fireflies();
    if (n === 2) memory();
    if (n === 3) treasures();
    if (n === 4) puzzle();
    if (n === 5) letter();
    if (n === 6) {
      finale();
      burstConfetti(80);
      sfxWin();
    }
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'instant' });
  }

  function gameMode() {
    $('#continue').hidden = true;
    $('#skip').hidden = false;
  }

  function won(message) {
    $('#status').textContent = message;
    $('#continue').hidden = false;
    $('#skip').hidden = true;
    burstConfetti(45);
    sfxWin();
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ── Vaga-lumes ── */
  function fireflies() {
    gameMode();
    const field = document.createElement('div');
    field.className = 'garden-game';
    field.setAttribute('aria-label', 'Jardim com cinco vaga-lumes');
    $('#game').append(field);
    let caught = 0, raf, last = 0;
    const flies = [];

    for (let i = 0; i < 5; i++) {
      const b = document.createElement('button');
      b.className = 'firefly';
      b.innerHTML = '<span></span>';
      b.setAttribute('aria-label', `Capturar vaga-lume ${i + 1}`);
      const f = {
        b,
        x: 15 + Math.random() * 70,
        y: 18 + Math.random() * 62,
        a: Math.random() * 6.28,
        turn: 0,
        next: 0,
        v: 2 + Math.random() * 2.2,
        done: false,
      };
      flies.push(f);
      field.append(b);
      b.firstChild.style.animationDelay = `-${Math.random() * 4}s`;
      b.onclick = () => {
        if (f.done) return;
        f.done = true;
        b.classList.add('caught');
        setTimeout(() => { b.hidden = true; }, 350);
        caught++;
        sfxCatch();
        $('#status').textContent = `${caught} de 5 luzes encontradas`;
        if (caught === 5) {
          won('O caminho se iluminou. Você sempre traz luz para a minha vida.');
        }
      };
    }

    function animate(now) {
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;
      for (const f of flies) {
        if (f.done) continue;
        if (!reduced && document.activeElement !== f.b) {
          f.next -= dt;
          if (f.next <= 0) {
            f.turn = (Math.random() - 0.5) * 1.6;
            f.next = 1 + Math.random() * 2;
          }
          f.a += f.turn * dt;
          f.x += Math.cos(f.a) * f.v * dt;
          f.y += Math.sin(f.a) * f.v * dt;
          if (f.x < 8 || f.x > 92 || f.y < 12 || f.y > 88) {
            f.a = Math.atan2(50 - f.y, 50 - f.x);
            f.x = Math.max(8, Math.min(92, f.x));
            f.y = Math.max(12, Math.min(88, f.y));
          }
        }
        f.b.style.left = f.x + '%';
        f.b.style.top = f.y + '%';
      }
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    cleanup = () => cancelAnimationFrame(raf);
    $('#status').textContent = '0 de 5 luzes encontradas';
  }

  /* ── Memória ── */
  function memory() {
    gameMode();
    let first = null, busy = false, pairs = 0, tries = 0, timer;
    const grid = document.createElement('div');
    grid.className = 'memory';
    const values = shuffle([1, 2, 3, 4, 5, 1, 2, 3, 4, 5]);

    values.forEach((value, i) => {
      const b = document.createElement('button');
      b.className = 'memory-card';
      b.dataset.pair = value;
      b.setAttribute('aria-label', `Virar carta ${i + 1}`);
      b.innerHTML = `<span class="card-inner"><span class="card-back" aria-hidden="true">♛</span><img class="card-photo" src="assets/memoria-${value}.jpg" alt="Foto de Vinícius e Bruna" aria-hidden="true" loading="lazy"></span>`;

      b.onclick = () => {
        if (busy || b.classList.contains('matched') || b === first) return;
        b.classList.add('revealed');
        b.setAttribute('aria-label', `Carta ${i + 1}: lembrança ${value}`);
        sfxClick();

        if (!first) {
          first = b;
          return;
        }

        tries++;
        if (first.dataset.pair === b.dataset.pair) {
          [first, b].forEach(c => {
            c.classList.add('matched');
            c.disabled = true;
          });
          first = null;
          pairs++;
          sfxMatch();
          $('#status').textContent = `${pairs} de 5 pares · ${tries} tentativas`;
          if (pairs === 5) {
            won('Cinco lembranças, um carinho que só cresce.');
          }
        } else {
          busy = true;
          const previous = first;
          sfxMiss();
          timer = setTimeout(() => {
            previous.classList.remove('revealed');
            b.classList.remove('revealed');
            previous.setAttribute('aria-label', 'Virar carta');
            b.setAttribute('aria-label', `Virar carta ${i + 1}`);
            first = null;
            busy = false;
          }, 900);
          $('#status').textContent = `${pairs} de 5 pares · ${tries} tentativas`;
        }
      };
      grid.append(b);
    });
    $('#game').append(grid);
    $('#status').textContent = '0 de 5 pares';
    cleanup = () => clearTimeout(timer);
  }

  /* ── Presentes ── */
  function treasures() {
    gameMode();
    const field = document.createElement('div');
    field.className = 'garden-game';
    const clues = document.createElement('div');
    clues.className = 'clues';
    let found = 0;
    // Posições espalhadas e um pouco aleatórias
    const spots = [
      [18 + Math.random() * 6, 60 + Math.random() * 10],
      [55 + Math.random() * 12, 22 + Math.random() * 10],
      [78 + Math.random() * 8, 68 + Math.random() * 10],
    ];
    spots.forEach(([x, y], i) => {
      const b = document.createElement('button');
      b.className = 'treasure';
      b.style.left = x + '%';
      b.style.top = y + '%';
      b.textContent = '✦';
      b.setAttribute('aria-label', `Abrir presente ${i + 1}`);
      b.onclick = () => {
        if (b.disabled) return;
        b.disabled = true;
        b.classList.add('found');
        b.textContent = '♥';
        sfxCatch();
        const p = document.createElement('p');
        p.textContent = cfg.compliments[i];
        clues.append(p);
        found++;
        $('#status').textContent = `${found} de 3 presentes`;
        if (found === 3) {
          won('O porquinho guardou cada palavra para você.');
        }
      };
      field.append(b);
    });
    $('#game').append(field, clues);
    $('#status').textContent = '0 de 3 presentes';
  }

  /* ── Pergaminho ── */
  function puzzle() {
    gameMode();
    const words = ['O meu', 'lugar favorito', 'é onde', 'eu posso', 'estar', 'com você.'];
    let order = shuffle([0, 1, 2, 3, 4, 5]);
    let selected = null;
    // Evita começar já resolvido
    if (order.every((x, i) => x === i)) order.reverse();

    const grid = document.createElement('div');
    grid.className = 'puzzle';
    $('#game').append(grid);

    function paint() {
      grid.replaceChildren();
      order.forEach((value, i) => {
        const b = document.createElement('button');
        b.textContent = words[value];
        b.setAttribute('aria-label', `Posição ${i + 1}: ${words[value]}`);
        b.setAttribute('aria-pressed', String(selected === i));
        if (selected === i) b.className = 'selected';
        // Destaca peças que já estão no lugar certo (feedback visual)
        if (order[i] === i && selected === null) b.classList.add('correct');

        b.onclick = () => {
          if (order[i] === i && selected === null) return; // já correta
          sfxClick();
          if (selected === null) {
            selected = i;
            paint();
            grid.children[i]?.focus();
            return;
          }
          const old = selected;
          [order[old], order[i]] = [order[i], order[old]];
          selected = null;
          paint();
          grid.children[i]?.focus();

          if (order.every((v, k) => v === k)) {
            Array.from(grid.children).forEach(c => {
              c.disabled = true;
              c.classList.add('correct');
            });
            won('O meu lugar favorito é onde eu posso estar com você.');
          }
        };
        grid.append(b);
      });
    }
    paint();
  }

  /* ── Carta ── */
  function letter() {
    const paper = document.createElement('article');
    paper.className = 'letter';
    for (const text of cfg.letter) {
      const p = document.createElement('p');
      p.textContent = text;
      paper.append(p);
    }
    const sign = document.createElement('p');
    sign.className = 'signature';
    sign.textContent = cfg.signature;
    paper.append(sign);
    $('#game').append(paper);
  }

  /* ── Final ── */
  function finale() {
    const div = document.createElement('div');
    div.className = 'final-portrait';
    div.innerHTML =
      '<img src="assets/cavaleiro.webp" alt="Seu cavaleiro com uma carta" width="130" height="175">' +
      '<div class="awake-sprite" role="img" aria-label="A princesa e seu porquinho"></div>';
    $('#game').append(div);
  }
})();
