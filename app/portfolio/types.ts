export type Language = "zh" | "en";

export type PortfolioSection = "intro" | "partfolio" | "contact";

export type PortfolioWork = {
  id: string;
  name: string;
  title: string;
  date: string;
  imageUri: string;
  groupName: string;
  groupTitle: string;
};

export type HomeLoaderData = {
  lang: Language;
  works: PortfolioWork[];
};
