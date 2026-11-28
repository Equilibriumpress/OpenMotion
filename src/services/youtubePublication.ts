import type { OpenMotionProject } from '../types/openmotion';

export type YouTubeMetadata = {
  title: string;
  description: string;
  tags: string;
  sources: string;
  tiktokCaption: string;
  primaryKeyword: string;
  secondaryKeywords: string;
  tiktokInteractionCaption: string;
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
function legacyTikTokCaption(p:OpenMotionProject):string {
 const entry=p.seriesId==='the-human-side'?tiktokHuman[p.slug.replace(/^the-human-side-/,'')]:undefined;
 // Use the existing title for other series rather than inventing claims or a language.
 return (entry??p.title).trim().slice(0,TIKTOK_CAPTION_DRAFT_LIMIT);
}

function legacyYouTubeMetadata(p: OpenMotionProject): YouTubeMetadata {
 const entry=p.seriesId==='the-human-side'?human[p.slug.replace(/^the-human-side-/,'')]:undefined;
 const links=Array.from(new Set((p.description.match(/https?:\/\/[^\s<>"']+/g)??[]).map(v=>v.replace(/[.,;:)\]]+$/,''))));
 const title=(entry?.[0]??p.title).slice(0,100);
 return {title,description:(entry?entry[1]+'\n\nThe Human Side · Episode '+String(p.episodeNumber??'').padStart(2,'0')+'\nAn original animated story about everyday human experiences. Not a diagnosis.':p.description).slice(0,5000),
 tags:entry?'The Human Side, animated short, '+entry[2]:'animated video, '+(p.category??''),
 sources:links.join('\n'),tiktokCaption:legacyTikTokCaption(p),primaryKeyword:'',secondaryKeywords:'',tiktokInteractionCaption:legacyTikTokCaption(p)};
}
// Editorial keyword hypotheses, not measured search volumes or guaranteed rankings.
const humanSeo: Record<string, Omit<YouTubeMetadata,'tags'|'sources'>> = {
  "01-same-situation": {
    "primaryKeyword": "overthinking messages",
    "secondaryKeywords": "cognitive appraisal, text message anxiety, emotional reactions, uncertainty",
    "title": "Overthinking Messages: Why the Same Text Feels Different",
    "description": "Overthinking messages often starts before the sender explains what they mean. Two people receive the same text and react differently. This animated example explores cognitive appraisal and the role of context.",
    "tiktokCaption": "Overthinking messages? Two people read “We need to talk” and react differently. Context matters more than assumptions.",
    "tiktokInteractionCaption": "“We need to talk.” What's your first thought when you read those words?"
  },
  "02-no-text-back": {
    "primaryKeyword": "texting anxiety",
    "secondaryKeywords": "waiting for a reply, overthinking texts, uncertainty in relationships, phone checking",
    "title": "Texting Anxiety: Why Waiting for a Reply Feels So Hard",
    "description": "Texting anxiety and the urge to keep checking your phone during a delayed reply. Two people respond differently to silence in this animated story about uncertainty in relationships.",
    "tiktokCaption": "Texting anxiety: waiting for a reply and checking your phone again and again. Silence alone does not explain why someone has not replied.",
    "tiktokInteractionCaption": "No reply yet. Do you check your phone again or put it away?"
  },
  "03-plans-change": {
    "primaryKeyword": "anxiety when plans change",
    "secondaryKeywords": "unexpected changes, disrupted routines, emotional regulation, coping with uncertainty",
    "title": "Anxiety When Plans Change: Why Cancelled Plans Feel Stressful",
    "description": "Anxiety when plans change sometimes follows the loss of an expected routine. Dinner is cancelled in this animated story about unexpected changes and finding one manageable next step.",
    "tiktokCaption": "Anxiety when plans change? A cancelled dinner disrupts an entire evening. Taking a moment and finding one next step might help.",
    "tiktokInteractionCaption": "Dinner is cancelled at the last minute. How does your evening change?"
  },
  "04-boundaries": {
    "primaryKeyword": "people pleasing and boundaries",
    "secondaryKeywords": "setting boundaries, saying no, assertiveness, personal limits",
    "title": "People Pleasing and Boundaries: Why Saying No Feels Hard",
    "description": "People pleasing and boundaries are the focus of this animated story about a request on an already busy day. Two responses explore saying no while still caring about others.",
    "tiktokCaption": "People pleasing and boundaries: saying yes to one more request when your day is already full. A clear limit leaves room for another solution.",
    "tiktokInteractionCaption": "One more favour, and your day is already full. What would you say?"
  },
  "05-criticism": {
    "primaryKeyword": "taking criticism personally",
    "secondaryKeywords": "constructive feedback, self worth, emotional reactions, handling criticism",
    "title": "Taking Criticism Personally: When Feedback Feels Like Rejection",
    "description": "Taking criticism personally sometimes means hearing feedback about work as a judgment of yourself. Two reactions to a draft revision explore the difference between constructive feedback and self worth.",
    "tiktokCaption": "Taking criticism personally? A comment about your draft is not a verdict on your worth. An animated story about handling feedback.",
    "tiktokInteractionCaption": "Someone says your work needs changes. What's your first reaction?"
  },
  "06-resting-guilt": {
    "primaryKeyword": "feeling guilty when resting",
    "secondaryKeywords": "rest guilt, productivity pressure, unfinished tasks, self compassion",
    "title": "Feeling Guilty When Resting? Why Doing Nothing Feels Wrong",
    "description": "Feeling guilty when resting is the focus of this animated story about productivity pressure and unfinished tasks. A short break becomes an opportunity to leave one task unfinished without judging yourself.",
    "tiktokCaption": "Feeling guilty when resting? Unfinished tasks fill your mind even during a break. Rest does not need to be earned.",
    "tiktokInteractionCaption": "You finally sit down. Which unfinished task pops into your head first?"
  },
  "07-smile-we-hide-behind": {
    "primaryKeyword": "emotional masking",
    "secondaryKeywords": "hiding emotions, pretending to be fine, expressing feelings, trusted support",
    "title": "Emotional Masking: The Smile We Hide Behind",
    "description": "Emotional masking and hiding feelings behind a smile. This animated story follows a person who looks cheerful around others, feels drained in private and shares a difficult moment with someone they trust.",
    "tiktokCaption": "Emotional masking: smiling around others while hiding how you feel. Sharing your feelings with someone you trust is one option.",
    "tiktokInteractionCaption": "“I'm fine.” When was the last time you said those words without meaning them?"
  },
  "08-same-mistakes": {
    "primaryKeyword": "how to stop endless scrolling",
    "secondaryKeywords": "phone scrolling, changing habits, environmental cues, screen time",
    "title": "How to Stop Endless Scrolling: Change the Cue",
    "description": "How to stop endless scrolling? Five minutes become ninety in this animated story about phone habits. Moving the phone somewhere harder to reach changes an environmental cue and offers a different starting point.",
    "tiktokCaption": "How to stop endless scrolling? Five minutes turn into ninety. Try changing the cue by moving your phone somewhere harder to reach.",
    "tiktokInteractionCaption": "Five more minutes of scrolling. Suddenly ninety minutes have passed. Sound familiar?"
  },
  "09-being-strong": {
    "primaryKeyword": "emotional exhaustion",
    "secondaryKeywords": "carrying responsibilities, asking for help, stress, sharing the load",
    "title": "Emotional Exhaustion: When Being Strong Gets Exhausting",
    "description": "Emotional exhaustion is explored through a fictional character who takes on increasing responsibilities. Asking for help and sharing tasks offer a different response to stress and a heavy workload.",
    "tiktokCaption": "Emotional exhaustion: always helping others while carrying your own responsibilities. Asking for help is part of caring for yourself.",
    "tiktokInteractionCaption": "When you're always the one helping, who helps you?"
  },
  "10-lonely-in-a-crowd": {
    "primaryKeyword": "feeling lonely around people",
    "secondaryKeywords": "emotional loneliness, social connection, belonging, meaningful conversations",
    "title": "Feeling Lonely Around People: Why Company Is Not Connection",
    "description": "Feeling lonely around people does not necessarily mean lacking company. This animated story explores emotional loneliness in a crowded room and the value of a meaningful conversation.",
    "tiktokCaption": "Feeling lonely around people? A room full of conversation is not always a place of connection. Sometimes one honest conversation feels different.",
    "tiktokInteractionCaption": "Have you ever felt lonely in a room full of people?"
  }
};
function seoEntry(p:OpenMotionProject){return p.seriesId==='the-human-side'?humanSeo[p.slug.replace(/^the-human-side-/,'')]:undefined;}
export function defaultTikTokCaption(p:OpenMotionProject):string {
 return seoEntry(p)?.tiktokCaption??legacyTikTokCaption(p);
}
export function defaultYouTubeMetadata(p:OpenMotionProject):YouTubeMetadata {
 const old=legacyYouTubeMetadata(p),seo=seoEntry(p);
 if(!seo)return old;
 return {...old,...seo,description:seo.description+'\n\nThe Human Side · Episode '+String(p.episodeNumber??'').padStart(2,'0')+'\nAn original animated story about everyday human experiences. Not a diagnosis.',tags:'The Human Side, animated short, '+seo.primaryKeyword+', '+seo.secondaryKeywords};
}
// Migrate untouched v1 defaults automatically; never replace user-written text.
export function migrateYouTubeMetadata(p:OpenMotionProject,value:unknown):YouTubeMetadata {
 const next=defaultYouTubeMetadata(p),old=legacyYouTubeMetadata(p);
 if(!value||typeof value!=='object')return next;
 const v={...value} as Partial<YouTubeMetadata>;
 if(seoEntry(p)&&typeof v.primaryKeyword!=='string'){
  for(const key of ['title','description','tags','tiktokCaption'] as const){
   if(v[key]===old[key])delete v[key];
  }
 }
 return normalizeYouTubeMetadata(v,next);
}
export function normalizeYouTubeMetadata(value:unknown, fallback:YouTubeMetadata):YouTubeMetadata {
 const v=value&&typeof value==='object'?value as Partial<YouTubeMetadata>:{};
 return {title:typeof v.title==='string'?v.title.slice(0,100):fallback.title,
 description:typeof v.description==='string'?v.description.slice(0,5000):fallback.description,
 tags:typeof v.tags==='string'?v.tags.slice(0,500):fallback.tags,
 sources:typeof v.sources==='string'?v.sources.slice(0,12000):fallback.sources,
 tiktokCaption:typeof v.tiktokCaption==='string'?v.tiktokCaption.slice(0,TIKTOK_CAPTION_DRAFT_LIMIT):fallback.tiktokCaption,
 primaryKeyword:typeof v.primaryKeyword==='string'?v.primaryKeyword.slice(0,160):fallback.primaryKeyword,
 secondaryKeywords:typeof v.secondaryKeywords==='string'?v.secondaryKeywords.slice(0,500):fallback.secondaryKeywords,
 tiktokInteractionCaption:typeof v.tiktokInteractionCaption==='string'?v.tiktokInteractionCaption.slice(0,TIKTOK_CAPTION_DRAFT_LIMIT):fallback.tiktokInteractionCaption};
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
