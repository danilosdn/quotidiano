export type Facing = 'up' | 'down' | 'left' | 'right';
export type PlayerActionName = 'use' | 'eat' | 'read' | 'phone' | 'lie';
export type PlayerPose = 'idle' | 'sit' | 'lie';

export const PLAYER_FRAME_MAP = {
  idle: { right:168, up:174, left:180, down:186 },
  walk: {
    right:[280,281,282,283,284,285],
    up:[286,287,288,289,290,291],
    left:[292,293,294,295,296,297],
    down:[298,299,300,301,302,303]
  },
  sit: { left:504, right:510, up:504, down:510 },
  lie: [448,449,450,451,452,453],
  phone: [728,729,730,731,732,733,734,735,736,737,738,739],
  read: [840,841,842,843,844,845,846,847,848,849,850,851],
  use: {
    right:[1176,1177,1178,1179,1180,1181],
    left:[1180,1181,1182,1183,1184,1185],
    up:[1186,1187,1188,1189,1190,1191],
    down:[1196,1197,1198,1199]
  },
  eat: {
    right:[1288,1289,1290,1291,1292,1293],
    left:[1296,1297,1298,1299,1300,1301],
    up:[1302,1303,1304,1305,1306,1307],
    down:[1316,1317,1318,1319]
  }
} as const;

export const assertPlayerFrameMap = (): string[] => {
  const issues: string[]=[];
  const directional = ['up','down','left','right'] as const;
  for (const direction of directional) {
    if (!Number.isInteger(PLAYER_FRAME_MAP.idle[direction])) issues.push(`Missing idle:${direction}`);
    if (PLAYER_FRAME_MAP.walk[direction].length !== 6) issues.push(`walk:${direction} must contain six frames`);
  }
  if (Number(PLAYER_FRAME_MAP.walk.left[0]) === Number(PLAYER_FRAME_MAP.walk.right[0])) issues.push('Left/right walk rows must differ');
  if (PLAYER_FRAME_MAP.idle.right !== 168 || PLAYER_FRAME_MAP.walk.right[0] !== 280 || PLAYER_FRAME_MAP.walk.left[0] !== 292) issues.push('Known corrected directional frames changed');
  return issues;
};
