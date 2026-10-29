import type {
  LocalizedText,
  PortfolioContent,
} from "./types";

export function localize(text: LocalizedText, lang: "zh" | "en") {
  return text[lang];
}

import works from "./works.json";

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
    displayName: "BrainEno",
    pageTitle: { zh: "BrainEno", en: "BrainEno" },
  },
  navigation: {
    intro: { zh: "簡介", en: "Intro" },
    partfolio: { zh: "作品集", en: "Works" },
    contact: { zh: "聯絡方式", en: "Contact" },
  },
  hero: {
    headlines: [
      { zh: "前端工程", en: "Frontend Dev" },
      { zh: "網頁", en: "Web" },
      { zh: "跨平台", en: "Flutter" },
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
      alt: { zh: "BrainEno 肖像", en: "BrainEno portrait" },
    },
    portraitCredit: { zh: "BrainEno", en: "BrainEno" },
    primaryText: {
      zh: "BrainEno 是前端工程師與 UI 設計師，曾任程序員，現在是一名自由職業 vibe coder。他善用最新的 AI 能力，融合設計品味與工程經驗，打造高品質、高度客製化的個人網站與應用服務，讓每一個想法都能成為獨特而實用的數位體驗。",
      en: "BrainEno is a frontend engineer, UI designer and former programmer, now working as a freelance vibe coder. Combining design sensibility, engineering experience and the latest AI capabilities, he creates high-quality, highly customized personal websites and applications that turn ideas into distinctive, useful digital experiences.",
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
        src: "/images/hairyApe.PNG",
        alt: { zh: "作品照片", en: "Project still" },
      },
      {
        src: "/images/show.png",
        alt: { zh: "演出照片", en: "Creative work" },
      },
    ],
    secondaryText: {
      zh: "他相信，在 AI 賦能的時代，當技術不再成為想像力的瓶頸，品味便格外重要。AI 能實現各種程式功能，卻無法取代人的判斷與想像，也不能替我們做出關於品味的取捨。",
      en: "He believes that in the age of AI, taste matters most when technology no longer limits imagination. AI can realize countless functions in code, but it cannot replace human judgment and imagination, or make our creative choices for us.",
    },
  },
  works: {
    heading: { zh: "開發項目", en: "Development Projects" },
    period: "2022 - 2026",
    tvFrame: {
      src: "/generated/tv-bg.webp",
      alt: { zh: "电视机框", en: "Television frame" },
    },
    items: works,
  },
  contact: {
    phone: "+86 - 1897 - 111 - 3243",
    email: "nodeman24@outlook.com",
    headlines: ["CALL ME", "FOR THE", "MARQUEE MOON"],
    marquee: { zh: "Contact me —", en: "Contact me —" },
    copyright: "© 2023 BrainEno. All rights reserved.",
    credit: {
      prefix: { zh: "Webdesign + WebDev by", en: "Webdesign + WebDev by" },
      name: "Bottom Think - BrainEno",
      url: "https://github.com/BrainEno",
    },
  },
} as const satisfies PortfolioContent;
