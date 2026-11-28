/** Shared portrait composition for Simply Explained 2.7.
 * Logical dimensions match the editorial Canvas renderer. Regions are disjoint,
 * including padding, animated hands and caption background.
 */
export const EDITORIAL_LAYOUT={width:512,height:910,
  graphic:{left:26,top:40,right:466,bottom:652},
  host:{left:0,top:674,right:192,bottom:910,anchorX:77,anchorY:816,scale:.82},
  caption:{left:202,top:658,right:432,bottom:784,centerY:720}
} as const;
export const EDITORIAL_LAYOUT_MARKER='alex-27-layout';

export const QUALITY_MARKER='alex-quality-v1';
export const QUALITY_LAYOUT={width:512,height:910,
 graphic:{left:26,top:40,right:466,bottom:635},
 host:{left:0,top:652,right:240,bottom:910,anchorX:96,anchorY:787,scale:1.05},
 caption:{left:248,top:686,right:448,bottom:824,centerY:755}
} as const;
