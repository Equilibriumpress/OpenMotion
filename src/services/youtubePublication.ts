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
  hashtags: string;
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
 sources:links.join('\n'),tiktokCaption:legacyTikTokCaption(p),primaryKeyword:'',secondaryKeywords:'',tiktokInteractionCaption:legacyTikTokCaption(p),hashtags:''};
}
// Editorial keyword hypotheses, not measured search volumes or guaranteed rankings.
const humanSeo: Record<string, Omit<YouTubeMetadata,'tags'|'sources'|'hashtags'>> = {
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
const humanHashtags: Record<string,string> = {
  "01-same-situation": "#TheHumanSide #Psychology #Overthinking #Emotions #Mindset",
  "02-no-text-back": "#TheHumanSide #Psychology #TextingAnxiety #Overthinking #Relationships",
  "03-plans-change": "#TheHumanSide #Psychology #Anxiety #Change #EmotionalRegulation",
  "04-boundaries": "#TheHumanSide #Psychology #PeoplePleasing #Boundaries #SelfWorth",
  "05-criticism": "#TheHumanSide #Psychology #Criticism #SelfEsteem #PersonalGrowth",
  "06-resting-guilt": "#TheHumanSide #Psychology #RestGuilt #ProductivityGuilt #SelfCompassion",
  "07-smile-we-hide-behind": "#TheHumanSide #Psychology #EmotionalMasking #MentalHealth #Emotions",
  "08-same-mistakes": "#TheHumanSide #Psychology #PhoneAddiction #Habits #ScreenTime",
  "09-being-strong": "#TheHumanSide #Psychology #EmotionalExhaustion #Stress #SelfCare",
  "10-lonely-in-a-crowd": "#TheHumanSide #Psychology #Loneliness #Belonging #HumanConnection"
};
export function defaultHashtags(p:OpenMotionProject):string {
 return p.seriesId==='the-human-side'?humanHashtags[p.slug.replace(/^the-human-side-/,'')]??'':'';
}
// Accept whitespace/comma separated tokens, optional #, Unicode letters and digits.
// Preserve case for display and deduplicate case-insensitively.
export function publicationHashtags(value:string):string[] {
 const seen=new Set<string>();
 return value.split(/[\s,]+/u).map(v=>v.replace(/^#+/,'')).filter(v=>{
  const key=v.toLowerCase();
  if(!/^[\p{L}\p{M}\p{N}_]+$/u.test(v)||!/[\p{L}\p{N}]/u.test(v)||seen.has(key))return false;
  seen.add(key);return true;
 }).map(v=>'#'+v).slice(0,5);
}
export function youtubeHashtags(m:YouTubeMetadata):string[] {
 const tags=publicationHashtags(m.hashtags);
 // Prefer the series and specific topics over the broad Psychology tag.
 return [...tags.filter(v=>v.toLowerCase()!=='#psychology'),...tags.filter(v=>v.toLowerCase()==='#psychology')].slice(0,3);
}
function appendHashtags(body:string,tags:string[]):string {
 const trimmed=body.trim();
 const existing=new Set((trimmed.match(/#[\p{L}\p{M}\p{N}_]+/gu)??[]).map(v=>v.toLowerCase()));
 return [trimmed,tags.filter(v=>!existing.has(v.toLowerCase())).join(' ')].filter(Boolean).join('\n\n');
}
export function publicationTikTokCaption(m:YouTubeMetadata,interaction=false):string {
 return appendHashtags(interaction?m.tiktokInteractionCaption:m.tiktokCaption,publicationHashtags(m.hashtags));
}
function seoEntry(p:OpenMotionProject){return p.seriesId==='the-human-side'?humanSeo[p.slug.replace(/^the-human-side-/,'')]:undefined;}
export function defaultTikTokCaption(p:OpenMotionProject):string {
 return seoEntry(p)?.tiktokCaption??legacyTikTokCaption(p);
}
export function defaultYouTubeMetadata(p:OpenMotionProject):YouTubeMetadata {
  if(p.slug==='premium-travel-routes-003-iceland-ring-road')return {"title":"Iceland’s Ring Road: 6 Scenic Stops on Route 1","description":"Explore six unforgettable Iceland Ring Road stops in 40 seconds: Seljalandsfoss, Reynisfjara, Fjaðrárgljúfur, Jökulsárlón, Hverir and Goðafoss. The loop closes through western Iceland.\n\nThe Open Road Collection · Episode 003 · Cinematic Hybrid Edition\nRoute 1 is approximately 1,322 km; the illustrated trip includes access roads. Check current road and weather conditions before driving. Footage trimmed, cropped, sampled and muted; photographs cropped and colour graded. CC BY-SA adaptations retain the applicable license. Soundscape is original synthesized audio.","tags":"Iceland Ring Road, Iceland road trip, Route 1, Seljalandsfoss, Reynisfjara, Fjadrargljufur, Jokulsarlon, Hverir, Godafoss, Iceland travel","sources":"sergejf · CC BY-SA 2.0 · https://commons.wikimedia.org/wiki/File:Road_No_1_winding_through_the_Icelandic_highlands_(16443714336).jpg · https://creativecommons.org/licenses/by-sa/2.0/\nDiego Delso · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Seljalandsfoss%2C_Su%C3%B0urland%2C_Islandia%2C_2014-08-16%2C_DD_189-191_HDR.JPG · https://creativecommons.org/licenses/by-sa/4.0/\nJakub Hałun · CC BY 4.0 · https://commons.wikimedia.org/wiki/File:Seljalandsfoss_Waterfall%2C_Iceland%2C_20240720_1507_3122.jpg · https://creativecommons.org/licenses/by/4.0/\nDiego Delso · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Reynisfjara%2C_Su%C3%B0urland%2C_Islandia%2C_2014-08-17%2C_DD_164.JPG · https://creativecommons.org/licenses/by-sa/4.0/\nMartin Falbisoner · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Reynisfjara_and_Reynisdrangar%2C_Iceland.jpg · https://creativecommons.org/licenses/by-sa/4.0/\nSyrio · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Fja%C3%B0r%C3%A1rglj%C3%BAfur_01.jpg · https://creativecommons.org/licenses/by-sa/4.0/\nJerzy Strzelecki · CC BY-SA 3.0 · https://commons.wikimedia.org/wiki/File:Fja%C3%B0r%C3%A1rglj%C3%BAfur01(js).jpg · https://creativecommons.org/licenses/by-sa/3.0/\nGiles Laurent · gileslaurent.com · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:033_Freshly_rotated_iceberg_at_J%C3%B6kuls%C3%A1rl%C3%B3n_(Iceland)_Photo_by_Giles_Laurent.jpg · https://creativecommons.org/licenses/by-sa/4.0/\nJakub Hałun · CC BY 4.0 · https://commons.wikimedia.org/wiki/File:J%C3%B6kuls%C3%A1rl%C3%B3n_glacier_lagoon%2C_Iceland%2C_20240718_1544_2213.jpg · https://creativecommons.org/licenses/by/4.0/\nJavierOlivares · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:N%C3%A1maskar%C3%B0_and_Hveroid.jpg · https://creativecommons.org/licenses/by-sa/4.0/\nJavierOlivares · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:N%C3%A1mafjall_Hverir.jpg · https://creativecommons.org/licenses/by-sa/4.0/\nMartin Falbisoner · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Go%C3%B0afoss_July_2014.JPG · https://creativecommons.org/licenses/by-sa/4.0/\nJakub Hałun · CC BY 4.0 · https://commons.wikimedia.org/wiki/File:Go%C3%B0afoss_Waterfall%2C_Iceland%2C_20240716_0921_1217.jpg · https://creativecommons.org/licenses/by/4.0/\nhttps://www.visiticeland.com/article/the-ring-road/\nhttps://umferdin.is/en\nhttps://safetravel.is/\nMap: OpenStreetMap / OpenFreeMap / OpenMapTiles; terrain: Mapzen / AWS; routing: OSRM.\n\nFootage (including optional sources):\nGiles Laurent · gileslaurent.com · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:203_Seljalandsfoss_long_exposure_timelapse_Video_by_Giles_Laurent.webm · https://creativecommons.org/licenses/by-sa/4.0/\nAlexander Grebenkov · CC BY 3.0 · https://commons.wikimedia.org/wiki/File:Windy_day_at_Reynisfjara_beach_in_Iceland.webm · https://creativecommons.org/licenses/by/3.0/\nAlexander Grebenkov · CC BY 3.0 · https://commons.wikimedia.org/wiki/File:Waterfall_in_Fja%C3%B0r%C3%A1rglj%C3%BAfur_canyon.webm · https://creativecommons.org/licenses/by/3.0/\nJason Eppink · CC BY 2.0 · https://commons.wikimedia.org/wiki/File:Brei%C3%B0armerkurj%C3%B6kull_glacier_lagoon.webm · https://creativecommons.org/licenses/by/2.0/\nJason Eppink · CC BY 2.0 · https://commons.wikimedia.org/wiki/File:Fumarole_at_Hverir%2C_Iceland.webm · https://creativecommons.org/licenses/by/2.0/\nAlexander Grebenkov · CC BY 3.0 · https://commons.wikimedia.org/wiki/File:Go%C3%B0afoss_waterfall_in_Northern_Iceland.webm · https://creativecommons.org/licenses/by/3.0/","primaryKeyword":"Iceland Ring Road","secondaryKeywords":"Iceland road trip, Reynisfjara black sand beach, Fjadrargljufur canyon, Jokulsarlon glacier lagoon, Hverir geothermal area","tiktokCaption":"Six stops on Iceland’s Ring Road in 40 seconds: waterfalls, black sand, a winding canyon, blue icebergs and steaming volcanic ground. Save this route for your Iceland trip.","tiktokInteractionCaption":"Black sand, glaciers, canyons or waterfalls? Which of these six Iceland stops would you visit first?","hashtags":""};
  if(p.slug==='premium-travel-routes-002-dolomites')return {"title":"Dolomites Road Trip: 4 Scenic Stops in the Italian Alps","description":"Follow a Dolomites road trip from Ortisei to Passo Gardena, Passo Giau and Lago di Braies. Four scenic stops in 30 seconds, with real road maps and authentic mountain photography.\n\nThe Open Road Collection · Episode 002\nSave this route for your next Italian Alps trip. Check local road and lake access restrictions before travelling.\nPhotographs cropped and colour graded. CC BY-SA adaptations retain their applicable licenses.","tags":"Dolomites road trip, Italian Alps, Ortisei, Passo Gardena, Passo Giau, Lago di Braies, scenic drives, South Tyrol","sources":"Simo Räsänen · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:SS242_road_makes_a_bend_on_the_way_to_Passo_Sella%2C_Trentino-Alto_Adige%2C_Italy%2C_2025_October.jpg\nPufacz · Public domain · https://commons.wikimedia.org/wiki/File:Italy_Ortisei_panorama.JPG\nMoroder · CC BY 2.5 · https://commons.wikimedia.org/wiki/File:Parish_church_Urtijei.JPG\nDmitry Djouce · CC BY 4.0 · https://commons.wikimedia.org/wiki/File:Passo_Gardena_-_Dolomites%2C_Italy_2025.jpg\nSjaak Kempe · CC BY 2.0 · https://commons.wikimedia.org/wiki/File:20130702_03_Passo_Gardena_(9230184794).jpg\nkallerna · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Ra_Gusela_3.jpg\nkallerna · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Passo_Giau_SP638.jpg\nMaxagace · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Lake_Lago_di_Braies.jpg\nCAPTAIN RAJU · CC0 1.0 · https://commons.wikimedia.org/wiki/File:Lake_of_Braies_in_2024.25.jpg\nMap: OpenStreetMap / OpenFreeMap / OpenMapTiles; terrain: Mapzen / AWS; routing: OSRM.\nhttps://www.valgardena.it/en/summer-holidays-dolomites/mobility-val-gardena/dolomites-passes/","primaryKeyword":"Dolomites road trip","secondaryKeywords":"Italian Alps scenic drives, Passo Gardena, Passo Giau, Lago di Braies","tiktokCaption":"Dolomites road trip in 30 seconds: Ortisei, Passo Gardena, Passo Giau and Lago di Braies. Save these four stops for your next Italian Alps adventure.","tiktokInteractionCaption":"Mountain passes or turquoise lakes? Which of these four Dolomites stops would you visit first?","hashtags":""};
 const old=legacyYouTubeMetadata(p),seo=seoEntry(p);
 if(!seo)return old;
 return {...old,...seo,hashtags:defaultHashtags(p),description:seo.description+'\n\nThe Human Side · Episode '+String(p.episodeNumber??'').padStart(2,'0')+'\nAn original animated story about everyday human experiences. Not a diagnosis.',tags:'The Human Side, animated short, '+seo.primaryKeyword+', '+seo.secondaryKeywords};
}
// Migrate untouched v1 defaults automatically; never replace user-written text.
export function migrateYouTubeMetadata(p:OpenMotionProject,value:unknown):YouTubeMetadata {
 const next=defaultYouTubeMetadata(p),old=legacyYouTubeMetadata(p);
 if(!value||typeof value!=='object')return next;
 const v={...value} as Partial<YouTubeMetadata>;
 // Upgrade untouched R9 defaults to R10, keeping custom copy. Always include selected footage attribution.
 if(p.slug==='premium-travel-routes-003-iceland-ring-road'&&p.templateVersion==='4.0'){
  const priorR9:YouTubeMetadata={"title":"Iceland’s Ring Road: 6 Scenic Stops on Route 1","description":"Explore six unforgettable Iceland Ring Road stops in 40 seconds: Seljalandsfoss, Reynisfjara, Fjaðrárgljúfur, Jökulsárlón, Hverir and Goðafoss. The loop closes through western Iceland.\n\nThe Open Road Collection · Episode 003 · Signature Extended Edition\nRoute 1 is approximately 1,322 km; the illustrated trip includes access roads. Check current road and weather conditions before driving. Photographs cropped and colour graded; applicable image licenses are retained. Soundscape is original synthesized audio.","tags":"Iceland Ring Road, Iceland road trip, Route 1, Seljalandsfoss, Reynisfjara, Fjadrargljufur, Jokulsarlon, Hverir, Godafoss, Iceland travel","sources":"sergejf · CC BY-SA 2.0 · https://commons.wikimedia.org/wiki/File:Road_No_1_winding_through_the_Icelandic_highlands_(16443714336).jpg · https://creativecommons.org/licenses/by-sa/2.0/\nDiego Delso · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Seljalandsfoss%2C_Su%C3%B0urland%2C_Islandia%2C_2014-08-16%2C_DD_189-191_HDR.JPG · https://creativecommons.org/licenses/by-sa/4.0/\nJakub Hałun · CC BY 4.0 · https://commons.wikimedia.org/wiki/File:Seljalandsfoss_Waterfall%2C_Iceland%2C_20240720_1507_3122.jpg · https://creativecommons.org/licenses/by/4.0/\nJakub Hałun · CC BY 4.0 · https://commons.wikimedia.org/wiki/File:Seljalandsfoss_Waterfall%2C_Iceland%2C_20240720_1504_3112.jpg · https://creativecommons.org/licenses/by/4.0/\nDiego Delso · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Reynisfjara%2C_Su%C3%B0urland%2C_Islandia%2C_2014-08-17%2C_DD_164.JPG · https://creativecommons.org/licenses/by-sa/4.0/\nMartin Falbisoner · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Reynisfjara_and_Reynisdrangar%2C_Iceland.jpg · https://creativecommons.org/licenses/by-sa/4.0/\nBeata May · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Black_sand_beach_in_V%C3%ADk_%C3%AD_M%C3%BDrdal%2C_Iceland.JPG · https://creativecommons.org/licenses/by-sa/4.0/\nSyrio · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Fja%C3%B0r%C3%A1rglj%C3%BAfur_01.jpg · https://creativecommons.org/licenses/by-sa/4.0/\nJerzy Strzelecki · CC BY-SA 3.0 · https://commons.wikimedia.org/wiki/File:Fja%C3%B0r%C3%A1rglj%C3%BAfur01(js).jpg · https://creativecommons.org/licenses/by-sa/3.0/\nWojciech Strzelecki (Wojtrix) · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Fja%C3%B0r%C3%A1rglj%C3%BAfur01(ws).jpg · https://creativecommons.org/licenses/by-sa/4.0/\nGiles Laurent · gileslaurent.com · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:033_Freshly_rotated_iceberg_at_J%C3%B6kuls%C3%A1rl%C3%B3n_(Iceland)_Photo_by_Giles_Laurent.jpg · https://creativecommons.org/licenses/by-sa/4.0/\nJakub Hałun · CC BY 4.0 · https://commons.wikimedia.org/wiki/File:J%C3%B6kuls%C3%A1rl%C3%B3n_glacier_lagoon%2C_Iceland%2C_20240718_1544_2213.jpg · https://creativecommons.org/licenses/by/4.0/\nJakub Hałun · CC BY 4.0 · https://commons.wikimedia.org/wiki/File:J%C3%B6kuls%C3%A1rl%C3%B3n_glacier_lagoon%2C_Iceland%2C_20240718_1542_2187.jpg · https://creativecommons.org/licenses/by/4.0/\nJavierOlivares · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:N%C3%A1maskar%C3%B0_and_Hveroid.jpg · https://creativecommons.org/licenses/by-sa/4.0/\nJavierOlivares · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:N%C3%A1mafjall_Hverir.jpg · https://creativecommons.org/licenses/by-sa/4.0/\nWojciech Strzelecki (Wojtrix) · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Hverir01(ws).jpg · https://creativecommons.org/licenses/by-sa/4.0/\nMartin Falbisoner · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Go%C3%B0afoss_July_2014.JPG · https://creativecommons.org/licenses/by-sa/4.0/\nJakub Hałun · CC BY 4.0 · https://commons.wikimedia.org/wiki/File:Go%C3%B0afoss_Waterfall%2C_Iceland%2C_20240716_0921_1217.jpg · https://creativecommons.org/licenses/by/4.0/\nJakub Hałun · CC BY 4.0 · https://commons.wikimedia.org/wiki/File:Go%C3%B0afoss_Waterfall%2C_Iceland%2C_20240716_0851_1122.jpg · https://creativecommons.org/licenses/by/4.0/\nhttps://www.visiticeland.com/article/the-ring-road/\nhttps://umferdin.is/en\nhttps://safetravel.is/\nMap: OpenStreetMap / OpenFreeMap / OpenMapTiles; terrain: Mapzen / AWS; routing: OSRM.","primaryKeyword":"Iceland Ring Road","secondaryKeywords":"Iceland road trip, Reynisfjara black sand beach, Fjadrargljufur canyon, Jokulsarlon glacier lagoon, Hverir geothermal area","tiktokCaption":"Six stops on Iceland’s Ring Road in 40 seconds: waterfalls, black sand, a winding canyon, blue icebergs and steaming volcanic ground. Save this route for your Iceland trip.","tiktokInteractionCaption":"Black sand, glaciers, canyons or waterfalls? Which of these six Iceland stops would you visit first?","hashtags":""};
  for(const key of Object.keys(priorR9) as (keyof YouTubeMetadata)[]){if(v[key]===priorR9[key])delete v[key];}
  if(typeof v.sources==='string'&&v.sources!==priorR9.sources){
   const footage=["Giles Laurent · gileslaurent.com · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:203_Seljalandsfoss_long_exposure_timelapse_Video_by_Giles_Laurent.webm · https://creativecommons.org/licenses/by-sa/4.0/","Alexander Grebenkov · CC BY 3.0 · https://commons.wikimedia.org/wiki/File:Windy_day_at_Reynisfjara_beach_in_Iceland.webm · https://creativecommons.org/licenses/by/3.0/","Jason Eppink · CC BY 2.0 · https://commons.wikimedia.org/wiki/File:Brei%C3%B0armerkurj%C3%B6kull_glacier_lagoon.webm · https://creativecommons.org/licenses/by/2.0/","Jason Eppink · CC BY 2.0 · https://commons.wikimedia.org/wiki/File:Fumarole_at_Hverir%2C_Iceland.webm · https://creativecommons.org/licenses/by/2.0/"];
   const missing=footage.filter(line=>!v.sources!.includes(line.split(' · ').find(part=>part.startsWith('https://commons.wikimedia.org/'))??line));
   if(missing.length)v.sources=[v.sources,...missing].filter(Boolean).join('\n');
  }
 }
 // Upgrade only untouched episode 003 defaults; preserve editorial changes.
 if(p.slug==='premium-travel-routes-003-iceland-ring-road'){
  const prior:YouTubeMetadata={"title":"Iceland’s Ring Road: 4 Unforgettable Stops on Route 1","description":"Explore Iceland’s Ring Road in 30 seconds, from Seljalandsfoss and Vík to Jökulsárlón and Goðafoss, before the loop closes through western Iceland.\n\nThe Open Road Collection · Episode 003\nRoute 1 is approximately 1,322 km; the illustrated trip includes access roads. Check current road and weather conditions before driving. Photographs cropped and colour graded; applicable image licenses are retained. Soundscape is original synthesized audio.","tags":"Iceland Ring Road, Iceland road trip, Route 1, Seljalandsfoss, Vik, Jokulsarlon, Godafoss, Iceland travel","sources":"sergejf · CC BY-SA 2.0 · https://commons.wikimedia.org/wiki/File:Road_No_1_winding_through_the_Icelandic_highlands_(16443714336).jpg · https://creativecommons.org/licenses/by-sa/2.0/\nJakub Hałun · CC BY 4.0 · https://commons.wikimedia.org/wiki/File:Seljalandsfoss_Waterfall%2C_Iceland%2C_20240720_1507_3122.jpg · https://creativecommons.org/licenses/by/4.0/\nJakub Hałun · CC BY 4.0 · https://commons.wikimedia.org/wiki/File:Seljalandsfoss_Waterfall%2C_Iceland%2C_20240720_1504_3112.jpg · https://creativecommons.org/licenses/by/4.0/\nBeata May · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Black_sand_beach_in_V%C3%ADk_%C3%AD_M%C3%BDrdal%2C_Iceland.JPG · https://creativecommons.org/licenses/by-sa/4.0/\nClaracorcoran1 · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Black_Sand_Beach_in_V%C3%ADk_%C3%AD_M%C3%BDrdal%2C_Iceland.jpg · https://creativecommons.org/licenses/by-sa/4.0/\nJakub Hałun · CC BY 4.0 · https://commons.wikimedia.org/wiki/File:J%C3%B6kuls%C3%A1rl%C3%B3n_glacier_lagoon%2C_Iceland%2C_20240718_1544_2213.jpg · https://creativecommons.org/licenses/by/4.0/\nJakub Hałun · CC BY 4.0 · https://commons.wikimedia.org/wiki/File:J%C3%B6kuls%C3%A1rl%C3%B3n_glacier_lagoon%2C_Iceland%2C_20240718_1542_2187.jpg · https://creativecommons.org/licenses/by/4.0/\nJakub Hałun · CC BY 4.0 · https://commons.wikimedia.org/wiki/File:Go%C3%B0afoss_Waterfall%2C_Iceland%2C_20240716_0921_1217.jpg · https://creativecommons.org/licenses/by/4.0/\nJakub Hałun · CC BY 4.0 · https://commons.wikimedia.org/wiki/File:Go%C3%B0afoss_Waterfall%2C_Iceland%2C_20240716_0851_1122.jpg · https://creativecommons.org/licenses/by/4.0/\nhttps://www.visiticeland.com/article/the-ring-road/\nhttps://www.vegagerdin.is/en/home/exploring-iceland/the-ring-road\nhttps://umferdin.is/en\nhttps://safetravel.is/\nMap: OpenStreetMap / OpenFreeMap / OpenMapTiles; terrain: Mapzen / AWS; routing: OSRM.","primaryKeyword":"Iceland Ring Road","secondaryKeywords":"Iceland road trip, Route 1 Iceland, Iceland waterfalls, Jokulsarlon glacier lagoon","tiktokCaption":"Iceland Ring Road in 30 seconds. Waterfalls, black volcanic sand and drifting icebergs: Seljalandsfoss, Vík, Jökulsárlón and Goðafoss. Save this route for your Iceland trip.","tiktokInteractionCaption":"Black sand beaches, icebergs or waterfalls? Which Iceland stop would you choose first?","hashtags":""};
  for(const key of Object.keys(prior) as (keyof YouTubeMetadata)[]){if(v[key]===prior[key])delete v[key];}
 }
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
 tiktokInteractionCaption:typeof v.tiktokInteractionCaption==='string'?v.tiktokInteractionCaption.slice(0,TIKTOK_CAPTION_DRAFT_LIMIT):fallback.tiktokInteractionCaption,
 hashtags:typeof v.hashtags==='string'?v.hashtags.slice(0,500):fallback.hashtags};
}
export function publicationDescription(m:YouTubeMetadata):string {
 return appendHashtags([m.description.trim(),m.sources.trim()?'Sources / further reading:\n'+m.sources.trim():''].filter(Boolean).join('\n\n'),youtubeHashtags(m));
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
