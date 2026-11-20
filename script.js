/* ============================================
   little moving things for jago-h.github.io
   ============================================ */

/* ---- 1. a fake live spectrogram ----
   draws a scrolling spectrogram with made-up dolphin whistles
   (smooth frequency sweeps) and frog calls (pulsed harmonic stacks).
   any <canvas class="scope"> on the page gets one. */
function startSpectrogram(canvas) {
  const W = 220, H = 80;              // low-res on purpose = chunky pixels
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  let t = 0;
  let whistle = null;   // {f0, len, age, wobble}
  let frog = null;      // {f, pulses, age}

  // colour map: black -> deep blue -> teal -> green -> yellow
  function colour(v) {
    v = Math.max(0, Math.min(1, v));
    const r = Math.floor(255 * Math.max(0, v * 2 - 1));
    const g = Math.floor(255 * Math.min(1, v * 1.6));
    const b = Math.floor(255 * Math.max(0, 0.7 - v) + 60 * v);
    return `rgb(${r},${g},${b})`;
  }

  function column() {
    // shift everything one pixel left
    const img = ctx.getImageData(1, 0, W - 1, H);
    ctx.putImageData(img, 0, 0);

    const col = new Float32Array(H);
    // background noise, louder at low frequencies (bottom)
    for (let y = 0; y < H; y++) {
      col[y] = Math.random() * 0.18 * (y / H) + 0.03;
    }

    // maybe start a dolphin whistle
    if (!whistle && Math.random() < 0.012) {
      whistle = { f0: 15 + Math.random() * 30, len: 40 + Math.random() * 60, age: 0,
                  wobble: 0.08 + Math.random() * 0.1, amp: 6 + Math.random() * 12 };
    }
    if (whistle) {
      const y = H - (whistle.f0 + whistle.amp * Math.sin(whistle.age * whistle.wobble) + whistle.age * 0.15);
      for (let h = 1; h <= 2; h++) {           // fundamental + one harmonic
        const yy = Math.round(H - (H - y) * h);
        if (yy >= 0 && yy < H) {
          col[yy] = Math.max(col[yy], h === 1 ? 0.95 : 0.5);
          if (yy + 1 < H) col[yy + 1] = Math.max(col[yy + 1], h === 1 ? 0.55 : 0.25);
        }
      }
      if (++whistle.age > whistle.len) whistle = null;
    }

    // maybe start a frog chorus burst
    if (!frog && Math.random() < 0.01) {
      frog = { f: 6 + Math.random() * 6, pulses: 4 + Math.floor(Math.random() * 6), age: 0 };
    }
    if (frog) {
      const on = (frog.age % 6) < 3;           // pulsed: 3 on, 3 off
      if (on) {
        for (let h = 1; h <= 6; h++) {
          const yy = Math.round(H - frog.f * h);
          if (yy >= 0 && yy < H) col[yy] = Math.max(col[yy], 0.85 - h * 0.08);
        }
      }
      frog.age++;
      if (frog.age > frog.pulses * 6) frog = null;
    }

    for (let y = 0; y < H; y++) {
      ctx.fillStyle = colour(col[y]);
      ctx.fillRect(W - 1, y, 1, 1);
    }
    t++;
  }

  for (let i = 0; i < W; i++) column();   // pre-fill so it never starts black
  setInterval(column, 45);
}

document.querySelectorAll('canvas.scope').forEach(startSpectrogram);


/* ---- 2. clock: what time is it in singapore right now ---- */
const clock = document.getElementById('sg-clock');
if (clock) {
  const tick = () => {
    clock.textContent = new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };
  tick();
  setInterval(tick, 1000);
}


/* ---- 3. typewriter for anything with data-type="..." ---- */
document.querySelectorAll('[data-type]').forEach(el => {
  const text = el.dataset.type;
  let i = 0;
  el.textContent = '';
  const step = () => {
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(step, 45 + Math.random() * 60);
  };
  setTimeout(step, 400);
});
