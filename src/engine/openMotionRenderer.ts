import {
  OpenMotionBrandKit,
  OpenMotionProject,
  OpenMotionScene,
  getProjectDurationSec,
} from '../types/openmotion';

function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v));
}

function easeOutExpo(t: number): number {
  const c = clamp(t);
  return c === 1 ? 1 : 1 - Math.pow(2, -10 * c);
}

function easeOutCubic(t: number): number {
  const c = clamp(t);
  return 1 - Math.pow(1 - c, 3);
}

function easeInOutCubic(t: number): number {
  const c = clamp(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : clean.padEnd(6, '0');
  const num = parseInt(full.slice(0, 6), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha)})`;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, Math.max(0, w / 2), Math.max(0, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function getSceneAtTime(
  project: OpenMotionProject,
  timeSec: number
): { scene: OpenMotionScene; sceneIndex: number; localTime: number; progress: number } {
  const total = Math.max(0.5, getProjectDurationSec(project));
  const clampedTime = ((timeSec % total) + total) % total;
  let elapsed = 0;

  for (let i = 0; i < project.scenes.length; i++) {
    const sc = project.scenes[i];
    const dur = Math.max(0.5, sc.durationSec);
    if (clampedTime < elapsed + dur || i === project.scenes.length - 1) {
      const localTime = Math.max(0, clampedTime - elapsed);
      return {
        scene: sc,
        sceneIndex: i,
        localTime,
        progress: clamp(localTime / dur),
      };
    }
    elapsed += dur;
  }

  return {
    scene: project.scenes[0],
    sceneIndex: 0,
    localTime: 0,
    progress: 0,
  };
}

function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  brand: OpenMotionBrandKit,
  scene: OpenMotionScene,
  globalTime: number
) {
  ctx.fillStyle = brand.backgroundColor;
  ctx.fillRect(0, 0, w, h);

  const scale = Math.min(w, h) / 1080;

  if (scene.backdrop === 'grid-architectural') {
    const step = Math.round(72 * scale);
    const driftX = (globalTime * 14 * scale) % step;
    ctx.strokeStyle = hexToRgba(brand.textColor, 0.055);
    ctx.lineWidth = Math.max(1, scale);

    ctx.beginPath();
    for (let x = -step + driftX; x < w + step; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y < h + step; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    const grad = ctx.createRadialGradient(
      w * 0.78,
      h * 0.22,
      0,
      w * 0.78,
      h * 0.22,
      Math.max(w, h) * 0.55
    );
    grad.addColorStop(0, hexToRgba(brand.primaryColor, 0.22));
    grad.addColorStop(1, hexToRgba(brand.primaryColor, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (scene.backdrop === 'radial-studio') {
    const cx = w * (0.5 + Math.sin(globalTime * 0.6) * 0.08);
    const cy = h * (0.35 + Math.cos(globalTime * 0.5) * 0.06);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.65);
    grad.addColorStop(0, hexToRgba(brand.primaryColor, 0.26));
    grad.addColorStop(0.55, hexToRgba(brand.accentColor, 0.09));
    grad.addColorStop(1, hexToRgba(brand.backgroundColor, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (scene.backdrop === 'waveform') {
    const bars = 36;
    const barGap = w / bars;
    ctx.fillStyle = hexToRgba(brand.primaryColor, 0.14);
    for (let i = 0; i < bars; i++) {
      const wave =
        0.35 +
        0.3 * Math.sin(globalTime * 3.1 + i * 0.42) +
        0.2 * Math.cos(globalTime * 1.9 - i * 0.27);
      const barH = h * 0.28 * clamp(wave, 0.1, 1);
      const bx = i * barGap + barGap * 0.25;
      const bw = Math.max(3 * scale, barGap * 0.45);
      drawRoundedRect(ctx, bx, h - barH - 40 * scale, bw, barH, bw / 2);
      ctx.fill();
    }
  } else if (scene.backdrop === 'swiss-lines') {
    ctx.strokeStyle = hexToRgba(brand.textColor, 0.08);
    ctx.lineWidth = Math.max(1, 1.5 * scale);
    const cols = 4;
    for (let i = 1; i < cols; i++) {
      const x = (w / cols) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    const accentY = h * 0.14;
    ctx.strokeStyle = hexToRgba(brand.primaryColor, 0.25);
    ctx.beginPath();
    ctx.moveTo(w * 0.06, accentY);
    ctx.lineTo(w * 0.94, accentY);
    ctx.stroke();
  } else if (scene.backdrop === 'dot-matrix') {
    const step = Math.round(52 * scale);
    const sweepX = ((globalTime * 220 * scale) % (w + 400 * scale)) - 200 * scale;
    for (let x = step / 2; x < w; x += step) {
      for (let y = step / 2; y < h; y += step) {
        const dist = Math.abs(x - sweepX);
        const boost = clamp(1 - dist / (260 * scale));
        ctx.fillStyle =
          boost > 0.15
            ? hexToRgba(brand.primaryColor, 0.12 + boost * 0.28)
            : hexToRgba(brand.textColor, 0.09);
        ctx.beginPath();
        ctx.arc(x, y, (1.8 + boost * 1.6) * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (scene.backdrop === 'orbital-rings') {
    const cx = w * 0.82;
    const cy = h * 0.46;
    const baseR = Math.min(w, h) * 0.26;
    for (let i = 0; i < 4; i++) {
      const r = baseR + i * 115 * scale;
      const startA = globalTime * (0.28 - i * 0.06) * (i % 2 === 0 ? 1 : -1);
      ctx.strokeStyle = hexToRgba(
        i % 2 === 0 ? brand.primaryColor : brand.accentColor,
        0.2 - i * 0.035
      );
      ctx.lineWidth = Math.max(1.5, 2 * scale);
      ctx.beginPath();
      ctx.arc(cx, cy, r, startA, startA + Math.PI * 1.35);
      ctx.stroke();
    }
  }
}

function drawChromeOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  project: OpenMotionProject,
  scene: OpenMotionScene,
  sceneIndex: number,
  globalTime: number
) {
  const brand = project.brandKit;
  const scale = Math.min(w, h) / 1080;
  const padX = w * 0.065;
  const topY = Math.max(46 * scale, h * 0.055);
  const totalSec = Math.max(0.5, getProjectDurationSec(project));
  const globalProgress = clamp(globalTime / totalSec);

  ctx.save();
  ctx.font = `600 ${Math.round(24 * scale)}px "${brand.fontFamily}", sans-serif`;
  ctx.fillStyle = brand.textColor;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(brand.brandName, padX, topY);

  ctx.font = `500 ${Math.round(20 * scale)}px "JetBrains Mono", monospace`;
  ctx.fillStyle = brand.mutedColor;
  ctx.textAlign = 'right';
  const sceneCounter = `${String(sceneIndex + 1).padStart(2, '0')} / ${String(
    project.scenes.length
  ).padStart(2, '0')}`;
  ctx.fillText(sceneCounter, w - padX, topY);

  if (scene.caption) {
    const captionY = h - Math.max(66 * scale, h * 0.065);
    ctx.font = `500 ${Math.round(23 * scale)}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = hexToRgba(brand.textColor, 0.85);
    ctx.textAlign = 'center';
    ctx.fillText(scene.caption, w / 2, captionY, w - padX * 2);
  }

  const barH = Math.max(4, Math.round(6 * scale));
  ctx.fillStyle = hexToRgba(brand.textColor, 0.12);
  ctx.fillRect(0, h - barH, w, barH);
  ctx.fillStyle = brand.primaryColor;
  ctx.fillRect(0, h - barH, w * globalProgress, barH);
  ctx.restore();
}

function animateMetricNumber(rawValue: string, progress: number): string {
  const match = rawValue.match(/^([^0-9.-]*)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!match) return rawValue;
  const [, prefix, numStr, suffix] = match;
  const target = parseFloat(numStr);
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  const eased = easeOutCubic(progress);
  const current = target * eased;
  return `${prefix}${current.toFixed(decimals)}${suffix}`;
}

export function renderOpenMotionFrame(
  ctx: CanvasRenderingContext2D,
  project: OpenMotionProject,
  timeSec: number,
  targetWidth?: number,
  targetHeight?: number
): void {
  const w = targetWidth ?? ctx.canvas.width;
  const h = targetHeight ?? ctx.canvas.height;
  const isPortrait = h > w * 1.1;
  const isSquare = Math.abs(w - h) <= Math.max(w, h) * 0.12;
  const scale = Math.min(w, h) / 1080;
  const brand = project.brandKit;
  const totalSec = Math.max(0.5, getProjectDurationSec(project));
  const safeTime = clamp(timeSec, 0, totalSec);
  const { scene, sceneIndex, localTime, progress } = getSceneAtTime(project, safeTime);

  ctx.save();
  ctx.clearRect(0, 0, w, h);

  // 1. Backdrop
  drawBackdrop(ctx, w, h, brand, scene, safeTime);

  // 2. Scene entrance & exit envelope
  const enterT = easeOutExpo(clamp(localTime / 0.55));
  const exitWindow = 0.26;
  const remaining = Math.max(0, scene.durationSec - localTime);
  const exitT = remaining < exitWindow ? clamp(remaining / exitWindow) : 1;
  const alpha = enterT * exitT;

  let offsetX = 0;
  let offsetY = 0;
  let zoomScale = 1;

  if (scene.transition === 'slide-up') {
    offsetY = (1 - enterT) * 52 * scale;
  } else if (scene.transition === 'wipe-left') {
    offsetX = (1 - enterT) * 68 * scale;
  } else if (scene.transition === 'zoom') {
    zoomScale = 0.94 + enterT * 0.06;
  }

  ctx.save();
  ctx.globalAlpha = clamp(alpha, 0, 1);
  ctx.translate(w / 2 + offsetX, h / 2 + offsetY);
  ctx.scale(zoomScale, zoomScale);
  ctx.translate(-w / 2, -h / 2);

  const padX = w * 0.075;
  const contentW = w - padX * 2;
  const displayFont = `"${brand.fontFamily}", "Plus Jakarta Sans", sans-serif`;
  const bodyFont = `"Plus Jakarta Sans", sans-serif`;
  const monoFont = `"JetBrains Mono", monospace`;

  if (scene.layout === 'hero-kinetic') {
    const centerY = h * 0.48;
    let cursorY = centerY - (isPortrait ? 190 : 120) * scale;

    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round((isPortrait ? 26 : 24) * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(scene.eyebrow, padX, cursorY);
      cursorY += 52 * scale;
    }

    const headSize = Math.round((isPortrait ? 78 : isSquare ? 74 : 84) * scale);
    ctx.font = `700 ${headSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    ctx.textAlign = 'left';
    const lines = wrapText(ctx, scene.headline, contentW * (isPortrait ? 0.98 : 0.88));
    const lineHeight = headSize * 1.12;

    lines.forEach((line, idx) => {
      const lineReveal = easeOutExpo(clamp((localTime - idx * 0.09) / 0.5));
      ctx.save();
      ctx.globalAlpha = clamp(alpha * lineReveal);
      ctx.fillText(line, padX, cursorY + idx * lineHeight + (1 - lineReveal) * 24 * scale);
      ctx.restore();
    });
    cursorY += lines.length * lineHeight + 34 * scale;

    const barW = 140 * scale * easeOutExpo(clamp((localTime - 0.18) / 0.55));
    ctx.fillStyle = brand.primaryColor;
    ctx.fillRect(padX, cursorY, barW, 5 * scale);
    cursorY += 34 * scale;

    if (scene.subheadline) {
      const subReveal = easeOutCubic(clamp((localTime - 0.28) / 0.5));
      ctx.save();
      ctx.globalAlpha = clamp(alpha * subReveal);
      const subSize = Math.round((isPortrait ? 34 : 30) * scale);
      ctx.font = `400 ${subSize}px ${bodyFont}`;
      ctx.fillStyle = brand.mutedColor;
      const subLines = wrapText(ctx, scene.subheadline, contentW * 0.82);
      subLines.forEach((sl, idx) => {
        ctx.fillText(sl, padX, cursorY + idx * subSize * 1.45);
      });
      ctx.restore();
    }
  } else if (scene.layout === 'step-tutorial') {
    // Modeled after nexu-io/openmotion's openmotion-step-by-step-tutorial recipe
    const stepNum = scene.stepNumber ?? sceneIndex + 1;
    const totalSteps = scene.totalSteps ?? Math.max(stepNum, project.scenes.length);
    const segY = h * (isPortrait ? 0.12 : 0.14);
    const segGap = 14 * scale;
    const segW = (contentW - segGap * (totalSteps - 1)) / totalSteps;
    const segH = 8 * scale;

    for (let i = 0; i < totalSteps; i++) {
      const sx = padX + i * (segW + segGap);
      drawRoundedRect(ctx, sx, segY, segW, segH, 4 * scale);
      ctx.fillStyle = hexToRgba(brand.textColor, 0.14);
      ctx.fill();

      if (i < stepNum - 1) {
        drawRoundedRect(ctx, sx, segY, segW, segH, 4 * scale);
        ctx.fillStyle = brand.primaryColor;
        ctx.fill();
      } else if (i === stepNum - 1) {
        const fillW = segW * clamp(progress);
        drawRoundedRect(ctx, sx, segY, Math.max(segH, fillW), segH, 4 * scale);
        ctx.fillStyle = brand.accentColor;
        ctx.fill();
      }
    }

    const cardY = segY + (isPortrait ? 72 : 56) * scale;
    const cardH = h * (isPortrait ? 0.58 : 0.6);
    drawRoundedRect(ctx, padX, cardY, contentW, cardH, 26 * scale);
    ctx.fillStyle = brand.surfaceColor;
    ctx.fill();
    ctx.strokeStyle = hexToRgba(brand.textColor, 0.12);
    ctx.lineWidth = Math.max(1.5, 1.5 * scale);
    ctx.stroke();

    const innerPad = (isPortrait ? 52 : 56) * scale;
    const numReveal = easeOutExpo(clamp(localTime / 0.55));
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Large architectural editorial step number
    ctx.font = `700 ${Math.round((isPortrait ? 148 : 138) * scale)}px ${displayFont}`;
    ctx.fillStyle = brand.primaryColor;
    ctx.fillText(
      String(stepNum).padStart(2, '0'),
      padX + innerPad,
      cardY + innerPad + (1 - numReveal) * 26 * scale
    );

    const textStartX = isPortrait ? padX + innerPad : padX + innerPad + 230 * scale;
    const textStartY = isPortrait ? cardY + innerPad + 178 * scale : cardY + innerPad + 10 * scale;
    const textMaxW = isPortrait ? contentW - innerPad * 2 : contentW - innerPad * 2 - 230 * scale;

    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(22 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.fillText(scene.eyebrow, textStartX, textStartY);
    }

    const headSize = Math.round((isPortrait ? 56 : 54) * scale);
    ctx.font = `700 ${headSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    const hLines = wrapText(ctx, scene.headline, textMaxW);
    const hY = textStartY + (scene.eyebrow ? 42 * scale : 0);
    hLines.forEach((line, idx) => {
      ctx.fillText(line, textStartX, hY + idx * headSize * 1.15);
    });

    if (scene.subheadline) {
      const sY = hY + hLines.length * headSize * 1.15 + 24 * scale;
      const subSize = Math.round((isPortrait ? 30 : 27) * scale);
      ctx.font = `400 ${subSize}px ${bodyFont}`;
      ctx.fillStyle = brand.mutedColor;
      const sLines = wrapText(ctx, scene.subheadline, textMaxW);
      sLines.forEach((line, idx) => {
        ctx.fillText(line, textStartX, sY + idx * subSize * 1.48);
      });
    }

    if (scene.stepTip) {
      const tipH = 74 * scale;
      const tipY = cardY + cardH - innerPad - tipH;
      drawRoundedRect(ctx, padX + innerPad, tipY, contentW - innerPad * 2, tipH, 14 * scale);
      ctx.fillStyle = hexToRgba(brand.primaryColor, 0.14);
      ctx.fill();
      ctx.font = `500 ${Math.round(23 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.textColor;
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `Tip: ${scene.stepTip}`,
        padX + innerPad + 26 * scale,
        tipY + tipH / 2,
        contentW - innerPad * 2 - 52 * scale
      );
    }
  } else if (scene.layout === 'data-rings') {
    const startY = h * 0.15;
    let cursorY = startY;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(22 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.fillText(scene.eyebrow, padX, cursorY);
      cursorY += 38 * scale;
    }

    const headSize = Math.round((isPortrait ? 52 : 50) * scale);
    ctx.font = `700 ${headSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    const hLines = wrapText(ctx, scene.headline, contentW);
    hLines.forEach((l, i) => ctx.fillText(l, padX, cursorY + i * headSize * 1.15));
    cursorY += hLines.length * headSize * 1.15 + 42 * scale;

    const rings = scene.rings ?? [
      { label: 'Render Nauwkeurigheid', percent: 99, sublabel: 'Frame-lock' },
      { label: 'Brand Consistentie', percent: 94, sublabel: 'Tokens' },
      { label: 'Tijdwinst Team', percent: 78, sublabel: 'Geautomatiseerd' },
    ];

    const ringCount = Math.min(3, rings.length);
    const gap = 28 * scale;
    const ringCardW = isPortrait ? contentW : (contentW - gap * (ringCount - 1)) / ringCount;
    const ringCardH = (isPortrait ? 200 : 320) * scale;
    const chartAnim = easeOutCubic(clamp((localTime - 0.12) / 1.25));

    rings.slice(0, 3).forEach((ring, idx) => {
      const rx = isPortrait ? padX : padX + idx * (ringCardW + gap);
      const ry = isPortrait ? cursorY + idx * (ringCardH + 20 * scale) : cursorY;

      drawRoundedRect(ctx, rx, ry, ringCardW, ringCardH, 20 * scale);
      ctx.fillStyle = brand.surfaceColor;
      ctx.fill();
      ctx.strokeStyle = hexToRgba(brand.textColor, 0.11);
      ctx.lineWidth = Math.max(1, 1.5 * scale);
      ctx.stroke();

      const radius = (isPortrait ? 64 : 84) * scale;
      const cx = isPortrait ? rx + 110 * scale : rx + ringCardW / 2;
      const cy = isPortrait ? ry + ringCardH / 2 : ry + 126 * scale;
      const strokeW = 14 * scale;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = hexToRgba(brand.textColor, 0.12);
      ctx.lineWidth = strokeW;
      ctx.stroke();

      const currentPct = ring.percent * chartAnim;
      const endAngle = -Math.PI / 2 + (Math.PI * 2 * clamp(currentPct / 100));
      ctx.beginPath();
      ctx.arc(cx, cy, radius, -Math.PI / 2, endAngle);
      ctx.strokeStyle = idx % 2 === 0 ? brand.primaryColor : brand.accentColor;
      ctx.lineWidth = strokeW;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.font = `700 ${Math.round((isPortrait ? 34 : 40) * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(currentPct)}%`, cx, cy);

      if (isPortrait) {
        ctx.textAlign = 'left';
        ctx.font = `600 ${Math.round(28 * scale)}px ${displayFont}`;
        ctx.fillText(ring.label, rx + 210 * scale, ry + ringCardH / 2 - 14 * scale);
        if (ring.sublabel) {
          ctx.font = `400 ${Math.round(22 * scale)}px ${bodyFont}`;
          ctx.fillStyle = brand.mutedColor;
          ctx.fillText(ring.sublabel, rx + 210 * scale, ry + ringCardH / 2 + 24 * scale);
        }
      } else {
        ctx.textAlign = 'center';
        ctx.font = `600 ${Math.round(24 * scale)}px ${displayFont}`;
        ctx.fillStyle = brand.textColor;
        ctx.fillText(ring.label, rx + ringCardW / 2, ry + 246 * scale, ringCardW - 36 * scale);
        if (ring.sublabel) {
          ctx.font = `400 ${Math.round(19 * scale)}px ${monoFont}`;
          ctx.fillStyle = brand.mutedColor;
          ctx.fillText(ring.sublabel, rx + ringCardW / 2, ry + 282 * scale, ringCardW - 36 * scale);
        }
      }
    });

    // Optional horizontal comparison bars below the rings on landscape / square
    const bars = scene.bars ?? [];
    if (bars.length > 0 && !isPortrait) {
      const barTopY = cursorY + ringCardH + 34 * scale;
      const barBoxH = h - barTopY - 96 * scale;
      if (barBoxH > 120 * scale) {
        drawRoundedRect(ctx, padX, barTopY, contentW, barBoxH, 18 * scale);
        ctx.fillStyle = brand.surfaceColor;
        ctx.fill();
        ctx.strokeStyle = hexToRgba(brand.textColor, 0.11);
        ctx.stroke();

        const rowH = (barBoxH - 44 * scale) / Math.min(3, bars.length);
        bars.slice(0, 3).forEach((b, i) => {
          const by = barTopY + 26 * scale + i * rowH;
          const maxV = b.maxValue ?? 100;
          const pct = clamp((b.value / maxV) * chartAnim);

          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.font = `500 ${Math.round(20 * scale)}px ${bodyFont}`;
          ctx.fillStyle = brand.textColor;
          ctx.fillText(b.label, padX + 32 * scale, by + rowH / 2);

          const trackX = padX + contentW * 0.34;
          const trackW = contentW * 0.5;
          const trackH = 14 * scale;
          drawRoundedRect(ctx, trackX, by + rowH / 2 - trackH / 2, trackW, trackH, 7 * scale);
          ctx.fillStyle = hexToRgba(brand.textColor, 0.1);
          ctx.fill();

          drawRoundedRect(
            ctx,
            trackX,
            by + rowH / 2 - trackH / 2,
            Math.max(trackH, trackW * pct),
            trackH,
            7 * scale
          );
          ctx.fillStyle = i === 0 ? brand.primaryColor : brand.accentColor;
          ctx.fill();

          ctx.textAlign = 'right';
          ctx.font = `600 ${Math.round(20 * scale)}px ${monoFont}`;
          ctx.fillStyle = brand.textColor;
          ctx.fillText(b.displayValue, padX + contentW - 32 * scale, by + rowH / 2);
        });
      }
    }
  } else if (scene.layout === 'ui-mockup') {
    const mock = scene.mockup ?? {
      windowTitle: 'OpenMotion Studio',
      urlBar: 'openmotion.github.io/studio',
      activeTab: 'MP4 Render Queue',
      primaryMetricLabel: 'Export Snelheid',
      primaryMetricValue: '60 fps H.264',
      statusText: 'Klaar voor GitHub Pages',
      rows: [
        { name: 'launch-reel-16x9.mp4', meta: '1920×1080 · 12s', status: 'Gereed' },
        { name: 'product-shorts-9x16.mp4', meta: '1080×1920 · 10s', status: 'Renderen' },
        { name: 'linkedin-square-1x1.mp4', meta: '1080×1080 · 9s', status: 'In wachtrij' },
      ],
    };

    const startY = h * 0.14;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(21 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.fillText(scene.eyebrow, padX, startY);
    }

    const headSize = Math.round((isPortrait ? 48 : 46) * scale);
    ctx.font = `700 ${headSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    ctx.fillText(scene.headline, padX, startY + 34 * scale, contentW);

    const winY = startY + 112 * scale;
    const winH = h - winY - 108 * scale;
    drawRoundedRect(ctx, padX, winY, contentW, winH, 22 * scale);
    ctx.fillStyle = brand.surfaceColor;
    ctx.fill();
    ctx.strokeStyle = hexToRgba(brand.textColor, 0.16);
    ctx.lineWidth = Math.max(1.5, 1.5 * scale);
    ctx.stroke();

    // Browser Chrome Bar
    const barH = 58 * scale;
    ctx.fillStyle = hexToRgba(brand.textColor, 0.05);
    ctx.fillRect(padX, winY, contentW, barH);

    // Address bar pill inside mockup browser
    const addrW = contentW * 0.44;
    const addrH = 34 * scale;
    drawRoundedRect(ctx, padX + contentW / 2 - addrW / 2, winY + 12 * scale, addrW, addrH, 8 * scale);
    ctx.fillStyle = hexToRgba(brand.backgroundColor, 0.75);
    ctx.fill();

    ctx.font = `500 ${Math.round(17 * scale)}px ${monoFont}`;
    ctx.fillStyle = brand.mutedColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(mock.urlBar, padX + contentW / 2, winY + barH / 2, addrW - 24 * scale);

    ctx.textAlign = 'left';
    ctx.fillStyle = brand.textColor;
    ctx.font = `600 ${Math.round(18 * scale)}px ${bodyFont}`;
    ctx.fillText(mock.windowTitle, padX + 28 * scale, winY + barH / 2);

    // Inner dashboard area
    const bodyX = padX + 34 * scale;
    const bodyY = winY + barH + 30 * scale;
    const bodyW = contentW - 68 * scale;

    // Top summary strip inside app mockup
    const kpiH = 104 * scale;
    drawRoundedRect(ctx, bodyX, bodyY, bodyW, kpiH, 14 * scale);
    ctx.fillStyle = hexToRgba(brand.primaryColor, 0.12);
    ctx.fill();

    ctx.textBaseline = 'top';
    ctx.font = `500 ${Math.round(18 * scale)}px ${bodyFont}`;
    ctx.fillStyle = brand.mutedColor;
    ctx.fillText(mock.primaryMetricLabel, bodyX + 26 * scale, bodyY + 18 * scale);

    ctx.font = `700 ${Math.round(34 * scale)}px ${monoFont}`;
    ctx.fillStyle = brand.textColor;
    ctx.fillText(mock.primaryMetricValue, bodyX + 26 * scale, bodyY + 46 * scale);

    ctx.textAlign = 'right';
    ctx.font = `600 ${Math.round(19 * scale)}px ${monoFont}`;
    ctx.fillStyle = brand.accentColor;
    ctx.fillText(mock.statusText, bodyX + bodyW - 26 * scale, bodyY + 44 * scale);

    // Animated rows with sequential highlight
    const activeRowIdx = Math.min(
      mock.rows.length - 1,
      Math.floor(progress * (mock.rows.length + 0.5))
    );
    const rowsStartY = bodyY + kpiH + 26 * scale;
    const rowH = 74 * scale;
    const rowGap = 14 * scale;

    mock.rows.slice(0, 4).forEach((row, idx) => {
      const ry = rowsStartY + idx * (rowH + rowGap);
      if (ry + rowH > winY + winH - 18 * scale) return;
      const isRowActive = idx === activeRowIdx;
      const rowReveal = easeOutExpo(clamp((localTime - 0.18 - idx * 0.12) / 0.45));

      ctx.save();
      ctx.globalAlpha = clamp(alpha * rowReveal);
      drawRoundedRect(ctx, bodyX, ry, bodyW, rowH, 12 * scale);
      ctx.fillStyle = isRowActive
        ? hexToRgba(brand.primaryColor, 0.22)
        : hexToRgba(brand.backgroundColor, 0.45);
      ctx.fill();
      if (isRowActive) {
        ctx.strokeStyle = brand.primaryColor;
        ctx.lineWidth = Math.max(1.5, 2 * scale);
        ctx.stroke();
      }

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = `600 ${Math.round(21 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.textColor;
      ctx.fillText(row.name, bodyX + 24 * scale, ry + rowH / 2 - 11 * scale);

      ctx.font = `400 ${Math.round(17 * scale)}px ${bodyFont}`;
      ctx.fillStyle = brand.mutedColor;
      ctx.fillText(row.meta, bodyX + 24 * scale, ry + rowH / 2 + 16 * scale);

      ctx.textAlign = 'right';
      ctx.font = `600 ${Math.round(18 * scale)}px ${monoFont}`;
      ctx.fillStyle = isRowActive ? brand.accentColor : brand.mutedColor;
      ctx.fillText(row.status, bodyX + bodyW - 24 * scale, ry + rowH / 2);
      ctx.restore();
    });

    // Animated synthetic pointer moving across active row
    const ptrProgress = easeInOutCubic(clamp((progress - 0.1) / 0.75));
    const ptrX = bodyX + bodyW * (0.25 + ptrProgress * 0.52);
    const ptrY = rowsStartY + activeRowIdx * (rowH + rowGap) + rowH * 0.55;
    ctx.save();
    ctx.translate(ptrX, ptrY);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 28 * scale);
    ctx.lineTo(9 * scale, 21 * scale);
    ctx.lineTo(22 * scale, 21 * scale);
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = Math.max(1.5, 2 * scale);
    ctx.stroke();
    ctx.restore();
  } else if (scene.layout === 'before-after') {
    const comp = scene.comparison ?? {
      beforeLabel: 'VOOR · HANDMATIG',
      beforeTitle: 'Statische video zonder broncode',
      beforePoints: ['Tekst niet meer aanpasbaar', 'Uren opnieuw monteren per merk'],
      afterLabel: 'NA · OPENMOTION REMIX',
      afterTitle: 'Video-as-Code met Brand Kit',
      afterPoints: ['100% bewerkbare JSON & scènes', 'Directe H.264 MP4 op GitHub Pages'],
    };

    const startY = h * 0.15;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(21 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.fillText(scene.eyebrow, padX, startY);
    }

    const headSize = Math.round((isPortrait ? 50 : 48) * scale);
    ctx.font = `700 ${headSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    const hLines = wrapText(ctx, scene.headline, contentW);
    hLines.forEach((l, i) => ctx.fillText(l, padX, startY + 34 * scale + i * headSize * 1.15));

    const panelY = startY + 52 * scale + hLines.length * headSize * 1.15;
    const panelH = h - panelY - 108 * scale;
    const gap = 24 * scale;

    const afterReveal = easeOutExpo(clamp((localTime - 0.55) / 0.75));
    const colW = isPortrait ? contentW : (contentW - gap) / 2;
    const colH = isPortrait ? (panelH - gap) / 2 : panelH;

    // BEFORE Card
    drawRoundedRect(ctx, padX, panelY, colW, colH, 20 * scale);
    ctx.fillStyle = hexToRgba(brand.surfaceColor, 0.72);
    ctx.fill();
    ctx.strokeStyle = hexToRgba(brand.textColor, 0.12);
    ctx.lineWidth = Math.max(1.5, 1.5 * scale);
    ctx.stroke();

    const ip = 34 * scale;
    ctx.font = `600 ${Math.round(19 * scale)}px ${monoFont}`;
    ctx.fillStyle = brand.mutedColor;
    ctx.fillText(comp.beforeLabel, padX + ip, panelY + ip);

    ctx.font = `700 ${Math.round(30 * scale)}px ${displayFont}`;
    ctx.fillStyle = hexToRgba(brand.textColor, 0.75);
    const bTitleLines = wrapText(ctx, comp.beforeTitle, colW - ip * 2);
    bTitleLines.forEach((l, i) => ctx.fillText(l, padX + ip, panelY + ip + 40 * scale + i * 38 * scale));

    const bListY = panelY + ip + 64 * scale + bTitleLines.length * 38 * scale;
    ctx.font = `400 ${Math.round(22 * scale)}px ${bodyFont}`;
    ctx.fillStyle = brand.mutedColor;
    comp.beforePoints.slice(0, 3).forEach((pt, i) => {
      ctx.fillText(`—  ${pt}`, padX + ip, bListY + i * 48 * scale, colW - ip * 2);
    });

    // AFTER Card (animated reveal)
    const afterX = isPortrait ? padX : padX + colW + gap;
    const afterY = isPortrait ? panelY + colH + gap : panelY;

    ctx.save();
    ctx.globalAlpha = clamp(alpha * afterReveal);
    ctx.translate(0, (1 - afterReveal) * 28 * scale);
    drawRoundedRect(ctx, afterX, afterY, colW, colH, 20 * scale);
    ctx.fillStyle = brand.surfaceColor;
    ctx.fill();
    ctx.strokeStyle = brand.primaryColor;
    ctx.lineWidth = Math.max(2, 2.5 * scale);
    ctx.stroke();

    ctx.font = `600 ${Math.round(19 * scale)}px ${monoFont}`;
    ctx.fillStyle = brand.accentColor;
    ctx.fillText(comp.afterLabel, afterX + ip, afterY + ip);

    ctx.font = `700 ${Math.round(30 * scale)}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    const aTitleLines = wrapText(ctx, comp.afterTitle, colW - ip * 2);
    aTitleLines.forEach((l, i) => ctx.fillText(l, afterX + ip, afterY + ip + 40 * scale + i * 38 * scale));

    const aListY = afterY + ip + 64 * scale + aTitleLines.length * 38 * scale;
    ctx.font = `500 ${Math.round(22 * scale)}px ${bodyFont}`;
    ctx.fillStyle = brand.textColor;
    comp.afterPoints.slice(0, 3).forEach((pt, i) => {
      ctx.fillText(`+  ${pt}`, afterX + ip, aListY + i * 48 * scale, colW - ip * 2);
    });
    ctx.restore();
  } else if (scene.layout === 'waveform-captions') {
    const words =
      scene.spokenWords && scene.spokenWords.length > 0
        ? scene.spokenWords
        : scene.headline.split(/\s+/);
    const activeWordIdx = Math.min(words.length - 1, Math.floor(progress * words.length));

    // Top eyebrow
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(22 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.fillText(scene.eyebrow, w / 2, h * 0.16);
    }

    // Live 32-band symmetrical audio spectrum in upper middle
    const bands = 32;
    const specW = contentW * (isPortrait ? 0.92 : 0.72);
    const specStartX = (w - specW) / 2;
    const specCenterY = h * (isPortrait ? 0.36 : 0.37);
    const bandStep = specW / bands;

    for (let i = 0; i < bands; i++) {
      const distFromMid = Math.abs(i - (bands - 1) / 2) / (bands / 2);
      const envelope = 1 - distFromMid * 0.65;
      const energy =
        (0.28 +
          0.42 * Math.abs(Math.sin(safeTime * 6.8 + i * 0.55)) +
          0.3 * Math.abs(Math.cos(safeTime * 4.2 - i * 0.35))) *
        envelope;
      const barH = Math.max(14 * scale, energy * (isPortrait ? 240 : 190) * scale);
      const bx = specStartX + i * bandStep + bandStep * 0.2;
      const bw = Math.max(5 * scale, bandStep * 0.56);

      drawRoundedRect(ctx, bx, specCenterY - barH / 2, bw, barH, bw / 2);
      ctx.fillStyle = i % 3 === 0 ? brand.accentColor : brand.primaryColor;
      ctx.fill();
    }

    // Word-by-word kinetic highlighted captions
    const wordFontSize = Math.round((isPortrait ? 62 : 56) * scale);
    ctx.font = `700 ${wordFontSize}px ${displayFont}`;
    ctx.textBaseline = 'middle';
    const maxLineW = contentW * 0.88;
    const spaceW = ctx.measureText(' ').width;

    // Group words into wrapped lines preserving indices
    const captionLines: Array<Array<{ word: string; idx: number; width: number }>> = [];
    let currentLine: Array<{ word: string; idx: number; width: number }> = [];
    let lineW = 0;

    words.forEach((word, idx) => {
      const ww = ctx.measureText(word).width;
      if (currentLine.length > 0 && lineW + spaceW + ww > maxLineW) {
        captionLines.push(currentLine);
        currentLine = [{ word, idx, width: ww }];
        lineW = ww;
      } else {
        currentLine.push({ word, idx, width: ww });
        lineW += (currentLine.length > 1 ? spaceW : 0) + ww;
      }
    });
    if (currentLine.length > 0) captionLines.push(currentLine);

    const lineHeight = wordFontSize * 1.38;
    const captionTopY = h * (isPortrait ? 0.57 : 0.61);

    captionLines.forEach((line, lIdx) => {
      const totalLineW =
        line.reduce((acc, item) => acc + item.width, 0) + spaceW * Math.max(0, line.length - 1);
      let cx = (w - totalLineW) / 2;
      const cy = captionTopY + lIdx * lineHeight;

      line.forEach((item) => {
        const isCurrent = item.idx === activeWordIdx;
        const isSpoken = item.idx < activeWordIdx;

        if (isCurrent) {
          drawRoundedRect(
            ctx,
            cx - 12 * scale,
            cy - wordFontSize * 0.58,
            item.width + 24 * scale,
            wordFontSize * 1.16,
            12 * scale
          );
          ctx.fillStyle = brand.primaryColor;
          ctx.fill();
        }

        ctx.textAlign = 'left';
        ctx.fillStyle = isCurrent
          ? '#FFFFFF'
          : isSpoken
            ? brand.textColor
            : hexToRgba(brand.textColor, 0.34);
        ctx.fillText(item.word, cx, cy);
        cx += item.width + spaceW;
      });
    });
  } else if (scene.layout === 'timeline-roadmap') {
    const items = scene.timeline ?? [
      { date: 'Q1 2026', title: 'Video-as-Code Basis', detail: 'OpenMotion JSON & Brand Kits' },
      { date: 'Q2 2026', title: 'ChatGPT MCP Koppeling', detail: 'Automatische GitHub commits' },
      { date: 'Q3 2026', title: 'GitHub Pages MP4', detail: 'WebCodecs H.264 export' },
    ];

    const startY = h * 0.16;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(21 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.fillText(scene.eyebrow, padX, startY);
    }

    const headSize = Math.round((isPortrait ? 52 : 52) * scale);
    ctx.font = `700 ${headSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    ctx.fillText(scene.headline, padX, startY + 34 * scale, contentW);

    const drawProgress = easeOutCubic(clamp((localTime - 0.1) / 1.35));

    if (isPortrait) {
      const trackX = padX + 26 * scale;
      const trackTop = startY + 150 * scale;
      const stepH = (h - trackTop - 160 * scale) / Math.max(1, items.length);

      ctx.strokeStyle = hexToRgba(brand.textColor, 0.14);
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.moveTo(trackX, trackTop);
      ctx.lineTo(trackX, trackTop + stepH * (items.length - 1));
      ctx.stroke();

      ctx.strokeStyle = brand.primaryColor;
      ctx.beginPath();
      ctx.moveTo(trackX, trackTop);
      ctx.lineTo(trackX, trackTop + stepH * (items.length - 1) * drawProgress);
      ctx.stroke();

      items.slice(0, 4).forEach((it, idx) => {
        const ny = trackTop + idx * stepH;
        const nodeT = easeOutExpo(clamp((localTime - 0.15 - idx * 0.18) / 0.5));
        ctx.save();
        ctx.globalAlpha = clamp(alpha * nodeT);
        ctx.beginPath();
        ctx.arc(trackX, ny, 14 * scale, 0, Math.PI * 2);
        ctx.fillStyle = brand.primaryColor;
        ctx.fill();

        ctx.font = `600 ${Math.round(21 * scale)}px ${monoFont}`;
        ctx.fillStyle = brand.accentColor;
        ctx.fillText(it.date, trackX + 42 * scale, ny - 14 * scale);

        ctx.font = `700 ${Math.round(30 * scale)}px ${displayFont}`;
        ctx.fillStyle = brand.textColor;
        ctx.fillText(it.title, trackX + 42 * scale, ny + 18 * scale, contentW - 80 * scale);

        ctx.font = `400 ${Math.round(23 * scale)}px ${bodyFont}`;
        ctx.fillStyle = brand.mutedColor;
        ctx.fillText(it.detail, trackX + 42 * scale, ny + 60 * scale, contentW - 80 * scale);
        ctx.restore();
      });
    } else {
      const lineY = h * 0.48;
      const count = Math.min(4, items.length);
      const segW = contentW / Math.max(1, count);

      ctx.strokeStyle = hexToRgba(brand.textColor, 0.14);
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.moveTo(padX, lineY);
      ctx.lineTo(padX + contentW, lineY);
      ctx.stroke();

      ctx.strokeStyle = brand.primaryColor;
      ctx.beginPath();
      ctx.moveTo(padX, lineY);
      ctx.lineTo(padX + contentW * drawProgress, lineY);
      ctx.stroke();

      items.slice(0, 4).forEach((it, idx) => {
        const nx = padX + idx * segW + 24 * scale;
        const nodeT = easeOutExpo(clamp((localTime - 0.15 - idx * 0.18) / 0.5));
        ctx.save();
        ctx.globalAlpha = clamp(alpha * nodeT);

        ctx.beginPath();
        ctx.arc(nx, lineY, 13 * scale, 0, Math.PI * 2);
        ctx.fillStyle = brand.primaryColor;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(nx, lineY, 5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.font = `600 ${Math.round(20 * scale)}px ${monoFont}`;
        ctx.fillStyle = brand.accentColor;
        ctx.fillText(it.date, nx - 10 * scale, lineY - 54 * scale);

        const cardW = segW - 28 * scale;
        drawRoundedRect(ctx, nx - 12 * scale, lineY + 34 * scale, cardW, 210 * scale, 16 * scale);
        ctx.fillStyle = brand.surfaceColor;
        ctx.fill();
        ctx.strokeStyle = hexToRgba(brand.textColor, 0.12);
        ctx.lineWidth = Math.max(1, 1.5 * scale);
        ctx.stroke();

        ctx.font = `700 ${Math.round(25 * scale)}px ${displayFont}`;
        ctx.fillStyle = brand.textColor;
        const tLines = wrapText(ctx, it.title, cardW - 44 * scale);
        tLines.forEach((l, li) =>
          ctx.fillText(l, nx + 12 * scale, lineY + 58 * scale + li * 32 * scale)
        );

        ctx.font = `400 ${Math.round(19 * scale)}px ${bodyFont}`;
        ctx.fillStyle = brand.mutedColor;
        const dLines = wrapText(ctx, it.detail, cardW - 44 * scale);
        const dy = lineY + 72 * scale + tLines.length * 32 * scale;
        dLines.forEach((l, li) => ctx.fillText(l, nx + 12 * scale, dy + li * 28 * scale));
        ctx.restore();
      });
    }
  } else if (scene.layout === 'quote-spotlight') {
    const q = scene.quote ?? {
      text: scene.headline,
      author: brand.brandName,
      role: scene.subheadline ?? 'OpenMotion Studio',
    };

    const boxY = h * 0.22;
    const boxH = h * 0.56;
    drawRoundedRect(ctx, padX, boxY, contentW, boxH, 26 * scale);
    ctx.fillStyle = brand.surfaceColor;
    ctx.fill();
    ctx.strokeStyle = hexToRgba(brand.textColor, 0.12);
    ctx.lineWidth = Math.max(1.5, 1.5 * scale);
    ctx.stroke();

    const ip = 64 * scale;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.font = `700 ${Math.round(92 * scale)}px ${displayFont}`;
    ctx.fillStyle = brand.primaryColor;
    ctx.fillText('“', padX + ip, boxY + ip - 18 * scale);

    const qSize = Math.round((isPortrait ? 48 : 48) * scale);
    ctx.font = `600 ${qSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    const qLines = wrapText(ctx, q.text, contentW - ip * 2);
    qLines.forEach((line, idx) => {
      const reveal = easeOutExpo(clamp((localTime - 0.1 - idx * 0.08) / 0.5));
      ctx.save();
      ctx.globalAlpha = clamp(alpha * reveal);
      ctx.fillText(
        line,
        padX + ip,
        boxY + ip + 68 * scale + idx * qSize * 1.28 + (1 - reveal) * 18 * scale
      );
      ctx.restore();
    });

    const footerY = boxY + boxH - ip - 56 * scale;
    ctx.fillStyle = brand.primaryColor;
    ctx.fillRect(padX + ip, footerY - 22 * scale, 64 * scale, 4 * scale);

    ctx.font = `700 ${Math.round(25 * scale)}px ${bodyFont}`;
    ctx.fillStyle = brand.textColor;
    ctx.fillText(q.author, padX + ip, footerY);

    ctx.font = `400 ${Math.round(21 * scale)}px ${monoFont}`;
    ctx.fillStyle = brand.mutedColor;
    ctx.fillText(q.role, padX + ip, footerY + 34 * scale);
  } else if (scene.layout === 'metric-spotlight') {
    const startY = h * (isPortrait ? 0.17 : 0.2);
    let cursorY = startY;

    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(22 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(scene.eyebrow, padX, cursorY);
      cursorY += 42 * scale;
    }

    const headSize = Math.round((isPortrait ? 60 : 58) * scale);
    ctx.font = `700 ${headSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    const headLines = wrapText(ctx, scene.headline, contentW);
    headLines.forEach((line, idx) => {
      ctx.fillText(line, padX, cursorY + idx * headSize * 1.15);
    });
    cursorY += headLines.length * headSize * 1.15 + 54 * scale;

    const metrics = scene.metrics ?? [];
    const cols = isPortrait ? 1 : Math.min(3, Math.max(1, metrics.length));
    const gap = 28 * scale;
    const cardW = (contentW - gap * (cols - 1)) / cols;
    const cardH = (isPortrait ? 245 : 300) * scale;

    metrics.slice(0, 3).forEach((m, idx) => {
      const stagger = easeOutExpo(clamp((localTime - 0.14 - idx * 0.12) / 0.55));
      const col = isPortrait ? 0 : idx % cols;
      const row = isPortrait ? idx : Math.floor(idx / cols);
      const x = padX + col * (cardW + gap);
      const y = cursorY + row * (cardH + gap) + (1 - stagger) * 32 * scale;

      ctx.save();
      ctx.globalAlpha = clamp(alpha * stagger);
      drawRoundedRect(ctx, x, y, cardW, cardH, 20 * scale);
      ctx.fillStyle = brand.surfaceColor;
      ctx.fill();
      ctx.strokeStyle = hexToRgba(brand.textColor, 0.12);
      ctx.lineWidth = Math.max(1, 1.5 * scale);
      ctx.stroke();

      const innerPad = 34 * scale;
      ctx.font = `500 ${Math.round(22 * scale)}px ${bodyFont}`;
      ctx.fillStyle = brand.mutedColor;
      ctx.fillText(m.label, x + innerPad, y + innerPad);

      const animatedVal = animateMetricNumber(m.value, clamp((localTime - 0.15) / 1.1));
      ctx.font = `700 ${Math.round((isPortrait ? 78 : 82) * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.textColor;
      ctx.fillText(animatedVal, x + innerPad, y + innerPad + 54 * scale);

      if (m.delta) {
        ctx.font = `500 ${Math.round(21 * scale)}px ${monoFont}`;
        ctx.fillStyle = brand.accentColor;
        ctx.fillText(m.delta, x + innerPad, y + cardH - innerPad - 24 * scale);
      }
      ctx.restore();
    });
  } else if (scene.layout === 'feature-cards') {
    const startY = h * (isPortrait ? 0.16 : 0.19);
    let cursorY = startY;

    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(22 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(scene.eyebrow, padX, cursorY);
      cursorY += 40 * scale;
    }

    const headSize = Math.round((isPortrait ? 58 : 56) * scale);
    ctx.font = `700 ${headSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    const headLines = wrapText(ctx, scene.headline, contentW);
    headLines.forEach((line, idx) => {
      ctx.fillText(line, padX, cursorY + idx * headSize * 1.15);
    });
    cursorY += headLines.length * headSize * 1.15 + 48 * scale;

    const items = scene.items ?? [];
    const cols = isPortrait ? 1 : Math.min(3, Math.max(1, items.length));
    const gap = 26 * scale;
    const cardW = (contentW - gap * (cols - 1)) / cols;
    const cardH = (isPortrait ? 240 : 340) * scale;

    items.slice(0, 3).forEach((item, idx) => {
      const stagger = easeOutExpo(clamp((localTime - 0.12 - idx * 0.14) / 0.5));
      const col = isPortrait ? 0 : idx % cols;
      const row = isPortrait ? idx : Math.floor(idx / cols);
      const x = padX + col * (cardW + gap);
      const y = cursorY + row * (cardH + gap) + (1 - stagger) * 34 * scale;

      ctx.save();
      ctx.globalAlpha = clamp(alpha * stagger);
      drawRoundedRect(ctx, x, y, cardW, cardH, 20 * scale);
      ctx.fillStyle = brand.surfaceColor;
      ctx.fill();
      ctx.strokeStyle = hexToRgba(brand.textColor, 0.12);
      ctx.lineWidth = Math.max(1, 1.5 * scale);
      ctx.stroke();

      const innerPad = 32 * scale;
      ctx.fillStyle = idx === 0 ? brand.primaryColor : brand.accentColor;
      ctx.fillRect(x + innerPad, y + innerPad, 48 * scale, 4 * scale);

      const titleSize = Math.round(28 * scale);
      ctx.font = `700 ${titleSize}px ${displayFont}`;
      ctx.fillStyle = brand.textColor;
      const tLines = wrapText(ctx, item.title, cardW - innerPad * 2);
      tLines.forEach((tl, tIdx) => {
        ctx.fillText(tl, x + innerPad, y + innerPad + 28 * scale + tIdx * titleSize * 1.25);
      });

      const detSize = Math.round(22 * scale);
      ctx.font = `400 ${detSize}px ${bodyFont}`;
      ctx.fillStyle = brand.mutedColor;
      const dLines = wrapText(ctx, item.detail, cardW - innerPad * 2);
      const detStartY = y + innerPad + 48 * scale + tLines.length * titleSize * 1.25;
      dLines.forEach((dl, dIdx) => {
        ctx.fillText(dl, x + innerPad, detStartY + dIdx * detSize * 1.45);
      });
      ctx.restore();
    });
  } else if (scene.layout === 'code-terminal') {
    const startY = h * 0.18;
    let cursorY = startY;

    if (scene.eyebrow) {
      ctx.font = `500 ${Math.round(21 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(scene.eyebrow, padX, cursorY);
      cursorY += 40 * scale;
    }

    const headSize = Math.round((isPortrait ? 52 : 54) * scale);
    ctx.font = `700 ${headSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    ctx.fillText(scene.headline, padX, cursorY, contentW);
    cursorY += headSize * 1.45;

    const termH = h - cursorY - h * 0.15;
    drawRoundedRect(ctx, padX, cursorY, contentW, termH, 20 * scale);
    ctx.fillStyle = '#070B14';
    ctx.fill();
    ctx.strokeStyle = hexToRgba(brand.textColor, 0.16);
    ctx.lineWidth = Math.max(1, 1.5 * scale);
    ctx.stroke();

    const headerH = 54 * scale;
    ctx.fillStyle = hexToRgba('#FFFFFF', 0.04);
    ctx.fillRect(padX, cursorY, contentW, headerH);

    ctx.font = `500 ${Math.round(18 * scale)}px ${monoFont}`;
    ctx.fillStyle = '#94A3B8';
    ctx.textBaseline = 'middle';
    ctx.fillText('openmotion-renderer · H.264', padX + 26 * scale, cursorY + headerH / 2);

    const codeLines = scene.codeLines ?? [];
    const totalChars = codeLines.reduce((acc, l) => acc + l.length, 0);
    const visibleChars = Math.floor(totalChars * clamp(progress * 1.45));
    let charBudget = visibleChars;

    const codeSize = Math.round((isPortrait ? 24 : 26) * scale);
    const codeLineH = codeSize * 1.75;
    ctx.font = `500 ${codeSize}px ${monoFont}`;
    ctx.textBaseline = 'top';

    codeLines.forEach((line, idx) => {
      if (charBudget <= 0) return;
      const shown = line.slice(0, charBudget);
      charBudget -= line.length;
      const ly = cursorY + headerH + 34 * scale + idx * codeLineH;

      ctx.fillStyle = '#475569';
      ctx.fillText(String(idx + 1).padStart(2, '0'), padX + 26 * scale, ly);

      ctx.fillStyle = idx % 2 === 0 ? '#E2E8F0' : brand.accentColor;
      ctx.fillText(shown, padX + 82 * scale, ly, contentW - 110 * scale);
    });
  } else if (scene.layout === 'split-showcase') {
    const startY = h * 0.2;
    const leftW = isPortrait ? contentW : contentW * 0.52;
    let cursorY = startY;

    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(22 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.primaryColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(scene.eyebrow, padX, cursorY);
      cursorY += 42 * scale;
    }

    const headSize = Math.round((isPortrait ? 58 : 60) * scale);
    ctx.font = `700 ${headSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    const hLines = wrapText(ctx, scene.headline, leftW);
    hLines.forEach((line, idx) => {
      ctx.fillText(line, padX, cursorY + idx * headSize * 1.15);
    });
    cursorY += hLines.length * headSize * 1.15 + 28 * scale;

    if (scene.subheadline) {
      const subSize = Math.round(26 * scale);
      ctx.font = `400 ${subSize}px ${bodyFont}`;
      ctx.fillStyle = brand.mutedColor;
      const sLines = wrapText(ctx, scene.subheadline, leftW);
      sLines.forEach((sl, idx) => {
        ctx.fillText(sl, padX, cursorY + idx * subSize * 1.5);
      });
      cursorY += sLines.length * subSize * 1.5 + 36 * scale;
    }

    const rightX = isPortrait ? padX : padX + leftW + contentW * 0.06;
    const rightW = isPortrait ? contentW : contentW * 0.42;
    const rightStartY = isPortrait ? cursorY : startY + 20 * scale;
    const items = scene.items ?? [];

    items.slice(0, 3).forEach((item, idx) => {
      const stagger = easeOutExpo(clamp((localTime - 0.15 - idx * 0.14) / 0.5));
      const boxH = 190 * scale;
      const boxY = rightStartY + idx * (boxH + 24 * scale) + (1 - stagger) * 28 * scale;

      ctx.save();
      ctx.globalAlpha = clamp(alpha * stagger);
      drawRoundedRect(ctx, rightX, boxY, rightW, boxH, 16 * scale);
      ctx.fillStyle = brand.surfaceColor;
      ctx.fill();
      ctx.strokeStyle = hexToRgba(brand.textColor, 0.12);
      ctx.lineWidth = Math.max(1, 1.5 * scale);
      ctx.stroke();

      const ip = 28 * scale;
      ctx.font = `700 ${Math.round(26 * scale)}px ${displayFont}`;
      ctx.fillStyle = brand.textColor;
      ctx.fillText(item.title, rightX + ip, boxY + ip);

      ctx.font = `400 ${Math.round(21 * scale)}px ${bodyFont}`;
      ctx.fillStyle = brand.mutedColor;
      const dLines = wrapText(ctx, item.detail, rightW - ip * 2);
      dLines.forEach((dl, dIdx) => {
        ctx.fillText(dl, rightX + ip, boxY + ip + 46 * scale + dIdx * 30 * scale);
      });
      ctx.restore();
    });
  } else if (scene.layout === 'ui-morph') {
    // OpenDesign.ai "UI Morph" — continuous One-Shape UI Motion without hard cuts
    // Smoothly morphs a single fluid container through 5 states:
    // 0: Generate Button -> 1: Loading Spinner -> 2: Dynamic Island Audio -> 3: Mini Analytics Card -> 4: Command Palette (⌘K)
    const stageCount = 5;
    const rawPos = clamp(progress) * (stageCount - 0.001);
    const stageIdx = Math.floor(rawPos);
    const stageT = rawPos - stageIdx;
    const morphEase = easeInOutCubic(clamp((stageT - 0.68) / 0.32));
    const nextIdx = Math.min(stageCount - 1, stageIdx + 1);

    const geometries = [
      { w: 340 * scale, h: 96 * scale, r: 48 * scale }, // 0: CTA Button
      { w: 460 * scale, h: 96 * scale, r: 48 * scale }, // 1: Loading / Confirmed Pill
      { w: 620 * scale, h: 148 * scale, r: 42 * scale }, // 2: Dynamic Island Player
      { w: 740 * scale, h: 310 * scale, r: 28 * scale }, // 3: Live Mini Chart & Toggle
      { w: 780 * scale, h: 380 * scale, r: 24 * scale }, // 4: Command Palette
    ];

    const gA = geometries[stageIdx];
    const gB = geometries[nextIdx];
    const curW = Math.min(contentW * 0.94, gA.w + (gB.w - gA.w) * morphEase);
    const curH = gA.h + (gB.h - gA.h) * morphEase;
    const curR = gA.r + (gB.r - gA.r) * morphEase;

    const labels = scene.morphLabels ?? [
      '01 · Generate Button',
      '02 · Live Progress',
      '03 · Dynamic Island',
      '04 · Mini Analytics',
      '05 · Command Palette',
    ];

    // Header context
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(21 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.fillText(scene.eyebrow, w / 2, h * 0.14);
    }
    ctx.font = `700 ${Math.round((isPortrait ? 46 : 44) * scale)}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    ctx.fillText(scene.headline, w / 2, h * 0.14 + 34 * scale, contentW);

    // Center morphing single-shape container
    const cx = w / 2;
    const cy = h * 0.54;
    const boxX = cx - curW / 2;
    const boxY = cy - curH / 2;

    // Soft ambient halo behind morphing container
    const glow = ctx.createRadialGradient(cx, cy, curH * 0.1, cx, cy, Math.max(curW, curH) * 0.85);
    glow.addColorStop(0, hexToRgba(brand.primaryColor, 0.28));
    glow.addColorStop(1, hexToRgba(brand.primaryColor, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(cx - curW, cy - curH, curW * 2, curH * 2);

    drawRoundedRect(ctx, boxX, boxY, curW, curH, curR);
    ctx.fillStyle = stageIdx === 0 && morphEase < 0.5 ? brand.primaryColor : brand.surfaceColor;
    ctx.fill();
    ctx.strokeStyle =
      stageIdx === 0 && morphEase < 0.5
        ? hexToRgba('#FFFFFF', 0.22)
        : hexToRgba(brand.textColor, 0.18);
    ctx.lineWidth = Math.max(1.5, 2 * scale);
    ctx.stroke();

    // Clip interior content to morphing container shape
    ctx.save();
    drawRoundedRect(ctx, boxX, boxY, curW, curH, curR);
    ctx.clip();

    const contentFade = 1 - Math.abs(morphEase - 0.5) * 0.6;
    ctx.globalAlpha = clamp(alpha * contentFade);

    if (stageIdx === 0) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${Math.round(30 * scale)}px ${displayFont}`;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('Generate Motion', cx, cy);
    } else if (stageIdx === 1) {
      const spinAngle = safeTime * 7;
      const doneCheck = stageT > 0.45;
      const iconX = boxX + 58 * scale;
      if (!doneCheck) {
        ctx.strokeStyle = brand.accentColor;
        ctx.lineWidth = 5 * scale;
        ctx.beginPath();
        ctx.arc(iconX, cy, 18 * scale, spinAngle, spinAngle + Math.PI * 1.4);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#16A34A';
        ctx.beginPath();
        ctx.arc(iconX, cy, 20 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(iconX - 8 * scale, cy);
        ctx.lineTo(iconX - 2 * scale, cy + 7 * scale);
        ctx.lineTo(iconX + 9 * scale, cy - 6 * scale);
        ctx.stroke();
      }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = `600 ${Math.round(25 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.textColor;
      ctx.fillText(doneCheck ? 'Render Gereed · 60 fps' : 'Rendering frames...', boxX + 98 * scale, cy);
    } else if (stageIdx === 2) {
      // Dynamic Island Audio / Volume Player
      drawRoundedRect(ctx, boxX + 26 * scale, cy - 42 * scale, 84 * scale, 84 * scale, 20 * scale);
      ctx.fillStyle = brand.primaryColor;
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${Math.round(24 * scale)}px ${displayFont}`;
      ctx.fillStyle = brand.textColor;
      ctx.fillText('Motion Future — 128 BPM', boxX + 132 * scale, cy - 16 * scale);

      ctx.font = `400 ${Math.round(18 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.mutedColor;
      ctx.fillText('OpenDesign Audio Track', boxX + 132 * scale, cy + 18 * scale);

      // Equalizer bars on right
      for (let i = 0; i < 6; i++) {
        const bh = (16 + Math.abs(Math.sin(safeTime * 8 + i * 0.9)) * 38) * scale;
        const bx = boxX + curW - 110 * scale + i * 13 * scale;
        drawRoundedRect(ctx, bx, cy - bh / 2, 7 * scale, bh, 3.5 * scale);
        ctx.fillStyle = brand.accentColor;
        ctx.fill();
      }
    } else if (stageIdx === 3) {
      // Live mini analytics chart + animated toggle
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = `600 ${Math.round(20 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.mutedColor;
      ctx.fillText('LIVE EXPORT THROUGHPUT', boxX + 36 * scale, boxY + 30 * scale);

      // Toggle switch top-right
      const togX = boxX + curW - 104 * scale;
      const togY = boxY + 26 * scale;
      drawRoundedRect(ctx, togX, togY, 68 * scale, 34 * scale, 17 * scale);
      ctx.fillStyle = brand.primaryColor;
      ctx.fill();
      const knobSlide = easeOutCubic(clamp(stageT * 2.2));
      ctx.beginPath();
      ctx.arc(togX + (18 + knobSlide * 32) * scale, togY + 17 * scale, 12 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Mini 10-bar sparkline
      const barValues = [0.35, 0.52, 0.48, 0.68, 0.74, 0.62, 0.85, 0.92, 0.88, 0.98];
      const chartW = curW - 72 * scale;
      const stepW = chartW / barValues.length;
      const grow = easeOutExpo(clamp(stageT * 1.8));
      barValues.forEach((v, i) => {
        const bh = 155 * scale * v * grow;
        const bx = boxX + 36 * scale + i * stepW + 6 * scale;
        const by = boxY + curH - 34 * scale - bh;
        drawRoundedRect(ctx, bx, by, stepW - 14 * scale, bh, 8 * scale);
        ctx.fillStyle = i >= 7 ? brand.accentColor : brand.primaryColor;
        ctx.fill();
      });
    } else {
      // Command Palette (⌘K)
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = `500 ${Math.round(23 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.mutedColor;
      ctx.fillText('⌘K   Zoek OpenMotion actie of export...', boxX + 34 * scale, boxY + 46 * scale);

      ctx.strokeStyle = hexToRgba(brand.textColor, 0.12);
      ctx.beginPath();
      ctx.moveTo(boxX, boxY + 86 * scale);
      ctx.lineTo(boxX + curW, boxY + 86 * scale);
      ctx.stroke();

      const cmds = [
        { name: 'Exporteer 1080p H.264 MP4', shortcut: '⌘E' },
        { name: 'Wissel Brand Kit Tokens', shortcut: '⌘B' },
        { name: 'Commit project.json naar GitHub', shortcut: '⌘G' },
      ];
      cmds.forEach((cmd, idx) => {
        const ry = boxY + 106 * scale + idx * 82 * scale;
        const isSel = idx === Math.min(2, Math.floor(stageT * 3));
        if (isSel) {
          drawRoundedRect(ctx, boxX + 20 * scale, ry, curW - 40 * scale, 66 * scale, 12 * scale);
          ctx.fillStyle = hexToRgba(brand.primaryColor, 0.24);
          ctx.fill();
        }
        ctx.font = `600 ${Math.round(22 * scale)}px ${bodyFont}`;
        ctx.fillStyle = brand.textColor;
        ctx.fillText(cmd.name, boxX + 40 * scale, ry + 33 * scale);
        ctx.textAlign = 'right';
        ctx.font = `500 ${Math.round(19 * scale)}px ${monoFont}`;
        ctx.fillStyle = brand.accentColor;
        ctx.fillText(cmd.shortcut, boxX + curW - 40 * scale, ry + 33 * scale);
        ctx.textAlign = 'left';
      });
    }
    ctx.restore();

    // State indicator strip below morphing container
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `500 ${Math.round(20 * scale)}px ${monoFont}`;
    ctx.fillStyle = brand.mutedColor;
    ctx.fillText(labels[stageIdx] ?? '', cx, h * 0.84);
  } else if (scene.layout === 'beat-kinetic') {
    // OpenDesign.ai "Motion Future" — Beat-led kinetic typography & rhythmic pulse
    const bpm = scene.bpm ?? 128;
    const beatDur = 60 / bpm;
    const beatIndex = Math.floor(localTime / beatDur);
    const beatFrac = (localTime % beatDur) / beatDur;
    const punch = 1 + (1 - easeOutExpo(beatFrac)) * 0.09;

    const words =
      scene.beatWords && scene.beatWords.length > 0
        ? scene.beatWords
        : scene.headline.split(/\s+/);
    const currentWord = words[beatIndex % words.length];

    // Rhythmic geometric pulse rings behind word
    const pulseR = (180 + easeOutCubic(beatFrac) * 260) * scale;
    ctx.strokeStyle = hexToRgba(brand.primaryColor, (1 - beatFrac) * 0.45);
    ctx.lineWidth = Math.max(2, 4 * scale);
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.5, pulseR, 0, Math.PI * 2);
    ctx.stroke();

    // Metallic chrome hairline frame
    ctx.strokeStyle = hexToRgba(brand.accentColor, 0.22);
    ctx.lineWidth = Math.max(1.5, 2 * scale);
    drawRoundedRect(ctx, padX, h * 0.17, contentW, h * 0.66, 24 * scale);
    ctx.stroke();

    // Top beat counter
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `600 ${Math.round(22 * scale)}px ${monoFont}`;
    ctx.fillStyle = brand.accentColor;
    ctx.fillText(
      `${scene.eyebrow ?? 'MOTION FUTURE'} · ${bpm} BPM · BEAT ${String(beatIndex + 1).padStart(
        2,
        '0'
      )}`,
      w / 2,
      h * 0.22
    );

    // Giant kinetic beat-synced word slam
    ctx.save();
    ctx.translate(w / 2, h * 0.5);
    ctx.scale(punch, punch);
    const giantSize = Math.round((isPortrait ? 112 : 146) * scale);
    ctx.font = `700 ${giantSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentWord, 0, 0, contentW * 0.88);
    ctx.restore();

    if (scene.subheadline) {
      ctx.font = `500 ${Math.round(26 * scale)}px ${bodyFont}`;
      ctx.fillStyle = brand.mutedColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(scene.subheadline, w / 2, h * 0.77, contentW * 0.84);
    }
  } else if (scene.layout === 'visual-lesson') {
    // OpenDesign.ai "Visual Lesson" — Structured educational concept diagram with signal flow
    const nodes = scene.lessonNodes ?? [
      { tag: 'INPUT', title: 'Prompt / Referentie', detail: 'Beschrijf stijl of doelgroep' },
      { tag: 'ENGINE', title: 'Motion.md Blueprint', detail: 'Timing, lagen en Brand Kit' },
      { tag: 'OUTPUT', title: 'H.264 MP4 Video', detail: 'Klaar voor GitHub Pages' },
    ];

    const startY = h * 0.15;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(21 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.fillText(scene.eyebrow, padX, startY);
    }
    const headSize = Math.round((isPortrait ? 50 : 50) * scale);
    ctx.font = `700 ${headSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    const hLines = wrapText(ctx, scene.headline, contentW);
    hLines.forEach((l, i) => ctx.fillText(l, padX, startY + 34 * scale + i * headSize * 1.15));

    const diagTop = startY + 64 * scale + hLines.length * headSize * 1.15;
    const count = Math.min(3, nodes.length);
    const gap = (isPortrait ? 52 : 68) * scale;
    const nodeW = isPortrait ? contentW : (contentW - gap * (count - 1)) / count;
    const nodeH = (isPortrait ? 200 : 280) * scale;

    // Animated connectors with moving pulse packet between nodes
    const packetPos = (localTime * 0.85) % 1;
    if (!isPortrait) {
      const cy = diagTop + nodeH / 2;
      for (let i = 0; i < count - 1; i++) {
        const x1 = padX + (i + 1) * nodeW + i * gap;
        const x2 = x1 + gap;
        ctx.strokeStyle = hexToRgba(brand.textColor, 0.22);
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(x1, cy);
        ctx.lineTo(x2, cy);
        ctx.stroke();

        const px = x1 + (x2 - x1) * packetPos;
        ctx.fillStyle = brand.accentColor;
        ctx.beginPath();
        ctx.arc(px, cy, 7 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const activeNodeIdx = Math.min(count - 1, Math.floor(progress * count));

    nodes.slice(0, 3).forEach((node, idx) => {
      const stagger = easeOutExpo(clamp((localTime - 0.1 - idx * 0.16) / 0.5));
      const nx = isPortrait ? padX : padX + idx * (nodeW + gap);
      const ny = isPortrait ? diagTop + idx * (nodeH + gap) : diagTop;
      const isFocused = idx === activeNodeIdx;

      ctx.save();
      ctx.globalAlpha = clamp(alpha * stagger);
      drawRoundedRect(ctx, nx, ny, nodeW, nodeH, 20 * scale);
      ctx.fillStyle = brand.surfaceColor;
      ctx.fill();
      ctx.strokeStyle = isFocused ? brand.primaryColor : hexToRgba(brand.textColor, 0.12);
      ctx.lineWidth = Math.max(1.5, (isFocused ? 3 : 1.5) * scale);
      ctx.stroke();

      const ip = 30 * scale;
      ctx.font = `600 ${Math.round(19 * scale)}px ${monoFont}`;
      ctx.fillStyle = isFocused ? brand.accentColor : brand.mutedColor;
      ctx.fillText(node.tag, nx + ip, ny + ip);

      ctx.font = `700 ${Math.round(28 * scale)}px ${displayFont}`;
      ctx.fillStyle = brand.textColor;
      const tLines = wrapText(ctx, node.title, nodeW - ip * 2);
      tLines.forEach((l, li) => ctx.fillText(l, nx + ip, ny + ip + 38 * scale + li * 34 * scale));

      ctx.font = `400 ${Math.round(21 * scale)}px ${bodyFont}`;
      ctx.fillStyle = brand.mutedColor;
      const dLines = wrapText(ctx, node.detail, nodeW - ip * 2);
      dLines.forEach((l, li) =>
        ctx.fillText(l, nx + ip, ny + ip + 52 * scale + tLines.length * 34 * scale + li * 30 * scale)
      );
      ctx.restore();
    });

    // Bottom takeaway summary bar on landscape
    if (!isPortrait && scene.subheadline) {
      const boxY = diagTop + nodeH + 40 * scale;
      const boxH = 96 * scale;
      if (boxY + boxH < h - 72 * scale) {
        drawRoundedRect(ctx, padX, boxY, contentW, boxH, 16 * scale);
        ctx.fillStyle = hexToRgba(brand.primaryColor, 0.12);
        ctx.fill();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = `500 ${Math.round(23 * scale)}px ${bodyFont}`;
        ctx.fillStyle = brand.textColor;
        ctx.fillText(scene.subheadline, padX + 32 * scale, boxY + boxH / 2, contentW - 64 * scale);
      }
    }
  } else if (scene.layout === 'bento-montage') {
    // OpenDesign.ai "Showreel" — Rapid Bento Showcase Montage
    const tiles = scene.bentoTiles ?? [
      { label: '01 · MOTION', title: 'Kinetic Systems', metric: '60 fps' },
      { label: '02 · UI MORPH', title: 'Fluid Components', metric: '14s' },
      { label: '03 · DECKS', title: 'Design.md Slides', metric: 'HTML' },
      { label: '04 · EXPORT', title: 'GitHub Pages MP4', metric: 'H.264' },
    ];

    const startY = h * 0.14;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(21 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.fillText(scene.eyebrow, padX, startY);
    }
    ctx.font = `700 ${Math.round((isPortrait ? 48 : 48) * scale)}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    ctx.fillText(scene.headline, padX, startY + 32 * scale, contentW);

    const gridY = startY + 114 * scale;
    const gridH = h - gridY - 104 * scale;
    const gap = 22 * scale;
    const cols = isPortrait ? 1 : 2;
    const rows = isPortrait ? Math.min(4, tiles.length) : 2;
    const cellW = (contentW - gap * (cols - 1)) / cols;
    const cellH = (gridH - gap * (rows - 1)) / rows;
    const activeTileIdx = Math.floor(progress * tiles.length) % tiles.length;

    tiles.slice(0, 4).forEach((tile, idx) => {
      const col = isPortrait ? 0 : idx % 2;
      const row = isPortrait ? idx : Math.floor(idx / 2);
      const tx = padX + col * (cellW + gap);
      const ty = gridY + row * (cellH + gap);
      const reveal = easeOutExpo(clamp((localTime - idx * 0.12) / 0.5));
      const isLit = idx === activeTileIdx;

      ctx.save();
      ctx.globalAlpha = clamp(alpha * reveal);
      drawRoundedRect(ctx, tx, ty + (1 - reveal) * 24 * scale, cellW, cellH, 20 * scale);
      ctx.fillStyle = isLit ? hexToRgba(brand.primaryColor, 0.24) : brand.surfaceColor;
      ctx.fill();
      ctx.strokeStyle = isLit ? brand.primaryColor : hexToRgba(brand.textColor, 0.12);
      ctx.lineWidth = Math.max(1.5, (isLit ? 2.5 : 1.5) * scale);
      ctx.stroke();

      const ip = 30 * scale;
      ctx.font = `600 ${Math.round(18 * scale)}px ${monoFont}`;
      ctx.fillStyle = isLit ? brand.accentColor : brand.mutedColor;
      ctx.fillText(tile.label, tx + ip, ty + ip);

      if (tile.metric) {
        ctx.textAlign = 'right';
        ctx.font = `700 ${Math.round(32 * scale)}px ${monoFont}`;
        ctx.fillStyle = brand.textColor;
        ctx.fillText(tile.metric, tx + cellW - ip, ty + ip - 4 * scale);
        ctx.textAlign = 'left';
      }

      ctx.font = `700 ${Math.round((isPortrait ? 32 : 34) * scale)}px ${displayFont}`;
      ctx.fillStyle = brand.textColor;
      ctx.fillText(tile.title, tx + ip, ty + cellH - ip - 38 * scale, cellW - ip * 2);
      ctx.restore();
    });
  } else if (scene.layout === 'paper-cutout') {
    // OpenDesign.ai "Narrative Paper-Cutout" — layered tactile paper sheets with crisp offset shadows
    const chapters = scene.paperChapters ?? [
      'Hoofdstuk 01 · Het Idee',
      'Hoofdstuk 02 · De Vorm',
      'Hoofdstuk 03 · De Beweging',
    ];
    const sheetW = contentW * (isPortrait ? 0.92 : 0.78);
    const sheetH = h * (isPortrait ? 0.56 : 0.58);
    const baseX = (w - sheetW) / 2;
    const baseY = h * 0.22;

    // Back stacked cutout sheets with gentle stop-motion stepped sway
    const stepClock = Math.floor(safeTime * 6) / 6;
    const angles = [-0.032, 0.024, 0];
    const sheetColors = [
      hexToRgba(brand.accentColor, 0.26),
      hexToRgba(brand.primaryColor, 0.22),
      brand.surfaceColor,
    ];

    angles.forEach((ang, idx) => {
      const reveal = easeOutExpo(clamp((localTime - idx * 0.14) / 0.55));
      const wobble = idx < 2 ? Math.sin(stepClock * 2.2 + idx * 1.4) * 0.006 : 0;
      ctx.save();
      ctx.globalAlpha = clamp(alpha * reveal);
      ctx.translate(baseX + sheetW / 2, baseY + sheetH / 2 + (1 - reveal) * 48 * scale);
      ctx.rotate(ang + wobble);

      // Tactile hard paper shadow
      drawRoundedRect(
        ctx,
        -sheetW / 2 + 14 * scale,
        -sheetH / 2 + 16 * scale,
        sheetW,
        sheetH,
        12 * scale
      );
      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.fill();

      drawRoundedRect(ctx, -sheetW / 2, -sheetH / 2, sheetW, sheetH, 12 * scale);
      ctx.fillStyle = sheetColors[idx];
      ctx.fill();
      ctx.strokeStyle = hexToRgba(brand.textColor, idx === 2 ? 0.22 : 0.12);
      ctx.lineWidth = Math.max(1.5, 2 * scale);
      ctx.stroke();

      if (idx === 2) {
        // Dashed editorial stitch border inside top paper cutout
        ctx.save();
        ctx.setLineDash([8 * scale, 8 * scale]);
        ctx.strokeStyle = hexToRgba(brand.primaryColor, 0.35);
        drawRoundedRect(
          ctx,
          -sheetW / 2 + 22 * scale,
          -sheetH / 2 + 22 * scale,
          sheetW - 44 * scale,
          sheetH - 44 * scale,
          8 * scale
        );
        ctx.stroke();
        ctx.restore();

        const ip = 58 * scale;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        if (scene.eyebrow) {
          ctx.font = `600 ${Math.round(21 * scale)}px ${monoFont}`;
          ctx.fillStyle = brand.primaryColor;
          ctx.fillText(scene.eyebrow, -sheetW / 2 + ip, -sheetH / 2 + ip);
        }

        const headSize = Math.round((isPortrait ? 52 : 54) * scale);
        ctx.font = `700 ${headSize}px ${displayFont}`;
        ctx.fillStyle = brand.textColor;
        const hLines = wrapText(ctx, scene.headline, sheetW - ip * 2);
        hLines.forEach((l, li) =>
          ctx.fillText(l, -sheetW / 2 + ip, -sheetH / 2 + ip + 42 * scale + li * headSize * 1.15)
        );

        if (scene.subheadline) {
          const sy = -sheetH / 2 + ip + 64 * scale + hLines.length * headSize * 1.15;
          ctx.font = `400 ${Math.round(24 * scale)}px ${bodyFont}`;
          ctx.fillStyle = brand.mutedColor;
          const sLines = wrapText(ctx, scene.subheadline, sheetW - ip * 2);
          sLines.forEach((sl, si) => ctx.fillText(sl, -sheetW / 2 + ip, sy + si * 36 * scale));
        }

        // Paper tape strips at bottom showing chapters
        const activeChap = Math.min(chapters.length - 1, Math.floor(progress * chapters.length));
        const stripY = sheetH / 2 - ip - 44 * scale;
        ctx.font = `600 ${Math.round(20 * scale)}px ${monoFont}`;
        ctx.fillStyle = brand.primaryColor;
        ctx.fillText(chapters[activeChap] ?? '', -sheetW / 2 + ip, stripY);
      }
      ctx.restore();
    });
  } else if (scene.layout === 'pricing-tiers') {
    // OpenDesign.ai "SaaS Pricing & Feature Matrix"
    const tiers = scene.pricingTiers ?? [
      {
        name: 'Starter',
        price: '€0',
        cadence: '/ maand',
        features: ['GitHub Pages Hosting', '10 OpenMotion Templates', '720p H.264 Export'],
      },
      {
        name: 'Studio Team',
        price: '€29',
        cadence: '/ maand',
        highlighted: true,
        features: ['Onbeperkte Brand Kits', '1080p 60fps MP4 Export', 'ChatGPT + GitHub Sync'],
      },
      {
        name: 'Enterprise',
        price: '€99',
        cadence: '/ maand',
        features: ['Eigen CI/CD Pipeline', 'SSO & Private Repos', 'Custom Motion.md'],
      },
    ];

    const startY = h * 0.14;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(21 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.fillText(scene.eyebrow, padX, startY);
    }
    ctx.font = `700 ${Math.round((isPortrait ? 48 : 48) * scale)}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    ctx.fillText(scene.headline, padX, startY + 32 * scale, contentW);

    const cardsY = startY + 116 * scale;
    const cardsH = h - cardsY - 104 * scale;
    const count = Math.min(3, tiers.length);
    const gap = 24 * scale;
    const colW = isPortrait ? contentW : (contentW - gap * (count - 1)) / count;
    const colH = isPortrait ? (cardsH - gap * (count - 1)) / count : cardsH;

    tiers.slice(0, 3).forEach((tier, idx) => {
      const reveal = easeOutExpo(clamp((localTime - 0.1 - idx * 0.15) / 0.55));
      const tx = isPortrait ? padX : padX + idx * (colW + gap);
      const ty = isPortrait ? cardsY + idx * (colH + gap) : cardsY;
      const isHi = Boolean(tier.highlighted);

      ctx.save();
      ctx.globalAlpha = clamp(alpha * reveal);
      const lift = isHi && !isPortrait ? -10 * scale : 0;
      drawRoundedRect(ctx, tx, ty + lift + (1 - reveal) * 28 * scale, colW, colH, 20 * scale);
      ctx.fillStyle = isHi ? hexToRgba(brand.primaryColor, 0.18) : brand.surfaceColor;
      ctx.fill();
      ctx.strokeStyle = isHi ? brand.primaryColor : hexToRgba(brand.textColor, 0.14);
      ctx.lineWidth = Math.max(1.5, (isHi ? 2.5 : 1.5) * scale);
      ctx.stroke();

      const ip = 30 * scale;
      ctx.font = `600 ${Math.round(22 * scale)}px ${displayFont}`;
      ctx.fillStyle = isHi ? brand.accentColor : brand.mutedColor;
      ctx.fillText(tier.name, tx + ip, ty + lift + ip);

      ctx.font = `700 ${Math.round((isPortrait ? 44 : 56) * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.textColor;
      ctx.fillText(tier.price, tx + ip, ty + lift + ip + 38 * scale);

      const priceW = ctx.measureText(tier.price).width;
      ctx.font = `400 ${Math.round(19 * scale)}px ${bodyFont}`;
      ctx.fillStyle = brand.mutedColor;
      ctx.fillText(tier.cadence, tx + ip + priceW + 10 * scale, ty + lift + ip + 66 * scale);

      const featStartY = ty + lift + ip + (isPortrait ? 104 : 132) * scale;
      ctx.font = `400 ${Math.round(20 * scale)}px ${bodyFont}`;
      ctx.fillStyle = brand.textColor;
      tier.features.slice(0, isPortrait ? 2 : 4).forEach((f, fi) => {
        ctx.fillText(`+  ${f}`, tx + ip, featStartY + fi * 40 * scale, colW - ip * 2);
      });
      ctx.restore();
    });
  } else if (scene.layout === 'mobile-screens') {
    // OpenDesign.ai "Multi-Screen Mobile App Onboarding Flow"
    const screens = scene.mobileScreens ?? [
      { step: '01', title: 'Koppel Repo', body: 'Verbind je GitHub-project in één klik.', cta: 'Volgende' },
      { step: '02', title: 'Kies Brand Kit', body: 'Stel typografie en merkkleuren in.', cta: 'Toepassen' },
      { step: '03', title: 'Exporteer MP4', body: 'Deel direct op Reels & Shorts.', cta: 'Download' },
    ];

    const startY = h * 0.13;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(21 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.fillText(scene.eyebrow, padX, startY);
    }
    ctx.font = `700 ${Math.round((isPortrait ? 46 : 46) * scale)}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    ctx.fillText(scene.headline, padX, startY + 32 * scale, contentW);

    const activeIdx = Math.min(screens.length - 1, Math.floor(progress * screens.length));
    const phonesY = startY + 112 * scale;
    const phoneH = h - phonesY - 96 * scale;

    if (isPortrait) {
      // Single centered device morphing smoothly between onboarding screens
      const scr = screens[activeIdx];
      const phoneW = contentW * 0.82;
      const px = (w - phoneW) / 2;
      drawRoundedRect(ctx, px, phonesY, phoneW, phoneH, 42 * scale);
      ctx.fillStyle = brand.surfaceColor;
      ctx.fill();
      ctx.strokeStyle = brand.primaryColor;
      ctx.lineWidth = 4 * scale;
      ctx.stroke();

      // Dynamic island notch
      drawRoundedRect(ctx, w / 2 - 64 * scale, phonesY + 22 * scale, 128 * scale, 22 * scale, 11 * scale);
      ctx.fillStyle = brand.backgroundColor;
      ctx.fill();

      const ip = 42 * scale;
      ctx.font = `700 ${Math.round(78 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.primaryColor;
      ctx.fillText(scr.step, px + ip, phonesY + 96 * scale);

      ctx.font = `700 ${Math.round(44 * scale)}px ${displayFont}`;
      ctx.fillStyle = brand.textColor;
      ctx.fillText(scr.title, px + ip, phonesY + 196 * scale, phoneW - ip * 2);

      ctx.font = `400 ${Math.round(26 * scale)}px ${bodyFont}`;
      ctx.fillStyle = brand.mutedColor;
      const bLines = wrapText(ctx, scr.body, phoneW - ip * 2);
      bLines.forEach((l, li) => ctx.fillText(l, px + ip, phonesY + 266 * scale + li * 38 * scale));

      const btnH = 68 * scale;
      drawRoundedRect(ctx, px + ip, phonesY + phoneH - ip - btnH, phoneW - ip * 2, btnH, 16 * scale);
      ctx.fillStyle = brand.primaryColor;
      ctx.fill();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `600 ${Math.round(24 * scale)}px ${bodyFont}`;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(scr.cta, w / 2, phonesY + phoneH - ip - btnH / 2);
    } else {
      // Three sleek mobile device mockups side-by-side
      const gap = 36 * scale;
      const phoneW = Math.min(340 * scale, (contentW - gap * 2) / 3);
      const totalW = phoneW * 3 + gap * 2;
      const startX = (w - totalW) / 2;

      screens.slice(0, 3).forEach((scr, idx) => {
        const isFocused = idx === activeIdx;
        const reveal = easeOutExpo(clamp((localTime - idx * 0.14) / 0.55));
        const px = startX + idx * (phoneW + gap);
        const py = phonesY + (isFocused ? -12 * scale : 12 * scale);

        ctx.save();
        ctx.globalAlpha = clamp(alpha * reveal);
        drawRoundedRect(ctx, px, py + (1 - reveal) * 32 * scale, phoneW, phoneH, 34 * scale);
        ctx.fillStyle = brand.surfaceColor;
        ctx.fill();
        ctx.strokeStyle = isFocused ? brand.primaryColor : hexToRgba(brand.textColor, 0.16);
        ctx.lineWidth = Math.max(2, (isFocused ? 3.5 : 2) * scale);
        ctx.stroke();

        // Top notch
        drawRoundedRect(ctx, px + phoneW / 2 - 42 * scale, py + 16 * scale, 84 * scale, 14 * scale, 7 * scale);
        ctx.fillStyle = brand.backgroundColor;
        ctx.fill();

        const ip = 28 * scale;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = `700 ${Math.round(52 * scale)}px ${monoFont}`;
        ctx.fillStyle = isFocused ? brand.primaryColor : brand.mutedColor;
        ctx.fillText(scr.step, px + ip, py + 62 * scale);

        ctx.font = `700 ${Math.round(28 * scale)}px ${displayFont}`;
        ctx.fillStyle = brand.textColor;
        ctx.fillText(scr.title, px + ip, py + 132 * scale, phoneW - ip * 2);

        ctx.font = `400 ${Math.round(20 * scale)}px ${bodyFont}`;
        ctx.fillStyle = brand.mutedColor;
        const bLines = wrapText(ctx, scr.body, phoneW - ip * 2);
        bLines.forEach((l, li) => ctx.fillText(l, px + ip, py + 180 * scale + li * 30 * scale));

        const btnH = 52 * scale;
        drawRoundedRect(ctx, px + ip, py + phoneH - ip - btnH, phoneW - ip * 2, btnH, 12 * scale);
        ctx.fillStyle = isFocused ? brand.primaryColor : hexToRgba(brand.textColor, 0.1);
        ctx.fill();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `600 ${Math.round(19 * scale)}px ${bodyFont}`;
        ctx.fillStyle = isFocused ? '#FFFFFF' : brand.textColor;
        ctx.fillText(scr.cta, px + phoneW / 2, py + phoneH - ip - btnH / 2);
        ctx.restore();
      });
    }
  } else if (scene.layout === 'poster-editorial') {
    // OpenDesign.ai "Editorial Poster & Magazine Cover Motion" (Atelier Zero / Travel Poster style)
    const meta = scene.posterMeta ?? {
      issue: 'EDITIE 04 · 2026',
      location: 'AMSTERDAM / TOKYO',
      tagline: 'ARCHITECTURAL MOTION SYSTEMS',
      accentWord: 'OPEN',
    };

    const framePad = padX * 0.9;
    const frameTop = h * 0.11;
    const frameH = h * 0.78;
    const frameW = w - framePad * 2;

    // Outer gallery frame
    ctx.strokeStyle = hexToRgba(brand.textColor, 0.25);
    ctx.lineWidth = Math.max(2, 2.5 * scale);
    ctx.strokeRect(framePad, frameTop, frameW, frameH);

    // Top poster masthead row
    const mastY = frameTop + 34 * scale;
    ctx.textBaseline = 'top';
    ctx.font = `600 ${Math.round(20 * scale)}px ${monoFont}`;
    ctx.fillStyle = brand.mutedColor;
    ctx.textAlign = 'left';
    ctx.fillText(meta.issue, framePad + 32 * scale, mastY);
    ctx.textAlign = 'right';
    ctx.fillText(meta.location, framePad + frameW - 32 * scale, mastY);

    ctx.strokeStyle = hexToRgba(brand.textColor, 0.15);
    ctx.beginPath();
    ctx.moveTo(framePad, frameTop + 78 * scale);
    ctx.lineTo(framePad + frameW, frameTop + 78 * scale);
    ctx.stroke();

    // Animated bold architectural geometric emblem in upper/right center
    const artX = framePad + 32 * scale;
    const artY = frameTop + 104 * scale;
    const artW = frameW - 64 * scale;
    const artH = frameH * 0.42;
    drawRoundedRect(ctx, artX, artY, artW, artH, 8 * scale);
    ctx.fillStyle = brand.primaryColor;
    ctx.fill();

    // Rotating geometric sun / architectural disc inside poster block
    const discR = Math.min(artW, artH) * 0.34;
    const discX = artX + artW * (0.5 + Math.sin(safeTime * 0.9) * 0.14);
    const discY = artY + artH * 0.5;
    ctx.beginPath();
    ctx.arc(discX, discY, discR, 0, Math.PI * 2);
    ctx.fillStyle = brand.accentColor;
    ctx.fill();

    // Giant accent word inside art block
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.round((isPortrait ? 94 : 118) * scale)}px ${displayFont}`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(meta.accentWord, artX + artW / 2, artY + artH / 2, artW - 40 * scale);

    // Lower editorial headline & subcopy
    const copyY = artY + artH + 40 * scale;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const headSize = Math.round((isPortrait ? 52 : 56) * scale);
    ctx.font = `700 ${headSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    const hLines = wrapText(ctx, scene.headline, artW);
    hLines.forEach((l, li) => ctx.fillText(l, artX, copyY + li * headSize * 1.12));

    ctx.font = `500 ${Math.round(21 * scale)}px ${monoFont}`;
    ctx.fillStyle = brand.mutedColor;
    ctx.fillText(meta.tagline, artX, frameTop + frameH - 48 * scale, artW);
  } else if (scene.layout === '3d-wireframe-stage') {
    // True 3D perspective-projected deterministic wireframe stage
    const shape = scene.wireframeShape ?? 'cube-stack';
    const specs = scene.wireframeSpecs ?? [
      { label: 'Engine', value: '3D Projection' },
      { label: 'Framerate', value: `${project.fps} fps` },
      { label: 'Codec', value: 'H.264 MP4' },
    ];

    const startY = h * 0.16;
    const leftW = isPortrait ? contentW : contentW * 0.48;
    let cursorY = startY;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(21 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.fillText(scene.eyebrow, padX, cursorY, leftW);
      cursorY += 38 * scale;
    }

    const headSize = Math.round((isPortrait ? 52 : 56) * scale);
    ctx.font = `700 ${headSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    const hLines = wrapText(ctx, scene.headline, leftW);
    hLines.forEach((l, li) => ctx.fillText(l, padX, cursorY + li * headSize * 1.13));
    cursorY += hLines.length * headSize * 1.13 + 22 * scale;

    if (scene.subheadline) {
      const subSize = Math.round(24 * scale);
      ctx.font = `400 ${subSize}px ${bodyFont}`;
      ctx.fillStyle = brand.mutedColor;
      const sLines = wrapText(ctx, scene.subheadline, leftW);
      sLines.forEach((sl, si) => ctx.fillText(sl, padX, cursorY + si * subSize * 1.45));
      cursorY += sLines.length * subSize * 1.45 + 32 * scale;
    }

    // Spec cards on left (or bottom on portrait)
    const specCols = isPortrait ? specs.length : 1;
    const specGap = 14 * scale;
    const specW = isPortrait ? (contentW - specGap * (specCols - 1)) / specCols : leftW * 0.92;
    const specH = (isPortrait ? 96 : 74) * scale;
    const specBaseY = isPortrait ? h * 0.77 : cursorY;

    specs.slice(0, 3).forEach((sp, idx) => {
      const reveal = easeOutExpo(clamp((localTime - 0.12 - idx * 0.14) / 0.45));
      const sx = isPortrait ? padX + idx * (specW + specGap) : padX;
      const sy = (isPortrait ? specBaseY : specBaseY + idx * (specH + specGap)) + (1 - reveal) * 18 * scale;

      ctx.save();
      ctx.globalAlpha = clamp(alpha * reveal);
      drawRoundedRect(ctx, sx, sy, specW, specH, 12 * scale);
      ctx.fillStyle = brand.surfaceColor;
      ctx.fill();
      ctx.strokeStyle = hexToRgba(brand.textColor, 0.14);
      ctx.lineWidth = Math.max(1, 1.5 * scale);
      ctx.stroke();

      if (isPortrait) {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = `500 ${Math.round(17 * scale)}px ${monoFont}`;
        ctx.fillStyle = brand.mutedColor;
        ctx.fillText(sp.label.toUpperCase(), sx + 16 * scale, sy + 16 * scale, specW - 32 * scale);
        ctx.font = `700 ${Math.round(23 * scale)}px ${monoFont}`;
        ctx.fillStyle = brand.accentColor;
        ctx.fillText(sp.value, sx + 16 * scale, sy + 46 * scale, specW - 32 * scale);
      } else {
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.font = `500 ${Math.round(20 * scale)}px ${monoFont}`;
        ctx.fillStyle = brand.mutedColor;
        ctx.fillText(sp.label.toUpperCase(), sx + 22 * scale, sy + specH / 2);
        ctx.textAlign = 'right';
        ctx.font = `700 ${Math.round(24 * scale)}px ${monoFont}`;
        ctx.fillStyle = brand.accentColor;
        ctx.fillText(sp.value, sx + specW - 22 * scale, sy + specH / 2);
      }
      ctx.restore();
    });

    // 3D Stage viewport
    const stageCx = isPortrait ? w * 0.5 : padX + leftW + contentW * 0.28;
    const stageCy = isPortrait ? h * 0.55 : h * 0.51;
    const stageR = (isPortrait ? 210 : 250) * scale;

    // Subtle radial backdrop & calibrated reticle ring
    const halo = ctx.createRadialGradient(stageCx, stageCy, 10 * scale, stageCx, stageCy, stageR * 1.35);
    halo.addColorStop(0, hexToRgba(brand.primaryColor, 0.26));
    halo.addColorStop(0.6, hexToRgba(brand.accentColor, 0.08));
    halo.addColorStop(1, hexToRgba(brand.primaryColor, 0));
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(stageCx, stageCy, stageR * 1.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = hexToRgba(brand.textColor, 0.12);
    ctx.lineWidth = Math.max(1, 1.5 * scale);
    ctx.beginPath();
    ctx.arc(stageCx, stageCy, stageR * 1.08, 0, Math.PI * 2);
    ctx.stroke();

    // Tick marks around reticle
    for (let t = 0; t < 24; t++) {
      const ang = (t / 24) * Math.PI * 2 + safeTime * 0.15;
      const r1 = stageR * 1.04;
      const r2 = stageR * (t % 3 === 0 ? 1.13 : 1.09);
      ctx.strokeStyle = hexToRgba(t % 3 === 0 ? brand.accentColor : brand.textColor, t % 3 === 0 ? 0.55 : 0.2);
      ctx.beginPath();
      ctx.moveTo(stageCx + Math.cos(ang) * r1, stageCy + Math.sin(ang) * r1);
      ctx.lineTo(stageCx + Math.cos(ang) * r2, stageCy + Math.sin(ang) * r2);
      ctx.stroke();
    }

    // Build 3D vertices & edges based on wireframeShape
    type Vec3 = [number, number, number];
    const verts: Vec3[] = [];
    const edges: Array<[number, number, boolean]> = []; // [a, b, isAccent]

    if (shape === 'octahedron') {
      verts.push(
        [0, -1.25, 0],
        [0, 1.25, 0],
        [-1.05, 0, 0],
        [1.05, 0, 0],
        [0, 0, -1.05],
        [0, 0, 1.05],
        // Inner core octahedron
        [0, -0.58, 0],
        [0, 0.58, 0],
        [-0.5, 0, 0],
        [0.5, 0, 0],
        [0, 0, -0.5],
        [0, 0, 0.5]
      );
      const octEdges: Array<[number, number, boolean]> = [
        [0, 2, false], [0, 3, false], [0, 4, false], [0, 5, false],
        [1, 2, false], [1, 3, false], [1, 4, false], [1, 5, false],
        [2, 4, false], [4, 3, false], [3, 5, false], [5, 2, false],
        [6, 8, true], [6, 9, true], [6, 10, true], [6, 11, true],
        [7, 8, true], [7, 9, true], [7, 10, true], [7, 11, true],
        [8, 10, true], [10, 9, true], [9, 11, true], [11, 8, true],
        [0, 6, true], [1, 7, true],
      ];
      edges.push(...octEdges);
    } else if (shape === 'iso-layers') {
      const layerYs = [-0.78, 0, 0.78];
      layerYs.forEach((ly, li) => {
        const s = 0.95 - li * 0.08;
        const base = verts.length;
        verts.push([-s, ly, -s], [s, ly, -s], [s, ly, s], [-s, ly, s]);
        const isAcc = li === 1;
        edges.push(
          [base, base + 1, isAcc],
          [base + 1, base + 2, isAcc],
          [base + 2, base + 3, isAcc],
          [base + 3, base, isAcc],
          [base, base + 2, isAcc]
        );
      });
      // Vertical connecting signal pillars between layers
      for (let c = 0; c < 4; c++) {
        edges.push([c, c + 4, true], [c + 4, c + 8, true]);
      }
    } else {
      // 'cube-stack': outer architectural cube + rotated inner core cube + struts
      const addCube = (s: number, isAcc: boolean) => {
        const b = verts.length;
        verts.push(
          [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
          [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]
        );
        edges.push(
          [b, b + 1, isAcc], [b + 1, b + 2, isAcc], [b + 2, b + 3, isAcc], [b + 3, b, isAcc],
          [b + 4, b + 5, isAcc], [b + 5, b + 6, isAcc], [b + 6, b + 7, isAcc], [b + 7, b + 4, isAcc],
          [b, b + 4, isAcc], [b + 1, b + 5, isAcc], [b + 2, b + 6, isAcc], [b + 3, b + 7, isAcc]
        );
      };
      addCube(0.95, false);
      addCube(0.46, true);
      for (let c = 0; c < 8; c++) {
        edges.push([c, c + 8, true]);
      }
    }

    const rotY = safeTime * 0.72 + easeOutCubic(clamp(localTime / 0.8)) * 0.5;
    const rotX = 0.42 + Math.sin(safeTime * 0.55) * 0.18;
    const rotZ = Math.cos(safeTime * 0.4) * 0.12;
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

    const projected = verts.map(([vx, vy, vz]) => {
      // Rotate Y
      const x1 = vx * cosY - vz * sinY;
      const z1 = vx * sinY + vz * cosY;
      // Rotate X
      const y2 = vy * cosX - z1 * sinX;
      const z2 = vy * sinX + z1 * cosX;
      // Rotate Z
      const x3 = x1 * cosZ - y2 * sinZ;
      const y3 = x1 * sinZ + y2 * cosZ;
      const persp = 3.4 / (3.4 + z2);
      return {
        x: stageCx + x3 * stageR * 0.68 * persp,
        y: stageCy + y3 * stageR * 0.68 * persp,
        z: z2,
      };
    });

    // Depth-sort edges (back to front)
    const sortedEdges = edges
      .map(([a, b, isAcc]) => ({
        pa: projected[a],
        pb: projected[b],
        isAcc,
        avgZ: (projected[a].z + projected[b].z) / 2,
      }))
      .sort((e1, e2) => e2.avgZ - e1.avgZ);

    sortedEdges.forEach(({ pa, pb, isAcc, avgZ }) => {
      const depthFactor = clamp(1 - (avgZ + 1.4) / 2.8, 0.22, 1);
      ctx.strokeStyle = hexToRgba(isAcc ? brand.accentColor : brand.primaryColor, 0.25 + depthFactor * 0.72);
      ctx.lineWidth = Math.max(1.2, (isAcc ? 2.4 : 3.2) * scale * (0.65 + depthFactor * 0.45));
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    });

    // Glowing vertices
    projected.forEach((p, idx) => {
      const depthFactor = clamp(1 - (p.z + 1.4) / 2.8, 0.25, 1);
      ctx.fillStyle = idx % 2 === 0 ? brand.accentColor : brand.textColor;
      ctx.globalAlpha = clamp(alpha * (0.35 + depthFactor * 0.65));
      ctx.beginPath();
      ctx.arc(p.x, p.y, (3.2 + depthFactor * 2.5) * scale, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = alpha;
  } else if (scene.layout === 'live-line-chart') {
    // High-craft animated Bezier spline chart with live interpolated value readout
    const series = scene.chartSeries ?? {
      label: 'ARR Groei',
      unit: 'k',
      points: [
        { xLabel: 'Q1', value: 120 },
        { xLabel: 'Q2', value: 195 },
        { xLabel: 'Q3', value: 280 },
        { xLabel: 'Q4', value: 410 },
        { xLabel: 'Q1+', value: 585 },
        { xLabel: 'Q2+', value: 790 },
      ],
    };
    const pts = series.points.length >= 2 ? series.points : [
      { xLabel: 'Start', value: 20 },
      { xLabel: 'Nu', value: 100 },
    ];
    const unit = series.unit ?? '';

    const startY = h * 0.14;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(21 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.fillText(scene.eyebrow, padX, startY);
    }

    const headSize = Math.round((isPortrait ? 48 : 50) * scale);
    ctx.font = `700 ${headSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    const hLines = wrapText(ctx, scene.headline, contentW);
    hLines.forEach((l, li) => ctx.fillText(l, padX, startY + 34 * scale + li * headSize * 1.13));

    const cardY = startY + 56 * scale + hLines.length * headSize * 1.13;
    const cardH = h * 0.86 - cardY;
    drawRoundedRect(ctx, padX, cardY, contentW, cardH, 20 * scale);
    ctx.fillStyle = brand.surfaceColor;
    ctx.fill();
    ctx.strokeStyle = hexToRgba(brand.textColor, 0.14);
    ctx.lineWidth = Math.max(1.5, 1.8 * scale);
    ctx.stroke();

    // Chart inner bounds
    const cPadL = 92 * scale;
    const cPadR = 44 * scale;
    const cPadT = 86 * scale;
    const cPadB = 64 * scale;
    const plotX = padX + cPadL;
    const plotY = cardY + cPadT;
    const plotW = contentW - cPadL - cPadR;
    const plotH = Math.max(120 * scale, cardH - cPadT - cPadB);

    const allVals = [
      ...pts.map((p) => p.value),
      ...(series.secondaryPoints ?? []),
    ];
    const minVal = 0;
    const maxVal = Math.max(10, Math.max(...allVals) * 1.14);

    // Horizontal grid lines & Y axis
    const gridSteps = 4;
    ctx.font = `500 ${Math.round(18 * scale)}px ${monoFont}`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let g = 0; g <= gridSteps; g++) {
      const gy = plotY + (plotH / gridSteps) * g;
      const valAtG = Math.round(maxVal - ((maxVal - minVal) / gridSteps) * g);
      ctx.strokeStyle = hexToRgba(brand.textColor, 0.08);
      ctx.lineWidth = Math.max(1, 1.2 * scale);
      ctx.beginPath();
      ctx.moveTo(plotX, gy);
      ctx.lineTo(plotX + plotW, gy);
      ctx.stroke();

      ctx.fillStyle = brand.mutedColor;
      ctx.fillText(`${valAtG}${unit}`, plotX - 16 * scale, gy);
    }

    // X-axis labels
    const coords = pts.map((p, i) => ({
      x: plotX + (plotW / (pts.length - 1)) * i,
      y: plotY + plotH - ((p.value - minVal) / (maxVal - minVal)) * plotH,
      value: p.value,
      xLabel: p.xLabel,
    }));

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    coords.forEach((c) => {
      ctx.fillStyle = brand.mutedColor;
      ctx.fillText(c.xLabel, c.x, plotY + plotH + 18 * scale);
    });

    const revealT = easeOutCubic(clamp(progress * 1.38));
    const clipW = plotW * revealT;

    // Optional secondary comparison line (dashed)
    if (series.secondaryPoints && series.secondaryPoints.length === pts.length) {
      const secCoords = series.secondaryPoints.map((v, i) => ({
        x: plotX + (plotW / (pts.length - 1)) * i,
        y: plotY + plotH - ((v - minVal) / (maxVal - minVal)) * plotH,
      }));
      ctx.save();
      ctx.beginPath();
      ctx.rect(plotX - 10, plotY - 20, clipW + 20, plotH + 40);
      ctx.clip();
      ctx.setLineDash([8 * scale, 8 * scale]);
      ctx.strokeStyle = hexToRgba(brand.mutedColor, 0.55);
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      secCoords.forEach((sc, i) => {
        if (i === 0) ctx.moveTo(sc.x, sc.y);
        else {
          const prev = secCoords[i - 1];
          const midX = (prev.x + sc.x) / 2;
          ctx.bezierCurveTo(midX, prev.y, midX, sc.y, sc.x, sc.y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Primary smooth Bezier curve & area fill clipped to revealT
    ctx.save();
    ctx.beginPath();
    ctx.rect(plotX - 6, plotY - 24, clipW + 12, plotH + 34);
    ctx.clip();

    // Area fill
    ctx.beginPath();
    coords.forEach((c, i) => {
      if (i === 0) ctx.moveTo(c.x, c.y);
      else {
        const prev = coords[i - 1];
        const midX = (prev.x + c.x) / 2;
        ctx.bezierCurveTo(midX, prev.y, midX, c.y, c.x, c.y);
      }
    });
    ctx.lineTo(coords[coords.length - 1].x, plotY + plotH);
    ctx.lineTo(coords[0].x, plotY + plotH);
    ctx.closePath();
    const areaGrad = ctx.createLinearGradient(0, plotY, 0, plotY + plotH);
    areaGrad.addColorStop(0, hexToRgba(brand.primaryColor, 0.36));
    areaGrad.addColorStop(1, hexToRgba(brand.primaryColor, 0.01));
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // Stroke curve
    ctx.beginPath();
    coords.forEach((c, i) => {
      if (i === 0) ctx.moveTo(c.x, c.y);
      else {
        const prev = coords[i - 1];
        const midX = (prev.x + c.x) / 2;
        ctx.bezierCurveTo(midX, prev.y, midX, c.y, c.x, c.y);
      }
    });
    ctx.strokeStyle = brand.accentColor;
    ctx.lineWidth = Math.max(3, 5 * scale);
    ctx.stroke();
    ctx.restore();

    // Interpolated live tracking tip position along segments
    const segFloat = revealT * (coords.length - 1);
    const segIdx = Math.min(coords.length - 2, Math.floor(segFloat));
    const segU = clamp(segFloat - segIdx);
    const pA = coords[segIdx];
    const pB = coords[segIdx + 1];
    // Evaluate horizontal-tangent cubic Bezier at segU
    const u1 = 1 - segU;
    const tipX = pA.x + (pB.x - pA.x) * segU;
    const tipY =
      u1 * u1 * u1 * pA.y +
      3 * u1 * u1 * segU * pA.y +
      3 * u1 * segU * segU * pB.y +
      segU * segU * segU * pB.y;
    const liveVal = Math.round(pA.value + (pB.value - pA.value) * segU);

    // Vertical tracker line + glowing tip dot
    ctx.strokeStyle = hexToRgba(brand.accentColor, 0.35);
    ctx.lineWidth = Math.max(1.5, 2 * scale);
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX, plotY + plotH);
    ctx.stroke();

    ctx.fillStyle = hexToRgba(brand.accentColor, 0.25);
    ctx.beginPath();
    ctx.arc(tipX, tipY, 18 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = brand.accentColor;
    ctx.beginPath();
    ctx.arc(tipX, tipY, 8 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Top-left series header & top-right live tabular readout inside card
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${Math.round(21 * scale)}px ${monoFont}`;
    ctx.fillStyle = brand.mutedColor;
    ctx.fillText(series.label.toUpperCase(), padX + 34 * scale, cardY + 42 * scale);

    ctx.textAlign = 'right';
    ctx.font = `700 ${Math.round(36 * scale)}px ${monoFont}`;
    ctx.fillStyle = brand.textColor;
    ctx.fillText(`${liveVal}${unit}`, padX + contentW - 34 * scale, cardY + 42 * scale);
  } else if (scene.layout === 'node-graph-flow') {
    // Multi-node directed architecture / AI agent graph with Bezier wires & streaming packets
    const nodes = scene.graphNodes ?? [
      { id: 'n1', label: 'Trigger', sublabel: 'Event / Prompt' },
      { id: 'n2', label: 'Planner', sublabel: 'Scene Graph' },
      { id: 'n3', label: 'Renderer', sublabel: 'Canvas 2D' },
      { id: 'n4', label: 'Export', sublabel: 'H.264 MP4' },
    ];
    const count = Math.min(4, Math.max(2, nodes.length));

    const startY = h * 0.14;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(21 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.fillText(scene.eyebrow, padX, startY);
    }
    const headSize = Math.round((isPortrait ? 46 : 48) * scale);
    ctx.font = `700 ${headSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    const hLines = wrapText(ctx, scene.headline, contentW);
    hLines.forEach((l, li) => ctx.fillText(l, padX, startY + 34 * scale + li * headSize * 1.13));

    const areaTop = startY + 62 * scale + hLines.length * headSize * 1.13;
    const areaH = h * 0.85 - areaTop;

    const nodeW = isPortrait ? contentW * 0.72 : (contentW - 140 * scale) / count;
    const nodeH = (isPortrait ? 132 : 168) * scale;

    // Compute node centers in a staggered S-flow
    const centers = nodes.slice(0, count).map((_, i) => {
      if (isPortrait) {
        const stepY = areaH / count;
        const offsetX = i % 2 === 0 ? -contentW * 0.11 : contentW * 0.11;
        return {
          x: w / 2 + offsetX,
          y: areaTop + stepY * i + stepY * 0.5,
        };
      }
      const spanX = contentW - nodeW;
      const cx = padX + nodeW / 2 + (count > 1 ? (spanX / (count - 1)) * i : 0);
      const waveY = (i % 2 === 0 ? -0.17 : 0.17) * areaH;
      return {
        x: cx,
        y: areaTop + areaH * 0.5 + waveY,
      };
    });

    // Draw smooth cubic Bezier connections & streaming signal packets
    const pulseCycle = (localTime * 0.75) % 1;
    for (let i = 0; i < count - 1; i++) {
      const a = centers[i];
      const b = centers[i + 1];
      const p0x = isPortrait ? a.x : a.x + nodeW / 2;
      const p0y = isPortrait ? a.y + nodeH / 2 : a.y;
      const p3x = isPortrait ? b.x : b.x - nodeW / 2;
      const p3y = isPortrait ? b.y - nodeH / 2 : b.y;
      const c1x = isPortrait ? p0x : (p0x + p3x) / 2;
      const c1y = isPortrait ? (p0y + p3y) / 2 : p0y;
      const c2x = isPortrait ? p3x : (p0x + p3x) / 2;
      const c2y = isPortrait ? (p0y + p3y) / 2 : p3y;

      ctx.strokeStyle = hexToRgba(brand.textColor, 0.2);
      ctx.lineWidth = Math.max(2, 3 * scale);
      ctx.beginPath();
      ctx.moveTo(p0x, p0y);
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p3x, p3y);
      ctx.stroke();

      // Animated luminous signal packet along wire
      const pt = (pulseCycle + i * 0.22) % 1;
      const mt = 1 - pt;
      const px =
        mt * mt * mt * p0x +
        3 * mt * mt * pt * c1x +
        3 * mt * pt * pt * c2x +
        pt * pt * pt * p3x;
      const py =
        mt * mt * mt * p0y +
        3 * mt * mt * pt * c1y +
        3 * mt * pt * pt * c2y +
        pt * pt * pt * p3y;

      ctx.fillStyle = hexToRgba(brand.accentColor, 0.3);
      ctx.beginPath();
      ctx.arc(px, py, 14 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = brand.accentColor;
      ctx.beginPath();
      ctx.arc(px, py, 6 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw nodes with sequential active highlight
    const activeNodeIdx = Math.floor(progress * count) % count;
    nodes.slice(0, count).forEach((node, i) => {
      const c = centers[i];
      const reveal = easeOutExpo(clamp((localTime - i * 0.14) / 0.48));
      const nx = c.x - nodeW / 2;
      const ny = c.y - nodeH / 2 + (1 - reveal) * 24 * scale;
      const isActive = i === activeNodeIdx;

      ctx.save();
      ctx.globalAlpha = clamp(alpha * reveal);
      drawRoundedRect(ctx, nx, ny, nodeW, nodeH, 16 * scale);
      ctx.fillStyle = brand.surfaceColor;
      ctx.fill();
      ctx.strokeStyle = isActive ? brand.accentColor : hexToRgba(brand.textColor, 0.16);
      ctx.lineWidth = Math.max(1.5, (isActive ? 3 : 1.5) * scale);
      ctx.stroke();

      // Top port label
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = `600 ${Math.round(17 * scale)}px ${monoFont}`;
      ctx.fillStyle = isActive ? brand.accentColor : brand.primaryColor;
      ctx.fillText(`NODE ${String(i + 1).padStart(2, '0')}`, nx + 22 * scale, ny + 22 * scale);

      ctx.font = `700 ${Math.round(28 * scale)}px ${displayFont}`;
      ctx.fillStyle = brand.textColor;
      ctx.fillText(node.label, nx + 22 * scale, ny + 54 * scale, nodeW - 44 * scale);

      ctx.font = `500 ${Math.round(19 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.mutedColor;
      ctx.fillText(node.sublabel, nx + 22 * scale, ny + 96 * scale, nodeW - 44 * scale);
      ctx.restore();
    });
  } else if (scene.layout === 'kinetic-marquee') {
    // High-velocity opposing-direction architectural typography wall + centered focal card
    const rows = scene.marqueeRows ?? [
      'OPENMOTION · VIDEO AS CODE · GITHUB PAGES · ',
      'WEBCODECS H.264 · DETERMINISTIC 60 FPS · ',
      'CHATGPT TO GITHUB · ZERO SERVER RENDERING · ',
      'OPENDESIGN TEMPLATES · BRAND KIT TOKENS · ',
      'REPRODUCIBLE JSON · STATIC MP4 PIPELINE · ',
    ];

    const rowCount = 5;
    const bandTop = h * 0.12;
    const bandH = h * 0.76;
    const rowStep = bandH / rowCount;
    const marqueeSize = Math.round((isPortrait ? 78 : 96) * scale);

    ctx.save();
    ctx.font = `700 ${marqueeSize}px ${displayFont}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    for (let r = 0; r < rowCount; r++) {
      const phrase = rows[r % rows.length];
      const ry = bandTop + rowStep * r + rowStep * 0.5;
      const dir = r % 2 === 0 ? -1 : 1;
      const speed = (130 + (r % 3) * 45) * scale;
      const textW = Math.max(260 * scale, ctx.measureText(phrase).width);
      const offset = ((safeTime * speed * dir) % textW + textW) % textW;

      for (let x = -textW + offset; x < w + textW; x += textW) {
        if (r % 2 === 0) {
          ctx.fillStyle = hexToRgba(brand.textColor, 0.085);
          ctx.fillText(phrase, x, ry);
        } else {
          ctx.strokeStyle = hexToRgba(brand.primaryColor, 0.24);
          ctx.lineWidth = Math.max(1.5, 2 * scale);
          ctx.strokeText(phrase, x, ry);
        }
      }
    }
    ctx.restore();

    // Centered elevated focal spotlight card
    const cardReveal = easeOutExpo(clamp(localTime / 0.55));
    const cardW = isPortrait ? contentW * 0.94 : contentW * 0.74;
    const cardH = (isPortrait ? 460 : 380) * scale;
    const cx = w / 2;
    const cy = h * 0.5;
    const pulse = 0.96 + cardReveal * 0.04;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(pulse, pulse);
    drawRoundedRect(ctx, -cardW / 2, -cardH / 2, cardW, cardH, 24 * scale);
    ctx.fillStyle = hexToRgba(brand.backgroundColor, 0.92);
    ctx.fill();
    ctx.strokeStyle = brand.primaryColor;
    ctx.lineWidth = Math.max(2, 2.5 * scale);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(21 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.fillText(scene.eyebrow, 0, -cardH * 0.3, cardW - 60 * scale);
    }

    const headSize = Math.round((isPortrait ? 52 : 62) * scale);
    ctx.font = `700 ${headSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    const hLines = wrapText(ctx, scene.headline, cardW - 88 * scale);
    const startH = -((hLines.length - 1) * headSize * 1.14) / 2 - 4 * scale;
    hLines.forEach((l, li) => ctx.fillText(l, 0, startH + li * headSize * 1.14));

    if (scene.subheadline) {
      ctx.font = `400 ${Math.round(24 * scale)}px ${bodyFont}`;
      ctx.fillStyle = brand.mutedColor;
      ctx.fillText(scene.subheadline, 0, cardH * 0.31, cardW - 88 * scale);
    }
    ctx.restore();
  } else if (scene.layout === 'code-diff-deploy') {
    // Git PR Diff panel paired with live animated CI/CD deploy step tracker
    const diffLines = scene.diffLines ?? [
      { type: 'context', text: '  "slug": "launch-video",' },
      { type: 'remove', text: '- "fps": 24,' },
      { type: 'add', text: '+ "fps": 60,' },
      { type: 'add', text: '+ "layout": "3d-wireframe-stage",' },
      { type: 'context', text: '  "format": "16:9"' },
    ];
    const deploySteps = scene.deploySteps ?? [
      { label: 'Checkout repository', duration: '0.8s' },
      { label: 'Index projects/manifest.json', duration: '0.4s' },
      { label: 'Vite build (base: ./)', duration: '2.1s' },
      { label: 'Deploy to GitHub Pages', duration: '1.3s' },
    ];

    const startY = h * 0.14;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(20 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.fillText(scene.eyebrow, padX, startY);
    }
    const headSize = Math.round((isPortrait ? 44 : 46) * scale);
    ctx.font = `700 ${headSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    const hLines = wrapText(ctx, scene.headline, contentW);
    hLines.forEach((l, li) => ctx.fillText(l, padX, startY + 32 * scale + li * headSize * 1.14));

    const panelTop = startY + 56 * scale + hLines.length * headSize * 1.14;
    const availH = h * 0.86 - panelTop;
    const gap = 28 * scale;

    const diffW = isPortrait ? contentW : contentW * 0.56;
    const diffH = isPortrait ? availH * 0.52 : availH;
    const pipeX = isPortrait ? padX : padX + diffW + gap;
    const pipeY = isPortrait ? panelTop + diffH + gap : panelTop;
    const pipeW = isPortrait ? contentW : contentW - diffW - gap;
    const pipeH = isPortrait ? availH - diffH - gap : availH;

    // Left panel: Git Diff
    drawRoundedRect(ctx, padX, panelTop, diffW, diffH, 16 * scale);
    ctx.fillStyle = '#0B1220';
    ctx.fill();
    ctx.strokeStyle = hexToRgba(brand.textColor, 0.16);
    ctx.lineWidth = Math.max(1.5, 1.5 * scale);
    ctx.stroke();

    const headerH = 50 * scale;
    ctx.fillStyle = '#141E33';
    drawRoundedRect(ctx, padX, panelTop, diffW, headerH, 16 * scale);
    ctx.fill();
    ctx.fillStyle = '#94A3B8';
    ctx.font = `500 ${Math.round(18 * scale)}px ${monoFont}`;
    ctx.textBaseline = 'middle';
    ctx.fillText('git diff · projects/project.json', padX + 22 * scale, panelTop + headerH / 2);

    const lineH = Math.min(48 * scale, (diffH - headerH - 28 * scale) / Math.max(1, diffLines.length));
    const visibleLines = Math.ceil(diffLines.length * clamp(progress * 1.6));
    ctx.font = `500 ${Math.round(19 * scale)}px ${monoFont}`;
    diffLines.slice(0, visibleLines).forEach((dl, idx) => {
      const ly = panelTop + headerH + 14 * scale + idx * lineH;
      if (dl.type === 'add') {
        ctx.fillStyle = 'rgba(22, 163, 74, 0.2)';
        ctx.fillRect(padX + 6 * scale, ly, diffW - 12 * scale, lineH - 4 * scale);
      } else if (dl.type === 'remove') {
        ctx.fillStyle = 'rgba(220, 38, 38, 0.2)';
        ctx.fillRect(padX + 6 * scale, ly, diffW - 12 * scale, lineH - 4 * scale);
      }
      ctx.fillStyle =
        dl.type === 'add' ? '#4ADE80' : dl.type === 'remove' ? '#F87171' : '#CBD5E1';
      ctx.fillText(dl.text, padX + 22 * scale, ly + (lineH - 4 * scale) / 2, diffW - 44 * scale);
    });

    // Right panel: CI/CD Deploy Checklist
    drawRoundedRect(ctx, pipeX, pipeY, pipeW, pipeH, 16 * scale);
    ctx.fillStyle = brand.surfaceColor;
    ctx.fill();
    ctx.strokeStyle = hexToRgba(brand.textColor, 0.14);
    ctx.lineWidth = Math.max(1.5, 1.5 * scale);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = `600 ${Math.round(19 * scale)}px ${monoFont}`;
    ctx.fillStyle = brand.accentColor;
    ctx.fillText('GITHUB ACTIONS · PAGES DEPLOY', pipeX + 24 * scale, pipeY + 22 * scale);

    const stepTop = pipeY + 66 * scale;
    const stepH = Math.min(72 * scale, (pipeH - 86 * scale) / Math.max(1, deploySteps.length));
    const completedFloat = progress * (deploySteps.length + 0.4);

    deploySteps.forEach((st, idx) => {
      const sy = stepTop + idx * stepH;
      const isDone = completedFloat >= idx + 1;
      const isRunning = !isDone && completedFloat >= idx;
      const cy = sy + stepH * 0.46;
      const iconX = pipeX + 36 * scale;

      if (isDone) {
        ctx.fillStyle = '#16A34A';
        ctx.beginPath();
        ctx.arc(iconX, cy, 12 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.6 * scale;
        ctx.beginPath();
        ctx.moveTo(iconX - 5 * scale, cy);
        ctx.lineTo(iconX - 1 * scale, cy + 4 * scale);
        ctx.lineTo(iconX + 6 * scale, cy - 4 * scale);
        ctx.stroke();
      } else if (isRunning) {
        const spin = safeTime * 7;
        ctx.strokeStyle = brand.accentColor;
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.arc(iconX, cy, 11 * scale, spin, spin + Math.PI * 1.4);
        ctx.stroke();
      } else {
        ctx.strokeStyle = hexToRgba(brand.mutedColor, 0.45);
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.arc(iconX, cy, 10 * scale, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.font = `600 ${Math.round(20 * scale)}px ${bodyFont}`;
      ctx.fillStyle = isDone || isRunning ? brand.textColor : brand.mutedColor;
      ctx.fillText(st.label, pipeX + 62 * scale, cy, pipeW - 140 * scale);

      ctx.textAlign = 'right';
      ctx.font = `500 ${Math.round(18 * scale)}px ${monoFont}`;
      ctx.fillStyle = isDone ? '#4ADE80' : brand.mutedColor;
      ctx.fillText(isDone ? st.duration : isRunning ? '...' : '—', pipeX + pipeW - 24 * scale, cy);
    });
  } else if (scene.layout === 'outro-cta') {
    const centerY = h * 0.47;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (scene.eyebrow) {
      ctx.font = `600 ${Math.round(24 * scale)}px ${monoFont}`;
      ctx.fillStyle = brand.accentColor;
      ctx.fillText(scene.eyebrow, w / 2, centerY - 145 * scale);
    }

    const headSize = Math.round((isPortrait ? 66 : 74) * scale);
    ctx.font = `700 ${headSize}px ${displayFont}`;
    ctx.fillStyle = brand.textColor;
    const hLines = wrapText(ctx, scene.headline, contentW * 0.85);
    const startHeadY = centerY - ((hLines.length - 1) * headSize * 1.15) / 2 - 20 * scale;
    hLines.forEach((line, idx) => {
      ctx.fillText(line, w / 2, startHeadY + idx * headSize * 1.15);
    });

    if (scene.subheadline) {
      ctx.font = `400 ${Math.round(26 * scale)}px ${bodyFont}`;
      ctx.fillStyle = brand.mutedColor;
      ctx.fillText(
        scene.subheadline,
        w / 2,
        startHeadY + hLines.length * headSize * 1.15 + 24 * scale,
        contentW * 0.85
      );
    }

    if (scene.ctaText) {
      const btnReveal = easeOutExpo(clamp((localTime - 0.25) / 0.5));
      const btnY = startHeadY + hLines.length * headSize * 1.15 + 104 * scale;
      ctx.font = `600 ${Math.round(26 * scale)}px ${bodyFont}`;
      const textW = ctx.measureText(scene.ctaText).width;
      const btnW = textW + 84 * scale;
      const btnH = 74 * scale;

      ctx.save();
      ctx.globalAlpha = clamp(alpha * btnReveal);
      drawRoundedRect(ctx, w / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 14 * scale);
      ctx.fillStyle = brand.primaryColor;
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(scene.ctaText, w / 2, btnY + 1 * scale);
      ctx.restore();
    }
  }

  ctx.restore();

  // 3. Persistent brand header, scene counter, caption, and bottom progress bar
  drawChromeOverlay(ctx, w, h, project, scene, sceneIndex, safeTime);

  ctx.restore();
}
