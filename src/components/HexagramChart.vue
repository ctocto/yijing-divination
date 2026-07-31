<template>
  <div class="hexagram-chart-container">
    <svg
      class="hexagram-chart"
      width="800"
      height="800"
      viewBox="0 0 800 800"
    >
      <!-- 回字纹花边pattern定义 -->
      <defs>
        <pattern id="hui-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="40" height="40" fill="#fffbe0"/>
          <path d="M0,0 h36 v36 h-32 v-32 h28 v28 h-24 v-24 h20 v20 h-16 v-16 h12 v12 h-8 v-8 h4"
                fill="none" stroke="#e6c155" stroke-width="1.5"/>
        </pattern>
        <linearGradient id="gold-text" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d4af37" />
          <stop offset="50%" stop-color="#f9d77e" />
          <stop offset="100%" stop-color="#d4af37" />
        </linearGradient>
        <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="2" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <!-- 外部大矩形花边 -->
      <rect x="0" y="0" width="800" height="800" fill="url(#hui-pattern)" stroke="#d4af37" stroke-width="8" rx="18" />

      
      <!-- 外圈文字说明 - 完全按照参考图片实现 -->
      <text :x="centerX" :y="centerY-360" text-anchor="middle" font-size="16" fill="#a38c45" style="font-family:'STKaiti',serif;">水火既济，火过危济，水多木，火多土集</text>
      <text :x="centerX" :y="centerY+360" text-anchor="middle" font-size="16" fill="#a38c45" style="font-family:'STKaiti',serif;">水多土流，水多元方，强水得木，方正贵势</text>
      <text :x="centerX-360" :y="centerY" text-anchor="middle" font-size="16" fill="#a38c45" style="font-family:'STKaiti',serif;" :transform="`rotate(-90 ${centerX-360} ${centerY})`">水火既济，火水未济，水土比，方成贵势</text>
      <text :x="centerX+360" :y="centerY" text-anchor="middle" font-size="16" fill="#a38c45" style="font-family:'STKaiti',serif;" :transform="`rotate(90 ${centerX+360} ${centerY})`">水火既济，火水未济，水土比，方成贵势</text>
      
      <!-- 四角文字 -->
      <text :x="centerX-280" :y="centerY-280" text-anchor="middle" font-size="12" fill="#a38c45" style="font-family:'STKaiti',serif;" :transform="`rotate(-45 ${centerX-280} ${centerY-280})`">得金多水，方成贵势</text>
      <text :x="centerX+280" :y="centerY-280" text-anchor="middle" font-size="12" fill="#a38c45" style="font-family:'STKaiti',serif;" :transform="`rotate(45 ${centerX+280} ${centerY-280})`">得金多火，方成贵势</text>
      <text :x="centerX-280" :y="centerY+280" text-anchor="middle" font-size="12" fill="#a38c45" style="font-family:'STKaiti',serif;" :transform="`rotate(45 ${centerX-280} ${centerY+280})`">得金多水，方成贵势</text>
      <text :x="centerX+280" :y="centerY+280" text-anchor="middle" font-size="12" fill="#a38c45" style="font-family:'STKaiti',serif;" :transform="`rotate(-45 ${centerX+280} ${centerY+280})`">得金多火，方成贵势</text>
      
      <!-- 八卦区域 -->
      <!-- 八重八边形+八卦扇形区块+极坐标文字 统一布局 -->
      <g>
        <!-- 八重八边形 -->
        <polygon :points="octagonPoints(400, 400, 430)" fill="none" stroke="#d4af37" stroke-width="4" stroke-linejoin="round" filter="url(#drop-shadow)" />
        <polygon :points="octagonPoints(400, 400, 390)" fill="none" stroke="#d4af37" stroke-width="3" />
        <polygon :points="octagonPoints(400, 400, 350)" fill="none" stroke="#d4af37" stroke-width="2.8" />
        <polygon :points="octagonPoints(400, 400, 310)" fill="none" stroke="#d4af37" stroke-width="2.5" />
        <polygon :points="octagonPoints(400, 400, 270)" fill="none" stroke="#d4af37" stroke-width="2.2" />
        <polygon :points="octagonPoints(400, 400, 230)" fill="none" stroke="#d4af37" stroke-width="2" />
        <polygon :points="octagonPoints(400, 400, 190)" fill="none" stroke="#d4af37" stroke-width="1.7" />
        <polygon :points="octagonPoints(400, 400, 150)" fill="none" stroke="#d4af37" stroke-width="1.3" />

        <!-- 八边形对角线与同心圆 -->
        <g>
          <template v-for="(pair, idx) in octagonDiagonals" :key="'diag-'+idx">
            <line
              :x1="pair[0].x"
              :y1="pair[0].y"
              :x2="pair[1].x"
              :y2="pair[1].y"
              stroke="#e6c155"
              stroke-width="0.8"
            />
          </template>
          <!-- 添加八边形内部的同心圆 -->
          <circle cx="400" cy="400" r="200" fill="none" stroke="#e6c155" stroke-width="0.5" />
        </g>

        <!-- 八卦扇形区块 -->
        <g>
          <path
            v-for="sIdx in 8"
            :key="'sector-bg-'+sIdx"
            :d="sectorPath(centerX, centerY, 430, 0, sIdx-1, 8)"
            fill="#fffbe0"
            stroke="#d4af37"
            stroke-width="2"
          />
        </g>

        <!-- 八卦极坐标文字与卦象 -->
        <g v-for="(sector, sIdx) in sectors" :key="'sector-label-'+sIdx">
          <!-- 区块顶部宫名 -->
          <text
            :x="400 + 160 * Math.cos((sIdx * 45 - 90) * Math.PI/180) - 20"
            :y="400 + 160 * Math.sin((sIdx * 45 - 90) * Math.PI/180) - 8"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="16"
            font-weight="bold"
            fill="url(#gold-text)"
            style="font-family:'STKaiti',serif;letter-spacing:2px;text-shadow:0 1px 2px #fffbe0;"
          >
            {{ sector.name }}
          </text>
          <!-- 卦象符号 -->
          <text
            :x="400 + 160 * Math.cos((sIdx * 45 - 90) * Math.PI/180)"
            :y="400 + 160 * Math.sin((sIdx * 45 - 90) * Math.PI/180) - 8"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="20"
            fill="#a38c45"
            font-weight="bold"
            style="font-family:'serif';"
          >
            {{ sector.trigram }}
          </text>
          <!-- 数字 -->
          <text
            :x="400 + 160 * Math.cos((sIdx * 45 - 90) * Math.PI/180)"
            :y="400 + 160 * Math.sin((sIdx * 45 - 90) * Math.PI/180) + 8"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="11"
            fill="#a38c45"
            style="font-family:'STKaiti',serif;"
          >
            {{ sector.num }}
          </text>
          <!-- 象 -->
          <text
            :x="400 + 160 * Math.cos((sIdx * 45 - 90) * Math.PI/180) + 20"
            :y="400 + 160 * Math.sin((sIdx * 45 - 90) * Math.PI/180) - 8"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="16"
            font-weight="bold"
            fill="url(#gold-text)"
            style="font-family:'STKaiti',serif;letter-spacing:2px;text-shadow:0 1px 2px #fffbe0;"
          >
            {{ sector.xiang }}
          </text>
          <!-- 数字、天干、地支、阴阳 -->
          <text
            :x="400 + 410 * Math.cos((sIdx * 45 - 90) * Math.PI/180)"
            :y="400 + 410 * Math.sin((sIdx * 45 - 90) * Math.PI/180) + 38"
            text-anchor="middle"
            font-size="11"
            fill="#a38c45"
            style="font-family:'STKaiti',serif;"
          >
            {{ sector.num }} {{ sector.heavenlyStem }} {{ sector.earthlyBranch }} {{ sector.yinYang }}
          </text>
          <!-- 五行与器官 -->
          <text
            :x="400 + 390 * Math.cos((sIdx * 45 - 90) * Math.PI/180)"
            :y="400 + 390 * Math.sin((sIdx * 45 - 90) * Math.PI/180) + 20"
            text-anchor="middle"
            font-size="13"
            fill="#a38c45"
            font-weight="bold"
            style="font-family:'STKaiti',serif;"
          >
            {{ sector.wuxing }} {{ sector.organs }}
          </text>
          <!-- 象征/主事 -->
          <text
            :x="400 + 370 * Math.cos((sIdx * 45 - 90) * Math.PI/180)"
            :y="400 + 370 * Math.sin((sIdx * 45 - 90) * Math.PI/180) + 32"
            text-anchor="middle"
            font-size="11"
            fill="#a38c45"
            style="font-family:'STKaiti',serif;"
          >
            {{ sector.meaning }}
          </text>
          <!-- 卦辞 -->
          <text
            :x="400 + 350 * Math.cos((sIdx * 45 - 90) * Math.PI/180)"
            :y="400 + 350 * Math.sin((sIdx * 45 - 90) * Math.PI/180) + 40"
            text-anchor="middle"
            font-size="11"
            fill="#8b6b43"
            font-weight="bold"
            style="font-family:'STKaiti',serif;"
          >
            {{ getHexagramText(sIdx) }}
          </text>
          <!-- 区块内卦象排布 -->
          <template v-for="(hex, hexIdx) in sectorHexs[sIdx]" :key="'hex-'+sIdx+'-'+hexIdx">
            <g
              v-if="hex && hex.name"
              :transform="getHexPosition(sIdx, hexIdx, 400, 400, 420)"
            >
              <!-- 卦象符号 - 阴阳爻 - 完全按照参考图片的样式实现 -->
              <g>
                <g v-for="(line, lineIdx) in getHexagramLines(hex.binary)" :key="'line-'+lineIdx">
                  <!-- 阳爻：实线 -->
                  <rect
                    v-if="line === '1'"
                    :x="-7"
                    :y="(lineIdx * 3.5) - 0.75"
                    width="14"
                    height="2"
                    :fill="hex.binary === props.highlightBinary ? '#ff0000' : (sIdx === 2 || sIdx === 5 ? '#ff0000' : '#000000')"
                  />
                  <!-- 阴爻：虚线 -->
                  <g v-else>
                    <rect
                      :x="-7"
                      :y="(lineIdx * 3.5) - 0.75"
                      width="5"
                      height="2"
                      :fill="hex.binary === props.highlightBinary ? '#ff0000' : (sIdx === 2 || sIdx === 5 ? '#ff0000' : '#000000')"
                    />
                    <rect
                      :x="2"
                      :y="(lineIdx * 3.5) - 0.75"
                      width="5"
                      height="2"
                      :fill="hex.binary === props.highlightBinary ? '#ff0000' : (sIdx === 2 || sIdx === 5 ? '#ff0000' : '#000000')"
                    />
                  </g>
                </g>
              </g>
              <!-- 卦名 -->
              <text
                x="0"
                :y="22"
                text-anchor="middle"
                font-size="9"
                :fill="hex.binary === props.highlightBinary ? '#ff0000' : (sIdx === 2 || sIdx === 5 ? '#ff0000' : '#000000')"
                font-weight="bold"
                style="font-family:'STKaiti',serif;letter-spacing:1px;"
              >
                {{ hex.name }}
              </text>
            </g>
          </template>
        </g>
      </g>
      
      <!-- 内部同心八边形 - 增加更多同心八边形 -->
        
        <!-- 内圈文字 - 完全按照参考图片实现 -->
        <text x="400" y="130" text-anchor="middle" font-size="12" fill="#a38c45" style="font-family:'STKaiti',serif;">丙午丁</text>
        <text x="400" y="670" text-anchor="middle" font-size="12" fill="#a38c45" style="font-family:'STKaiti',serif;">癸子壬</text>
        <text x="130" y="400" text-anchor="middle" font-size="12" fill="#a38c45" style="font-family:'STKaiti',serif;" transform="rotate(-90 130 400)">甲卯乙</text>
        <text x="670" y="400" text-anchor="middle" font-size="12" fill="#a38c45" style="font-family:'STKaiti',serif;" transform="rotate(90 670 400)">庚酉辛</text>
        
        <!-- 添加八边形边上的文字 -->
        <text x="260" y="180" text-anchor="middle" font-size="10" fill="#a38c45" style="font-family:'STKaiti',serif;" transform="rotate(-67.5 260 180)">寅</text>
        <text x="180" y="260" text-anchor="middle" font-size="10" fill="#a38c45" style="font-family:'STKaiti',serif;" transform="rotate(-22.5 180 260)">辰</text>
        <text x="180" y="540" text-anchor="middle" font-size="10" fill="#a38c45" style="font-family:'STKaiti',serif;" transform="rotate(22.5 180 540)">申</text>
        <text x="260" y="620" text-anchor="middle" font-size="10" fill="#a38c45" style="font-family:'STKaiti',serif;" transform="rotate(67.5 260 620)">戌</text>
        <text x="540" y="620" text-anchor="middle" font-size="10" fill="#a38c45" style="font-family:'STKaiti',serif;" transform="rotate(-67.5 540 620)">丑</text>
        <text x="620" y="540" text-anchor="middle" font-size="10" fill="#a38c45" style="font-family:'STKaiti',serif;" transform="rotate(-22.5 620 540)">亥</text>
        <text x="620" y="260" text-anchor="middle" font-size="10" fill="#a38c45" style="font-family:'STKaiti',serif;" transform="rotate(22.5 620 260)">未</text>
        <text x="540" y="180" text-anchor="middle" font-size="10" fill="#a38c45" style="font-family:'STKaiti',serif;" transform="rotate(67.5 540 180)">巳</text>
      

      <!-- 添加更多文字说明 -->
      <g>
        <!-- 内圈文字说明 -->
        <text x="400" y="120" text-anchor="middle" font-size="12" fill="#a38c45" style="font-family:'STKaiti',serif;">阴火/阳火</text>
        <text x="400" y="680" text-anchor="middle" font-size="12" fill="#a38c45" style="font-family:'STKaiti',serif;">阴水/阳水</text>
        <text x="120" y="400" text-anchor="middle" font-size="12" fill="#a38c45" style="font-family:'STKaiti',serif;" transform="rotate(-90 120 400)">阴木/阳木</text>
        <text x="680" y="400" text-anchor="middle" font-size="12" fill="#a38c45" style="font-family:'STKaiti',serif;" transform="rotate(90 680 400)">阴金/阳金</text>
      <!-- 中心太极图 最上层显示 -->
      <g>
        <!-- 标准太极图，复用 TaijiSymbol 组件 -->
        <TaijiSymbol :centerX="400" :centerY="400" :radius="70" :strokeColor="'#000'" />
        
        <!-- 太极周围的文字 -->
        <text x="400" y="320" text-anchor="middle" font-size="16" fill="#000000" style="font-family:'STKaiti',serif;">南</text>
        <text x="400" y="490" text-anchor="middle" font-size="16" fill="#000000" style="font-family:'STKaiti',serif;">北</text>
        <text x="315" y="405" text-anchor="middle" font-size="16" fill="#000000" style="font-family:'STKaiti',serif;">东</text>
        <text x="485" y="405" text-anchor="middle" font-size="16" fill="#000000" style="font-family:'STKaiti',serif;">西</text>

        <!-- 添加对角方位 -->
        <text x="463" y="463" text-anchor="middle" font-size="16" fill="#000000" style="font-family:'STKaiti',serif;"
        transform="rotate(-45 463 463)">西北</text>
        <text x="335" y="460" text-anchor="middle" font-size="16" fill="#000000" style="font-family:'STKaiti',serif;"
        transform="rotate(45 335 460)">东北</text>
        <text x="460" y="345" text-anchor="middle" font-size="16" fill="#000000" style="font-family:'STKaiti',serif;"
        transform="rotate(45 460 345)">西南</text>
        <text x="345" y="345" text-anchor="middle" font-size="16" fill="#000000" style="font-family:'STKaiti',serif;" transform="rotate(-45 345 345)">东南</text>
      </g>

      <g>
        <!-- 添加方位数字 -->
        <text x="400" y="285" text-anchor="middle" font-size="16" fill="#000000" style="font-family:'STKaiti',serif;">二七</text>
        <text x="525" y="400" text-anchor="middle" font-size="16" fill="#000000" style="font-family:'STKaiti',serif;"
        transform="rotate(-90 523 400)">四九</text>
        <text x="400" y="523" text-anchor="middle" font-size="16" fill="#000000" style="font-family:'STKaiti',serif;">一六</text>
        <text x="278" y="400" text-anchor="middle" font-size="16" fill="#000000" style="font-family:'STKaiti',serif;"
        transform="rotate(90 278 400)">三八</text>
      </g>
      </g>
      
      <!-- 添加更多卦象说明文字 - 完全按照参考图片实现 -->
      <g>
        <!-- 乾区域 -->
        <text x="350" y="80" text-anchor="middle" font-size="10" fill="#8b6b43" style="font-family:'STKaiti',serif;">元亨利贞</text>
        <!-- 坤区域 -->
        <text x="350" y="620" text-anchor="middle" font-size="10" fill="#8b6b43" style="font-family:'STKaiti',serif;">元亨，利牝马之贞</text>
        <!-- 坎区域 -->
        <text x="80" y="350" text-anchor="middle" font-size="10" fill="#8b6b43" style="font-family:'STKaiti',serif;" transform="rotate(-90 80 350)">习坎，有孚</text>
        <!-- 离区域 -->
        <text x="620" y="350" text-anchor="middle" font-size="10" fill="#8b6b43" style="font-family:'STKaiti',serif;" transform="rotate(90 620 350)">利贞，亨</text>
        
        <!-- 添加更多卦辞说明 -->
        <text x="200" y="200" text-anchor="middle" font-size="9" fill="#8b6b43" style="font-family:'STKaiti',serif;" transform="rotate(-45 200 200)">心悦 心经 小畜 吉</text>
        <text x="500" y="200" text-anchor="middle" font-size="9" fill="#8b6b43" style="font-family:'STKaiti',serif;" transform="rotate(45 500 200)">三畜</text>
        <text x="200" y="500" text-anchor="middle" font-size="9" fill="#8b6b43" style="font-family:'STKaiti',serif;" transform="rotate(45 200 500)">旅</text>
        <text x="500" y="500" text-anchor="middle" font-size="9" fill="#8b6b43" style="font-family:'STKaiti',serif;" transform="rotate(-45 500 500)">家人</text>
        
        <!-- 添加八卦区域内的更多文字 -->
        <text x="350" y="100" text-anchor="middle" font-size="9" fill="#8b6b43" style="font-family:'STKaiti',serif;">乾为天</text>
        <text x="350" y="600" text-anchor="middle" font-size="9" fill="#8b6b43" style="font-family:'STKaiti',serif;">坤为地</text>
        <text x="100" y="350" text-anchor="middle" font-size="9" fill="#8b6b43" style="font-family:'STKaiti',serif;" transform="rotate(-90 100 350)">坎为水</text>
        <text x="600" y="350" text-anchor="middle" font-size="9" fill="#8b6b43" style="font-family:'STKaiti',serif;" transform="rotate(90 600 350)">离为火</text>
        
        <!-- 添加更多卦象说明 -->
        <text x="170" y="170" text-anchor="middle" font-size="8" fill="#8b6b43" style="font-family:'STKaiti',serif;" transform="rotate(-45 170 170)">艮山</text>
        <text x="530" y="170" text-anchor="middle" font-size="8" fill="#8b6b43" style="font-family:'STKaiti',serif;" transform="rotate(45 530 170)">震山</text>
        <text x="170" y="530" text-anchor="middle" font-size="8" fill="#8b6b43" style="font-family:'STKaiti',serif;" transform="rotate(45 170 530)">巽山</text>
        <text x="530" y="530" text-anchor="middle" font-size="8" fill="#8b6b43" style="font-family:'STKaiti',serif;" transform="rotate(-45 530 530)">兑山</text>
        
        <!-- 添加底部文字说明 -->
        <text x="350" y="650" text-anchor="middle" font-size="8" fill="#8b6b43" style="font-family:'STKaiti',serif;">腹胀 胆经 肠鸣 肠胀</text>
        <!-- 添加顶部文字说明 -->
        <text x="350" y="50" text-anchor="middle" font-size="8" fill="#8b6b43" style="font-family:'STKaiti',serif;">节水 电水 脉水 沉水</text>
        <!-- 添加左侧文字说明 -->
        <text x="50" y="350" text-anchor="middle" font-size="8" fill="#8b6b43" style="font-family:'STKaiti',serif;" transform="rotate(-90 50 350)">节水 半水 明地 佛地</text>
        <!-- 添加右侧文字说明 -->
        <text x="650" y="350" text-anchor="middle" font-size="8" fill="#8b6b43" style="font-family:'STKaiti',serif;" transform="rotate(90 650 350)">明火 半火 沉火 静火</text>
      </g>
      <!-- 八重八边形主轮廓: 置于所有内容之后，保证线条最上层可见 -->
      <g>
        <!-- 外圈 -->
        <circle cx="400" cy="400" r="100" fill="none" stroke="#000000" stroke-width="1" />
        
        <polygon :points="octagonPoints(400, 400, 430)" fill="none" stroke="#d4af37" stroke-width="4" stroke-linejoin="round" filter="url(#drop-shadow)" />
        <polygon :points="octagonPoints(400, 400, 390)" fill="none" stroke="#d4af37" stroke-width="3" />
        <polygon :points="octagonPoints(400, 400, 350)" fill="none" stroke="#d4af37" stroke-width="2.8" />
        <polygon :points="octagonPoints(400, 400, 310)" fill="none" stroke="#d4af37" stroke-width="2.5" />
        <polygon :points="octagonPoints(400, 400, 270)" fill="none" stroke="#d4af37" stroke-width="2.2" />
        <polygon :points="octagonPoints(400, 400, 230)" fill="none" stroke="#d4af37" stroke-width="2" />
        <polygon :points="octagonPoints(400, 400, 190)" fill="none" stroke="#d4af37" stroke-width="1.7" />
        <polygon :points="octagonPoints(400, 400, 150)" fill="none" stroke="#d4af37" stroke-width="1.3" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
// 统一中心坐标
const centerX = 400;
const centerY = 400;

import { computed } from 'vue';
import { hexagrams } from '@/data/hexagrams.js';
import TaijiSymbol from './hexagram/TaijiSymbol.vue';

/**
 * 八卦区块类型定义
 */
/**
 * 八卦区块类型定义
 */
type Sector = {
  /** 卦名 */
  name: string;
  /** 卦象（三爻符号） */
  trigram: string;
  /** 五行 */
  wuxing: string;
  /** 方位 */
  direction: string;
  /** 数字 */
  num: string;
  /** 天干 */
  heavenlyStem: string;
  /** 地支 */
  earthlyBranch: string;
  /** 人体部位 */
  organs: string;
  /** 象征/主事 */
  meaning: string;
  /** 象（八卦之象义） */
  xiang: string;
  /** 阴阳属性 */
  yinYang: string;
};

// 新增 props：高亮当前卦
const props = defineProps<{
  highlightBinary?: string; // 需要高亮的卦（六字符，如"111111"）
}>();


/**
 * 八卦基本信息，顺序为：乾、兑、离、震、巽、坎、艮、坤
 * 字段含义：
 * - name: 卦名
 * - trigram: 卦象（三爻符号）
 * - wuxing: 五行
 * - direction: 方位
 * - num: 数字
 * - heavenlyStem: 天干
 * - earthlyBranch: 地支
 * - organs: 人体部位
 * - meaning: 象征/主事
 * - yinYang: 阴阳属性
 */
const sectors: Sector[] = [
  {
    name: '离',
    trigram: '☲', // 一阴夹二阳
    wuxing: '火',
    direction: '正南',
    num: '九',
    heavenlyStem: '丙丁',
    earthlyBranch: '巳午',
    organs: '目/心',
    meaning: '火/中女',
    yinYang: '阳',
    xiang: '火',
  },
  {
    name: '坤',
    trigram: '☷', // 三阴
    wuxing: '土',
    direction: '西南',
    num: '二',
    heavenlyStem: '戊己',
    earthlyBranch: '未申',
    organs: '腹/胃',
    meaning: '地/母',
    yinYang: '阴',
    xiang: '地',
  },
  {
    name: '兑',
    trigram: '☱', // 二阳一阴
    wuxing: '金',
    direction: '正西',
    num: '七',
    heavenlyStem: '庚辛',
    earthlyBranch: '申酉',
    organs: '口/大肠',
    meaning: '泽/少女',
    yinYang: '阴',
    xiang: '泽',
  },
  {
    name: '乾',
    trigram: '☰', // 三连
    wuxing: '金',
    direction: '西北',
    num: '六',
    heavenlyStem: '壬癸',
    earthlyBranch: '戌亥',
    organs: '头/肺',
    meaning: '天/父',
    yinYang: '阳',
    xiang: '天',
  },
  {
    name: '坎',
    trigram: '☵', // 一阳夹二阴
    wuxing: '水',
    direction: '正北',
    num: '一',
    heavenlyStem: '壬癸',
    earthlyBranch: '子',
    organs: '耳/肾',
    meaning: '水/中男',
    yinYang: '阳',
    xiang: '水',
  },
  {
    name: '艮',
    trigram: '☶', // 一阴二阳
    wuxing: '土',
    direction: '东北',
    num: '八',
    heavenlyStem: '丙丁',
    earthlyBranch: '丑寅',
    organs: '手/脾',
    meaning: '山/少男',
    yinYang: '阴',
    xiang: '山',
  },
  {
    name: '震',
    trigram: '☳', // 一阳二阴
    wuxing: '木',
    direction: '正东',
    num: '三',
    heavenlyStem: '甲乙',
    earthlyBranch: '寅卯',
    organs: '足/肝',
    meaning: '雷/长男',
    yinYang: '阳',
    xiang: '雷',
  },
  {
    name: '巽',
    trigram: '☴', // 二阴一阳
    wuxing: '木',
    direction: '东南',
    num: '四',
    heavenlyStem: '戊己',
    earthlyBranch: '辰巳',
    organs: '股/胆',
    meaning: '风/长女',
    yinYang: '阴',
    xiang: '入'
  }
];

// 卦辞
const hexagramTexts = [
  "元亨利贞", // 乾
  "亨，利贞", // 兑
  "利贞，亨", // 离
  "亨，震来虩虩", // 震
  "小亨，利有攸往", // 巽
  "习坎，有孚", // 坎
  "艮其背，不获其身", // 艮
  "元亨，利牝马之贞" // 坤
];

// 获取卦辞
function getHexagramText(sectorIdx: number) {
  return hexagramTexts[sectorIdx];
}

// 将64卦分配到8个区域
/**
 * 八卦卦象应与八边形各边/顶点严格对齐：
 * 1. 先按八个主方向（八边形八顶点）分布八个主卦
 * 2. 每卦的三爻图形依次向内圈（卦名放在八边形一侧外部）
 * 3. 位置用八边形各顶点（r=320）和内八边形顶点、中心点自动插值
 * 4. sectorHexs[i][0]是该扇区的主卦——顺序为：乾、兑、离、震、巽、坎、艮、坤
 */
const sectorHexs: Array<any[]> = [];
for (let i = 0; i < 8; i++) {
  sectorHexs[i] = [];
  // 每区只取主卦
  sectorHexs[i].push(hexagrams[i * 8]);
}

// 八边形顶点 - 调整为更规则的八边形
function octagonPoints(cx: number, cy: number, r: number) {
  const points = [];
  for (let i = 0; i < 8; i++) {
    // 从正上方开始，顺时针旋转
    const angle = (Math.PI / 4) * i + Math.PI / 8;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

// 八卦区块扇形路径
function sectorPath(cx: number, cy: number, r1: number, r2: number, idx: number, total: number) {
  // 使扇形与八边形顶点/边严格对齐，需加 Math.PI/8 偏移
  const offset = Math.PI / 8;
  const angle1 = (Math.PI * 2 / total) * idx + offset;
  const angle2 = (Math.PI * 2 / total) * (idx + 1) + offset;
  const x1 = cx + r1 * Math.cos(angle1), y1 = cy + r1 * Math.sin(angle1);
  const x2 = cx + r1 * Math.cos(angle2), y2 = cy + r1 * Math.sin(angle2);
  const x3 = cx + r2 * Math.cos(angle2), y3 = cy + r2 * Math.sin(angle2);
  const x4 = cx + r2 * Math.cos(angle1), y4 = cy + r2 * Math.sin(angle1);
  return `
    M ${x1} ${y1}
    L ${x2} ${y2}
    L ${x3} ${y3}
    L ${x4} ${y4}
    Z
  `;
}

/**
* 八卦主卦排布于八边形顶点，完全还原八卦图。
* sectorIdx: 0~7
* hexIdx: 必为0（每区只有一个卦）
*/
function getHexPosition(sectorIdx: number, hexIdx: number, cx = 400, cy = 400, r = 350) {
  // 外圈正八边形顶点坐标
  const angle = sectorIdx * 45 - 90; // 0度为正上方
  const theta = angle * Math.PI / 180;
  const x = cx + r * Math.cos(theta);
  const y = cy + r * Math.sin(theta);
  // 朝向中心旋转每个卦象
  const rotate = angle + 90;
  return `translate(${x},${y}) rotate(${rotate})`;
}

// 将二进制字符串转换为卦象线条数组
function getHexagramLines(binary: string) {
  if (!binary) return [];
  return binary.split('').reverse();
}
const octagonVertexCoords = computed(() => {
  // 返还八个顶点坐标对象 [{x,y}, ...]，与主八边形一致
  const cx = 400, cy = 400, r = 430;
  const points = [];
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i + Math.PI / 8;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push({ x, y });
  }
  return points;
});
const octagonDiagonals = computed(() => {
  // 生成四组对角点配对 [[{x,y},{x,y}],...]
  const pts = octagonVertexCoords.value;
  return [
    [pts[0], pts[4]],
    [pts[1], pts[5]],
    [pts[2], pts[6]],
    [pts[3], pts[7]]
  ];
});
</script>

<style scoped>
.hexagram-chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fffbe0;
  border-radius: 8px;
  padding: 20px;
  margin: 0 auto;
  max-width: 780px;
  min-width: 400px;
  min-height: 400px;
  position: relative;
  overflow: visible;
  box-shadow: 0 0 15px rgba(230, 193, 85, 0.5);
}

.hexagram-chart {
  background: none;
  border-radius: 8px;
}

@media (max-width: 800px) {
  .hexagram-chart-container {
    padding: 10px;
    min-width: 0;
    max-width: 100vw;
  }
  .hexagram-chart {
    width: 98vw;
    height: 98vw;
    min-width: 0;
    min-height: 0;
    max-width: 100vw;
    max-height: 100vw;
  }
}
</style>
