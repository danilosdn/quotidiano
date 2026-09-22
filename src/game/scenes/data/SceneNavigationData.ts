import type { AnchorPoint } from '../../interactions/InteractionTypes';
import type { RectObstacle } from '../../navigation/NavigationManager';

export interface SceneNavigationDefinition {
  width: number;
  height: number;
  spawn: { x:number; y:number };
  obstacles: RectObstacle[];
  anchors: Record<string, AnchorPoint>;
}

export const HOME_NAV: SceneNavigationDefinition = {
  width: 1600,
  height: 1000,
  spawn: { x:610, y:670 },
  obstacles: [
    {x:105,y:75,width:1390,height:43},{x:105,y:75,width:43,height:850},{x:1452,y:75,width:43,height:850},{x:105,y:900,width:1390,height:35},
    {x:600,y:115,width:38,height:227},{x:600,y:454,width:38,height:28},{x:1250,y:115,width:38,height:395},
    {x:130,y:505,width:468,height:38},{x:710,y:505,width:238,height:38},{x:1088,y:505,width:402,height:38},
    {x:495,y:543,width:38,height:132},{x:495,y:790,width:38,height:110},{x:720,y:543,width:38,height:147},{x:720,y:805,width:38,height:95},
    {x:190,y:180,width:230,height:142},{x:440,y:160,width:145,height:190},{x:725,y:230,width:240,height:120},{x:790,y:393,width:150,height:78},
    {x:870,y:565,width:360,height:118},{x:1225,y:560,width:104,height:180},{x:842,y:728,width:146,height:106},{x:355,y:650,width:110,height:72}
  ],
  anchors: {
    bed:{x:310,y:355,facing:'up'},
    sofa:{x:1005,y:340,facing:'left'},
    table:{x:805,y:850,facing:'right'},
    wardrobe:{x:520,y:375,facing:'up'},
    fridge:{x:1190,y:735,facing:'up'},
    stove:{x:1100,y:714,facing:'up'},
    sink:{x:835,y:650,facing:'right'},
    coffeeMaker:{x:1170,y:712,facing:'up'},
    shower:{x:255,y:760,facing:'up'},
    bathSink:{x:405,y:790,facing:'up'},
    mirror:{x:470,y:745,facing:'left'},
    backpack:{x:590,y:735,facing:'up'},
    keys:{x:635,y:700,facing:'up'},
    exit:{x:638,y:842,facing:'down'}
  }
};

export const STREET_NAV: SceneNavigationDefinition = {
  width: 2400,
  height: 1000,
  spawn: { x:300, y:335 },
  obstacles: [
    // Continuous façade line. Interaction anchors sit on the public sidewalk below it.
    {x:0,y:0,width:2400,height:246},
    // Street furniture / vegetation footprints.
    {x:110,y:248,width:125,height:48},{x:365,y:248,width:125,height:48},
    {x:815,y:300,width:150,height:42},
    {x:1016,y:292,width:30,height:58},
    {x:1065,y:298,width:190,height:56},
    {x:1748,y:280,width:34,height:70},{x:1938,y:292,width:30,height:58},
    {x:470,y:270,width:48,height:50},
    {x:1580,y:270,width:48,height:50},
    {x:840,y:845,width:54,height:60},
    {x:1840,y:845,width:54,height:60},
    // Café pavement board and one outdoor table leave a generous path to the door.
    {x:1998,y:316,width:54,height:46},
    {x:2250,y:318,width:88,height:62}
  ],
  anchors: {
    house:{x:300,y:284,facing:'up'},
    pieter:{x:690,y:342,facing:'left'},
    lotte:{x:1370,y:382,facing:'right'},
    pip:{x:1495,y:410,facing:'right'},
    bench:{x:1160,y:392,facing:'up'},
    bike:{x:890,y:382,facing:'up'},
    bus:{x:1705,y:382,facing:'right'},
    cafe:{x:2165,y:292,facing:'up'}
  }
};

export const CAFE_NAV: SceneNavigationDefinition = {
  width: 1500,
  height: 950,
  spawn: { x:750, y:810 },
  obstacles: [
    {x:95,y:70,width:1310,height:48},{x:95,y:70,width:48,height:820},{x:1357,y:70,width:48,height:820},{x:95,y:860,width:1310,height:40},
    {x:810,y:230,width:460,height:155},{x:650,y:335,width:200,height:100},
    {x:355,y:575,width:130,height:95},{x:965,y:580,width:130,height:95},
    {x:1278,y:735,width:50,height:55}
  ],
  anchors: {
    sanne:{x:1060,y:455,facing:'up'},
    menu:{x:590,y:365,facing:'up'},
    display:{x:740,y:475,facing:'up'},
    coffee:{x:965,y:465,facing:'up'},
    tableLeft:{x:325,y:715,facing:'right'},
    tableRight:{x:930,y:720,facing:'right'},
    customer:{x:575,y:535,facing:'left'},
    bin:{x:1235,y:790,facing:'right'},
    exit:{x:750,y:820,facing:'down'}
  }
};

export const REQUIRED_ANCHORS = {
  HomeScene: ['bed','sofa','table','wardrobe','fridge','stove','sink','shower','keys','exit'],
  StreetScene: ['house','pieter','lotte','pip','bench','bike','bus','cafe'],
  CafeScene: ['sanne','menu','display','coffee','tableLeft','tableRight','customer','bin','exit']
} as const;
