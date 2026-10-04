import type { PortfolioWork } from "./types";

// Temporary local source of truth for visual QA and deploy previews.
// Keep portfolio rendering independent from external databases while the
// content/data layer is being redesigned.
export const portfolioWorks: PortfolioWork[] = [
  {
    id: "0",
    name: "Seeing You Through The River",
    title: "划过江水看见你",
    imageUri: "/images/seeing.jpg",
    date: "2022",
    groupName: "The ONE International Women's Film Festival",
    groupTitle: "山一女性电影展作品",
  },
  {
    id: "1",
    name: "Plague",
    title: "鼠疫",
    imageUri: "/images/plague.jpg",
    date: "2021",
    groupName: "Hong Kong Art Festival",
    groupTitle: "香港艺术节",
  },
  {
    id: "2",
    name: "Hairy Ape",
    title: "毛猿",
    imageUri: "/images/hairy-ape-post.jpg",
    date: "2020",
    groupName: "Johoo Theatre",
    groupTitle: "江湖戏班",
  },
  {
    id: "3",
    name: "Wuhan Puzzle",
    title: "武汉拼图",
    imageUri: "/images/tree1.jpg",
    date: "2022",
    groupName: "So What Original",
    groupTitle: "那什么实验创作小组",
  },
];
