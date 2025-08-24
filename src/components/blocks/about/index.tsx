import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, BookOpen, Users, Shield, Brain, Eye, Database, Lock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Hero as HeroType } from "@/types/blocks/hero";
import { Section as SectionType } from "@/types/blocks/section";

interface AboutPageData {
  hero: HeroType;
  mission: SectionType;
  story: SectionType;
  team: SectionType;
  values: SectionType;
  technology: SectionType;
}

export default function AboutPage({ data }: { data: AboutPageData }) {
  const { hero, mission, story, team, values, technology } = data;

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

      {/* Mission Section */}
      {!mission.disabled && (
        <section id={mission.name} className="py-16 bg-muted/50">
          <div className="container">
            <div className="text-center mb-12">
              {mission.label && (
                <Badge className="text-xs font-medium">{mission.label}</Badge>
              )}
              <h2 className="mt-4 text-4xl font-semibold">{mission.title}</h2>
              <p className="mt-6 font-medium text-muted-foreground max-w-3xl mx-auto">
                {mission.description}
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {mission.items?.map((item, index) => {
                const icons = [Target, BookOpen, Users];
                const IconComponent = icons[index] || Target;
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
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Story Section */}
      {!story.disabled && (
        <section id={story.name} className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              {story.label && (
                <Badge className="text-xs font-medium">{story.label}</Badge>
              )}
              <h2 className="mt-4 text-4xl font-semibold">{story.title}</h2>
              <p className="mt-6 font-medium text-muted-foreground">
                {story.description}
              </p>
            </div>
            <div className="space-y-8">
              {story.items?.map((item, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-4 h-4 bg-primary rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      {item.date && (
                        <Badge variant="outline" className="text-xs">
                          {item.date}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Section */}
      {!team.disabled && (
        <section id={team.name} className="py-16 bg-muted/50">
          <div className="container">
            <div className="text-center mb-12">
              {team.label && (
                <Badge className="text-xs font-medium">{team.label}</Badge>
              )}
              <h2 className="mt-4 text-4xl font-semibold">{team.title}</h2>
              <p className="mt-6 font-medium text-muted-foreground">
                {team.description}
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {team.items?.map((item, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Values Section */}
      {!values.disabled && (
        <section id={values.name} className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              {values.label && (
                <Badge className="text-xs font-medium">{values.label}</Badge>
              )}
              <h2 className="mt-4 text-4xl font-semibold">{values.title}</h2>
              <p className="mt-6 font-medium text-muted-foreground">
                {values.description}
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.items?.map((item, index) => {
                const icons = [Shield, Target, Users, BookOpen];
                const IconComponent = icons[index] || Shield;
                return (
                  <div key={index} className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Technology Section */}
      {!technology.disabled && (
        <section id={technology.name} className="py-16 bg-muted/50">
          <div className="container">
            <div className="text-center mb-12">
              {technology.label && (
                <Badge className="text-xs font-medium">{technology.label}</Badge>
              )}
              <h2 className="mt-4 text-4xl font-semibold">{technology.title}</h2>
              <p className="mt-6 font-medium text-muted-foreground">
                {technology.description}
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {technology.items?.map((item, index) => {
                const icons = [Eye, Brain, Database, Lock];
                const IconComponent = icons[index] || Eye;
                return (
                  <Card key={index} className="text-center">
                    <CardHeader>
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {item.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}