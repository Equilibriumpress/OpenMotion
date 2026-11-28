/** Shared portrait composition for Simply Explained 2.7.
 * Logical dimensions match the editorial Canvas renderer. Regions are disjoint,
 * including padding, animated hands and caption background.
 */
export const EDITORIAL_LAYOUT={width:512,height:910,
  graphic:{left:26,top:40,right:466,bottom:652},
  host:{left:0,top:674,right:192,bottom:910,anchorX:69,anchorY:816,scale:.82},
  caption:{left:202,top:658,right:432,bottom:784,centerY:720}
} as const;
export const EDITORIAL_LAYOUT_MARKER='alex-27-layout';
