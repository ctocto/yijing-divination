// 玄空九星表 + 大局断语 + 特殊位文案
// 星性文本：当运（旺/生气）用 dangYun，失令用 shiLing。内容为文化参考。

export const stars = [
  { star: 1, name: '一白贪狼', wuxing: '水', nature: '吉',
    dangYun: '一白当运，文思敏捷，人缘桃花俱旺，主聪明才智、声名进益。',
    shiLing: '一白失令，防酒色口舌与桃花是非，情绪易生波澜。' },
  { star: 2, name: '二黑巨门', wuxing: '土', nature: '凶',
    dangYun: '二黑当运，聚财有库，反主财源稳固。',
    shiLing: '二黑失令为病符，防肠胃与慢性疾患，此方宜静不宜动。' },
  { star: 3, name: '三碧禄存', wuxing: '木', nature: '凶',
    dangYun: '三碧当运，官非口舌反成利器，主威权名声。',
    shiLing: '三碧失令主是非争斗，防诉讼争执，少在此方议事。' },
  { star: 4, name: '四绿文曲', wuxing: '木', nature: '平',
    dangYun: '四绿当运，文昌得力，利读书考试、文思进益。',
    shiLing: '四绿失令主是非桃花，文章虽利而慎言语，防文书之损。' },
  { star: 5, name: '五黄廉贞', wuxing: '土', nature: '凶',
    dangYun: '五黄本为极凶，纵当运亦宜化解，主灾病意外。',
    shiLing: '五黄煞气所到，主血光病灾，动土修造尤须避忌。' },
  { star: 6, name: '六白武曲', wuxing: '金', nature: '吉',
    dangYun: '六白当运，武曲主权威与金融，利仕途进财。',
    shiLing: '六白失令主是非与退财，防投资失利、金类破耗。' },
  { star: 7, name: '七赤破军', wuxing: '金', nature: '凶',
    dangYun: '七赤当运，口才与竞争得利，主武职与决断。',
    shiLing: '七赤失令主贼盗口舌，防金属利刃之伤、小人暗算。' },
  { star: 8, name: '八白左辅', wuxing: '土', nature: '吉',
    dangYun: '八白当运，土星主财，田宅不动产兴旺，最利守财。',
    shiLing: '八白失令仍主安稳，财来较缓，宜守成不宜冒进。' },
  { star: 9, name: '九紫右弼', wuxing: '火', nature: '吉',
    dangYun: '九紫当运，喜气盈门，主喜庆婚嫁、声名远扬。',
    shiLing: '九紫失令主急躁眼疾，防火灾血光，宜静心养性。' },
]

// 大局断语（key 供整体判断返回）
export const overallJudgments = {
  wangshan: { name: '旺山旺向', text: '山星得坐、向星得向，人丁与财运皆得其位，为难得的大吉之局。', advice: '坐山处宜聚气，向首处宜开阔纳财，居之丁财两旺。' },
  shuangXiang: { name: '双星到向', text: '旺星双双聚于向首，主财运特旺、门前热闹。', advice: '向首宜开阔明亮，但旺财不旺丁，注意人丁健康。' },
  shuangShan: { name: '双星到山', text: '旺星双双聚于坐山，主人丁兴旺、背后有靠。', advice: '坐山宜高宜静，旺丁而不旺财，理财宜稳健。' },
  shangshan: { name: '上山下水', text: '山星到向、向星到山，人丁与财运失位，为大凶之局。', advice: '宜用风水布局化解，或择吉调整门户朝向。' },
  fuyin: { name: '伏吟', text: '星临本位，气机郁滞，主进展迟缓、事多反复。', advice: '宜在旺方用力，伏吟之宫作静区。' },
  fanyin: { name: '反吟', text: '星与宫位相冲，气机动荡，主变动不安、多是非。', advice: '此方宜静不宜动，大事缓行，以静制动。' },
  ping: { name: '平局', text: '山向旺星未能同到本位，吉凶参半，中平之局。', advice: '可借流年飞星择吉方用事，趋吉避凶。' },
}

// 特殊位文案（key 供 specialPositions 返回的宫位对应）
export const specialPositions = {
  cai: { label: '财位', text: '当运财星所到之方，宜设收银台或财神位，常驻生气以聚财。' },
  wen: { label: '文昌位', text: '四绿文曲所到，利读书考试，宜设书桌文昌。' },
  bing: { label: '病符位', text: '二黑病符所到，宜保持整洁安静，防健康受损。' },
  sha: { label: '五黄煞', text: '五黄煞气所到，切忌动土装修，宜以静化煞。' },
}
