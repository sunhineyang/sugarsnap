import ContactPage from "@/components/blocks/contact";
import { getContactPage } from "@/services/page";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await getContactPage(locale);

  return {
    title: page.hero?.title || "Contact Us - Sugar Snap",
    description: page.hero?.description || "Get in touch with the Sugar Snap team. We're here to help with your diabetes management journey.",
  };
}

export default async function Contact({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getContactPage(locale);

  return (
    <ContactPage
      data={{
        hero: page.hero,
        contact_info: page.contact_info,
        contact_form: page.contact_form,
        faq: page.faq,
      }}
    />
  );
}