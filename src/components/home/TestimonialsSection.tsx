import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, Play, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { InView } from "@/components/motion/InView";
import { SectionHeader } from "@/components/home/SectionHeader";

const testimonials = [
  {
    name: "Adaeze Okonkwo",
    location: "London, UK",
    child: "Mom of David, 11",
    rating: 5,
    text: "Lumitria has been a blessing! David now speaks Igbo with his grandparents and is building his own games. The tutors are so patient and engaging.",
  },
  {
    name: "Chukwuma Eze",
    location: "Toronto, Canada",
    child: "Dad of Amara, 9",
    rating: 5,
    text: "We tried many tutoring services, but Lumitria understands our needs as a Nigerian family abroad. Amara loves her coding classes!",
  },
  {
    name: "Folake Adeyemi",
    location: "Houston, USA",
    child: "Mom of Tunde, 13",
    rating: 5,
    text: "The STEM program exceeded our expectations. Tunde's confidence has grown so much, and he's now teaching his younger sister what he learns!",
  },
];

const getInitials = (fullName: string) => {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const locationFlag = (location: string) => {
  if (location.includes("UK")) return "🇬🇧";
  if (location.includes("Canada")) return "🇨🇦";
  if (location.includes("USA")) return "🇺🇸";
  if (location.includes("Nigeria")) return "🇳🇬";
  return "🌍";
};

type Instructor = {
  id: string;
  name: string;
  subject: string;
  imageSrc?: string;
  placeholder?: boolean;
};

const instructorTriLines = (instructor: Instructor) => {
  const lines = [
    {
      key: "name",
      text: instructor.name,
      className: "w-[94%] font-semibold text-foreground text-[13px] leading-tight md:text-sm",
    },
    {
      key: "subject",
      text: instructor.subject,
      className:
        "w-[72%] text-[11px] leading-snug text-muted-foreground md:text-xs line-clamp-2 break-words",
    },
  ];
  if (instructor.placeholder) {
    lines.push({
      key: "soon",
      text: "Details coming soon",
      className: "w-[56%] text-[10px] text-muted-foreground/80",
    });
  }
  return lines;
};

const TestimonialsSection = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const instructors: Instructor[] = useMemo(
    () => [
      {
        id: "nathaniel",
        name: "Nathaniel Udofa",
        subject: "French Tutor",
        imageSrc: "/images/mr-nath.png",
      },
      {
        id: "dosu",
        name: "Dosu Kingsley",
        subject: "Physics and Mathematics",
        imageSrc: "/images/kingsley.png",
      },
      {
        id: "adejoju",
        name: "Adejoju Taiwo",
        subject: "Coding",
        imageSrc: "/images/taiwo.png",
      },
      {
        id: "victor",
        name: "Victor",
        subject: "Yoruba & Graphics Design",
        imageSrc: "/images/victor.jpeg",
      },
      {
        id: "fidelis",
        name: "Fidelis Ipuole",
        subject: "Chemistry & Biology",
        imageSrc: "/images/fidelis.jpeg",
      },
      {
        id: "azegba",
        name: "Azegba James",
        subject: "Igbo",
        imageSrc: "/images/james.png",
      },
    ],
    [],
  );

  const ringPositions = useMemo(
    () => [
      { top: "14%", left: "50%", transform: "translate(-50%, -50%)" }, // top
      { top: "30%", left: "86%", transform: "translate(-50%, -50%)" }, // upper-right
      { top: "72%", left: "86%", transform: "translate(-50%, -50%)" }, // lower-right
      { top: "86%", left: "50%", transform: "translate(-50%, -50%)" }, // bottom
      { top: "72%", left: "14%", transform: "translate(-50%, -50%)" }, // lower-left
      { top: "30%", left: "14%", transform: "translate(-50%, -50%)" }, // upper-left
    ],
    [],
  );

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-b from-muted/40 via-background to-lumitria-gold-light/20"
        aria-hidden
      />
      <div className="container mx-auto px-4 sm:px-6 max-w-[1280px] relative z-10">
        <SectionHeader
          eyebrow="Testimonials"
          title={
            <>
              Loved by <span className="text-gradient">Nigerian Families</span> Worldwide
            </>
          }
          description="Join hundreds of families who trust Lumitria to nurture their children's education and cultural connection."
        />

        <InView className="mb-12 md:mb-16" y={24}>
          <h3 className="font-display text-center text-2xl font-semibold text-foreground md:text-3xl px-4">
            Our Intructors
          </h3>
        </InView>

        <div className="relative left-1/2 w-[100vw] max-w-[100vw] -translate-x-1/2 px-3 sm:px-4">
        <InView className="mx-auto mb-14 w-[80vw] max-w-[min(80vw,1600px)]" y={28}>
          <div className="relative mx-auto grid w-full place-items-center">
            <div className="relative w-full">
              <div className="relative mx-auto aspect-square w-full">
                <div className="absolute inset-0 rounded-[44px] bg-gradient-to-br from-lumitria-orange/28 via-lumitria-gold/14 to-lumitria-orange/12 blur-sm" />

                <div className="absolute inset-0 rounded-[44px] border border-white/45 bg-gradient-to-br from-lumitria-orange/72 via-lumitria-orange/58 to-lumitria-gold/38 shadow-soft ring-1 ring-white/25" />

                <div className="absolute left-1/2 top-1/2 w-[92%] max-w-[960px] -translate-x-1/2 -translate-y-1/2">
                  <div className="relative overflow-hidden rounded-3xl border border-white/25 bg-muted shadow-glow">
                    <div className="relative aspect-video">
                      <video
                        className="h-full w-full object-cover"
                        src="/video/mr-fidelis-video.mp4"
                        preload="metadata"
                        muted
                        playsInline
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />

                      <button
                        type="button"
                        onClick={() => setIsVideoOpen(true)}
                        className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background md:h-20 md:w-20"
                        aria-label="Play instructor video"
                      >
                        <Play className="ml-1 h-8 w-8 md:h-10 md:w-10" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-center text-sm text-muted-foreground">
                    Tap play to watch our lead instructor.
                  </p>
                </div>

                {instructors.map((instructor, idx) => {
                  const pos = ringPositions[idx] ?? ringPositions[0];
                  return (
                    <div
                      key={instructor.id}
                      className="absolute"
                      style={{
                        top: pos.top,
                        left: pos.left,
                        transform: pos.transform,
                      }}
                    >
                      <Card
                        variant="elevated"
                        className="h-[196px] w-[196px] rounded-full border-white/40 bg-background/95 p-0 shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-glow sm:h-[212px] sm:w-[212px] md:h-[232px] md:w-[232px] lg:h-[248px] lg:w-[248px]"
                      >
                        <CardContent className="flex h-full w-full flex-col items-center justify-center px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
                          <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full border-2 border-primary/25 bg-gradient-to-br from-lumitria-orange-light to-lumitria-gold-light/60 shadow-soft sm:h-[100px] sm:w-[100px] md:h-[112px] md:w-[112px] lg:h-[120px] lg:w-[120px]">
                            {instructor.imageSrc ? (
                              <img
                                src={instructor.imageSrc}
                                alt={instructor.name}
                                className="h-full w-full object-cover object-top"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : instructor.placeholder ? (
                              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground sm:text-3xl">
                                ?
                              </div>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-base font-bold text-primary sm:text-lg">
                                {getInitials(instructor.name)}
                              </div>
                            )}
                          </div>

                          <div className="mt-3 flex w-full flex-col items-center gap-1">
                            {instructorTriLines(instructor).map((line) => (
                              <div
                                key={line.key}
                                className={[
                                  "max-w-full rounded-full border border-white/25 bg-background/80 px-2 py-0.5 text-center leading-tight sm:px-2.5 sm:py-1",
                                  line.className,
                                ].join(" ")}
                              >
                                <span className="block max-w-full">{line.text}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </InView>
        </div>

        <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
          <DialogContent className="max-w-5xl w-full border-0 bg-transparent p-0 shadow-none">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/20 bg-black shadow-glow">
              {isVideoOpen && (
                <video
                  className="h-full w-full"
                  src="/video/mr-fidelis-video.mp4"
                  controls
                  autoPlay
                  playsInline
                />
              )}
              <button
                type="button"
                onClick={() => setIsVideoOpen(false)}
                className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-background/80 text-foreground backdrop-blur-md transition-colors hover:bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                aria-label="Close video"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <InView key={testimonial.name} delay={index * 0.1} y={36}>
              <Card
                variant="elevated"
                className="relative h-full border-white/55 transition-all duration-500 hover:-translate-y-2 hover:shadow-glow"
              >
                <CardContent className="pt-10">
                  <div className="absolute -top-4 left-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-cta shadow-button">
                      <Quote className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>

                  <div className="mb-4 flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="mb-6 text-muted-foreground leading-[1.7]">&ldquo;{testimonial.text}&rdquo;</p>

                  <div className="flex items-center gap-3 border-t border-border/80 pt-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-gradient-to-br from-lumitria-orange-light to-lumitria-gold-light/50 text-sm font-bold text-primary shadow-soft">
                      {getInitials(testimonial.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.child}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="mr-1" aria-hidden>
                          {locationFlag(testimonial.location)}
                        </span>
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </InView>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
