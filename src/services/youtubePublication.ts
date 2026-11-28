import type { OpenMotionProject } from '../types/openmotion';

export type YouTubeMetadata = {
  title: string;
  description: string;
  tags: string;
  sources: string;
  tiktokCaption: string;
};

const human: Record<string, [string,string,string]> = {
 '01-same-situation':['Same Message, Different Minds','Two people receive the same message: “We need to talk.” Their reactions differ before either knows what the sender means.','social psychology, cognitive appraisal, overthinking'],
 '02-no-text-back':['Why No Reply Feels So Personal','A message goes unanswered. One person keeps checking their phone while another leaves room for uncertainty.','texting anxiety, uncertainty, relationships'],
 '03-plans-change':['Why Changed Plans Feel So Stressful','Dinner plans are cancelled. Watch two different responses to an unexpected change.','change, routines, emotional regulation'],
 '04-boundaries':['Why Saying No Feels So Hard','One more favour lands on a full schedule. Two responses show why personal limits matter.','people pleasing, boundaries, assertiveness'],
 '05-criticism':['Why Criticism Feels Personal','A draft needs revisions. One person questions their worth while another looks for specific feedback.','criticism, feedback, self worth'],
 '06-resting-guilt':['Why Resting Makes You Feel Guilty','A quiet break becomes a reminder of unfinished tasks. What happens when you give yourself permission to rest?','rest guilt, productivity pressure, self compassion'],
 '07-smile-we-hide-behind':['The Smile We Hide Behind','A smiling face hides a difficult day. A short animated story about sharing how you feel with someone you trust.','emotional masking, emotions, social connection'],
 '08-same-mistakes':['Why You Keep Making the Same Mistake','Five minutes of scrolling turn into ninety. Changing the environment offers a different starting point.','habits, phone scrolling, behavior change'],
 '09-being-strong':['Being Strong Gets Exhausting','Responsibilities accumulate until the person who helps everyone else needs support too.','responsibility, asking for help, stress'],
 '10-lonely-in-a-crowd':['Lonely in a Room Full of People','A crowded room is not always a place of connection. A short story about feeling understood.','loneliness, belonging, social connection'],
};

// Post captions, distinct from timed subtitles rendered into the video.
export const TIKTOK_CAPTION_DRAFT_LIMIT=2200;
const tiktokHuman: Record<string,string> = {
 '01-same-situation':'“We need to talk.” Four words, two completely different reactions. What goes through your mind?',
 '02-no-text-back':'Sent. Seen. Still no reply. Do you keep checking your phone, or put it away?',
 '03-plans-change':'Dinner is cancelled. Does the rest of your evening suddenly feel off?',
 '04-boundaries':'One more favour when your day is already full. Saying no does not mean you stop caring.',
 '05-criticism':'Someone asks you to change your work. Why does the feedback sometimes feel so personal?',
 '06-resting-guilt':'Finally, a moment to rest. So why are you thinking about everything you still need to do?',
 '07-smile-we-hide-behind':'“I’m fine.” Sometimes a smile tells only part of the story.',
 '08-same-mistakes':'Five more minutes of scrolling. Suddenly, ninety minutes have passed. Sound familiar?',
 '09-being-strong':'When you are always the one helping, who helps you? Asking for support matters too.',
 '10-lonely-in-a-crowd':'A room full of people, yet you still feel lonely. Connection is more than being surrounded.',
};
export function defaultTikTokCaption(p:OpenMotionProject):string {
 const entry=p.seriesId==='the-human-side'?tiktokHuman[p.slug.replace(/^the-human-side-/,'')]:undefined;
 // Use the existing title for other series rather than inventing claims or a language.
 return (entry??p.title).trim().slice(0,TIKTOK_CAPTION_DRAFT_LIMIT);
}

export function defaultYouTubeMetadata(p: OpenMotionProject): YouTubeMetadata {
 const entry=p.seriesId==='the-human-side'?human[p.slug.replace(/^the-human-side-/,'')]:undefined;
 const links=Array.from(new Set((p.description.match(/https?:\/\/[^\s<>"']+/g)??[]).map(v=>v.replace(/[.,;:)\]]+$/,''))));
 const title=(entry?.[0]??p.title).slice(0,100);
 return {title,description:(entry?entry[1]+'\n\nThe Human Side · Episode '+String(p.episodeNumber??'').padStart(2,'0')+'\nAn original animated story about everyday human experiences. Not a diagnosis.':p.description).slice(0,5000),
 tags:entry?'The Human Side, animated short, '+entry[2]:'animated video, '+(p.category??''),
 sources:links.join('\n'),tiktokCaption:defaultTikTokCaption(p)};
}
export function normalizeYouTubeMetadata(value:unknown, fallback:YouTubeMetadata):YouTubeMetadata {
 const v=value&&typeof value==='object'?value as Partial<YouTubeMetadata>:{};
 return {title:typeof v.title==='string'?v.title.slice(0,100):fallback.title,
 description:typeof v.description==='string'?v.description.slice(0,5000):fallback.description,
 tags:typeof v.tags==='string'?v.tags.slice(0,500):fallback.tags,
 sources:typeof v.sources==='string'?v.sources.slice(0,12000):fallback.sources,
 tiktokCaption:typeof v.tiktokCaption==='string'?v.tiktokCaption.slice(0,TIKTOK_CAPTION_DRAFT_LIMIT):fallback.tiktokCaption};
}
export function publicationDescription(m:YouTubeMetadata):string {
 return [m.description.trim(),m.sources.trim()?'Sources / further reading:\n'+m.sources.trim():''].filter(Boolean).join('\n\n');
}
export function publicationSlug(slug:string):string {
 return slug.replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-+|-+$/g,'')||'video';
}
export const publicationChecks=[
 ['watch','Complete MP4 bekeken, inclusief opening en einde'],
 ['listen','Voice-over, muziek en effecten beluisterd'],
 ['rights','Rechten van beeld, muziek, stem en andere assets gecontroleerd'],
 ['facts','Tekst, bronnen en eventuele feitelijke claims gecontroleerd'],
 ['settings','Doelgroep, AI-vermelding indien vereist en zichtbaarheid beoordeeld'],
] as const;
export type PublicationCheckId=typeof publicationChecks[number][0];
export const publicationHelp={
 upload:'https://support.google.com/youtube/answer/12779649',
 cover:'https://support.google.com/youtube/answer/10343433',
 encoding:'https://support.google.com/youtube/answer/1722171',
 metadata:'https://support.google.com/youtube/answer/57404',
};
