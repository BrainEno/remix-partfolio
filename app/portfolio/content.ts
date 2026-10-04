import type {
  LocalizedText,
  PortfolioContent,
  PortfolioWork,
} from "./types";

export function localize(text: LocalizedText, lang: "zh" | "en") {
  return text[lang];
}

const works: readonly PortfolioWork[] = [
  {
    id: "seeing-you-through-the-river",
    title: {
      zh: "划过江水看见你",
      en: "Seeing You Through The River",
    },
    year: "2022",
    image: {
      src: "/images/seeing.jpg",
      alt: {
        zh: "《划过江水看见你》项目画面",
        en: "Seeing You Through The River project still",
      },
    },
    credit: {
      zh: "山一女性电影展作品",
      en: "The ONE International Women's Film Festival",
    },
  },
  {
    id: "plague",
    title: { zh: "鼠疫", en: "Plague" },
    year: "2021",
    image: {
      src: "/images/plague.jpg",
      alt: { zh: "《鼠疫》项目画面", en: "Plague project still" },
    },
    credit: { zh: "香港艺术节", en: "Hong Kong Art Festival" },
  },
  {
    id: "hairy-ape",
    title: { zh: "毛猿", en: "Hairy Ape" },
    year: "2020",
    image: {
      src: "/images/hairy-ape-post.jpg",
      alt: { zh: "《毛猿》项目画面", en: "Hairy Ape project still" },
    },
    credit: { zh: "江湖戏班", en: "Johoo Theatre" },
  },
  {
    id: "wuhan-puzzle",
    title: { zh: "武汉拼图", en: "Wuhan Puzzle" },
    year: "2022",
    image: {
      src: "/images/tree1.jpg",
      alt: { zh: "《武汉拼图》项目画面", en: "Wuhan Puzzle project still" },
    },
    credit: { zh: "那什么实验创作小组", en: "So What Original" },
  },
];

/**
 * EDIT THIS FILE to reuse the site as a portfolio template.
 *
 * Keep the animation-related class names in the React components unchanged;
 * text, labels and image paths belong here instead. All public image paths are
 * relative to /public and should start with `/`.
 *
 * `works.tvFrame.src` points at a generated WebP. Replace the editable source
 * file at public/images/tv-bg.png; `npm run dev` and `npm run build` regenerate
 * public/generated/tv-bg.webp automatically.
 */
export const portfolioContent = {
  identity: {
    displayName: "Sydney Zhao",
    pageTitle: { zh: "趙 悉 尼", en: "Sydney Zhao" },
  },
  navigation: {
    intro: { zh: "簡介", en: "Intro" },
    partfolio: { zh: "作品集", en: "Works" },
    contact: { zh: "聯絡方式", en: "Contact" },
  },
  hero: {
    headlines: [
      { zh: "⾏為藝術", en: "Performance Art" },
      { zh: "電影", en: "Movie" },
      { zh: "戲劇", en: "Drama" },
    ],
    image: {
      src: "/images/figure.webp",
      alt: { zh: "人物主视觉", en: "Portrait artwork" },
    },
  },
  intro: {
    heading: { zh: "簡介", en: "Intro" },
    portrait: {
      src: "/images/profilephoto.jpg",
      alt: { zh: "Sydney Zhao 肖像", en: "Sydney Zhao portrait" },
    },
    portraitCredit: { zh: "Sydney Zhao", en: "Sydney Zhao" },
    primaryText: {
      zh: "趙悉尼是⻑駐武漢的演員和⾏為藝術家，畢業於美國賓夕法尼亞州狄⾦森學院並獲得經湾學學⼠學位，亦曾就讀美國戲劇學院劇院。曾在多部影視和戲劇作品中參與創作和表演，在多個藝術節進⾏⾏為藝術表演。主要表演經歷包括舞台劇《⿏疫（英⽂版）》（⾹港藝術節），《⽑猿》（江湖戲班），《武漢拼圖》（那甚麽實驗剑作⼩組）和電影《划過江⽔看⾒你》（⼭⼀⼥性電影展作品）。⾏為藝術作品曾參與「穀⾬⾏動」中國當代⾏為藝術城市聯合展演和「⽔泥公園」⾏為藝術節，擔任策展⼈策劃2020年⽔泥公園藝術節。",
      en: "Sydney Zhao is an actor and a performance artist based in Wuhan. She holds a BA in economics from Dickinson College in Pennsylvania, USA and studied at the American Conservatory Theater. She has appeared in several theatre productions and art festivals. Her stage appearances include Plague (Hong Kong Art Festival), The Hairy Ape (Johoo Theatre), Wuhan Puzzle (So What Original) and Seeing You Through The River (The ONE International Women's Film Festival). Her performances were featured at Guyu Action [X-CFCA] and the Cement Park Art Festival (Sowerart), where at the latter she also worked as a curator.",
    },
    gallery: [
      {
        src: "/images/tree1.jpg",
        alt: { zh: "创作照片 1", en: "Work photo 1" },
      },
      {
        src: "/images/tree3.jpg",
        alt: { zh: "创作照片 2", en: "Work photo 2" },
      },
      {
        src: "/images/tree4.jpg",
        alt: { zh: "创作照片 3", en: "Work photo 3" },
      },
      {
        src: "/images/tree2.jpg",
        alt: { zh: "创作照片 4", en: "Work photo 4" },
      },
      {
        src: "/images/tree5.jpg",
        alt: { zh: "创作照片 5", en: "Work photo 5" },
      },
    ],
    accentImages: [
      {
        src: "/images/hairyApe.png",
        alt: { zh: "作品照片", en: "Performance still" },
      },
      {
        src: "/images/show.png",
        alt: { zh: "演出照片", en: "Show still" },
      },
    ],
    secondaryText: {
      zh: "趙悉尼以過程導向式的戲劇、影像和表演藝術，循着探索藝術、身體⾏為和⼼靈的旅程前進。⽬前正在計畫⼀項⻑期個⼈⾏為藝術項⽬，當中運⽤了⼯程師和物理學家費登奎斯的學說和依莎兰按摩艺术的部分理論。",
      en: "She would continue her journey exploring art, human body movement and mind, through process-oriented action in the form of drama, dance and performance art. She is currently working on a performance art project which involves certain concepts of the Feldenkrais Method and of the healing arts of Esalen Massage.",
    },
  },
  works: {
    heading: { zh: "參與作品", en: "Involved Works" },
    period: "2020 - 2022",
    tvFrame: {
      src: "/generated/tv-bg.webp",
      alt: { zh: "电视机框", en: "Television frame" },
    },
    items: works,
  },
  contact: {
    phone: "+86 - 1897 - 111 - 3243",
    email: "sydzhao@outlook.com",
    headlines: ["CALL ME", "FOR THE", "MARQUEE MOON"],
    marquee: { zh: "Contact me —", en: "Contact me —" },
    copyright: "© 2023 Sydney Zhao. All rights reserved.",
    credit: {
      prefix: { zh: "Webdesign + WebDev by", en: "Webdesign + WebDev by" },
      name: "Bottom Think - BrainEno",
      url: "https://github.com/BrainEno",
    },
  },
} as const satisfies PortfolioContent;
