export type Language = "zh" | "en";

export type PortfolioSection = "intro" | "partfolio" | "contact";

export type LocalizedText = Readonly<Record<Language, string>>;

export type PortfolioImage = Readonly<{
  src: string;
  alt: LocalizedText;
}>;

export type PortfolioWork = Readonly<{
  id: string;
  title: LocalizedText;
  year: string;
  image: PortfolioImage;
  credit: LocalizedText;
}>;

export type PortfolioContent = Readonly<{
  identity: {
    displayName: string;
    pageTitle: LocalizedText;
  };
  navigation: Readonly<Record<PortfolioSection, LocalizedText>>;
  hero: {
    headlines: readonly LocalizedText[];
    image: PortfolioImage;
  };
  intro: {
    heading: LocalizedText;
    portrait: PortfolioImage;
    portraitCredit: LocalizedText;
    primaryText: LocalizedText;
    gallery: readonly PortfolioImage[];
    accentImages: readonly PortfolioImage[];
    secondaryText: LocalizedText;
  };
  works: {
    heading: LocalizedText;
    period: string;
    tvFrame: PortfolioImage;
    items: readonly PortfolioWork[];
  };
  contact: {
    phone: string;
    email: string;
    headlines: readonly string[];
    marquee: LocalizedText;
    copyright: string;
    credit: {
      prefix: LocalizedText;
      name: string;
      url: string;
    };
  };
}>;

export type HomeLoaderData = {
  lang: Language;
};
