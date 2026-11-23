import {
  EditorialMapCamera,
  GeoCoord,
  OpenMotionScene,
  SceneEditorialMap,
} from '../types/openmotion';
import { getCachedPhoto } from './imageCache';

function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number): number {
  const c = clamp(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

function easeOutCubic(t: number): number {
  const c = clamp(t);
  return 1 - Math.pow(1 - c, 3);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

interface ProjectedPoint {
  x: number;
  y: number;
}

function createProjector(
  w: number,
  h: number,
  bounds: SceneEditorialMap['bounds'],
  cam: EditorialMapCamera
) {
  const refLat = (bounds.minLat + bounds.maxLat) * 0.5;
  const cosLat = Math.cos((refLat * Math.PI) / 180);
  const lonSpan = Math.max(0.001, (bounds.maxLon - bounds.minLon) * cosLat);
  const latSpan = Math.max(0.001, bounds.maxLat - bounds.minLat);

  // Choose base scale so zoom=1.0 cleanly fills the 16:9 canvas with true geographic proportions
  const pxPerDegX = w / lonSpan;
  const pxPerDegY = h / latSpan;
  const pxPerDeg = Math.max(pxPerDegX, pxPerDegY) * cam.zoom;

  const tilt = clamp(cam.tilt ?? 0, 0, 0.45);
  const ySquash = 1 - tilt * 0.26;
  const rotRad = -tilt * 0.12; // Gentle oblique camera bearing along the Royal Mile
  const cosR = Math.cos(rotRad);
  const sinR = Math.sin(rotRad);

  const project = (lat: number, lon: number): ProjectedPoint => {
    const rawX = (lon - cam.lon) * cosLat * pxPerDeg;
    const rawY = -(lat - cam.lat) * pxPerDeg;
    const rx = rawX * cosR - rawY * sinR;
    const ry = (rawX * sinR + rawY * cosR) * ySquash;
    return {
      x: w * 0.5 + rx,
      y: h * 0.5 + ry,
    };
  };

  return { project, pxPerDeg, cosLat, tilt };
}

function computePolylineSegments(pts: ProjectedPoint[]): {
  cumLengths: number[];
  totalLength: number;
} {
  const cumLengths: number[] = [0];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    total += seg;
    cumLengths.push(total);
  }
  return { cumLengths, totalLength: Math.max(1, total) };
}

function samplePolylineAt(
  pts: ProjectedPoint[],
  cumLengths: number[],
  totalLength: number,
  frac: number
): ProjectedPoint {
  if (pts.length === 0) return { x: 0, y: 0 };
  if (pts.length === 1 || frac <= 0) return pts[0];
  if (frac >= 1) return pts[pts.length - 1];

  const target = clamp(frac) * totalLength;
  for (let i = 1; i < pts.length; i++) {
    if (cumLengths[i] >= target) {
      const segLen = Math.max(0.0001, cumLengths[i] - cumLengths[i - 1]);
      const localT = (target - cumLengths[i - 1]) / segLen;
      return {
        x: lerp(pts[i - 1].x, pts[i].x, localT),
        y: lerp(pts[i - 1].y, pts[i].y, localT),
      };
    }
  }
  return pts[pts.length - 1];
}

function tracePartialPolyline(
  ctx: CanvasRenderingContext2D,
  pts: ProjectedPoint[],
  cumLengths: number[],
  totalLength: number,
  fromFrac: number,
  toFrac: number
) {
  const startD = clamp(fromFrac) * totalLength;
  const endD = clamp(toFrac) * totalLength;
  if (endD <= startD || pts.length < 2) return;

  const startPt = samplePolylineAt(pts, cumLengths, totalLength, fromFrac);
  ctx.beginPath();
  ctx.moveTo(startPt.x, startPt.y);

  for (let i = 1; i < pts.length; i++) {
    const dPrev = cumLengths[i - 1];
    const dCurr = cumLengths[i];
    if (dCurr <= startD) continue;
    if (dPrev >= endD) break;

    if (dCurr <= endD) {
      ctx.lineTo(pts[i].x, pts[i].y);
    } else {
      const localT = (endD - dPrev) / Math.max(0.0001, dCurr - dPrev);
      ctx.lineTo(lerp(pts[i - 1].x, pts[i].x, localT), lerp(pts[i - 1].y, pts[i].y, localT));
      break;
    }
  }
}

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  coords: GeoCoord[],
  project: (lat: number, lon: number) => ProjectedPoint
) {
  if (coords.length < 3) return;
  const p0 = project(coords[0][0], coords[0][1]);
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  for (let i = 1; i < coords.length; i++) {
    const p = project(coords[i][0], coords[i][1]);
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  zoom: number,
  panXFrac: number,
  panYFrac: number
) {
  const imgRatio = img.naturalWidth / Math.max(1, img.naturalHeight);
  const canvasRatio = w / Math.max(1, h);

  let drawW = w;
  let drawH = h;
  if (imgRatio > canvasRatio) {
    drawH = h * zoom;
    drawW = drawH * imgRatio;
  } else {
    drawW = w * zoom;
    drawH = drawW / imgRatio;
  }

  const extraW = drawW - w;
  const extraH = drawH - h;
  const dx = -extraW * 0.5 + panXFrac * extraW * 0.35;
  const dy = -extraH * 0.5 + panYFrac * extraH * 0.35;

  ctx.drawImage(img, dx, dy, drawW, drawH);
}

function drawPaperCartographyMap(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  em: SceneEditorialMap,
  cam: EditorialMapCamera,
  routeProgressFrac: number,
  sceneProgress: number,
  globalTime: number
) {
  const scale = Math.min(w, h) / 1080;
  const { project, pxPerDeg, tilt } = createProjector(w, h, em.bounds, cam);
  const zoomScale = Math.sqrt(clamp(cam.zoom, 0.7, 4.5));

  // 1. Warm light editorial parchment ground
  ctx.fillStyle = '#F3ECE0';
  ctx.fillRect(0, 0, w, h);

  // Subtle organic parchment shading & warm cartographic graticule
  const paperGrad = ctx.createRadialGradient(
    w * 0.5,
    h * 0.46,
    w * 0.1,
    w * 0.5,
    h * 0.5,
    Math.max(w, h) * 0.78
  );
  paperGrad.addColorStop(0, 'rgba(255, 252, 245, 0.45)');
  paperGrad.addColorStop(0.7, 'rgba(236, 226, 210, 0.15)');
  paperGrad.addColorStop(1, 'rgba(202, 187, 165, 0.42)');
  ctx.fillStyle = paperGrad;
  ctx.fillRect(0, 0, w, h);

  // Faint geographic graticule (lat/lon hairline grid every 0.005 deg)
  ctx.save();
  ctx.strokeStyle = 'rgba(130, 114, 92, 0.09)';
  ctx.lineWidth = Math.max(0.75, 0.9 * scale);
  ctx.beginPath();
  for (let lat = 55.935; lat <= 55.968; lat += 0.004) {
    const a = project(lat, em.bounds.minLon - 0.02);
    const b = project(lat, em.bounds.maxLon + 0.02);
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
  }
  for (let lon = -3.225; lon <= -3.145; lon += 0.008) {
    const a = project(em.bounds.minLat - 0.015, lon);
    const b = project(em.bounds.maxLat + 0.015, lon);
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
  }
  ctx.stroke();
  ctx.restore();

  // 2. Topographic relief shading & elevation contours (Castle Rock, Calton Hill, Salisbury Crags)
  if (em.reliefs && em.reliefs.length > 0) {
    for (const rel of em.reliefs) {
      const center = project(rel.lat, rel.lon);
      const baseR = rel.radiusDeg * pxPerDeg;

      // Soft NW light / SE hillshade shadow
      const shadeGrad = ctx.createRadialGradient(
        center.x + baseR * 0.16,
        center.y + baseR * 0.18,
        baseR * 0.05,
        center.x + baseR * 0.08,
        center.y + baseR * 0.1,
        baseR * 1.15
      );
      shadeGrad.addColorStop(0, 'rgba(155, 137, 110, 0.24)');
      shadeGrad.addColorStop(0.55, 'rgba(176, 159, 134, 0.11)');
      shadeGrad.addColorStop(1, 'rgba(176, 159, 134, 0)');
      ctx.fillStyle = shadeGrad;
      ctx.beginPath();
      ctx.ellipse(center.x, center.y, baseR * 1.25, baseR * 0.88, -0.18, 0, Math.PI * 2);
      ctx.fill();

      // Concentric cartographic elevation contours
      ctx.strokeStyle = 'rgba(146, 128, 102, 0.26)';
      ctx.lineWidth = Math.max(0.8, 1.05 * scale);
      for (let ring = 1; ring <= 4; ring++) {
        const frac = ring / 4.2;
        ctx.beginPath();
        ctx.ellipse(
          center.x - ring * 2 * scale,
          center.y - ring * 1.5 * scale,
          baseR * frac * 1.05,
          baseR * frac * 0.72,
          -0.2,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      if (rel.elevationLabel && cam.zoom < 2.6) {
        ctx.font = `italic 500 ${Math.round(13 * scale * zoomScale)}px Georgia, serif`;
        ctx.fillStyle = 'rgba(116, 100, 79, 0.65)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rel.elevationLabel, center.x, center.y + baseR * 0.42);
      }
    }
  }

  // 3. Dark-green Edinburgh Parks & Gardens
  for (const park of em.parks) {
    ctx.save();
    drawPolygon(ctx, park.coords, project);
    ctx.fillStyle = '#335943';
    ctx.fill();

    // Subtle botanical inner tonal depth
    ctx.lineWidth = Math.max(1.5, 2.2 * scale);
    ctx.strokeStyle = 'rgba(34, 62, 46, 0.42)';
    ctx.stroke();

    // Soft dashed park path accent inside larger parks
    ctx.restore();

    // Subtle uppercase park label
    const labelCoord = park.labelCoord ?? park.coords[0];
    const lp = project(labelCoord[0], labelCoord[1]);
    ctx.save();
    ctx.font = `600 ${Math.round(clamp(12 * scale * zoomScale, 10 * scale, 18 * scale))}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = 'rgba(235, 243, 236, 0.78)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(park.name.toUpperCase(), lp.x, lp.y);
    ctx.restore();
  }

  // 4. Recognizable Old Town & New Town Building Footprints
  for (const bld of em.buildings) {
    // Subtle architectural drop shadow for depth
    ctx.save();
    ctx.translate(2.2 * scale * zoomScale, 2.8 * scale * zoomScale);
    drawPolygon(ctx, bld.coords, project);
    ctx.fillStyle = bld.landmark ? 'rgba(98, 84, 66, 0.24)' : 'rgba(136, 121, 101, 0.14)';
    ctx.fill();
    ctx.restore();

    // Building footprint fill & fine outline
    drawPolygon(ctx, bld.coords, project);
    ctx.fillStyle = bld.landmark ? '#D7C7AE' : '#E6DDD0';
    ctx.fill();
    ctx.lineWidth = Math.max(0.75, (bld.landmark ? 1.5 : 0.95) * scale);
    ctx.strokeStyle = bld.landmark ? '#9E8A6E' : '#CBC0AD';
    ctx.stroke();
  }

  // 5. Real OpenStreetMap Street Network (2-pass casing + warm ivory fill)
  const streetWidths: Record<'major' | 'secondary' | 'lane', number> = {
    major: 10.5 * scale * zoomScale,
    secondary: 7.4 * scale * zoomScale,
    lane: 4.2 * scale * zoomScale,
  };

  // Pass A: Street casings
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const st of em.streets) {
    if (st.coords.length < 2) continue;
    const p0 = project(st.coords[0][0], st.coords[0][1]);
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i < st.coords.length; i++) {
      const p = project(st.coords[i][0], st.coords[i][1]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = st.kind === 'lane' ? 'rgba(176, 163, 143, 0.65)' : '#BDB09B';
    ctx.lineWidth = streetWidths[st.kind] + 2.4 * scale;
    ctx.stroke();
  }

  // Pass B: Crisp cream road fills
  for (const st of em.streets) {
    if (st.coords.length < 2) continue;
    const p0 = project(st.coords[0][0], st.coords[0][1]);
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i < st.coords.length; i++) {
      const p = project(st.coords[i][0], st.coords[i][1]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = st.kind === 'major' ? '#FDFBF7' : '#F8F4EC';
    ctx.lineWidth = streetWidths[st.kind];
    ctx.stroke();
  }
  ctx.restore();

  // Pass C: Clean oriented street names
  ctx.save();
  for (const st of em.streets) {
    if (!st.name || !st.showLabel || st.coords.length < 2) continue;
    const midIdx = Math.floor((st.coords.length - 1) / 2);
    const pA = project(st.coords[midIdx][0], st.coords[midIdx][1]);
    const pB = project(st.coords[midIdx + 1][0], st.coords[midIdx + 1][1]);
    const mx = (pA.x + pB.x) * 0.5;
    const my = (pA.y + pB.y) * 0.5;
    let angle = Math.atan2(pB.y - pA.y, pB.x - pA.x);
    if (angle > Math.PI * 0.5 || angle < -Math.PI * 0.5) {
      angle += Math.PI;
    }

    const fontSize = Math.round(clamp(11.5 * scale * zoomScale, 10 * scale, 16 * scale));
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(angle);
    ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3.5 * scale;
    ctx.strokeStyle = 'rgba(248, 244, 236, 0.9)';
    ctx.strokeText(st.name.toUpperCase(), 0, -9 * scale);
    ctx.fillStyle = '#6D6254';
    ctx.fillText(st.name.toUpperCase(), 0, -9 * scale);
    ctx.restore();
  }
  ctx.restore();

  // 6. Animated Crimson Red Walking Route (OpenStreetMap Royal Mile spine)
  const routePts = em.routeCoords.map(([lat, lon]) => project(lat, lon));
  const { cumLengths, totalLength } = computePolylineSegments(routePts);
  const routeCol = em.routeColor ?? '#C41E2E';

  if (routeProgressFrac > 0.002) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Subtle ambient crimson drop shadow
    ctx.shadowColor = 'rgba(130, 18, 30, 0.25)';
    ctx.shadowBlur = 10 * scale;
    ctx.shadowOffsetY = 3 * scale;

    // White cartographic halo casing
    tracePartialPolyline(ctx, routePts, cumLengths, totalLength, 0, routeProgressFrac);
    ctx.strokeStyle = '#FCF9F2';
    ctx.lineWidth = 10.5 * scale * clamp(zoomScale, 0.9, 1.35);
    ctx.stroke();

    // Primary crimson red route stroke
    ctx.shadowColor = 'transparent';
    tracePartialPolyline(ctx, routePts, cumLengths, totalLength, 0, routeProgressFrac);
    ctx.strokeStyle = routeCol;
    ctx.lineWidth = 5.6 * scale * clamp(zoomScale, 0.9, 1.35);
    ctx.stroke();

    // Finale luminous highlight sweep along the full route
    if (em.routeHighlightPulse) {
      const pulseWindow = 0.26;
      const pulseCenter = lerp(-0.15, 1.15, easeInOutCubic(clamp((sceneProgress - 0.14) / 0.72)));
      const pFrom = clamp(pulseCenter - pulseWindow * 0.5);
      const pTo = clamp(pulseCenter + pulseWindow * 0.5);
      if (pTo > pFrom) {
        ctx.save();
        ctx.shadowColor = 'rgba(220, 38, 38, 0.7)';
        ctx.shadowBlur = 22 * scale;
        tracePartialPolyline(ctx, routePts, cumLengths, totalLength, pFrom, pTo);
        ctx.strokeStyle = '#FCA5A5';
        ctx.lineWidth = 9.5 * scale;
        ctx.stroke();

        ctx.shadowBlur = 8 * scale;
        tracePartialPolyline(ctx, routePts, cumLengths, totalLength, pFrom, pTo);
        ctx.strokeStyle = '#FFF7ED';
        ctx.lineWidth = 4.2 * scale;
        ctx.stroke();
        ctx.restore();
      }
    } else if (em.routeDrawTo > em.routeDrawFrom && routeProgressFrac < 0.995) {
      // Smooth leading walker beacon at the head of the growing crimson route
      const tip = samplePolylineAt(routePts, cumLengths, totalLength, routeProgressFrac);
      const pulse = 0.5 + 0.5 * Math.sin(globalTime * 5.2);
      ctx.fillStyle = `rgba(196, 30, 46, ${0.18 + pulse * 0.14})`;
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, (15 + pulse * 5) * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FCF9F2';
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 7.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = routeCol;
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 4.8 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 7. Numbered Editorial Stop Markers (01 – 04)
  for (let i = 0; i < em.stops.length; i++) {
    const stop = em.stops[i];
    const reached = routeProgressFrac >= stop.routeFrac - 0.012;
    if (!reached) continue;

    const appearT = easeOutCubic(clamp((routeProgressFrac - (stop.routeFrac - 0.012)) / 0.07));
    const isActive = em.activeStopIndex === i;
    const p = project(stop.lat, stop.lon);
    const radius = (isActive ? 19 : 16) * scale * (0.65 + 0.35 * appearT);

    ctx.save();
    ctx.globalAlpha = appearT;

    // Soft active halo
    if (isActive) {
      ctx.fillStyle = 'rgba(196, 30, 46, 0.18)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius * 1.65, 0, Math.PI * 2);
      ctx.fill();
    }

    // Crisp drop shadow + ivory border + crimson core
    ctx.save();
    ctx.shadowColor = 'rgba(30, 22, 14, 0.28)';
    ctx.shadowBlur = 10 * scale;
    ctx.shadowOffsetY = 3 * scale;
    ctx.fillStyle = routeCol;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#FCF9F2';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Stop number inside marker
    ctx.font = `700 ${Math.round((isActive ? 14 : 12.5) * scale)}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stop.number, p.x, p.y + 0.5 * scale);

    // Refined editorial landmark label positioned without overlap
    const align = stop.labelAlign ?? 'top';
    let lx = p.x;
    let ly = p.y - radius - 14 * scale;
    let textAlign: CanvasTextAlign = 'center';
    let textBaseline: CanvasTextBaseline = 'bottom';

    if (align === 'bottom') {
      ly = p.y + radius + 14 * scale;
      textBaseline = 'top';
    } else if (align === 'left') {
      lx = p.x - radius - 12 * scale;
      ly = p.y;
      textAlign = 'right';
      textBaseline = 'middle';
    } else if (align === 'right') {
      lx = p.x + radius + 12 * scale;
      ly = p.y;
      textAlign = 'left';
      textBaseline = 'middle';
    }

    ctx.font = `700 ${Math.round((isActive ? 15 : 13) * scale)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    ctx.lineWidth = 5 * scale;
    ctx.strokeStyle = 'rgba(243, 236, 224, 0.94)';
    ctx.strokeText(stop.name.toUpperCase(), lx, ly);
    ctx.fillStyle = isActive ? '#1C1917' : '#3F3A34';
    ctx.fillText(stop.name.toUpperCase(), lx, ly);

    ctx.restore();
  }

  // Subtle horizon atmosphere when tilted in oblique aerial mode (Canongate)
  if (tilt > 0.04) {
    const horizonGrad = ctx.createLinearGradient(0, 0, 0, h * 0.24);
    horizonGrad.addColorStop(0, `rgba(243, 236, 224, ${tilt * 0.72})`);
    horizonGrad.addColorStop(1, 'rgba(243, 236, 224, 0)');
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, 0, w, h * 0.24);
  }
}

function drawCartographyHud(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  em: SceneEditorialMap,
  mapVisibility: number
) {
  if (mapVisibility <= 0.02) return;
  const scale = Math.min(w, h) / 1080;

  ctx.save();
  ctx.globalAlpha = clamp(mapVisibility);

  // Discreet editorial top-left map legend (no boxes or pills — pure Swiss cartography)
  const padX = 56 * scale;
  const padY = 44 * scale;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = `600 ${Math.round(13 * scale)}px "JetBrains Mono", monospace`;
  ctx.fillStyle = 'rgba(41, 37, 36, 0.72)';
  ctx.fillText(em.cityLabel.toUpperCase(), padX, padY);

  if (em.coordinatesLabel) {
    ctx.font = `400 ${Math.round(12 * scale)}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(87, 83, 78, 0.72)';
    ctx.fillText(em.coordinatesLabel, padX, padY + 20 * scale);
  }

  // Minimalist compass north arrow + scale bar top-right
  const cx = w - 68 * scale;
  const cy = 66 * scale;
  ctx.strokeStyle = 'rgba(41, 37, 36, 0.35)';
  ctx.lineWidth = 1.2 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, 18 * scale, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = em.routeColor ?? '#C41E2E';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 13 * scale);
  ctx.lineTo(cx + 4 * scale, cy);
  ctx.lineTo(cx - 4 * scale, cy);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(41, 37, 36, 0.65)';
  ctx.beginPath();
  ctx.moveTo(cx, cy + 13 * scale);
  ctx.lineTo(cx + 4 * scale, cy);
  ctx.lineTo(cx - 4 * scale, cy);
  ctx.closePath();
  ctx.fill();

  ctx.font = `600 ${Math.round(10 * scale)}px "JetBrains Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(41, 37, 36, 0.72)';
  ctx.fillText('N', cx, cy - 22 * scale);

  // Subtle scale rule to the left of compass
  const barRight = cx - 36 * scale;
  const barLeft = barRight - 76 * scale;
  const barY = cy + 6 * scale;
  ctx.strokeStyle = 'rgba(41, 37, 36, 0.55)';
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(barLeft, barY - 4 * scale);
  ctx.lineTo(barLeft, barY);
  ctx.lineTo(barRight, barY);
  ctx.lineTo(barRight, barY - 4 * scale);
  ctx.stroke();

  ctx.font = `500 ${Math.round(11 * scale)}px "JetBrains Mono", monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(em.distanceLabel ?? 'ROYAL MILE · 1.81 KM', barRight, barY - 8 * scale);

  ctx.restore();
}

function drawEditorialTitles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  em: SceneEditorialMap,
  sceneProgress: number,
  photoAlpha: number
) {
  const scale = Math.min(w, h) / 1080;
  const layout = em.titleLayout ?? 'lower-left-stop';
  const routeCol = em.routeColor ?? '#C41E2E';

  if (layout === 'centered-opening') {
    // 00:00–00:04 Opening: Centered documentary title over panoramic Edinburgh photo, fading cleanly as map emerges
    const textIn = smoothstep(0.06, 0.24, sceneProgress);
    const textOut = 1 - smoothstep(0.68, 0.88, sceneProgress);
    const textAlpha = clamp(textIn * textOut);
    if (textAlpha <= 0.01) return;

    ctx.save();
    ctx.globalAlpha = textAlpha;

    // Gentle dark documentary vignette for effortless legibility
    const scrim = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.08, w * 0.5, h * 0.5, w * 0.65);
    scrim.addColorStop(0, 'rgba(15, 14, 13, 0.42)');
    scrim.addColorStop(1, 'rgba(15, 14, 13, 0.66)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, w, h);

    const driftY = (1 - easeOutCubic(clamp(sceneProgress / 0.35))) * 18 * scale;
    const centerY = h * 0.5 + driftY;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Editorial title: "EDINBURGH ON FOOT"
    ctx.font = `600 ${Math.round(68 * scale)}px Georgia, "Times New Roman", serif`;
    ctx.fillStyle = '#FAF7F2';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 24 * scale;
    ctx.fillText(em.titleText, w * 0.5, centerY - 26 * scale);

    // Delicate crimson-ivory rule
    ctx.shadowBlur = 0;
    const ruleW = 88 * scale * easeOutCubic(clamp((sceneProgress - 0.1) / 0.3));
    ctx.fillStyle = routeCol;
    ctx.fillRect(w * 0.5 - ruleW * 0.5, centerY + 24 * scale, ruleW, 2.5 * scale);

    // Subtitle: "The Royal Mile"
    ctx.font = `italic 400 ${Math.round(32 * scale)}px Georgia, "Times New Roman", serif`;
    ctx.fillStyle = 'rgba(250, 247, 242, 0.92)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 16 * scale;
    ctx.fillText(em.subtitleText, w * 0.5, centerY + 64 * scale);

    ctx.restore();
    return;
  }

  if (layout === 'centered-finale') {
    // 00:26–00:30 Finale: Full-route map visible with elegant lower editorial closing lockup
    const textIn = smoothstep(0.18, 0.42, sceneProgress);
    if (textIn <= 0.01) return;

    ctx.save();
    ctx.globalAlpha = textIn;

    // Warm parchment-ivory lower gradient scrim so the map remains unobstructed above
    const scrimH = h * 0.36;
    const grad = ctx.createLinearGradient(0, h - scrimH, 0, h);
    grad.addColorStop(0, 'rgba(243, 236, 224, 0)');
    grad.addColorStop(0.45, 'rgba(243, 236, 224, 0.86)');
    grad.addColorStop(1, 'rgba(243, 236, 224, 0.97)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, h - scrimH, w, scrimH);

    const baseY = h - 134 * scale + (1 - easeOutCubic(textIn)) * 14 * scale;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `600 ${Math.round(52 * scale)}px Georgia, "Times New Roman", serif`;
    ctx.fillStyle = '#1C1917';
    ctx.fillText(em.titleText, w * 0.5, baseY);

    const ruleW = 72 * scale * easeOutCubic(textIn);
    ctx.fillStyle = routeCol;
    ctx.fillRect(w * 0.5 - ruleW * 0.5, baseY + 38 * scale, ruleW, 2.5 * scale);

    ctx.font = `italic 400 ${Math.round(27 * scale)}px Georgia, "Times New Roman", serif`;
    ctx.fillStyle = '#44403C';
    ctx.fillText(em.subtitleText, w * 0.5, baseY + 72 * scale);

    ctx.restore();
    return;
  }

  // Stops 01–04 ('lower-left-stop'): Appears gracefully once the landmark arrives / photo transitions in
  const revealStart = em.photoStartFrac ? Math.max(0.08, em.photoStartFrac - 0.1) : 0.14;
  const textIn = smoothstep(revealStart, revealStart + 0.16, sceneProgress);
  const textOut = 1 - smoothstep(0.88, 0.99, sceneProgress);
  const textAlpha = clamp(textIn * textOut);
  if (textAlpha <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = textAlpha;

  // Adaptive editorial scrim: deep cinema vignette over photography, soft warm scrim over light map
  const darkWeight = clamp(photoAlpha * 1.15);
  const scrimH = h * 0.34;
  const grad = ctx.createLinearGradient(0, h - scrimH, 0, h);
  if (darkWeight > 0.35) {
    grad.addColorStop(0, 'rgba(12, 11, 10, 0)');
    grad.addColorStop(0.55, `rgba(12, 11, 10, ${0.52 * darkWeight})`);
    grad.addColorStop(1, `rgba(12, 11, 10, ${0.8 * darkWeight})`);
  } else {
    grad.addColorStop(0, 'rgba(243, 236, 224, 0)');
    grad.addColorStop(0.55, 'rgba(243, 236, 224, 0.72)');
    grad.addColorStop(1, 'rgba(243, 236, 224, 0.92)');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, h - scrimH, w, scrimH);

  const leftX = 76 * scale;
  const bottomY = h - 78 * scale;
  const slideY = (1 - easeOutCubic(textIn)) * 16 * scale;

  // Vertical crimson editorial rule
  ctx.fillStyle = routeCol;
  ctx.fillRect(leftX, bottomY - 72 * scale + slideY, 4 * scale, 74 * scale);

  const onDark = darkWeight > 0.35;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  if (onDark) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 16 * scale;
  }

  // Title: e.g. "01 / EDINBURGH CASTLE"
  ctx.font = `700 ${Math.round(36 * scale)}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = onDark ? '#FAF7F2' : '#1C1917';
  ctx.fillText(em.titleText, leftX + 22 * scale, bottomY - 74 * scale + slideY);

  // Subtitle: e.g. "Where the journey begins"
  ctx.font = `italic 400 ${Math.round(26 * scale)}px Georgia, "Times New Roman", serif`;
  ctx.fillStyle = onDark ? 'rgba(250, 247, 242, 0.88)' : '#44403C';
  ctx.fillText(em.subtitleText, leftX + 22 * scale, bottomY - 28 * scale + slideY);

  ctx.restore();
}

export function renderEditorialCartographyScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scene: OpenMotionScene,
  localTime: number,
  globalTime: number
) {
  const em = scene.editorialMap;
  if (!em) return;

  const dur = Math.max(0.5, scene.durationSec);
  const progress = clamp(localTime / dur);
  const scale = Math.min(w, h) / 1080;

  // Smooth interpolated camera (continuous pan, zoom, and subtle oblique tilt)
  const camT = easeInOutCubic(progress);
  const cam: EditorialMapCamera = {
    lat: lerp(em.cameraFrom.lat, em.cameraTo.lat, camT),
    lon: lerp(em.cameraFrom.lon, em.cameraTo.lon, camT),
    zoom: lerp(em.cameraFrom.zoom, em.cameraTo.zoom, camT),
    tilt: lerp(em.cameraFrom.tilt ?? 0, em.cameraTo.tilt ?? 0, camT),
  };

  // Smooth organic crimson route growth during the map portion of the scene
  const routeSpanEnd = em.photoMode === 'map-to-photo' ? clamp((em.photoStartFrac ?? 0.45) + 0.12, 0.25, 0.9) : 0.85;
  const routeT = easeInOutCubic(clamp(progress / routeSpanEnd));
  const routeProgressFrac = lerp(em.routeDrawFrom, em.routeDrawTo, routeT);

  // Compute full-bleed documentary photography opacity & parallax motion
  let photoAlpha = 0;
  let photoLocalT = 0;
  const mode = em.photoMode ?? 'none';

  if (mode === 'opening-to-map' && em.photoUrl) {
    // 00:00–00:04: Full photo zooms in slowly, then dissolves seamlessly into the Edinburgh map
    const fadeStart = em.photoEndFrac ? em.photoEndFrac - 0.28 : 0.64;
    const fadeEnd = em.photoEndFrac ?? 0.96;
    photoAlpha = 1 - smoothstep(fadeStart, fadeEnd, progress);
    photoLocalT = progress;
  } else if (mode === 'map-to-photo' && em.photoUrl) {
    // Stops 01–04: Map leads in, then full-bleed photo glides in softly and dissolves back to map at exit
    const startF = em.photoStartFrac ?? 0.36;
    const endF = em.photoEndFrac ?? 0.94;
    const fadeIn = smoothstep(startF, startF + 0.14, progress);
    const fadeOut = 1 - smoothstep(endF - 0.12, endF, progress);
    photoAlpha = clamp(fadeIn * fadeOut);
    photoLocalT = clamp((progress - startF) / Math.max(0.1, endF - startF));
  }

  // 1. Always render full-bleed editorial map underneath (zero black bars, zero gaps)
  if (photoAlpha < 0.999) {
    drawPaperCartographyMap(ctx, w, h, em, cam, routeProgressFrac, progress, globalTime);
    drawCartographyHud(ctx, w, h, em, 1 - photoAlpha);
  }

  // 2. Render full-bleed documentary photography with subtle Ken Burns parallax & warm film grade
  if (photoAlpha > 0.005 && em.photoUrl) {
    const img = getCachedPhoto(em.photoUrl);
    ctx.save();
    ctx.globalAlpha = photoAlpha;
    if (img) {
      const zoom = mode === 'opening-to-map'
        ? lerp(1.01, 1.09, easeOutCubic(photoLocalT))
        : lerp(1.02, 1.085, photoLocalT);
      const panX = mode === 'opening-to-map'
        ? lerp(-0.1, 0.14, photoLocalT)
        : lerp(-0.18, 0.18, photoLocalT);
      const panY = lerp(0.08, -0.08, photoLocalT);

      drawCoverImage(ctx, img, w, h, zoom, panX, panY);

      // Subtle warm editorial film tonal wash unifying photography with the parchment map
      ctx.fillStyle = 'rgba(244, 232, 212, 0.06)';
      ctx.fillRect(0, 0, w, h);

      // Gentle edge vignette
      const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.25, w * 0.5, h * 0.5, w * 0.72);
      vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vig.addColorStop(1, 'rgba(15, 13, 11, 0.34)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    } else {
      // Elegant warm fallback while image decodes on first load
      ctx.fillStyle = '#262320';
      ctx.fillRect(0, 0, w, h);
    }

    // Discreet bottom-right Wikimedia Commons photo credit
    if (em.photoCredit && photoAlpha > 0.25) {
      ctx.globalAlpha = photoAlpha * 0.72;
      ctx.font = `400 ${Math.round(12 * scale)}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = '#F5F2EB';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = 8 * scale;
      ctx.fillText(
        `Photo: ${em.photoCredit.author} · ${em.photoCredit.license} (Wikimedia Commons)`,
        w - 36 * scale,
        h - 24 * scale
      );
    }

    ctx.restore();
  }

  // 3. Modern editorial documentary typography
  drawEditorialTitles(ctx, w, h, em, progress, photoAlpha);
}
