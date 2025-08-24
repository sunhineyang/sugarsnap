import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Hero as HeroType } from "@/types/blocks/hero";
import { Section as SectionType } from "@/types/blocks/section";

interface ContactPageData {
  hero: HeroType;
  contact_info: SectionType;
  contact_form: SectionType;
  faq: SectionType;
}

export default function ContactPage({ data }: { data: ContactPageData }) {
  const { hero, contact_info, contact_form, faq } = data;

  return (
    <>
      {/* Hero Section */}
      {!hero.disabled && (
        <section className="py-24">
          <div className="container">
            <div className="text-center">
              <h1 className="mx-auto mb-3 mt-4 max-w-6xl text-balance text-4xl font-bold lg:mb-7 lg:text-7xl">
                {hero.title}
              </h1>
              <p
                className="mx-auto max-w-3xl text-muted-foreground lg:text-xl"
                dangerouslySetInnerHTML={{ __html: hero.description || "" }}
              />
              {hero.buttons && (
                <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                  {hero.buttons.map((item, i) => (
                    <Link
                      key={i}
                      href={item.url as any}
                      target={item.target || ""}
                      className="flex items-center"
                    >
                      <Button
                        className="w-full"
                        size="lg"
                        variant={item.variant || "default"}
                      >
                        {item.title}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Contact Information Section */}
      {!contact_info.disabled && (
        <section id={contact_info.name} className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              {contact_info.label && (
                <Badge className="text-xs font-medium">{contact_info.label}</Badge>
              )}
              <h2 className="mt-4 text-4xl font-semibold">{contact_info.title}</h2>
              <p className="mt-6 font-medium text-muted-foreground">
                {contact_info.description}
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {contact_info.items?.map((item, index) => {
                const icons = [Mail, MessageSquare, Users];
                const IconComponent = icons[index] || Mail;
                return (
                  <Card key={index} className="text-center">
                    <CardHeader>
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {item.description}
                      </CardDescription>
                      {item.url && (
                        <Link href={item.url as any} className="mt-4 inline-block">
                          <Button variant="outline" size="sm">
                            {item.button_text || "Contact"}
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Contact Form Section */}
      {!contact_form.disabled && (
        <section id={contact_form.name} className="py-16 bg-muted/50">
          <div className="container">
            <div className="mx-auto max-w-2xl">
              <div className="text-center mb-12">
                {contact_form.label && (
                  <Badge className="text-xs font-medium">{contact_form.label}</Badge>
                )}
                <h2 className="mt-4 text-4xl font-semibold">{contact_form.title}</h2>
                <p className="mt-6 font-medium text-muted-foreground">
                  {contact_form.description}
                </p>
              </div>
              <Card>
                <CardContent className="p-6">
                  <form className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Your full name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="your@email.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="What is this about?" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        className="min-h-[120px]"
                      />
                    </div>
                    <Button type="submit" className="w-full" size="lg">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {!faq.disabled && (
        <section id={faq.name} className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              {faq.label && (
                <Badge className="text-xs font-medium">{faq.label}</Badge>
              )}
              <h2 className="mt-4 text-4xl font-semibold">{faq.title}</h2>
              <p className="mt-6 font-medium text-muted-foreground">
                {faq.description}
              </p>
            </div>
            <div className="mx-auto mt-14 grid gap-8 md:grid-cols-2 md:gap-12">
              {faq.items?.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-sm border border-primary font-mono text-xs text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold">{item.title}</h3>
                    </div>
                    <p className="text-md text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}