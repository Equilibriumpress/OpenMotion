import { EDITORIAL_LAYOUT, QUALITY_LAYOUT } from './simplyExplainedLayout';
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
  const editorial = project.seriesId === 'simply-explained' && (project.templateVersion === '1.1' || project.templateVersion === '2.0' || project.templateVersion === '2.6' || project.templateVersion === '2.7' || project.templateVersion === '3.0' || (project.templateVersion === '3.1' || (project.templateVersion === '3.2' || project.templateVersion === '3.3')));
  const strict = project.seriesId === 'simply-explained' && (project.templateVersion === '2.7' || (project.templateVersion === '3.1' || (project.templateVersion === '3.2' || project.templateVersion === '3.3')));
  const zone=(project.templateVersion==='3.2'||project.templateVersion==='3.3')?QUALITY_LAYOUT.caption:EDITORIAL_LAYOUT.caption;
  const sx=width/EDITORIAL_LAYOUT.width,sy=height/EDITORIAL_LAYOUT.height;
  const padX=(editorial||strict?14:25)*scale,padY=(editorial||strict?11:19)*scale;
  const centerX = strict ? (zone.left+zone.right)*sx/2 : width * (editorial ? .60 : .5);
  const maxWidth = strict ? (zone.right-zone.left)*sx-2*padX-6*scale : width * (editorial ? .42 : .80);
  let fontPx = Math.max(20 * scale, Math.min(82 * scale, (caption.fontSizePx ?? 49) * scale));
  ctx.save();
  if(strict){ctx.beginPath();ctx.rect(zone.left*sx,zone.top*sy,(zone.right-zone.left)*sx,(zone.bottom-zone.top)*sy);ctx.clip();}
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const setFont = () => {
    ctx.font = '800 ' + Math.round(fontPx) + 'px "Bricolage Grotesque", sans-serif';
  };
  setFont();

  // Match the exact per-word advance used for painting, including spaces.
  const measure=(line:TimedCaptionWord[])=>line.reduce((n,w,i)=>n+ctx.measureText(w.text).width+(i?ctx.measureText(' ').width:0),0);
  const wrap = (): TimedCaptionWord[][] => {
    const lines: TimedCaptionWord[][] = [];
    let line: TimedCaptionWord[] = [];
    for (const word of words) {
      const next = line.length ? line.map(item => item.text).join(' ') + ' ' + word.text : word.text;
      if (line.length && (strict?measure([...line,word]):ctx.measureText(next).width) > maxWidth) {
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
  if(strict){
    const availableHeight=2*Math.min(zone.centerY-zone.top,zone.bottom-zone.centerY)*sy-2*padY-6*scale;
    // Fit long single words as well as multi-line cues. Do not truncate words.
    while((lines.length*fontPx*1.38>availableHeight||lines.some(line=>measure(line)>maxWidth))&&fontPx>scale){
      fontPx*=.94;setFont();lines=wrap();
    }
  }
  const lineHeight = fontPx * 1.38;
  const position = strict ? zone.centerY/EDITORIAL_LAYOUT.height : editorial ? .765 : Math.max(.23, Math.min(.78, caption.position ?? .76));
  const totalHeight = lines.length * lineHeight;
  const top = height * position - totalHeight / 2;
  const maxLineWidth = Math.max(...lines.map(line => strict?measure(line):ctx.measureText(line.map(w => w.text).join(' ')).width));
  if (caption.style !== 'minimal') {
    ctx.fillStyle = 'rgba(12, 28, 32, .83)';
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
    let x = centerX - (strict?measure(line):ctx.measureText(text).width) / 2;
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
