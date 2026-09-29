# -*- coding: utf-8 -*-
"""《黎明前夜》红岩互动叙事游戏 · 答辩PPT生成脚本"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
import copy

# ---------- 视觉规范（与作品一致） ----------
RED   = RGBColor(0xC3, 0x27, 0x2B)   # 红岩红
RED_D = RGBColor(0x8A, 0x1F, 0x22)
CHAR  = RGBColor(0x17, 0x14, 0x12)   # 炭黑
CHAR2 = RGBColor(0x21, 0x1C, 0x19)
GOLD  = RGBColor(0xC9, 0xA0, 0x63)   # 暖金
GOLD_S= RGBColor(0xE8, 0xD5, 0xAE)
FOG   = RGBColor(0x9C, 0x94, 0x8A)   # 雾都灰
PAPER = RGBColor(0xE8, 0xE4, 0xDE)   # 米白
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
FONT  = 'Microsoft YaHei'

prs = Presentation()
prs.slide_width  = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]

def set_font(run, name=FONT):
    run.font.name = name
    rPr = run._r.get_or_add_rPr()
    ea = rPr.find(qn('a:ea'))
    if ea is None:
        ea = rPr.makeelement(qn('a:ea'), {})
        rPr.append(ea)
    ea.set('typeface', name)

def add_text(slide, x, y, w, h, text, size=14, color=PAPER, bold=False,
             align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, spacing=1.15):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    lines = text.split('\n')
    for i, ln in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = spacing
        r = p.add_run()
        r.text = ln
        r.font.size = Pt(size)
        r.font.bold = bold
        r.font.color.rgb = color
        set_font(r)
    return tb

def add_rect(slide, x, y, w, h, fill=CHAR2, line=None, radius=0.08, shadow=False):
    shp = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    if fill is None:
        shp.fill.background()
    else:
        shp.fill.solid(); shp.fill.fore_color.rgb = fill
    if line:
        shp.line.color.rgb = line; shp.line.width = Pt(1)
    else:
        shp.line.fill.background()
    try:
        shp.adjustments[0] = radius
    except Exception:
        pass
    shp.shadow.inherit = False
    return shp

def add_rect_text(slide, x, y, w, h, text, size=13, color=PAPER, bold=False,
                  fill=CHAR2, line=None, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE):
    shp = add_rect(slide, x, y, w, h, fill=fill, line=line)
    tf = shp.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    for i, ln in enumerate(text.split('\n')):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = 1.12
        r = p.add_run(); r.text = ln
        r.font.size = Pt(size); r.font.bold = bold
        r.font.color.rgb = color
        set_font(r)
    return shp

def new_slide(bg=CHAR):
    s = prs.slides.add_slide(BLANK)
    s.background.fill.solid()
    s.background.fill.fore_color.rgb = bg
    return s

def header(slide, kicker, title, sub=None):
    add_rect(slide, 0, 0, 13.333, 0.06, fill=RED)
    add_text(slide, 0.65, 0.32, 12, 0.3, kicker, size=11, color=GOLD, bold=True)
    add_text(slide, 0.65, 0.58, 12, 0.6, title, size=27, color=PAPER, bold=True)
    if sub:
        add_text(slide, 0.65, 1.16, 12, 0.35, sub, size=13, color=FOG)
    add_rect(slide, 0.68, 1.52, 1.1, 0.035, fill=RED)

def footer(slide, page):
    add_text(slide, 12.35, 7.06, 0.7, 0.3, str(page), size=10, color=FOG, align=PP_ALIGN.RIGHT)

# ================= S1 封面 =================
s = new_slide()
add_rect(s, 0, 0, 13.333, 0.09, fill=RED)
add_rect(s, 0, 7.41, 13.333, 0.09, fill=RED)
add_text(s, 0.9, 1.15, 11.5, 0.4, 'THE NIGHT BEFORE DAWN · 数字媒体艺术设计参赛作品',
         size=13, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
add_text(s, 0.9, 2.05, 11.5, 1.7, '黎 明 前 夜', size=72, color=GOLD_S, bold=True, align=PP_ALIGN.CENTER)
add_text(s, 0.9, 3.55, 11.5, 0.5, '红岩精神互动叙事游戏', size=26, color=WHITE, align=PP_ALIGN.CENTER)
add_rect_text(s, 4.17, 4.35, 5.0, 0.5, '报童宋小福的 1949 · 四章剧情 · 多结局',
              size=14, color=GOLD_S, fill=CHAR2, line=GOLD)
add_text(s, 0.9, 6.2, 11.5, 0.35, '参赛人：__________　　指导老师：__________　　2026',
         size=13, color=FOG, align=PP_ALIGN.CENTER)

# ================= S2 选题背景 =================
s = new_slide()
header(s, 'BACKGROUND · 选题背景', '为什么是红岩？为什么是游戏？')
add_rect_text(s, 0.65, 1.85, 4.0, 4.9,
    '红岩精神 · 六重内核\n\n忠贞信仰\n狱中坚守\n黎明抗争\n铁骨柔情\n雾都明灯\n星火燎原',
    size=14, color=PAPER, fill=CHAR2, line=None, align=PP_ALIGN.LEFT)
add_text(s, 0.9, 2.1, 3.5, 0.4, '红岩精神 · 六重内核', size=16, color=GOLD, bold=True)
add_rect_text(s, 4.95, 1.85, 7.75, 2.2,
    '三个痛点\n\n① 说教式传播——「你应该学习」\n② 内容同质化——红梅、誓言、口号千篇一律\n③ 年轻人无感——历史与他们之间有雾',
    size=13.5, color=PAPER, fill=CHAR2, align=PP_ALIGN.LEFT)
add_rect_text(s, 4.95, 4.3, 7.75, 2.45,
    '三个机会\n\n① 参与式体验——「你来选择」\n② 史料即内容——真实档案是最大的差异化\n③ 游戏化叙事——让历史成为可以玩的黎明',
    size=13.5, color=GOLD_S, fill=CHAR2, line=GOLD, align=PP_ALIGN.LEFT)
add_text(s, 0.9, 6.55, 11.5, 0.4,
    '核心命题：红色文化传播，从「讲给年轻人听」转向「让年轻人自己选择」。',
    size=14, color=RED, bold=True, align=PP_ALIGN.CENTER)
footer(s, 2)

# ================= S3 作品定位 =================
s = new_slide()
header(s, 'POSITIONING · 作品定位', '一句话读懂作品')
add_rect(s, 0.65, 2.0, 12.03, 1.9, fill=CHAR2, line=GOLD)
add_text(s, 1.1, 2.35, 11.2, 1.3,
    '《黎明前夜》是一款红岩精神主题的 Web 互动叙事游戏——\n玩家扮演 1949 年重庆《新华日报》报童宋小福，\n用四章剧情、四次生死抉择，走出属于自己的黎明。',
    size=19, color=WHITE, align=PP_ALIGN.CENTER, spacing=1.5)
labels = [('互动叙事', '剧情不是被读的，是被选的'),
          ('品格引擎', '选择积累品格维度，决定结局'),
          ('多结局', '五种结局，各有各的黎明')]
for i, (t, d) in enumerate(labels):
    x = 0.65 + i * 4.14
    add_rect_text(s, x, 4.35, 3.85, 1.7, f'{t}\n{d}', size=15, color=GOLD_S,
                  fill=CHAR2, line=RED)
add_text(s, 0.9, 6.45, 11.5, 0.4,
    '一句主张：你选择的不是关卡，是信仰的形态。',
    size=16, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
footer(s, 3)

# ================= S4 故事与角色 =================
s = new_slide()
header(s, 'NARRATIVE · 故事与角色', '报童宋小福的 1949')
add_rect_text(s, 0.65, 1.8, 3.5, 1.75, '主角\n\n宋小福 · 16岁\n《新华日报》报童',
              size=16, color=GOLD_S, fill=CHAR2, line=RED, align=PP_ALIGN.CENTER)
add_rect_text(s, 4.35, 1.8, 8.35, 1.75,
    '历史原型：真实存在的「新华日报报童」群体\n——1938 年起在重庆军警监视下送报，\n既是发行员，也是传递消息的交通员，\n被称作「雾都的传灯人」。',
    size=13.5, color=PAPER, fill=CHAR2, align=PP_ALIGN.LEFT)
chapters = [('第一章', '雾都夜行', '送报穿越封锁线'),
            ('第二章', '狱中书信', '竹签之问不改其志'),
            ('第三章', '囚窗诗会', '传诗与守望'),
            ('第四章', '黎明前夜', '11·27 大屠杀')]
for i, (c, t, d) in enumerate(chapters):
    x = 0.65 + i * 3.1
    add_rect_text(s, x, 4.0, 2.85, 1.85, f'{c}\n{t}\n{d}', size=13, color=PAPER,
                  fill=CHAR2, line=GOLD)
add_rect_text(s, 0.65, 6.15, 12.03, 0.7,
    '📜 每章结束附「档案卡」——全部真实史料出处（新华日报创刊 / 江姐竹签之问 / 狱中诗会 / 狱中八条）',
    size=13, color=GOLD_S, fill=CHAR2, line=None)
footer(s, 4)

# ================= S5 玩法系统 =================
s = new_slide()
header(s, 'GAMEPLAY · 核心玩法', '四大游戏化系统')
mech = [('🎮 送报小游戏', '第一章可玩关卡\n躲避军警手电光柱\n收集 5 份报纸\n成功获得道具「最后一份报纸」'),
        ('⚖️ 生死抉择', '四章四次抉择\n忠贞 / 坚韧 / 智慧 / 柔情\n四维品格计分\n信念值即时反馈'),
        ('🔍 道具探索', '每章隐藏探索点\n铅笔头 / 诗稿 / 狱中八条\n集齐四件道具\n解锁隐藏结局'),
        ('📖 结局图鉴', '五种结局收集格\n未解锁显示「？？？」\nlocalStorage 持久化\n多周目核心动力')]
for i, (t, d) in enumerate(mech):
    x = 0.65 + (i % 2) * 6.16
    y = 1.85 + (i // 2) * 2.3
    add_rect_text(s, x, y, 5.9, 2.05, f'{t}\n{d}', size=13.5, color=PAPER,
                  fill=CHAR2, line=GOLD, align=PP_ALIGN.LEFT)
add_rect_text(s, 0.65, 6.5, 12.03, 0.6,
    '失败不惩罚，坚持有回报——每一个选择都被尊重，每一种品格都有结局。',
    size=13.5, color=RED, bold=True, fill=CHAR2, line=RED)
footer(s, 5)

# ================= S6 多结局设计 =================
s = new_slide()
header(s, 'ENDING SYSTEM · 多结局设计', '五种结局，各有各的黎明')
ends = [('🕯 明灯不灭', '忠贞', '黎明前夜倒下，灯不灭'),
        ('🏮 暗夜传灯', '智慧', '把火种带出牢房'),
        ('⛰ 狱中磐石', '坚韧', '咬住最黑的夜'),
        ('🌸 铁骨柔情', '柔情', '扑向黎明，也守住牵挂'),
        ('🌅 黎明之光', '隐藏', '集齐四道具·圆满')]
for i, (t, d, desc) in enumerate(ends):
    x = 0.65 + i * 2.47
    add_rect_text(s, x, 1.95, 2.25, 2.6, f'{t}\n\n{d}\n\n{desc}', size=12.5,
                  color=GOLD_S if i < 4 else WHITE,
                  fill=CHAR2, line=GOLD if i < 4 else RED)
add_rect_text(s, 0.65, 4.9, 12.03, 1.15,
    '品格由选择定义\n\n四章抉择 → 品格维度累计 → 结局判定（含平局特殊结局「星火燎原」）',
    size=14.5, color=WHITE, fill=CHAR2, line=GOLD)
add_rect_text(s, 0.65, 6.3, 12.03, 0.65,
    '结局图鉴 × 隐藏结局 → 自发二刷 → 截图分享 → 传播闭环',
    size=14, color=GOLD_S, fill=CHAR2, line=RED)
footer(s, 6)

# ================= S7 技术实现 =================
s = new_slide()
header(s, 'TECHNOLOGY · 技术实现', '纯浏览器原生能力 · 零依赖')
tech = [('Canvas 2D', '星火燎原粒子系统\n送报小游戏关卡引擎\n粒子跟随鼠标形成「星火追随」'),
        ('Web Audio API', '抉择 / 档案 / 道具 / 结局\n全部音效实时合成\n雾都雨声氛围音（零素材文件）'),
        ('Web Speech API', '狱中书信语音朗读\n江姐托孤信 / 《囚歌》/ 报童吆喝\n系统语音合成'),
        ('localStorage', '结局图鉴收集状态\n传播数据看板持久化\n多周目进度保留')]
for i, (t, d) in enumerate(tech):
    x = 0.65 + (i % 2) * 6.16
    y = 1.85 + (i // 2) * 2.05
    add_rect_text(s, x, y, 5.9, 1.85, f'{t}\n{d}', size=13.5, color=PAPER,
                  fill=CHAR2, line=GOLD, align=PP_ALIGN.LEFT)
add_rect_text(s, 0.65, 6.15, 12.03, 0.75,
    '方案价值：无服务器、无第三方依赖、响应式适配桌面与移动端——\n打包即用，可一键部署到景区 H5 / 研学平板 / 学校机房。',
    size=13.5, color=GOLD_S, fill=CHAR2, line=None)
footer(s, 7)

# ================= S8 IP 衍生 =================
s = new_slide()
header(s, 'IP DERIVATIVES · 游戏IP衍生', '游戏世界观延伸出四大文创产品线')
ip4 = [('🧸 潮玩 IP', 'Q版报童盲盒\n角色集卡册\nNFC 历史故事'),
       ('✏️ 文具伴手礼', '印章拓印套装\n钢笔墨水礼盒\n四季花语便利贴'),
       ('☕ 生活日用', '红岩印咖啡\n漫游红岩 Pass 打卡\n剪纸文创'),
       ('📱 数字文创', 'AR 实景互动\n表情包壁纸\n数字藏品')]
for i, (t, d) in enumerate(ip4):
    x = 0.65 + i * 3.1
    add_rect_text(s, x, 1.9, 2.85, 2.5, f'{t}\n{d}', size=13, color=PAPER,
                  fill=CHAR2, line=GOLD)
add_rect_text(s, 0.65, 4.75, 12.03, 1.35,
    '🎓 传灯证书：输入姓名，自动结合真实游戏数据\n（结局称号 + 信念值 + 点亮明灯数 + 绣旗进度）\n生成专属证书，可下载分享——「数据 → 产物」系统闭环',
    size=14.5, color=GOLD_S, fill=CHAR2, line=RED)
add_rect_text(s, 0.65, 6.35, 12.03, 0.6,
    '游戏 IP × 文创零售 × 研学教具 × 数字传播 = 完整商业生态',
    size=13.5, color=WHITE, fill=CHAR2, line=GOLD)
footer(s, 8)

# ================= S9 传播与数据 =================
s = new_slide()
header(s, 'DISSEMINATION · 传播与数据', '让传播可以被看见')
add_text(s, 0.65, 1.85, 12, 0.4, '红岩传播力数据看板——每一次交互实时计入：', size=15, color=PAPER, bold=True)
metrics = [('故事被聆听', '段'), ('明灯被点亮', '盏'), ('红旗被绣成', '面'),
           ('证书被生成', '张'), ('盲盒被拆开', '次')]
for i, (t, u) in enumerate(metrics):
    x = 0.65 + i * 2.47
    add_rect_text(s, x, 2.3, 2.25, 1.5, f'{t}\n\n——{u}', size=13, color=GOLD_S,
                  fill=CHAR2, line=GOLD)
add_rect_text(s, 0.65, 4.15, 12.03, 1.6,
    '传播逻辑\n\n多周目图鉴 → 自发二刷　　隐藏结局 → 收集传播　　结局分享 → 社交裂变　　证书生成 → 身份认同',
    size=14, color=PAPER, fill=CHAR2, align=PP_ALIGN.LEFT)
add_rect_text(s, 0.65, 6.0, 12.03, 0.75,
    '接入正式后台即成为景区 H5 的传播数据看板——用数据证明红色文化传播力。',
    size=14, color=RED, bold=True, fill=CHAR2, line=RED)
footer(s, 9)

# ================= S10 创新点 =================
s = new_slide()
header(s, 'INNOVATION · 创新点总结', '四个「不一样」')
inn = [('品格叙事引擎', '选择积累品格、品格决定结局——\n拒绝说教，让玩家自己回答\n「你会怎么做」'),
       ('史料即内容', '档案卡全部真实出处：\n江姐竹签之问 / 狱中八条 / 11·27 大屠杀——\n故事可溯源，符号有出处'),
       ('完整游戏化系统', '小游戏关卡 × 道具收集 ×\n结局图鉴 × 隐藏要素——\n一个「能玩」的红色作品'),
       ('零依赖技术方案', '全部浏览器原生能力，\n无服务器无第三方依赖，\n打包即用，随处可部署')]
for i, (t, d) in enumerate(inn):
    x = 0.65 + (i % 2) * 6.16
    y = 1.85 + (i // 2) * 2.35
    add_rect_text(s, x, y, 5.9, 2.15, f'{t}\n\n{d}', size=14, color=GOLD_S,
                  fill=CHAR2, line=RED, align=PP_ALIGN.LEFT)
footer(s, 10)

# ================= S11 社会价值与展望 =================
s = new_slide()
header(s, 'VALUE & FUTURE · 社会价值与展望', '让红岩精神成为年轻人的选择')
add_rect_text(s, 0.65, 1.85, 5.9, 2.3,
    '应用场景\n\n研学课堂：边玩边学的沉浸思政课\n景区文旅：打卡动线与 H5 游戏联动\n党建教育：互动式主题党日内容',
    size=14, color=PAPER, fill=CHAR2, align=PP_ALIGN.LEFT)
add_rect_text(s, 6.85, 1.85, 5.85, 2.3,
    '未来规划\n\n多主角支线：江姐 / 报童 / 狱友视角\nAIGC 声音复原：合成烈士语音朗读\n多人共创：玩家共同决定结局走向',
    size=14, color=PAPER, fill=CHAR2, align=PP_ALIGN.LEFT)
add_rect_text(s, 0.65, 4.45, 12.03, 1.5,
    '一张报纸，一盏明灯\n\n雾都再大，也遮不住报上的光——\n让红岩精神，成为年轻人自己走出来的选择。',
    size=17, color=GOLD_S, fill=CHAR2, line=GOLD)
footer(s, 11)

# ================= S12 致谢 =================
s = new_slide()
add_rect(s, 0, 0, 13.333, 0.09, fill=RED)
add_rect(s, 0, 7.41, 13.333, 0.09, fill=RED)
add_text(s, 0.9, 2.3, 11.5, 0.5, 'THANKS · 请各位老师批评指正', size=13, color=GOLD,
         bold=True, align=PP_ALIGN.CENTER)
add_text(s, 0.9, 3.1, 11.5, 1.2, '谢 谢 聆 听', size=60, color=GOLD_S, bold=True, align=PP_ALIGN.CENTER)
add_text(s, 0.9, 4.8, 11.5, 0.4, '黎明前夜 · 红岩精神互动叙事游戏', size=18, color=WHITE, align=PP_ALIGN.CENTER)
add_text(s, 0.9, 5.4, 11.5, 0.4, '作品演示：双击 index.html 即可运行 · 纯本地零依赖', size=12, color=FOG, align=PP_ALIGN.CENTER)
footer(s, 12)

OUT = r'C:\Users\30373\.zcode\workspace\default\hongyan-showcase\黎明前夜·答辩PPT.pptx'
prs.save(OUT)
print('OK ->', OUT, '| slides:', len(prs.slides.__iter__.__self__._sldIdLst))
