interface SlotLike {
  name: string;
  nian?: string;
  qi?: string;
  level: string;
  ji: string;
  text?: string;
}

export function buildSlotText(o: {
  title: string;
  ringSlot: 'fenjin' | 'chuanShan' | 'touDi';
  fenjin: { shan?: SlotLike; xiang?: SlotLike } | null;
  chuanShan: { shan?: SlotLike; xiang?: SlotLike } | null;
  touDi: { shan?: SlotLike; xiang?: SlotLike } | null;
  shanName: string;
  shanLevel: string;
  xiangName: string;
  xiangLevel: string;
  xianMingInfo: { name: string; nian: string } | null;
  shanXm: { text: string } | null;
  xiangXm: { text: string } | null;
}): string;

export function buildReadingText(o: {
  shan: string;
  xiang: string;
  period: number;
  overallInfo: { name: string; text: string; advice?: string };
  judges: { palace: string; level: string; brief: string }[];
  special: { cai?: string; wen?: string; bing?: string; sha?: string };
  spText: {
    cai: { text: string };
    wen: { text: string };
    bing: { text: string };
    sha: { text: string };
  };
}): string;

export function buildShaText(o: {
  selectedDir: string;
  shanSheng: string;
  shanLine: string;
  baShaInfo: { branch: string; angle: number } | null;
  shaRows: {
    dir: string;
    mansion: string;
    shaWx: string;
    name: string;
    level: string;
    fang: { name: string; fang: string[] }[];
    text?: string;
  }[];
  currentSha: { dir: string; name: string; text: string } | null;
}): string;

export function buildShuiText(o: {
  selectedDir: string;
  shuiJu: { ju: string; changshengName: string };
  flow: 'left' | 'right';
  shuiInfo: {
    inDeg: number;
    outDeg: number;
    inPos: string;
    outPos: string;
    inLai: string | null;
    outQu: string | null;
    inText: string;
    outText: string;
    summary: string;
  } | null;
}): string;

export function buildGuaText(o: {
  benGuaName: string;
  chouYao: {
    line: string;
    bian: string;
    bianText: string;
    bianPlain: string;
  } | null;
  guaQi: { text: string } | null;
  guaFenjinText: string;
}): string;

export function buildZeriText(o: {
  source: 'calendar' | 'read';
  zeriDate: string;
  zeriDateInfo: {
    yearGz: string;
    monthGz: string;
    dayGz: string;
    monthB: string;
    dayB: string;
    nian: string;
    jianChu?: { name: string; text?: string };
    huangDao?: { name: string; dao?: string };
  } | null;
  zeriInfo: {
    monthB: string;
    dayB: string;
    nian: string;
    jianChu?: { name: string; text?: string };
    huangDao?: { name: string; dao?: string };
  } | null;
  readout: { term?: string; jiazi?: string } | null;
}): string;
