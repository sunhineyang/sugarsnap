import AboutPage from "@/components/blocks/about";
import { getAboutPage } from "@/services/page";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await getAboutPage(locale);

  return {
    title: page.hero?.title || "About Us - Sugar Snap",
    description: page.hero?.description || "Learn about Sugar Snap's mission to revolutionize diabetes management through innovative AI technology.",
  };
}

export default async function About({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getAboutPage(locale);

  return (
    <AboutPage
      data={{
        hero: page.hero,
        mission: page.mission,
        story: page.story,
        team: page.team,
        values: page.values,
        technology: page.technology,
      }}
    />
  );
}