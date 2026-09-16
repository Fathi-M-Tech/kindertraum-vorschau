/* 1:1 aus Taste Library: bilderslider-rundung (erstes Script) */
/* =========================================================================
   Baustein-Skript: Vanilla-Slider ohne Abhängigkeit.
   Als IIFE gekapselt, keine globalen Namen, keine IDs — die Elemente werden
   über data-Attribute gefunden, damit mehrere Instanzen nebeneinander
   laufen können.
   ========================================================================= */
(() => {
  const WENIGER_BEWEGUNG = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('[data-bsr]').forEach((wurzel) => {
    const buehne  = wurzel.querySelector('[data-bsr-buehne]');
    const slides  = [...wurzel.querySelectorAll('[data-bsr-slide]')];
    const punkteL = wurzel.querySelector('[data-bsr-punkte]');
    const titelEl = wurzel.querySelector('.bsr__titel');
    const textEl  = wurzel.querySelector('[data-bsr-text-ziel]');
    const zaehler = wurzel.querySelector('[data-bsr-zaehler]');
    const status  = wurzel.querySelector('[data-bsr-status]');
    if (!buehne || slides.length < 2) return;

    let index = Math.max(0, slides.findIndex((s) => s.classList.contains('is-aktiv')));
    let autoplayAn = false;
    let timer = null;
    let pausiert = false;

    /* --- Punktreihe aufbauen ---------------------------------------------
       Die Punkte entstehen im JS, nicht im Markup: so kann die Anzahl nie
       von der Slide-Anzahl abweichen. Jeder Punkt ist ein echter <button>
       mit aria-current — Screenreader nennen damit den aktiven Punkt. */
    const punkte = [];
    if (punkteL) {
      slides.forEach((slide, i) => {
        const li = document.createElement('li');
        const b  = document.createElement('button');
        b.type = 'button';
        b.className = 'bsr__punkt';
        b.setAttribute('aria-label', 'Bild ' + (i + 1) + ' von ' + slides.length +
                       (slide.dataset.bsrTitel ? ': ' + slide.dataset.bsrTitel : ''));
        b.addEventListener('click', () => { halteAn(); zeige(i); });
        li.appendChild(b);
        punkteL.appendChild(li);
        punkte.push(b);
      });
    }

    /* Slides, die nicht aktiv sind, werden für Screenreader ausgeblendet.
       Sonst liest ein Screenreader alle vier Bildunterschriften am Stück,
       obwohl nur eine sichtbar ist. */
    const zeige = (neu) => {
      index = (neu + slides.length) % slides.length;
      slides.forEach((s, i) => {
        const aktiv = i === index;
        s.classList.toggle('is-aktiv', aktiv);
        s.setAttribute('aria-hidden', aktiv ? 'false' : 'true');
      });
      punkte.forEach((p, i) => p.setAttribute('aria-current', i === index ? 'true' : 'false'));

      const s = slides[index];
      if (titelEl && s.dataset.bsrTitel) titelEl.textContent = s.dataset.bsrTitel;
      /* Der Text kommt aus einem data-Attribut des Slides. Er darf ein <b>
         enthalten — deshalb innerHTML. Die Quelle ist eigenes Markup, kein
         Nutzereingang; bei fremden Daten gehörte hier textContent hin. */
      if (textEl && s.dataset.bsrText) textEl.innerHTML = s.dataset.bsrText;
      if (zaehler) zaehler.textContent = (index + 1) + ' / ' + slides.length;
      if (status) status.textContent = 'Bild ' + (index + 1) + ' von ' + slides.length +
        (s.dataset.bsrTitel ? ': ' + s.dataset.bsrTitel : '');
    };

    const vor     = () => zeige(index + 1);
    const zurueck = () => zeige(index - 1);

    /* --- Autoplay ---------------------------------------------------------
       Pause bei Hover UND bei Fokus im Baustein — beides ist Pflicht:
       Hover deckt die Maus ab, Fokus die Tastatur. Ohne die Fokus-Pause
       schaltet der Slider unter den Fingern eines Tastaturnutzers weiter.
       Bei prefers-reduced-motion startet Autoplay gar nicht erst. */
    const tick = () => {
      if (!autoplayAn || pausiert || document.hidden) return;
      vor();
    };
    const starteTimer = () => {
      stoppeTimer();
      const sek = parseFloat(getComputedStyle(wurzel).getPropertyValue('--bsr-autoplay')) || 5;
      timer = setInterval(tick, sek * 1000);
    };
    const stoppeTimer = () => { if (timer) { clearInterval(timer); timer = null; } };

    const setzeAutoplay = (an) => {
      autoplayAn = an && !WENIGER_BEWEGUNG.matches;
      if (autoplayAn) starteTimer(); else stoppeTimer();
    };
    /* Eine Nutzergeste beendet das Autoplay endgültig — wer selbst
       weiterschaltet, will nicht gleich darauf weitergeschoben werden. */
    const halteAn = () => setzeAutoplay(false);

    wurzel.addEventListener('pointerenter', () => { pausiert = true; });
    wurzel.addEventListener('pointerleave', () => { pausiert = false; });
    wurzel.addEventListener('focusin',  () => { pausiert = true; });
    wurzel.addEventListener('focusout', () => { pausiert = false; });

    /* --- Knöpfe ----------------------------------------------------------- */
    const bZur = wurzel.querySelector('[data-bsr-zurueck]');
    const bVor = wurzel.querySelector('[data-bsr-vor]');
    if (bZur) bZur.addEventListener('click', () => { halteAn(); zurueck(); });
    if (bVor) bVor.addEventListener('click', () => { halteAn(); vor(); });

    /* --- Tastatur ---------------------------------------------------------
       Die Bühne trägt tabindex="0" und hört auf Pfeiltasten, Pos1 und Ende.
       Genau dieser Teil fehlt dem Original vollständig. */
    buehne.addEventListener('keydown', (e) => {
      const taste = {
        ArrowLeft: zurueck, ArrowRight: vor,
        Home: () => zeige(0), End: () => zeige(slides.length - 1)
      }[e.key];
      if (!taste) return;
      e.preventDefault();
      halteAn();
      taste();
    });

    /* --- Wischgeste -------------------------------------------------------
       Pointer-Events statt Touch-Events: derselbe Code bedient Finger, Stift
       und Maus-Drag. setPointerCapture hält den Zeiger auch dann bei der
       Bühne, wenn er beim Ziehen darüber hinausläuft. */
    const SCHWELLE = 45;   /* px, ab denen die Geste als Wisch zählt */
    let startX = 0, startY = 0, zieht = false;

    buehne.addEventListener('pointerdown', (e) => {
      /* Klicks auf Pfeilknöpfe sind keine Wischgesten. */
      if (e.target.closest('[data-bsr-zurueck], [data-bsr-vor]')) return;
      zieht = true;
      startX = e.clientX;
      startY = e.clientY;
      buehne.setPointerCapture(e.pointerId);
    });

    buehne.addEventListener('pointerup', (e) => {
      if (!zieht) return;
      zieht = false;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      /* Nur waagerechte Gesten zählen: Math.abs(dy) > Math.abs(dx) heißt,
         der Nutzer wollte scrollen, nicht blättern. */
      if (Math.abs(dx) < SCHWELLE || Math.abs(dy) > Math.abs(dx)) return;
      halteAn();
      dx < 0 ? vor() : zurueck();
    });

    buehne.addEventListener('pointercancel', () => { zieht = false; });

    /* Im Hintergrundtab laufen Timer weiter — der Slider stünde beim
       Zurückkehren an einer zufälligen Stelle. Deshalb Timer neu ansetzen. */
    document.addEventListener('visibilitychange', () => {
      if (autoplayAn && !document.hidden) starteTimer();
    });

    zeige(index);
    wurzel._bsrAutoplay = setzeAutoplay;
  });
})();

// Live-Regler — nur Demo, gehört nicht zum Baustein.
(() => {
  const ziele = [...document.querySelectorAll('[data-bsr]')];
  if (!ziele.length) return;
  const haupt = ziele[0];
  const bind = (id, out, css, einheit, nurHaupt) => {
    const r = document.getElementById(id), o = document.getElementById(out);
    if (!r) return;
    const setze = () => {
      const v = r.value + (einheit || '');
      (nurHaupt ? [haupt] : ziele).forEach((z) => z.style.setProperty(css, v));
      if (o) o.textContent = v;
    };
    r.addEventListener('input', setze);
    setze();
  };
  bind('r-radius', 'o-radius', '--bsr-radius', 'px', true);
  bind('r-hoehe',  'o-hoehe',  '--bsr-hoehe',  'px', true);
  bind('r-dauer',  'o-dauer',  '--bsr-dauer',  'ms');
  bind('r-punkt',  'o-punkt',  '--bsr-punkt',  'px');

  const f = document.getElementById('r-akzent');
  if (f) f.addEventListener('input', () =>
    ziele.forEach((z) => z.style.setProperty('--bsr-akzent', f.value)));

  const a = document.getElementById('r-auto');
  if (a) a.addEventListener('change', () =>
    ziele.forEach((z) => z._bsrAutoplay && z._bsrAutoplay(a.checked)));
})();
