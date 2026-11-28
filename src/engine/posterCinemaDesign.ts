export const POSTER_DESIGN={"switzerland":{"headline":"SWITZERLAND","sub":"THE ALPINE EXPRESS","foot":"TRAVEL BY RAIL","num":"01","fg":"#f8edcf","style":"swiss","slug":"living-travel-posters-001-switzerland"},"amalfi":{"headline":"AMALFI COAST","sub":"AN ITALIAN SUMMER","foot":"RIVIERA ITALIANA","num":"02","fg":"#244f49","style":"italian","slug":"living-travel-posters-002-amalfi"},"japan":{"headline":"JAPAN","sub":"BENEATH MOUNT FUJI","foot":"SPRING BY RAIL","num":"03","fg":"#244b4b","style":"japanese","slug":"living-travel-posters-003-japan"}} as const;
export type PosterDestination=keyof typeof POSTER_DESIGN;
export const PAPER='#efe2bf';
export const INK='#554c37';
export const TEXTURE_SEED=151;
// A repeated 96-unit ink tile; the same marks are used in Canvas and SVG.
export function printMarks(){let seed=TEXTURE_SEED;const marks:{x:number;y:number;r:number;light:boolean}[]=[];for(let i=0;i<490;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const x=(seed>>>0)%960/10;seed=(Math.imul(seed,1664525)+1013904223)|0;const y=(seed>>>0)%960/10;marks.push({x,y,r:i%7===0?.55:.23,light:i%3===0});}return marks;}
