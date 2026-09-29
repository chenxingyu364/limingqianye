/* ============================================================
   雾都明灯 · 红岩文化创新IP系统 — 交互逻辑
   ============================================================ */
(function(){
'use strict';

/* ---------- 数据：盲盒角色与 NFC 故事 ---------- */
const ROLES = {
  jiang: {
    name:'江姐', tag:'红梅傲骨 · 忠贞不渝', face:'🌸',
    title:'江姐 · 江竹筠',
    story:'1948年6月，江竹筠被捕，关进渣滓洞监狱。敌人用竹签钉进她的指尖，她只说：「竹签子是竹子做的，共产党员的意志是钢铁做的。」1949年11月14日，她从容走向刑场，年仅29岁。'
  },
  boy: {
    name:'报童', tag:'雾都少年 · 传递真理', face:'📰',
    title:'新华报童 · 王汝舟',
    story:'抗战时期，重庆《新华日报》的报童们穿过军警封锁、街头飞石，把报纸送到读者手中。他们喊出的不只是新闻，更是迷雾山城里的一声声「明灯」。'
  },
  radish: {
    name:'小萝卜头', tag:'狱中星光 · 希望不息', face:'🌱',
    title:'小萝卜头 · 宋振中',
    story:'8个月大随母入狱，狱中度过8年。他用黄泥水在草纸上练字，用一截铅笔头学习「中国」两个字。1949年9月6日遇害时年仅8岁，是中国年龄最小的烈士。'
  },
  mate: {
    name:'狱友', tag:'黎明守望 · 并肩同行', face:'🕯',
    title:'狱中难友',
    story:'渣滓洞、白公馆的囚室里，难友们秘密成立狱中党支部，坚持读书、办诗会，以黄纸剪星、绣制红旗。1949年11月27日黎明前夜，多数难友壮烈殉难。'
  }
};

/* ---------- 数据：花语 ---------- */
const FLOWERS = {
  mei: { name:'红梅', person:'江姐 · 江竹筠', poem:'零落成泥碾作尘，只有香如故' },
  mian:{ name:'木棉', person:'张露萍 · 红色电台特工', poem:'英雄花开，英雄魂归——花开如血，傲立高枝' },
  cha: { name:'山茶', person:'左绍英 · 狱中坚守者', poem:'坚贞守候，四季不凋——寒霜之中照常开放' }
};

/* ---------- 数据：咖啡 ---------- */
const COFFEES = ['烈火永生','雾都明灯','红岩光辉'];

/* ---------- 工具 ---------- */
const $  = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];

/* ============================================================
   1. 滚动：进度条 / 导航 / 回到顶部
   ============================================================ */
const progress = $('#scrollProgress');
const nav = $('#nav');
const backTop = $('#backTop');

function onScroll(){
  const y = window.scrollY;
  const h = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  nav.classList.toggle('scrolled', y > 40);
  backTop.classList.toggle('show', y > 600);
}
addEventListener('scroll', onScroll, { passive:true });
onScroll();
backTop.addEventListener('click', () => scrollTo({ top:0, behavior:'smooth' }));

/* ============================================================
   2. 入场动画 reveal
   ============================================================ */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); }
  });
}, { threshold:.12 });
$$('.reveal').forEach(el => io.observe(el));

/* ============================================================
   3. 产品线 Tab 切换
   ============================================================ */
const tabs = $$('.p-tab');
const panels = $$('.p-panel');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.toggle('is-active', t === tab));
    panels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === tab.dataset.tab));
  });
});

/* ============================================================
   4. 盲盒：开盒 + 角色切换 + NFC 故事
   ============================================================ */
const bbBox = $('#bbBox');
const bbChar = $('#bbChar');
let curRole = 'jiang';

function renderRole(key){
  curRole = key;
  tick('boxes');
  const r = ROLES[key];
  $('#bbName').textContent = r.name;
  $('#bbTag').textContent = r.tag;
  $('.bc-avatar', bbChar).textContent = r.face;
  bbChar.classList.add('show');
  bbBox.classList.add('open');
}
bbBox.addEventListener('click', () => {
  bbBox.classList.toggle('open');
  bbChar.classList.add('show');
});
bbBox.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); bbBox.click(); }
});

$$('#rolePicker .role-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('#rolePicker .role-btn').forEach(b => b.classList.toggle('is-active', b === btn));
    renderRole(btn.dataset.role);
  });
});

/* ---------- NFC 故事弹窗 ---------- */
const modal = $('#storyModal');
function openStory(key){
  const r = ROLES[key];
  $('#mTitle').textContent = r.title;
  $('#mBody').textContent = r.story;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
  tick('story');
}
function closeStory(){
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
}
$('#modalClose').addEventListener('click', closeStory);
modal.addEventListener('click', e => { if (e.target === modal) closeStory(); });
addEventListener('keydown', e => { if (e.key === 'Escape') closeStory(); });

document.addEventListener('click', e => {
  const btn = e.target.closest('.nfc-btn');
  if (btn) openStory(curRole);
});

/* ============================================================
   5. 花语首饰（SVG 动态生成）
   ============================================================ */
const flowerSvg = $('#flowerSvg');

function flowerMarkup(key){
  const colors = {
    mei:  { petal:'#C3272B', core:'#C9A063', ring:'rgba(195,39,43,.35)', petals:5 },
    mian: { petal:'#E2523C', core:'#F2D9A4', ring:'rgba(226,82,60,.35)', petals:6 },
    cha:  { petal:'#D65E7E', core:'#F2D9A4', ring:'rgba(214,94,126,.35)', petals:7 }
  }[key];
  const c = colors;
  const R = 52;
  let petals = '';
  const gap = 360 / c.petals;
  for (let i = 0; i < c.petals; i++){
    const a = i * gap * Math.PI/180;
    const x = Math.sin(a) * R, y = -Math.cos(a) * R;
    petals += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${key==='mian'?16:13}" ry="${key==='mian'?20:17}" fill="${c.petal}" transform="rotate(${(i*gap+90)%360} 0 0)" opacity=".92"/>`;
  }
  let inner = '';
  if (key === 'cha'){
    for (let i = 0; i < 7; i++){
      const a = i * (360/7) * Math.PI/180;
      const x = Math.sin(a) * 26, y = -Math.cos(a) * 26;
      inner += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="7" ry="10" fill="#E87E9A" transform="rotate(${(i*(360/7)+90)%360} 0 0)"/>`;
    }
  }
  // 荆棘与锁链：苦难的环
  let thorns = '';
  for (let i = 0; i < 12; i++){
    const a = i * 30 * Math.PI/180;
    const x = Math.sin(a) * 74, y = -Math.cos(a) * 74;
    thorns += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${c.ring}"/>`;
  }
  let links = '';
  for (let i = 0; i < 6; i++){
    const a = i * 60 * Math.PI/180;
    const x = Math.sin(a) * 63, y = -Math.cos(a) * 63;
    links += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="none" stroke="${c.ring}" stroke-width="2"/>`;
  }
  return `<svg viewBox="-80 -80 160 160" aria-hidden="true">
    <circle r="78" fill="none" stroke="rgba(201,160,99,.18)" stroke-width="1" stroke-dasharray="3 6"/>
    ${links}
    ${thorns}
    ${inner}
    ${petals}
    <circle r="${key==='mian'?8:7}" fill="${c.core}"/>
    <circle r="${key==='mian'?3.5:3}" fill="#fff" opacity=".8"/>
  </svg>`;
}

function renderFlower(key){
  flowerSvg.innerHTML = `<div class="fl-single">${flowerMarkup(key)}</div>`;
  const f = FLOWERS[key];
  $('#fmFlower').textContent = f.name;
  $('#fmPerson').textContent = f.person;
  $('#fmPoem').textContent = f.poem;
}
renderFlower('mei');
$$('#flowerSwitch .fl-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('#flowerSwitch .fl-btn').forEach(b => b.classList.toggle('is-active', b === btn));
    renderFlower(btn.dataset.fl);
  });
});

/* ============================================================
   6. 盖章拓印（真实印章图优先，SVG 版降级）
   ============================================================ */
const stampSvg = $('#sealStamp');
const imprintSvg = $('#sealImprint');
const stampPhotoEl = $('#sealChopPhoto');
const imprintPhotoEl = $('#sealImprintPhoto');
$('#stampBtn').addEventListener('click', () => {
  const chop = (stampPhotoEl && stampPhotoEl.isConnected) ? stampPhotoEl : stampSvg;
  const imp  = (imprintPhotoEl && imprintPhotoEl.isConnected) ? imprintPhotoEl : imprintSvg;
  chop.classList.remove('stamping');
  void chop.offsetWidth; // 重触发动画
  chop.classList.add('stamping');
  setTimeout(() => imp.classList.add('shown'), 360); // 印章落下后印迹浮现
});

/* ============================================================
   7. 四季便利贴
   ============================================================ */
$$('#stickyWall .note').forEach(note => {
  note.addEventListener('click', () => {
    $$('#stickyWall .note').forEach(n => n.classList.toggle('is-active', n === note));
  });
});

/* ============================================================
   8. 咖啡命名切换
   ============================================================ */
const cupName = $('#cupName');
$$('#coffeeSwitch .cf-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('#coffeeSwitch .cf-btn').forEach(b => b.classList.toggle('is-active', b === btn));
    cupName.textContent = COFFEES[+btn.dataset.cf];
  });
});

/* ============================================================
   9. 漫游红岩 Pass 打卡
   ============================================================ */
const passFill = $('#passFill');
const passCount = $('#passCount');
const passTip = $('#passTip');
const passCards = $$('#passCards .pass-card');
let doneCount = 0;

passCards.forEach(card => {
  card.addEventListener('click', () => {
    if (card.classList.contains('done')) return;
    card.classList.add('done');
    $('.pc-st', card).textContent = '已打卡';
    doneCount++;
    passFill.style.width = (doneCount / passCards.length * 100) + '%';
    passCount.textContent = `已点亮 ${doneCount} / 5`;
    if (doneCount === passCards.length){
      passTip.classList.add('win');
      passTip.textContent = '🎉 集齐5景！可兑换「拓印体验券」一张 —— 漫游红岩，文旅消费闭环达成';
    }
  });
});

/* ============================================================
   10. 数字藏品翻转
   ============================================================ */
$$('.nft-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
});

/* ============================================================
   11. 三套方案展开
   ============================================================ */
$$('.plan-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.plan-card');
    const open = card.classList.toggle('open');
    btn.textContent = open ? '收起详案 ▴' : '展开详案 ▾';
  });
});

/* ============================================================
   12. 星火燎原粒子系统（Hero）
   ============================================================ */
const sparks = $('#heroSparks');
if (sparks){
  const ctx = sparks.getContext('2d');
  let W, H;
  const mouse = { x:-9999, y:-9999 };
  function resizeSparks(){
    W = sparks.width  = sparks.offsetWidth;
    H = sparks.height = sparks.offsetHeight;
  }
  resizeSparks();
  addEventListener('resize', resizeSparks);

  const N = Math.min(90, Math.floor(W * H / 16000) || 40);
  const ps = Array.from({ length:N }, () => ({
    x: Math.random()*W, y: Math.random()*H,
    vx: (Math.random()-.5)*.35, vy: (Math.random()-.5)*.35 - .12,
    r: Math.random()*1.6 + .5, a: Math.random()*.6 + .25,
    tw: Math.random()*Math.PI*2
  }));

  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });

  (function sparkLoop(){
    ctx.clearRect(0, 0, W, H);
    for (const p of ps){
      p.x += p.vx; p.y += p.vy; p.tw += .02;
      if (p.x < -12) p.x = W + 12; else if (p.x > W + 12) p.x = -12;
      if (p.y < -12) p.y = H + 12; else if (p.y > H + 12) p.y = -12;
      const dx = mouse.x - p.x, dy = mouse.y - p.y, d2 = dx*dx + dy*dy;
      if (d2 < 22500){ const d = Math.sqrt(d2) || 1; p.x += dx/d*.6; p.y += dy/d*.6; }
      ctx.globalAlpha = p.a * (.7 + .3*Math.sin(p.tw));
      ctx.fillStyle = '#E8C87E';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = .08; ctx.strokeStyle = '#C9A063'; ctx.lineWidth = 1;
    for (let i = 0; i < ps.length; i++){
      for (let j = i + 1; j < ps.length; j++){
        const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y;
        if (dx*dx + dy*dy < 6400){
          ctx.beginPath(); ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y); ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(sparkLoop);
  })();
}

/* ============================================================
   13. 数字绣红旗
   ============================================================ */
const flagSvg = $('#flagSvg');
const threadSvg = $('#threadSvg');
const flagStage = $('.flag-stage');
const flagCount = $('#flagCount');
const NS = 'http://www.w3.org/2000/svg';
let stitched = 0;

const STAR_POS = [
  { cx: 84,  cy: 76, r: 34 },   // 大星
  { cx: 152, cy: 50, r: 12 },
  { cx: 182, cy: 84, r: 12 },
  { cx: 198, cy: 120, r: 12 },
  { cx: 168, cy: 148, r: 12 }
];

function starPath(cx, cy, r){
  let pts = '';
  for (let i = 0; i < 10; i++){
    const rad = i % 2 === 0 ? r : r * .45;
    const a = Math.PI/2 + i*Math.PI/5;
    pts += (pts ? ' L' : 'M') + (cx + Math.cos(a)*rad).toFixed(1) + ',' + (cy - Math.sin(a)*rad).toFixed(1);
  }
  return pts + ' Z';
}

STAR_POS.forEach((s) => {
  const star = document.createElementNS(NS, 'path');
  star.setAttribute('class', 'flag-star');
  star.setAttribute('d', starPath(s.cx, s.cy, s.r));
  star.setAttribute('tabindex', '0');
  star.addEventListener('click', () => stitch(star, s));
  star.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); stitch(star, s); }
  });
  flagSvg.appendChild(star);
});

function stitch(star, s){
  if (star.classList.contains('stitched')) return;
  const line = document.createElementNS(NS, 'line');
  line.setAttribute('class', 'thread-line');
  line.setAttribute('pathLength', '1');
  line.setAttribute('x1', '8'); line.setAttribute('y1', '296');
  line.setAttribute('x2', s.cx); line.setAttribute('y2', s.cy);
  threadSvg.appendChild(line);
  setTimeout(() => {
    star.classList.add('stitched');
    stitched++;
    flagCount.textContent = `已绣 ${stitched} / 5 颗星`;
    if (stitched === 5){
      flagSvg.classList.add('done');
      flagStage.classList.add('complete');
      flagCount.textContent = '✨ 绣制完成——红旗为你展开，黎明已至';
      tick('flags');
    }
  }, 360);
}

/* ============================================================
   14. 狱中留声机（TTS + 雾都雨声）
   ============================================================ */
const AUDIOS = {
  jiang: '云儿，妈妈想你。竹安弟：我有必胜和必活的信心，现在虽然身陷囹圄，但我相信，天快亮了。假若不幸的话，云儿就送你了，盼教以踏着父母之足迹，以建设新中国为志，为共产主义革命事业奋斗到底。孩子们决不要娇养，粗茶淡饭足矣。',
  ge: '为人进出的门紧锁着，为狗爬出的洞敞开着。我渴望自由，但我深深地知道，人的身躯怎能从狗洞子里爬出。我希望有一天，地下的烈火，将我连这活棺材一齐烧掉，我应该在烈火与热血中得到永生！',
  boy: '新华日报！看新华日报！民族解放的号角，抗战到底的宣言！先生，买一份吧——山城的雾再大，也遮不住报上的光！'
};

let zhVoices = [];
if ('speechSynthesis' in window){
  speechSynthesis.onvoiceschanged = () => {
    zhVoices = speechSynthesis.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith('zh'));
  };
}
function speak(text, onend){
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN'; u.rate = .95; u.pitch = 1;
  if (zhVoices.length) u.voice = zhVoices[0];
  if (onend) u.onend = onend;
  speechSynthesis.speak(u);
}

const vinyl = $('#vinyl');
let playingAudio = null;
$$('.vt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.audio;
    if (playingAudio === key){
      playingAudio = null;
      vinyl.classList.remove('playing');
      $$('.vt-btn').forEach(b => b.classList.remove('playing'));
      if ('speechSynthesis' in window) speechSynthesis.cancel();
      return;
    }
    playingAudio = key;               // 先登记，再开播
    $$('.vt-btn').forEach(b => b.classList.toggle('playing', b === btn));
    vinyl.classList.add('playing');
    speak(AUDIOS[key], () => {
      // 只有自己仍在播放时才清理（避免旧语音的 onend 误清新状态）
      if (playingAudio === key){
        vinyl.classList.remove('playing');
        btn.classList.remove('playing');
        playingAudio = null;
      }
    });
  });
});

/* 雾都雨声：白噪声 + 低通滤波模拟雨声 */
const rainBtn = $('#rainBtn');
let rain = null, rainOn = false;
rainBtn.addEventListener('click', () => {
  if (!rain){
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const actx = new AC();
    const len = actx.sampleRate * 2;
    const buf = actx.createBuffer(1, len, actx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random()*2 - 1;
    const src = actx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const filter = actx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 850;
    const gain = actx.createGain(); gain.gain.value = 0;
    src.connect(filter); filter.connect(gain); gain.connect(actx.destination);
    src.start();
    rain = { actx, gain };
  }
  rainOn = !rainOn;
  rain.gain.gain.linearRampToValueAtTime(rainOn ? .14 : 0, rain.actx.currentTime + .7);
  rainBtn.classList.toggle('on', rainOn);
  rainBtn.textContent = rainOn ? '🌧 雾都雨声 · 开' : '🌧 雾都雨声 · 关';
});

/* ============================================================
   15. 精神闯关「点亮雾都明灯」
   ============================================================ */
const QUIZ = [
  { q:'江姐被捕后，敌人把竹签钉进她的指尖逼供，她说了什么？',
    opts:['「竹签子是竹子做的，共产党员的意志是钢铁做的」','「我什么都不知道」','「放了我，我什么都说」','「你们可以杀了我」'],
    a:0, story:'竹签钉指之刑下，江竹筠的回答成为红岩最著名的誓言。1949年11月14日，她就义于歌乐山，年仅29岁。' },
  { q:'抗战时期，重庆《新华日报》的报童们最危险的工作是什么？',
    opts:['爬楼送报','穿过军警封锁把报纸送到读者手中','在防空洞里排版','半夜印刷'],
    a:1, story:'报童们抱着报纸穿过封锁线，被殴打、被没收是常事——他们喊出的是迷雾山城里的一声声「明灯」。' },
  { q:'小萝卜头宋振中在狱中学习，最珍贵的文具是什么？',
    opts:['一本字典','一截铅笔头','一支钢笔','一盒蜡笔'],
    a:1, story:'黄泥水当墨、草纸当纸、一截铅笔头当笔——8岁的他学会写下「中国」二字，1949年遇害时年仅8岁。' },
  { q:'1949年10月，狱中难友得知新中国成立的消息后做了什么？',
    opts:['集体绝食','写诗庆祝','用黄纸剪星、秘密绣制五星红旗','等待越狱'],
    a:2, story:'在白公馆平二室，罗广斌等难友用被面和黄纸剪出五角星，绣出心中的五星红旗——那是黎明前最亮的希望。' },
  { q:'1949年11月27日，重庆发生了什么？',
    opts:['重庆解放','渣滓洞白公馆大屠杀，黎明前夜','《新华日报》创刊','红岩村成立'],
    a:1, story:'重庆解放前三天的大屠杀中，200余名革命志士壮烈殉难。最黑暗的时刻，恰恰是最接近光明的时刻。' },
  { q:'「狱中八条」是什么？',
    opts:['八条狱规','烈士用生命留下的经验教训与党建警示','八首狱中诗','八个人的名单'],
    a:1, story:'罗广斌脱险后，把难友们在狱中反复讨论的总结整理成八条建议——这是用生命换来的红色遗产。' },
  { q:'红岩村13号在抗战时期是什么地方？',
    opts:['中共中央南方局驻地','一家书店','一所监狱','报社印刷厂'],
    a:0, story:'重庆红岩村13号是中共中央南方局驻地，也是「红岩精神」名字的由来。' },
  { q:'曾家岩50号「周公馆」是干什么的？',
    opts:['周恩来的私宅','中共南方局在城内的办公地','一个茶馆','军统据点'],
    a:1, story:'曾家岩50号紧邻戴笠公馆，被称为「虎穴中的战斗堡垒」，南方局在此坚持斗争多年。' },
  { q:'白公馆监狱原是做什么的？',
    opts:['一座寺庙','四川军阀白驹的郊外别墅','银行金库','一家医院'],
    a:1, story:'原是军阀白驹的香山别墅，1939年被改为监狱，与渣滓洞并称歌乐山两大魔窟。' },
  { q:'江姐狱中托孤信里的「云儿」是谁？',
    opts:['她的战友','她的孩子彭云','她养的小猫','监狱里的孩子'],
    a:1, story:'「盼教以踏着父母之足迹，以建设新中国为志」——这封托孤信，写的是她与孩子彭云最后的约定。' }
];

const quizLamps = $('#quizLamps');
const quizStatus = $('#quizStatus');
const quizQ = $('#quizQ');
const quizOpts = $('#quizOpts');
const quizFb = $('#quizFb');
const quizNext = $('#quizNext');
const quizDone = $('#quizDone');
const qdSub = $('#qdSub');
let quizPool = [], quizIdx = 0, quizLampsOn = 0, quizAnswered = false;

function shuffle(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function renderLamps(){
  quizLamps.innerHTML = Array.from({ length:5 }, (_, i) =>
    `<svg class="lamp${i < quizLampsOn ? ' on' : ''}" viewBox="0 0 40 56" aria-hidden="true">
      <circle class="glow" cx="20" cy="16" r="17"/>
      <path class="flame" d="M20 5 q5 10 0 17 q-5 -7 0 -17"/>
      <rect x="17" y="24" width="6" height="20" fill="#3a2a20"/>
      <ellipse cx="20" cy="50" rx="13" ry="5" fill="#3a2a20"/>
    </svg>`).join('');
}
function renderQuestion(){
  const item = quizPool[quizIdx];
  quizQ.textContent = `Q${quizIdx + 1} · ${item.q}`;
  quizStatus.textContent = `第 ${quizIdx + 1} / 5 题 · 已点亮 ${quizLampsOn} 盏灯`;
  quizOpts.innerHTML = '';
  item.opts.forEach((op, i) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.textContent = op;
    b.addEventListener('click', () => answer(i, item, b));
    quizOpts.appendChild(b);
  });
  quizFb.textContent = '';
  quizFb.className = 'quiz-fb';
  quizNext.hidden = true;
  quizAnswered = false;
}
function answer(i, item, btn){
  if (quizAnswered) return;
  quizAnswered = true;
  $$('.opt').forEach(o => o.disabled = true);
  if (i === item.a){
    btn.classList.add('correct');
    quizLampsOn++;
    tick('lamps');
    quizFb.textContent = '✓ 答对了！' + item.story;
    quizFb.className = 'quiz-fb good';
    renderLamps();
  } else {
    btn.classList.add('wrong');
    $$('.opt')[item.a].classList.add('correct');
    quizFb.textContent = '✗ 再想想——' + item.story;
    quizFb.className = 'quiz-fb bad';
  }
  quizNext.hidden = false;
}
function startQuiz(){
  quizPool = shuffle(QUIZ).slice(0, 5);
  quizIdx = 0; quizLampsOn = 0;
  quizDone.hidden = true;
  renderLamps();
  renderQuestion();
}
quizNext.addEventListener('click', () => {
  quizIdx++;
  if (quizIdx >= quizPool.length){
    quizStatus.textContent = `闯关完成 · 点亮 ${quizLampsOn} / 5 盏明灯`;
    quizQ.textContent = '';
    quizOpts.innerHTML = '';
    quizFb.textContent = '';
    quizNext.hidden = true;
    qdSub.textContent = quizLampsOn === 5
      ? '五盏全亮——你是「红岩传灯人」！愿星火之志，随你燎原。'
      : `答对 ${quizLampsOn} 题，点亮 ${quizLampsOn} 盏明灯。再闯一局，把灯全部点亮吧。`;
    quizDone.hidden = false;
    return;
  }
  renderQuestion();
});
$('#quizAgain').addEventListener('click', startQuiz);
startQuiz();

/* ============================================================
   16. 红岩传播力数据看板（本地统计）
   ============================================================ */
const stats = (() => {
  try { return JSON.parse(localStorage.getItem('hongyan-stats')) || { story:0, lamps:0, flags:0, certs:0, boxes:0 }; }
  catch(e){ return { story:0, lamps:0, flags:0, certs:0, boxes:0 }; }
})();
function saveStats(){
  try { localStorage.setItem('hongyan-stats', JSON.stringify(stats)); } catch(e){}
}
function tick(key){
  stats[key]++;
  saveStats();
  const el = document.querySelector(`.dash-num[data-key="${key}"]`);
  if (el) countUp(el, +el.textContent || 0, stats[key]);
}
function countUp(el, from, to){
  const t0 = performance.now(), dur = 600;
  (function step(t){
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}
(function renderDash(){
  document.querySelectorAll('.dash-num').forEach(el => { el.textContent = stats[el.dataset.key] || 0; });
})();

/* ============================================================
   17. 黎明前夜 · 互动叙事游戏（四章剧情 · 多结局 · 趣味系统）
   ============================================================ */
const DIM_LABEL = { loyalty:'忠贞', tenacity:'坚韧', wisdom:'智慧', tenderness:'柔情' };
const GAME = [
  { title:'第一章 · 雾都夜行', tag:'1949年秋 · 重庆朝天门码头', minigame:true,
    intro:[
      '雾都的秋天，雾大得能吞掉整条街。',
      '你叫宋小福，16岁，《新华日报》的报童。怀里最后十二份报纸，是今天没送完的。',
      '前方就是军警的封锁线，火盆把路口照得通红。老报童说过：报童的命可以丢，报纸不能断。'
    ],
    q:'穿过封锁线有两条路：一条是小巷，绕远但没人查；一条是码头边的近路，但今晚码头上站着两个军警。你选择——',
    opts:[
      { t:'钻进小巷——绕远路，也要把报纸送到读者手里', dim:'tenacity' },
      { t:'走大路，边走边喊「卖报！新华日报！」——反其道而行，赌他们不敢当街动手', dim:'wisdom' }
    ],
    archive:'《新华日报》1938年1月在重庆创刊。报童们在军警监视下送报，既是发行员，也兼做传递消息的交通员，被称作「雾都的传灯人」。' },
  { title:'第二章 · 狱中书信', tag:'渣滓洞监狱 · 审讯室',
    intro:[
      '终究还是没躲过。巷口的暗哨把你按在地上，报纸散了一地，你被带进了渣滓洞。',
      '审讯官把竹签一根根摆在你面前：「小报童，说出接头的人，放你回家。」',
      '火光里，你想起了老报童送你的那支笔——他说，用它写下的名字，都是要带进黎明的人。'
    ],
    explore:{ btn:'🔍 墙缝里似乎有什么在反光……', item:'pencil', found:'你从墙缝里抠出一截铅笔头——笔尖还带着干涸的墨，是某个难友留给后来人的。' },
    q:'竹签钉进指尖的瞬间，你选择——',
    opts:[
      { t:'咬牙沉默——宁可指骨尽碎，也不吐一个字', dim:'loyalty' },
      { t:'胡编一个名字拖延时间——让外面的人来得及转移', dim:'wisdom' }
    ],
    archive:'1948年，江竹筠（江姐）在渣滓洞受竹签钉指酷刑，留下「竹签子是竹子做的，共产党员的意志是钢铁做的」的名言。1949年11月14日就义，年仅29岁。' },
  { title:'第三章 · 囚窗诗会', tag:'白公馆监狱 · 平二室',
    intro:[
      '你被转到了白公馆。难友们没有垮，他们在囚窗下秘密办起诗会。',
      '教识字的老大哥说：牢房里最不能丢的两样东西——一样是信仰，一样是读书。',
      '这一夜，诗稿传到你的手里，看守的脚步声由远及近。'
    ],
    explore:{ btn:'🔍 囚窗下压着一角纸，像被风吹过来的……', item:'poem', found:'你拾起那页诗稿——墨迹新干，写着「黑夜再长，也长不过天明」。不知道是谁写的，但你知道它属于谁。' },
    q:'你选择——',
    opts:[
      { t:'主动站到门口望风——诗会不能断，我来挡', dim:'tenacity' },
      { t:'把诗稿塞进墙缝——留下证据，也留下明天的名字', dim:'wisdom' }
    ],
    archive:'狱中难友坚持学习，狱中党支部秘密组织读书会、办诗会。1949年10月，难友闻听新中国成立的消息，以黄纸剪星、秘密绣制五星红旗。' },
  { title:'第四章 · 黎明前夜', tag:'1949年11月27日 · 深夜',
    intro:[
      '外面传来密集的枪声，看守在加固铁门。今夜，就是黎明前最黑的那一段。',
      '老大哥把一小片纸塞进你手里：「小福，藏好它——出去以后，交给组织。这是狱中八条，我们这些人用命换来的话。」',
      '铁门被踹开了。他一把将你推进墙角的黑暗，自己站了出去。'
    ],
    explore:{ btn:'🔍 暗角里，似乎还有什么被塞了进来……', item:'eight', found:'你摸到一片纸——是狱中八条的开头。门外的骚乱声里，你听见老大哥压低的声音：「拿着，一起走。」' },
    q:'最后的时刻，你选择——',
    opts:[
      { t:'冲出去——不能让他一个人扛', dim:'tenderness' },
      { t:'攥紧纸片，在黑暗里一动不动——他交给你的话，比你的命重要', dim:'loyalty' }
    ],
    archive:'1949年11月27日，国民党特务对渣滓洞、白公馆在押人员实施集体屠杀，180余人殉难，重庆在3天后解放。脱险的罗广斌将难友讨论的「狱中八条」整理上报，成为以生命换来的红色遗产。' }
];
const ENDINGS = {
  loyalty:   { title:'明灯不灭', flower:'红梅 · 忠贞', text:'黎明前夜，你没能走出去。但那张写着「狱中八条」的纸片被后人从墙缝中找到——它后来成为执政党自我警示的诫训。你说不出话，可那盏灯，从没有灭过。' },
  wisdom:    { title:'暗夜传灯', flower:'木棉 · 智慧', text:'你活过了那一夜。3天后重庆解放，你把「狱中八条」交到组织手里。很多年后，人们管那批报童叫「雾都的传灯人」——而你是最后一个把火种带出牢房的人。' },
  tenacity:  { title:'狱中磐石', flower:'山茶 · 坚韧', text:'你像一块石头，咬住了那个最黑的夜。枪声停下时，你活着，纸片也在。重庆解放那天，你站在欢呼的人群里把报纸撒向天空——这一天的报，一条都没断过。' },
  tenderness:{ title:'铁骨柔情', flower:'樱花 · 柔情', text:'你冲了出去。子弹打穿了你的肩，但老大哥活了下来——他说你扑过来的那一下，让他想起了家。后来的日子，你收养了难友的遗孤，把「报童」两个字做成了家训。' }
};
const TIE_ENDING = { title:'星火燎原', flower:'五星 · 全面', text:'你的品格没有唯一的答案——忠、勇、智、情，你全都带着。那一夜之后，无论你身在何处，星火总在你经过的地方亮起来。这就是红岩给一个人的全部礼物。' };

/* --- 音效：Web Audio 合成（零外部资源） --- */
let AC = null;
function audioCtx(){
  if (!AC){
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    AC = new Ctor();
  }
  return AC;
}
function tone(freq, dur, type, vol, when){
  const a = audioCtx(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type || 'sine'; o.frequency.value = freq;
  g.gain.setValueAtTime(0, a.currentTime + (when || 0));
  g.gain.linearRampToValueAtTime(vol || .14, a.currentTime + (when || 0) + .015);
  g.gain.exponentialRampToValueAtTime(.001, a.currentTime + (when || 0) + dur);
  o.connect(g); g.connect(a.destination);
  o.start(a.currentTime + (when || 0)); o.stop(a.currentTime + (when || 0) + dur + .05);
}
const sfx = {
  click:  () => tone(880, .08, 'triangle', .12),
  found:  () => { tone(660, .1, 'triangle', .14); tone(990, .12, 'triangle', .12, .09); },
  archive:() => { tone(220, .2, 'sine', .16); tone(330, .25, 'sine', .1, .05); },
  bell:   () => { tone(196, 1.1, 'sine', .2); tone(294, .9, 'sine', .1, .15); tone(392, .8, 'sine', .07, .3); },
  pop:    () => tone(520, .07, 'square', .06)
};

/* --- 沉浸模式：章节场景条（SVG 剪影） --- */
const SCENE_SVG = [
  `<svg class="scene-svg" viewBox="0 0 800 80" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <g fill="#2b2421"><path d="M0 66 L90 50 L180 63 L260 44 L360 60 L460 47 L560 63 L660 50 L760 64 L800 57 L800 80 L0 80 Z"/></g>
    <g fill="#1a1512"><path d="M0 72 L120 60 L240 72 L380 58 L520 72 L660 60 L800 72 L800 80 L0 80 Z"/></g>
    <rect x="118" y="30" width="4" height="34" fill="#3a322d"/><rect x="468" y="36" width="4" height="28" fill="#3a322d"/>
    <path d="M120 30 L146 38 M470 36 L496 44" stroke="#3a322d" stroke-width="2" fill="none"/>
    <g fill="rgba(201,160,99,.5)"><rect x="300" y="52" width="5" height="6"/><rect x="330" y="58" width="5" height="6"/><rect x="620" y="54" width="5" height="6"/></g>
    <g stroke="rgba(200,200,205,.1)" stroke-width="6"><path d="M0 30 H800"/><path d="M0 50 H800"/></g>
  </svg>`,
  `<svg class="scene-svg" viewBox="0 0 800 80" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <circle cx="400" cy="18" r="30" fill="rgba(201,160,99,.14)"/>
    <g stroke="#6e5f55" stroke-width="5" opacity=".55">
      <path d="M40 0 V80 M150 0 V80 M260 0 V80 M370 0 V80 M480 0 V80 M590 0 V80 M700 0 V80"/>
    </g>
    <g stroke="#4a423c" stroke-width="3" opacity=".5"><path d="M0 22 H800"/></g>
  </svg>`,
  `<svg class="scene-svg" viewBox="0 0 800 80" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <circle class="moon-glow" cx="636" cy="26" r="17" fill="#e8d5ae" opacity=".7"/>
    <rect x="316" y="6" width="150" height="74" fill="rgba(10,8,7,.6)" stroke="#8a8378" stroke-width="4" opacity=".7"/>
    <line x1="391" y1="6" x2="391" y2="80" stroke="#8a8378" stroke-width="3" opacity=".7"/>
    <line x1="316" y1="43" x2="466" y2="43" stroke="#8a8378" stroke-width="3" opacity=".7"/>
    <g stroke="rgba(200,200,205,.12)" stroke-width="5"><path d="M0 60 H800"/></g>
  </svg>`,
  `<svg class="scene-svg" viewBox="0 0 800 80" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs><radialGradient id="dawnGrad2" cx="50%" cy="100%" r="65%">
      <stop offset="0%" stop-color="#e8c87e" stop-opacity=".55"/>
      <stop offset="100%" stop-color="#e8c87e" stop-opacity="0"/>
    </radialGradient></defs>
    <circle class="dawn-glow" cx="400" cy="84" r="70" fill="url(#dawnGrad2)"/>
    <g fill="#171210"><path d="M0 70 L100 56 L210 70 L330 52 L450 68 L570 54 L690 70 L800 58 L800 80 L0 80 Z"/></g>
    <circle cx="400" cy="74" r="10" fill="#f0ddb4" opacity=".8"/>
  </svg>`
];
const CHAPTER_TINT = ['ch1','ch2','ch3','ch4'];

/* --- 沉浸氛围音：低频雾声 + 雨声底噪 --- */
let amb = null, ambWanted = false;
const ambBtn = $('#ambBtn');
function startAmbience(){
  if (amb) return;
  const a = audioCtx(); if (!a) return;
  const master = a.createGain();
  master.gain.setValueAtTime(0, a.currentTime);
  master.gain.linearRampToValueAtTime(.15, a.currentTime + 2.2);
  master.connect(a.destination);
  const o1 = a.createOscillator(); o1.type = 'sine'; o1.frequency.value = 55;
  const o2 = a.createOscillator(); o2.type = 'sine'; o2.frequency.value = 82.5;
  const og = a.createGain(); og.gain.value = .3;
  o1.connect(og); o2.connect(og); og.connect(master);
  const len = a.sampleRate * 2;
  const buf = a.createBuffer(1, len, a.sampleRate);
  const dt = buf.getChannelData(0);
  for (let i = 0; i < len; i++) dt[i] = Math.random()*2 - 1;
  const src = a.createBufferSource(); src.buffer = buf; src.loop = true;
  const filt = a.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 720;
  const rg = a.createGain(); rg.gain.value = .5;
  src.connect(filt); filt.connect(rg); rg.connect(master);
  o1.start(); o2.start(); src.start();
  amb = { a, master, o1, o2, src };
}
function stopAmbience(){
  if (!amb) return;
  const cur = amb; amb = null;
  cur.master.gain.linearRampToValueAtTime(0, cur.a.currentTime + 1.1);
  setTimeout(() => { try { cur.o1.stop(); cur.o2.stop(); cur.src.stop(); } catch(e){} }, 1400);
}
ambBtn.addEventListener('click', () => {
  ambWanted = !ambWanted;
  if (ambWanted) startAmbience(); else stopAmbience();
  ambBtn.classList.toggle('on', ambWanted);
  ambBtn.textContent = ambWanted ? '🎧 氛围 · 开' : '🎧 氛围 · 关';
});
function chapterChime(){
  if (!ambWanted) return;
  tone(392, .5, 'sine', .05); tone(523, .6, 'sine', .04, .14);
}
function tenseHeartbeat(){
  if (!ambWanted) return;
  tone(62, .7, 'sine', .1); tone(62, .5, 'sine', .07, .85);
}
function endingMusic(key){
  const seq = {
    loyalty:   [[220,.9,.11,0],[330,1.1,.08,.2],[440,1.5,.06,.46]],
    wisdom:    [[330,.5,.1,0],[494,.5,.09,.16],[659,.8,.08,.32],[880,1.3,.06,.5]],
    tenacity:  [[196,.7,.13,0],[196,.7,.11,.26],[294,1.3,.09,.54]],
    tenderness:[[440,.8,.09,0],[554,.9,.08,.2],[659,1.4,.06,.44]],
    hidden:    [[262,.4,.1,0],[330,.4,.1,.14],[392,.4,.1,.28],[523,.5,.1,.42],[659,.6,.1,.56],[784,1.4,.08,.74]],
    tie:       [[196,.4,.12,0],[262,.4,.12,.2],[330,.5,.12,.4],[392,.6,.12,.62],[523,1.5,.09,.88]]
  }[key] || [];
  seq.forEach(([f, d, v, w]) => tone(f, d, 'sine', v, w));
}

/* --- 道具 / 信念 / 结局图鉴 --- */
const ITEMS = [
  { key:'paper',  name:'最后一份报纸', face:'📰', desc:'穿过封锁线也要送到读者手里——报童的命可以丢，报纸不能断。' },
  { key:'pencil', name:'半截铅笔头',   face:'✏️', desc:'墙缝里找到的——有人用它写诗，也用它把名字带进黎明。' },
  { key:'poem',   name:'囚窗诗稿',     face:'📜', desc:'「黑夜再长，也长不过天明」——黑暗里最亮的东西，是写下来的字。' },
  { key:'eight',  name:'狱中八条',     face:'🔖', desc:'老大哥用命换来的话——把它带出去，就是替所有没能走出去的人活着。' }
];
const CODEX_DEF = [
  { key:'loyalty',    face:'🕯', name:'明灯不灭', tip:'以忠贞走到黎明前夜' },
  { key:'wisdom',     face:'🏮', name:'暗夜传灯', tip:'以智慧带出火种' },
  { key:'tenacity',   face:'⛰', name:'狱中磐石', tip:'以坚韧咬住黑夜' },
  { key:'tenderness', face:'🌸', name:'铁骨柔情', tip:'以柔情扑向黎明' },
  { key:'hidden',     face:'🌅', name:'黎明之光', tip:'隐藏结局 · 集齐四件道具' }
];
const HIDDEN_ENDING = { title:'黎明之光', flower:'五星 · 圆满',
  text:'你带着报纸、铅笔、诗稿和「狱中八条」，完整地走出了那个黎明。许多年后，你把它们捐给了红岩革命纪念馆。讲解员说，那支铅笔头还能写字。你笑了：那就好，让它继续写。' };

let items = [];
let belief = 0;
let codex = (() => { try { return JSON.parse(localStorage.getItem('hongyan-codex')) || []; } catch(e){ return []; } })();

function addItem(key){
  if (items.includes(key)) return;
  items.push(key);
  sfx.found();
  renderHUD();
  feedbackPop(`获得道具 · ${ITEMS.find(i => i.key === key).name}`);
}
function addBelief(n, label){
  belief += n;
  renderHUD();
  feedbackPop(label ? `信念 +${n} · ${label}` : `信念 +${n}`);
}
function renderHUD(){
  $('#beliefFill').style.width = Math.min(belief, 100) + '%';
  $('#beliefNum').textContent = belief;
  $('#itemStrip').innerHTML = ITEMS.map(it => {
    const got = items.includes(it.key);
    return `<span class="item-chip${got ? ' got' : ''}" title="${got ? it.name : '未获得'}">${got ? it.face : '·'}</span>`;
  }).join('');
}
function feedbackPop(text){
  let el = document.querySelector('.feedback-pop');
  if (!el){
    el = document.createElement('div');
    el.className = 'feedback-pop';
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
}
function saveCodex(){ try { localStorage.setItem('hongyan-codex', JSON.stringify(codex)); } catch(e){} }
function renderCodex(){
  $('#codexGrid').innerHTML = CODEX_DEF.map(c => {
    const has = codex.includes(c.key);
    return `<div class="codex-slot${has ? ' unlocked' : ' locked'}">
      <span class="codex-face">${has ? c.face : '❔'}</span>
      <span class="codex-name">${has ? c.name : '？？？'}</span>
      <span class="codex-tip">${has ? c.tip : '尚未解锁'}</span>
    </div>`;
  }).join('');
}
function unlockEnding(key){
  if (!codex.includes(key)){ codex.push(key); saveCodex(); renderCodex(); }
}

/* --- 状态机 --- */
let gIdx = 0, gStep = 'intro', gTimer = null, gameEnding = null;
const gScores = { loyalty:0, tenacity:0, wisdom:0, tenderness:0 };

function startGame(){
  gIdx = 0; gStep = 'intro'; gameEnding = null;
  belief = 0;
  for (const k in gScores) gScores[k] = 0;
  renderHUD();
  renderGame();
}
function renderGame(){
  if (gStep === 'ending'){ renderEnding(); return; }
  const ch = GAME[gIdx];
  $('#gameProgress').textContent = ch.title;
  $('#gameStage').className = 'game-stage ' + CHAPTER_TINT[gIdx];
  const panel = $('#gamePanel');

  if (gStep === 'intro'){
    chapterChime();
    panel.innerHTML = `<div class="scene-strip">${SCENE_SVG[gIdx]}</div><p class="g-tag">${ch.tag}</p><p class="g-text" id="gText"></p><button class="btn btn-mini g-continue">继续 ▸</button>`;
    typeWriter($('#gText'), ch.intro.join('　'));
    $('.g-continue', panel).addEventListener('click', () => {
      stopType();
      if (ch.minigame) startMinigame();
      else { gStep = 'explore'; renderGame(); }
    });

  } else if (gStep === 'explore'){
    const ex = ch.explore;
    if (!ex){ gStep = 'choice'; renderGame(); return; }
    const found = items.includes(ex.item);
    if (found){
      panel.innerHTML = `
        <p class="g-tag">${ch.tag}</p>
        <div class="item-found">
          <p class="if-name">${ITEMS.find(i => i.key === ex.item).face} ${ITEMS.find(i => i.key === ex.item).name}</p>
          <p class="if-desc">${ex.found}</p>
        </div>
        <button class="btn btn-mini g-continue">继续 ▸</button>`;
    } else {
      panel.innerHTML = `
        <p class="g-tag">${ch.tag}</p>
        <p class="g-text" style="min-height:0">出发前，你环顾四周——似乎有什么值得带走的东西。</p>
        <div class="rc-actions">
          <button class="btn btn-mini explore-btn" id="exploreBtn">${ex.btn}</button>
          <button class="btn btn-mini g-continue">继续 ▸</button>
        </div>`;
      $('#exploreBtn').addEventListener('click', () => { addItem(ex.item); gStep = 'explore'; renderGame(); });
    }
    $('.g-continue', panel).addEventListener('click', () => { gStep = 'choice'; renderGame(); });

  } else if (gStep === 'choice'){
    tenseHeartbeat();
    panel.innerHTML = `
      <p class="g-tag">${ch.tag}</p>
      <p class="g-q">${ch.q}</p>
      <div class="choice-opts">
        <button class="choice-opt">${ch.opts[0].t}</button>
        <button class="choice-opt">${ch.opts[1].t}</button>
      </div>`;
    $$('.choice-opt', panel).forEach((b, i) => b.addEventListener('click', () => {
      gScores[ch.opts[i].dim]++;
      addBelief(25, DIM_LABEL[ch.opts[i].dim]);
      sfx.click();
      tick('story');
      gStep = 'archive';
      renderGame();
    }));

  } else {
    sfx.archive();
    panel.innerHTML = `<p class="g-archive">${ch.archive}</p><button class="btn btn-mini g-continue">${gIdx < 3 ? '下一章 ▸' : '迎来黎明 ▸'}</button>`;
    $('.g-continue', panel).addEventListener('click', () => {
      gIdx++;
      if (gIdx >= GAME.length){ gStep = 'ending'; }
      else { gStep = 'intro'; }
      renderGame();
    });
  }
}
function renderEnding(){
  const hasAll = items.length >= 4;
  let top = null, max = -1, tie = false;
  for (const k in gScores){
    if (gScores[k] > max){ max = gScores[k]; top = k; tie = false; }
    else if (gScores[k] === max){ tie = true; }
  }
  const e = hasAll ? HIDDEN_ENDING : (tie ? TIE_ENDING : ENDINGS[top]);
  gameEnding = { title: e.title, flower: e.flower };
  unlockEnding(hasAll ? 'hidden' : top);
  endingMusic(hasAll ? 'hidden' : (tie ? 'tie' : top));
  $('#gameProgress').textContent = '结局 · 黎明到来';
  $('#gamePanel').innerHTML = `
    <div class="g-ending">
      <p class="ge-tag">结局 · ${e.flower}　·　信念值 ${belief}</p>
      <p class="ge-title">${e.title}</p>
      <p class="ge-text">${e.text}</p>
      <div class="rc-actions">
        <button class="btn btn-mini" id="gameAgain">重新开始</button>
        <span class="rc-share">📤 截图分享你的结局</span>
      </div>
    </div>`;
  $('#gameAgain').addEventListener('click', startGame);
}
function typeWriter(el, text){
  stopType();
  let i = 0;
  el.classList.add('typing');
  gTimer = setInterval(() => {
    i += 2;
    el.textContent = text.slice(0, i);
    if (i % 6 === 0 && ambWanted) tone(1150 + Math.random()*520, .02, 'square', .012);
    if (i >= text.length){ stopType(); el.classList.remove('typing'); }
  }, 20);
}
function stopType(){ if (gTimer){ clearInterval(gTimer); gTimer = null; } }

/* --- 送报小游戏（第一章） --- */
function startMinigame(){
  gStep = 'minigame';
  const panel = $('#gamePanel');
  panel.innerHTML = `
    <p class="g-tag">小游戏 · 送报穿过封锁线</p>
    <div class="mini-stage">
      <canvas class="mini-canvas" id="miniCanvas" width="640" height="320"></canvas>
      <div class="mini-bar">
        <span class="mini-info">📰 <b id="miniScore">0</b> / 5　🔦 命中 <b id="miniHits">0</b> / 3　⏱ <b id="miniTime">45</b>s</span>
        <button class="btn btn-mini mini-btn" id="miniSkip">放弃送报，继续剧情</button>
      </div>
    </div>
    <p class="mini-tip">🖱 移动鼠标控制报童左右移动 · 接住报纸，躲开手电光柱</p>`;
  $('#miniSkip').addEventListener('click', () => endMinigame(false, true));

  const cvs = $('#miniCanvas');
  const ctx = cvs.getContext('2d');
  const W = cvs.width, H = cvs.height;
  let px = W / 2, score = 0, hits = 0, time = 45, over = false;
  const papers = [];
  const beams = [
    { y:-60, speed:1.6, x:W*.3, w:90, hit:false },
    { y:-160, speed:1.9, x:W*.65, w:70, hit:false }
  ];
  for (let i = 0; i < 3; i++) papers.push({ x:40 + Math.random()*(W-100), y:-20 - i*90, vy:1.2 + Math.random()*.6, got:false });

  cvs.addEventListener('pointermove', e => {
    const r = cvs.getBoundingClientRect();
    px = (e.clientX - r.left) * (W / r.width);
  });

  const timer = setInterval(() => {
    time--;
    const el = $('#miniTime'); if (el) el.textContent = Math.max(time, 0);
    if (time <= 0) endMinigame(false, false);
  }, 1000);

  (function loop(){
    if (over) return;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#171210'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(233,213,190,.05)';
    for (let i = 0; i < 6; i++) ctx.fillRect(0, 40*i + Math.sin(performance.now()/800 + i)*6, W, 14);
    // 手电光柱
    for (const b of beams){
      b.y += b.speed;
      if (b.y > H + 60){ b.y = -80; b.x = W*(.15 + Math.random()*.7); b.hit = false; }
      const g2 = ctx.createLinearGradient(0, b.y, 0, b.y + 130);
      g2.addColorStop(0, 'rgba(255,220,150,.75)');
      g2.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.moveTo(b.x - b.w/2, b.y); ctx.lineTo(b.x + b.w/2, b.y);
      ctx.lineTo(b.x + b.w/2 + 26, b.y + 130); ctx.lineTo(b.x - b.w/2 - 26, b.y + 130);
      ctx.closePath(); ctx.fill();
      if (!b.hit && b.y + 130 > 258 && Math.abs(b.x - px) < b.w/2 + 22){
        b.hit = true; hits++; sfx.pop();
        const el = $('#miniHits'); if (el) el.textContent = hits;
        if (hits >= 3) endMinigame(false, false);
      }
      if (b.y > 310) b.hit = false;
    }
    // 报纸
    for (const p of papers){
      p.y += p.vy;
      ctx.fillStyle = '#E8C87E';
      ctx.fillRect(p.x - 10, p.y - 7, 20, 14);
      ctx.fillStyle = '#8a1f22';
      ctx.fillRect(p.x - 6, p.y - 4, 12, 2);
      if (!p.got && Math.abs(p.y - 250) < 16 && Math.abs(p.x - px) < 30){
        p.got = true; score++; sfx.found();
        const el = $('#miniScore'); if (el) el.textContent = score;
        if (score >= 5) endMinigame(true, false);
      }
      if (p.y > H + 20){ p.y = -20; p.x = 40 + Math.random()*(W-100); }
    }
    // 报童
    ctx.fillStyle = '#C9A063';
    ctx.fillRect(px - 12, 236, 24, 30);
    ctx.beginPath(); ctx.arc(px, 228, 12, 0, 7); ctx.fill();
    ctx.fillStyle = '#8a1f22';
    ctx.beginPath(); ctx.arc(px, 220, 12, Math.PI, 0); ctx.fill();
    ctx.fillRect(px - 14, 258, 28, 8);
    requestAnimationFrame(loop);
  })();

  function endMinigame(win, skipped){
    if (over) return; over = true;
    clearInterval(timer);
    const panel = $('#gamePanel');
    if (win){
      addItem('paper');
      addBelief(10, '无畏');
      panel.innerHTML = `
        <p class="g-tag">小游戏 · 过关</p>
        <div class="item-found">
          <p class="if-name">📰 获得道具 · 最后一份报纸</p>
          <p class="if-desc">你穿过封锁线，把报纸塞进读者门缝。军警搜走了一叠，但没搜到这一份。</p>
        </div>
        <button class="btn btn-mini g-continue">继续 ▸</button>`;
    } else {
      if (!skipped) addBelief(3, '坚持');
      panel.innerHTML = `
        <p class="g-tag">小游戏 · ${skipped ? '放弃' : '失败'}</p>
        <div class="item-found">
          <p class="if-name">${skipped ? '🕊 你放下了报纸' : '🔦 报纸被没收了'}</p>
          <p class="if-desc">${skipped ? '老报童说过：留得青山在。你空着手，但人还在——黎明还需要你。' : '军警收走了报纸，但你没有交出任何名字。人还在，就还有明天。'}</p>
        </div>
        <button class="btn btn-mini g-continue">继续 ▸</button>`;
    }
    $('.g-continue', panel).addEventListener('click', () => { gStep = 'choice'; renderGame(); });
  }
}

renderHUD();
renderCodex();
startGame();

/* ============================================================
   18. 盲盒集卡册（模拟抽卡 + 狱中八条）
   ============================================================ */
const CARDS = {
  jiang:  { name:'江姐',     face:'🌸', line:'红梅傲骨 · 忠贞不渝' },
  boy:    { name:'报童',     face:'📰', line:'雾都少年 · 传递真理' },
  radish: { name:'小萝卜头', face:'🌱', line:'狱中星光 · 希望不息' },
  mate:   { name:'狱友',     face:'🕯', line:'黎明守望 · 并肩同行' }
};
const EIGHT = [
  '防止领导成员腐化','加强党内教育和实际斗争的锻炼','不要理想主义，对上级也不要迷信',
  '注意路线问题，不要从右跳到「左」','切勿轻视敌人','重视党员特别是领导干部的经济、恋爱和生活作风问题',
  '严格进行整党整风','惩办叛徒特务'
];
let owned = [];
function renderBook(){
  const book = $('#cardbook');
  book.innerHTML = '';
  ['jiang','boy','radish','mate'].forEach(k => {
    const c = CARDS[k];
    const has = owned.includes(k);
    book.innerHTML += `
      <div class="cb-slot${has ? ' cb-owned' : ' cb-locked'}">
        <span class="cb-face">${has ? c.face : '❔'}</span>
        <span class="cb-name">${has ? c.name : '未收录'}</span>
        <span class="cb-tip">${has ? c.line : '继续抽取'}</span>
      </div>`;
  });
  const all = owned.length === 4;
  book.innerHTML += `
    <div class="cb-slot cb-hidden${all ? '' : ' cb-locked'}" id="hiddenSlot" role="button" tabindex="0">
      <span class="cb-face">${all ? '📜' : '🔒'}</span>
      <span class="cb-name">${all ? '狱中八条' : '隐藏卡'}</span>
      <span class="cb-tip">${all ? '点击展开' : '集齐四位解锁'}</span>
    </div>`;
  if (all){
    $('#hiddenSlot').addEventListener('click', () => {
      $('#mTitle').textContent = '狱中八条 · 烈士遗训';
      $('#mBody').textContent = '1949年脱险后，罗广斌把难友们在狱中反复讨论的总结整理为八条——' + EIGHT.map((e, i) => `（${i+1}）${e}`).join('；');
      modal.classList.add('show');
      modal.setAttribute('aria-hidden','false');
      tick('story');
    });
  }
}
$('#drawBtn').addEventListener('click', () => {
  const pool = ['jiang','boy','radish','mate'];
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const out = $('#drawResult');
  tick('boxes');
  if (owned.includes(pick)){
    out.textContent = `重复了——${CARDS[pick].name} 已在册。集齐四位即可解锁「狱中八条」。`;
    return;
  }
  owned.push(pick);
  renderBook();
  if (owned.length === 4){
    out.textContent = '✨ 四位角色集齐！隐藏卡「狱中八条」已解锁——点击展开';
  } else {
    out.textContent = `🎉 开出「${CARDS[pick].name}」——${CARDS[pick].line}（${owned.length} / 4）`;
  }
});
renderBook();

/* ============================================================
   19. 传灯证书生成（canvas 绘制 + 真实数据）
   ============================================================ */
const certCanvas = $('#certCanvas');
const certCtx = certCanvas.getContext('2d');
function drawCert(name, lamps, flags, title){
  const W = certCanvas.width, H = certCanvas.height;
  certCtx.clearRect(0, 0, W, H);
  const g = certCtx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#b8292c'); g.addColorStop(1, '#571316');
  certCtx.fillStyle = g; certCtx.fillRect(0, 0, W, H);
  certCtx.strokeStyle = '#C9A063'; certCtx.lineWidth = 3;
  certCtx.strokeRect(26, 26, W - 52, H - 52);
  certCtx.strokeStyle = 'rgba(201,160,99,.5)'; certCtx.lineWidth = 1;
  certCtx.strokeRect(38, 38, W - 76, H - 76);
  certCtx.textAlign = 'center';
  certCtx.fillStyle = '#C9A063'; certCtx.font = '30px serif';
  certCtx.fillText('★', W/2, 92);
  certCtx.fillStyle = '#f5e6d8'; certCtx.font = 'bold 52px "KaiTi","STKaiti",serif';
  certCtx.fillText('红岩传灯证书', W/2, 152);
  certCtx.strokeStyle = 'rgba(201,160,99,.6)'; certCtx.beginPath();
  certCtx.moveTo(W/2 - 170, 178); certCtx.lineTo(W/2 + 170, 178); certCtx.stroke();
  certCtx.fillStyle = '#f5e6d8'; certCtx.font = '22px "KaiTi","STKaiti",serif';
  const lines = [
    `兹证明  ${name}`,
    '于红岩文化互动体验中：',
    `点亮雾都明灯 ${lamps} 盏 · 绣成红旗 ${flags} 面`,
    title ? `${title}` : '传承红岩精神，传播红色文化',
    '特发此证，以志传承。'
  ];
  lines.forEach((ln, i) => certCtx.fillText(ln, W/2, 236 + i * 42));
  certCtx.fillStyle = 'rgba(245,230,216,.75)'; certCtx.font = '15px "KaiTi","STKaiti",serif';
  certCtx.fillText('编号 HY-' + Date.now().toString(36).toUpperCase(), W/2, 452);
  const now = new Date();
  certCtx.fillText(`${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`, W/2, 476);
  certCtx.save();
  certCtx.translate(W - 120, H - 92); certCtx.rotate(-.06);
  certCtx.fillStyle = 'rgba(200,40,44,.85)';
  certCtx.fillRect(-30, -38, 60, 76);
  certCtx.fillStyle = '#f5e6d8'; certCtx.font = '15px "KaiTi","STKaiti",serif';
  certCtx.fillText('红岩', 0, -11); certCtx.fillText('明灯', 0, 13);
  certCtx.restore();
}
$('#certBtn').addEventListener('click', () => {
  const name = $('#certName').value.trim() || '传灯人';
  drawCert(name, stats.lamps, document.querySelectorAll('.flag-star.stitched').length, gameEnding ? `通关《黎明前夜》 · 结局「${gameEnding.title}」` : '');
  $('#certDl').hidden = false;
  tick('certs');
});
$('#certDl').addEventListener('click', () => {
  const a = document.createElement('a');
  a.download = '红岩传灯证书.png';
  a.href = certCanvas.toDataURL('image/png');
  a.click();
});
drawCert('示例 · 传灯人', 0, 0, '');

})();
