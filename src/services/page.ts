import { LandingPage, PricingPage, ShowcasePage } from "@/types/pages/landing";

// Contact and About page types
export interface ContactPage {
  template: string;
  theme: string;
  header: any;
  hero: any;
  contact_info: any;
  contact_form: any;
  faq: any;
  cta: any;
}

export interface AboutPage {
  template: string;
  theme: string;
  header: any;
  hero: any;
  mission: any;
  story: any;
  team: any;
  values: any;
  technology: any;
  cta: any;
}

export async function getLandingPage(locale: string): Promise<LandingPage> {
  return (await getPage("landing", locale)) as LandingPage;
}

export async function getPricingPage(locale: string): Promise<PricingPage> {
  return (await getPage("pricing", locale)) as PricingPage;
}

export async function getShowcasePage(locale: string): Promise<ShowcasePage> {
  return (await getPage("showcase", locale)) as ShowcasePage;
}

export async function getContactPage(locale: string): Promise<ContactPage> {
  return (await getPage("contact", locale)) as ContactPage;
}

export async function getAboutPage(locale: string): Promise<AboutPage> {
  return (await getPage("about", locale)) as AboutPage;
}

export async function getPage(
  name: string,
  locale: string
): Promise<LandingPage | PricingPage | ShowcasePage | ContactPage | AboutPage> {
  try {
    if (locale === "zh-CN") {
      locale = "zh";
    }

    return await import(
      `@/i18n/pages/${name}/${locale.toLowerCase()}.json`
    ).then((module) => module.default);
  } catch (error) {
    console.warn(`Failed to load ${locale}.json, falling back to en.json`);

    return await import(`@/i18n/pages/${name}/en.json`).then(
      (module) => module.default
    );
  }
}
