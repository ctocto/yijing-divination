// 风水罗盘各模式解读 → 便于粘贴给外部工具（如大模型）解读的文本
// 与 hexagramText.buildHexagramText 同款【标签】格式；数据取自 FengShuiView 已算好的读数

// 定向模式圈位判断（分金 / 穿山 / 透地）：坐向读数 + 吉凶
export function buildSlotText(o) {
  const parts = [`【${o.title}】`];
  if (o.ringSlot === 'fenjin') {
    const shan = o.fenjin?.shan;
    const xiang = o.fenjin?.xiang;
    if (!shan || !xiang) return '';
    parts.push(
      `坐分金：${shan.name}（${shan.nian || '—'}）· ${shan.level} · ${shan.ji}`
    );
    if (shan.text) parts.push(shan.text);
    if (o.xianMingInfo && o.shanXm)
      parts.push(
        `仙命 ${o.xianMingInfo.name}（${o.xianMingInfo.nian}）配分金：${o.shanXm.text}`
      );
    parts.push(
      `向分金：${xiang.name}（${xiang.nian || '—'}）· ${xiang.level} · ${xiang.ji}`
    );
    if (xiang.text) parts.push(xiang.text);
    if (o.xianMingInfo && o.xiangXm)
      parts.push(`仙命配分金：${o.xiangXm.text}`);
    return parts.join('\n');
  }
  const long = o.ringSlot === 'chuanShan' ? o.chuanShan : o.touDi;
  const shan = long?.shan;
  const xiang = long?.xiang;
  if (!shan || !xiang) return '';
  const extra = (s) =>
    o.ringSlot === 'touDi'
      ? `（${s.nian} · ${s.qi}气）`
      : `（${s.nian || '—'}）`;
  parts.push(`坐龙：${o.shanName}${extra(shan)} · ${o.shanLevel} · ${shan.ji}`);
  parts.push(
    `向龙：${o.xiangName}${extra(xiang)} · ${o.xiangLevel} · ${xiang.ji}`
  );
  return parts.join('\n');
}

// 定向模式宅运解读：大局 + 九宫分述 + 特殊方位
export function buildReadingText(o) {
  const parts = [
    `【坐向】坐${o.shan}朝${o.xiang}（${o.period}运）`,
    `【大局】${o.overallInfo.name}——${o.overallInfo.text}`,
  ];
  if (o.overallInfo.advice) parts.push(`　${o.overallInfo.advice}`);
  parts.push('【九宫分述】');
  for (const j of o.judges)
    parts.push(`　${j.palace}：${j.level} · ${j.brief}`);
  const sp = [];
  if (o.special.cai) sp.push(`财位 ${o.special.cai}：${o.spText.cai.text}`);
  if (o.special.wen) sp.push(`文昌位 ${o.special.wen}：${o.spText.wen.text}`);
  if (o.special.bing)
    sp.push(`病符位 ${o.special.bing}：${o.spText.bing.text}`);
  if (o.special.sha) sp.push(`五黄煞 ${o.special.sha}：${o.spText.sha.text}`);
  parts.push(`【特殊方位】${sp.join('；') || '无'}`);
  return parts.join('\n');
}

// 消砂判断：坐山五行 + 八方砂表 + 当前砂细断
export function buildShaText(o) {
  const parts = [
    `【坐山】${o.selectedDir}（${o.shanSheng} · 线度五行 ${o.shanLine}）`,
  ];
  if (o.baShaInfo)
    parts.push(
      `【八煞】${o.baShaInfo.branch}方（${o.baShaInfo.angle}°）逢砂须忌`
    );
  parts.push('【八方砂】');
  for (const s of o.shaRows) {
    const fang = s.fang.map((f) => `${f.name}·${f.fang.join('/')}`).join(' / ');
    parts.push(
      `　${s.dir}：${s.mansion}·${s.shaWx} · ${s.name}（${s.level}） · 应房 ${fang}`
    );
  }
  if (o.currentSha)
    parts.push(
      `【当前】${o.currentSha.dir}·${o.currentSha.name}：${o.currentSha.text}`
    );
  return parts.join('\n');
}

// 纳水判断：坐山定局 + 来去水长生位吉凶 + 总评
export function buildShuiText(o) {
  const parts = [
    `【坐山】${o.selectedDir} → ${o.shuiJu.ju}局（长生 ${o.shuiJu.changshengName}）`,
    `【水流】${o.flow === 'left' ? '左水倒右' : '右水倒左'}`,
  ];
  if (!o.shuiInfo) {
    parts.push('（请先锁定来水与去水方位）');
    return parts.join('\n');
  }
  const s = o.shuiInfo;
  parts.push(
    `【来水】${s.inDeg}° ${s.inPos}（${s.inLai || '–'}）· ${s.inText}`
  );
  parts.push(
    `【去水】${s.outDeg}° ${s.outPos}（${s.outQu || '–'}）· ${s.outText}`
  );
  parts.push(`【总评】${s.summary}`);
  return parts.join('\n');
}

// 易卦抽爻：本卦 + 动爻 + 变卦 + 卦气 + 配分金
export function buildGuaText(o) {
  const parts = [`【本卦】${o.benGuaName}`];
  if (!o.chouYao) {
    parts.push('（选一爻看变卦）');
    return parts.join('\n');
  }
  const c = o.chouYao;
  parts.push(`【动爻】${c.line}`);
  parts.push(`【变卦】${c.bian}——${c.bianText}（${c.bianPlain}）`);
  if (o.guaQi) parts.push(`【卦气】${o.guaQi.text}`);
  parts.push(`【配分金】${o.guaFenjinText}`);
  return parts.join('\n');
}

// 择日判断：日期（或读盘）干支 + 建除/黄道 + 宜忌
export function buildZeriText(o) {
  const info = o.source === 'calendar' ? o.zeriDateInfo : o.zeriInfo;
  if (!info) return '';
  const parts = [];
  if (o.source === 'calendar') {
    parts.push(`【日期】${o.zeriDate}`);
    parts.push(
      `【干支】${info.yearGz}年 ${info.monthGz}月 ${info.dayGz}日（${info.nian}）`
    );
  } else {
    parts.push(
      `【读盘】${o.readout?.term ?? '–'} · ${o.readout?.jiazi ?? '–'}（${info.nian ?? '–'}）`
    );
  }
  parts.push(
    `【建除】${info.monthB ?? '–'}月 ${info.dayB ?? '–'}日 · ${info.jianChu?.name ?? '–'}日（${info.huangDao?.name ?? '–'} · ${info.huangDao?.dao ?? '–'}道）`
  );
  if (info.jianChu?.text) parts.push(info.jianChu.text);
  return parts.join('\n');
}
