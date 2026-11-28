import { OpenMotionProject, TimedCaption, TimedCaptionWord } from '../types/openmotion';

/**
 * Word-accurate caption layout. All stroke and fill operations share a single
 * left-aligned baseline, avoiding the ghosted / duplicated lettering from r1.
 */
export function renderTimedCaptions(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  project: OpenMotionProject,
  timeSec: number
): void {
  const caption = project.captions?.find(
    (c): c is TimedCaption =>
      c.startSec <= timeSec && timeSec < c.endSec && c.endSec > c.startSec
  );
  if (!caption || !caption.text?.trim()) return;

  const words: TimedCaptionWord[] = caption.words?.length
    ? caption.words
    : caption.text.trim().split(/\s+/).map((word, i, all) => ({
        text: word,
        startSec: caption.startSec + ((caption.endSec - caption.startSec) * i) / all.length,
        endSec: caption.startSec + ((caption.endSec - caption.startSec) * (i + 1)) / all.length,
      }));

  const scale = width / 1080;
  const editorial = project.seriesId === 'simply-explained' && (project.templateVersion === '1.1' || project.templateVersion === '2.0');
  const centerX = width * (editorial ? .60 : .5);
  const maxWidth = width * (editorial ? .42 : .80);
  let fontPx = Math.max(20 * scale, Math.min(82 * scale, (caption.fontSizePx ?? 49) * scale));
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const setFont = () => {
    ctx.font = '800 ' + Math.round(fontPx) + 'px "Bricolage Grotesque", sans-serif';
  };
  setFont();

  const wrap = (): TimedCaptionWord[][] => {
    const lines: TimedCaptionWord[][] = [];
    let line: TimedCaptionWord[] = [];
    for (const word of words) {
      const next = line.length ? line.map(item => item.text).join(' ') + ' ' + word.text : word.text;
      if (line.length && ctx.measureText(next).width > maxWidth) {
        lines.push(line);
        line = [word];
      } else {
        line.push(word);
      }
    }
    if (line.length) lines.push(line);
    return lines;
  };

  let lines = wrap();
  while (lines.length > 3 && fontPx > 21 * scale) {
    fontPx -= 2 * scale;
    setFont();
    lines = wrap();
  }
  const lineHeight = fontPx * 1.38;
  const position = editorial ? .765 : Math.max(.23, Math.min(.78, caption.position ?? .76));
  const totalHeight = lines.length * lineHeight;
  const top = height * position - totalHeight / 2;
  const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line.map(w => w.text).join(' ')).width));
  if (caption.style !== 'minimal') {
    ctx.fillStyle = 'rgba(12, 28, 32, .83)';
    const padX = (editorial ? 14 : 25) * scale, padY = (editorial ? 11 : 19) * scale;
    ctx.beginPath();
    ctx.roundRect(
      centerX - maxLineWidth / 2 - padX,
      top - padY,
      maxLineWidth + padX * 2,
      totalHeight + padY * 2,
      19 * scale
    );
    ctx.fill();
  }
  lines.forEach((line, i) => {
    const text = line.map(item => item.text).join(' ');
    let x = centerX - ctx.measureText(text).width / 2;
    const y = top + (i + .5) * lineHeight;
    line.forEach((word, j) => {
      const glyph = word.text;
      const current = timeSec >= word.startSec && timeSec < word.endSec;
      ctx.textAlign = 'left';
      if (caption.style === 'minimal') {
        ctx.strokeStyle = 'rgba(8, 23, 25, .86)';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 5.5 * scale;
        ctx.strokeText(glyph, x, y);
      }
      ctx.fillStyle =
        caption.style === 'karaoke' && current
          ? (caption.color ?? '#FFE1A0')
          : caption.style === 'block' ? (caption.color ?? '#FFFFFF') : '#FFFFFF';
      ctx.fillText(glyph, x, y);
      x += ctx.measureText(glyph).width + (j < line.length - 1 ? ctx.measureText(' ').width : 0);
    });
  });
  ctx.restore();
}
