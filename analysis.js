/**
 * 抖音短视频分析引擎
 * 基于 douyin-video-analysis Skill 的框架
 */

const COPYWRITING_TYPES = {
  PAIN_POINT: '痛点激发型',
  IDENTITY: '身份认同型',
  VALUE: '性价比型',
  SCENARIO: '场景代入型',
  SOCIAL_PROOF: '社会认同型',
  KNOWLEDGE: '知识科普型',
  STORY: '故事叙事型'
};

const BGM_STYLES = {
  UPBEAT: { name: '快节奏流行', bpm: '120-140', desc: '适合卡点换装、节奏感强的内容', examples: ['抖音热门BGM', '电子舞曲'] },
  CHILL: { name: '轻快氛围', bpm: '100-120', desc: '适合日常穿搭、轻松种草', examples: ['轻音乐', 'R&B'] },
  HIGHEND: { name: '高级感轻音乐', bpm: '70-100', desc: '适合气质穿搭、轻奢定位', examples: ['钢琴曲', '电影配乐风'] },
  TREND: { name: '蹭热度热歌', bpm: 'varies', desc: '适合追热点、借势流量', examples: ['平台热歌榜'] }
};

const CATEGORY_BGM_MAP = {
  '女装短袖': 'UPBEAT',
  '男装': 'UPBEAT',
  '美妆': 'CHILL',
  '食品': 'CHILL',
  '数码': 'HIGHEND',
  '家居': 'HIGHEND',
  '其他': 'CHILL'
};

/**
 * 主分析函数
 * @param {Object} input
 * @param {string} input.videoUrl
 * @param {string} input.videoContent - 口播文案（可选）
 * @param {Object} input.product
 */
async function analyze(input) {
  const { videoUrl, videoContent, product } = input;
  
  // Step 1: 获取视频内容
  const videoInfo = extractVideoInfo(videoUrl, videoContent);
  
  // Step 2: 分析文案结构
  const copywritingAnalysis = analyzeCopywriting(videoInfo.content);
  
  // Step 3: 分析镜头语言
  const shotAnalysis = analyzeShotLanguage(videoInfo.content);
  
  // Step 4: 推荐BGM
  const bgmRecommendations = recommendBGM(product.category, copywritingAnalysis.primaryType);
  
  // Step 5: 生成新脚本
  const newScript = generateNewScript(product, copywritingAnalysis, shotAnalysis);
  
  return {
    videoInfo,
    copywritingAnalysis,
    shotAnalysis,
    bgmRecommendations,
    newScript
  };
}

/**
 * 从URL和内容提取视频基本信息
 */
function extractVideoInfo(url, content) {
  let account = '未知账号';
  let videoId = '';
  let platform = '抖音';
  
  // 从URL提取视频ID
  const match = url.match(/video\/(\d+)/);
  if (match) videoId = match[1];
  
  // 如果没有提供内容，生成一个占位说明
  const finalContent = content || '';
  
  return {
    platform,
    account,
    videoId,
    url,
    content: finalContent,
    hasContent: !!content
  };
}

/**
 * 文案结构分析
 */
function analyzeCopywriting(content) {
  // 如果没有实际内容，使用默认框架分析
  if (!content || content.trim().length < 20) {
    return generateTemplateAnalysis();
  }
  
  // 基于内容的关键词分析文案类型
  const lowerContent = content.toLowerCase();
  
  let primaryType = COPYWRITING_TYPES.IDENTITY;
  let hookType = '身份标签';
  let types: { type: string; score: number; evidence: string }[] = [];
  
  // 检测7种文案类型
  const typeScores = [
    { type: COPYWRITING_TYPES.PAIN_POINT, keywords: ['胖', '显瘦', '不好看', '老气', '土', '路人', '撞款', '难搭'], weight: 1 },
    { type: COPYWRITING_TYPES.IDENTITY, keywords: ['女生', '男生', '学生', '上班', '微胖', '小个子', '梨形', '姐妹'], weight: 1.2 },
    { type: COPYWRITING_TYPES.VALUE, keywords: ['便宜', '性价比', '划算', '只要', '不到', '钱', '超值'], weight: 1 },
    { type: COPYWRITING_TYPES.SCENARIO, keywords: ['通勤', '约会', '逛街', '拍照', '旅游', '上班', '日常'], weight: 1 },
    { type: COPYWRITING_TYPES.SOCIAL_PROOF, keywords: ['卖了', '买了', '粉丝', '大家', '都在', '爆了', '推荐'], weight: 0.8 },
    { type: COPYWRITING_TYPES.KNOWLEDGE, keywords: ['面料', '材质', '怎么选', '教你', '知识', '分享'], weight: 0.6 },
    { type: COPYWRITING_TYPES.STORY, keywords: ['今天', '之前', '后来', '终于', '第一次', '故事'], weight: 0.5 }
  ];
  
  for (const item of typeScores) {
    let score = 0;
    let evidence = '';
    for (const kw of item.keywords) {
      if (lowerContent.includes(kw)) {
        score += item.weight;
        evidence = kw;
      }
    }
    if (score > 0) {
      types.push({ type: item.type, score, evidence });
    }
  }
  
  // 排序，取最高分
  types.sort((a, b) => b.score - a.score);
  if (types.length > 0) {
    primaryType = types[0].type;
  }
  
  // 检测钩子类型
  if (lowerContent.includes('谁穿') || lowerContent.includes('千万别') || lowerContent.includes('为什么')) {
    hookType = '反常识/提问';
  } else if (/\d+元/.test(content) || /不到/.test(content)) {
    hookType = '数字冲击';
  } else if (lowerContent.includes('女生') || lowerContent.includes('姐妹') || lowerContent.includes('微胖')) {
    hookType = '身份标签';
  } else if (lowerContent.includes('这件') || lowerContent.includes('今天')) {
    hookType = '产品引入';
  }
  
  // 分析各部分
  const segments = segmentContent(content);
  
  return {
    primaryType,
    hookType,
    allTypes: types,
    structure: {
      hook: extractHook(content),
      painPoint: extractPainPoint(content),
      sellingPoints: extractSellingPoints(content),
      cta: extractCTA(content)
    },
    template: generateTemplate(primaryType, content),
    content // 原文
  };
}

function segmentContent(content) {
  // 简单按句号/换行分割
  const sentences = content.split(/[。\n]/).filter(s => s.trim().length > 5);
  return sentences.map(s => s.trim());
}

function extractHook(content) {
  const sentences = segmentContent(content);
  return sentences.slice(0, 2).join('。') || '开场合集引导';
}

function extractPainPoint(content) {
  const keywords = ['胖', '显瘦', '老气', '土', '路人', '撞款', '难搭', '太紧', '太松', '不透'];
  const lowerContent = content.toLowerCase();
  for (const kw of keywords) {
    if (lowerContent.includes(kw)) return `涉及：${kw}`;
  }
  return '通用痛点：不够好看/不够百搭';
}

function extractSellingPoints(content) {
  const points = [];
  const keywords = {
    '面料': ['纯棉', '重磅', '透气', '厚实', '面料', '材质'],
    '版型': ['oversize', '宽松', '修身', '显瘦', '正肩', '落肩'],
    '百搭': ['百搭', '好搭', '怎么搭', '通勤', '日常'],
    '性价比': ['便宜', '超值', '划算', '性价比']
  };
  
  for (const [category, kws] of Object.entries(keywords)) {
    for (const kw of kws) {
      if (content.includes(kw)) {
        points.push(category);
        break;
      }
    }
  }
  
  return points.length > 0 ? [...new Set(points)] : ['品质', '版型', '百搭'];
}

function extractCTA(content) {
  const keywords = ['左下角', '链接', '评论区', '扣', '喜欢', '想要', '直接拍'];
  const lowerContent = content.toLowerCase();
  for (const kw of keywords) {
    if (lowerContent.includes(kw)) return '涉及购买引导';
  }
  return '通用CTA：左下角链接 + 评论区互动';
}

function generateTemplateAnalysis() {
  return {
    primaryType: COPYWRITING_TYPES.IDENTITY,
    hookType: '产品引入',
    allTypes: [
      { type: COPYWRITING_TYPES.IDENTITY, score: 1.2, evidence: '精准人群' },
      { type: COPYWRITING_TYPES.SCENARIO, score: 1.0, evidence: '场景描述' }
    ],
    structure: {
      hook: '开场合集引导（框架模板）',
      painPoint: '通用痛点：不够好看/不够百搭',
      sellingPoints: ['品质', '版型', '百搭'],
      cta: '通用CTA：左下角链接 + 评论区互动'
    },
    template: null,
    content: ''
  };
}

function generateTemplate(primaryType, content) {
  const templates = {
    [COPYWRITING_TYPES.PAIN_POINT]: {
      name: '痛点+解决方案',
      structure: '痛点 → 解决方案 → 产品推荐',
      example: '手臂粗/肩宽/背厚 → 选对版型 → 这件正肩T恤'
    },
    [COPYWRITING_TYPES.IDENTITY]: {
      name: '身份标签+种草',
      structure: '精准人群 → 共鸣 → 产品满足需求',
      example: '梨形身材/小个子/微胖/学生党/上班族'
    },
    [COPYWRITING_TYPES.VALUE]: {
      name: '性价比对比',
      structure: '价格锚点 → 价值对比 → 限时紧迫感',
      example: '只卖xx元，但面料/做工/版型是xxx水准'
    },
    [COPYWRITING_TYPES.SCENARIO]: {
      name: '场景代入',
      structure: '具体场景 → 情绪触发 → 产品植入',
      example: '通勤/约会/旅行/逛街/拍照/见家长'
    }
  };
  
  return templates[primaryType] || templates[COPYWRITING_TYPES.IDENTITY];
}

/**
 * 镜头语言分析
 */
function analyzeShotLanguage(content) {
  // 基于内容关键词推断镜头语言
  const lowerContent = content.toLowerCase();
  
  let sceneComplexity = 3; // 1-5
  let rhythm = '中快节奏';
  let transitionStyle = '硬切为主';
  
  if (lowerContent.includes('正面背面侧面') || lowerContent.includes('360')) {
    sceneComplexity = 4;
  }
  if (lowerContent.includes('细节') || lowerContent.includes('面料')) {
    sceneComplexity += 1;
  }
  sceneComplexity = Math.min(5, sceneComplexity);
  
  const shots = [
    { time: '0-2s', shot: '特写', movement: '固定', content: '面料/领口特写', purpose: '建立质感第一印象' },
    { time: '2-5s', shot: '近景', movement: '轻微推', content: '上身正面展示', purpose: '展示版型' },
    { time: '5-8s', shot: '中景', movement: '轻微拉', content: '正面+侧面转身', purpose: '360°廓形' },
    { time: '8-12s', shot: '全景', movement: '固定', content: '全身站立展示（3/4侧身）', purpose: '整体效果' },
    { time: '12-15s', shot: '中景', movement: '跟拍', content: '行走动图', purpose: '动态展示' },
    { time: '15-18s', shot: '特写', movement: '固定', content: '面料/袖口/领口细节', purpose: '品质信任' },
    { time: '18-22s', shot: '中景', movement: '固定', content: '搭配其他单品效果', purpose: '百搭性' },
    { time: '22-26s', shot: '近景', movement: '轻微推', content: '搭配半身裙效果', purpose: '多场景' },
    { time: '26-28s', shot: '特写', movement: '固定', content: '吊牌/尺码特写', purpose: '引导购买' },
    { time: '28-30s', shot: '近景', movement: '固定', content: '正面微笑', purpose: '情感连接+CTA' }
  ];
  
  return {
    shots,
    summary: {
      totalDuration: '约30秒',
      totalShots: shots.length,
      avgShotLength: '2-3秒/镜头',
      rhythm,
      transitionStyle,
      sceneComplexity
    },
    patterns: {
      shotSequence: '特写→近景→中景→全景→行走→细节→搭配→CTA',
      mostUsedShot: '中景（40%）',
      movementStyle: '固定镜头为主，轻微推拉为辅',
      keyFeature: '3/4侧身站立最常用，比正面更显瘦显气质'
    },
    recommendations: {
      mustHave: [
        '✅ 面料/领口特写（质感）',
        '✅ 上身正面（版型）',
        '✅ 半身侧面（廓形）',
        '✅ 行走/转身动图（动态效果）',
        '✅ 搭配其他单品（百搭性）'
      ],
      niceToHave: [
        '⭐ 面料揉搓/手感展示（品质）',
        '⭐ 水洗/尺码标特写（信任）',
        '⭐ 场景化展示（通勤/约会/逛街）'
      ],
      advanced: [
        '⭐⭐ 镜头跟随模特行走（临场感）',
        '⭐⭐ 慢动作特写（面料飘逸/质感）',
        '⭐⭐ 多个场景切换（同款多搭）'
      ]
    }
  };
}

/**
 * BGM推荐
 */
function recommendBGM(category, copywritingType) {
  const styleKey = CATEGORY_BGM_MAP[category] || 'CHILL';
  const baseStyle = BGM_STYLES[styleKey];
  
  const recommendations = [
    {
      ...baseStyle,
      priority: 1,
      reason: '最匹配当前内容风格',
      tips: [
        '剪辑时注意换装动作与重拍同步',
        '特写镜头可适当放慢节奏',
        '结尾CTA部分可降低BGM音量或留白'
      ]
    },
    {
      ...BGM_STYLES.TREND,
      priority: 2,
      reason: '蹭平台热度，增加曝光机会',
      tips: [
        '选择发布前后3天内抖音热歌榜歌曲',
        '可使用"歌名+翻唱"版本避免版权'
      ]
    },
    {
      ...BGM_STYLES.HIGHEND,
      priority: 3,
      reason: '提升内容质感，适合高品质定位',
      tips: [
        '适合搭配慢镜头使用',
        '轻奢/白领人群定位优先考虑'
      ]
    }
  ];
  
  // 根据文案类型微调优先级
  if (copywritingType === COPYWRITING_TYPES.VALUE) {
    recommendations.sort((a, b) => {
      if (a.name === '快节奏流行') return -1;
      if (b.name === '快节奏流行') return 1;
      return 0;
    });
  }
  
  return {
    primary: recommendations[0],
    alternatives: recommendations.slice(1),
    bpmGuide: {
      range: '90-130 BPM',
      switchPoint: '换装/转身动作与重拍对齐',
      ctaTip: '结尾字幕出现时BGM降低20-30%音量'
    }
  };
}

/**
 * 生成新脚本
 */
function generateNewScript(product, copywritingAnalysis, shotAnalysis) {
  const sellingPointMap = {
    '面料': `260g重磅纯棉，上手就知道质感有多好`,
    '版型': `oversize版型，微胖女生也能穿`,
    '百搭': `搭牛仔裤、阔腿裤、裙子都好看`,
    '性价比': `只卖${product.priceRange || 'xx'}元，但品质完全不输大牌`,
    '品质': `面料厚实，水洗不变形`,
    '透气': `透气不闷汗，夏天穿超舒服`
  };
  
  const targetAudienceMap = {
    '学生党': '学生党',
    '年轻白领': '上班族',
    '宝妈': '带娃的姐妹',
    '高消费': '追求品质的姐妹'
  };
  
  const audience = product.targetAudience || ['女生'];
  const audienceStr = audience.map(a => targetAudienceMap[a] || a).join('、');
  
  const spoints = (product.sellingPoints || ['面料', '版型', '百搭'])
    .map(s => sellingPointMap[s] || s)
    .slice(0, 3);
  
  const copyType = copywritingAnalysis.primaryType;
  
  // 生成文案
  let script;
  if (copyType === COPYWRITING_TYPES.IDENTITY) {
    script = `${audienceStr}，今天给你们推荐一件不太挑人的T恤

普通T恤很容易穿出路人感，但这件完全不一样

${spoints.join('，')}

已经帮你们试过了，真的很百搭

喜欢左下角链接直接拍`;
  } else if (copyType === COPYWRITING_TYPES.PAIN_POINT) {
    script = `还在为${audience.length > 1 ? '穿搭' : ''}烦恼吗？

${spoints[0]}，专门为你们设计

${spoints.slice(1).join('，')}

只卖${product.priceRange || 'xx'}元，品质对标几百块的大牌

想要直接左下角拍，码数评论区问我`;
  } else {
    script = `姐妹们，今天给你们推荐一件${product.category || 'T恤'}

${spoints.join('，')}

${audienceStr}都可以穿，真的很百搭

喜欢左下角链接直接拍`;
  }
  
  // 生成新的分镜
  const newShots = shotAnalysis.shots.map(shot => ({
    ...shot,
    // 保持原有结构，标注可替换内容
    adjustableContent: shot.content
  }));
  
  // 拍摄建议
  const suggestions = {
    location: [
      '主景：白色/浅色纯色背景（简洁干净）',
      '辅景：咖啡馆/街头（营造生活感）'
    ],
    model: [
      '表情：自然微笑为主，偶尔冷面高级感',
      '姿势：3/4侧身站立、行走动图、插兜',
      '眼神：看镜头（建立连接）+ 不看镜头（营造氛围）混合'
    ],
    props: [
      '产品平铺图（开场或结尾用）',
      '搭配单品（牛仔裤、阔腿裤、半裙）'
    ],
    lighting: [
      '自然光优先（窗边/户外）',
      '面部补光避免阴阳脸',
      '面料特写可用侧光强调质感'
    ],
    edit: [
      '每2秒一切，保持快节奏',
      '换装/转身动作与音乐重拍同步',
      '结尾加字幕："左下角链接" "评论区扣1"',
      '可用剪映/App快速剪辑'
    ]
  };
  
  return {
    product,
    copywritingScript: script,
    shotScript: {
      totalDuration: shotAnalysis.summary.totalDuration,
      shots: newShots,
      totalShots: newShots.length
    },
    shootingSuggestions: suggestions,
    differentiator: product.differentiator || '暂无差异化信息（建议补充）',
    tips: [
      '先拍摄再配音，文案可后期调整',
      '同一产品建议拍3个版本：快剪版/沉浸版/对比版',
      '发布时带上热门话题标签'
    ]
  };
}

module.exports = { analyze, COPYWRITING_TYPES, BGM_STYLES };
