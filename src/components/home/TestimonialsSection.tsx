import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, Play, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { InView } from "@/components/motion/InView";
import { SectionHeader } from "@/components/home/SectionHeader";

const INSTRUCTOR_VIDEO_POSTER = "/images/video-cover.jpeg";
const INSTRUCTOR_VIDEO_SRC = "/video/mr-fidelis-video.mp4";

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
    text: "We tried many tutoring services, but Lumitria understands our needs as a global family abroad. Amara loves her coding classes!",
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

type InstructorCardSize = "mobile" | "desktop";

const InstructorCircleCard = ({
  instructor,
  size,
}: {
  instructor: Instructor;
  size: InstructorCardSize;
}) => {
  const isDesktop = size === "desktop";
  return (
    <Card
      variant="elevated"
      className={
        isDesktop
          ? "h-[196px] w-[196px] rounded-full border-white/40 bg-background/95 p-0 shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-glow sm:h-[212px] sm:w-[212px] md:h-[232px] md:w-[232px] lg:h-[248px] lg:w-[248px]"
          : "h-[164px] w-[164px] rounded-full border-white/40 bg-background/95 p-0 shadow-soft"
      }
    >
      <CardContent className="flex h-full w-full flex-col items-center justify-center px-2.5 pb-2.5 pt-1.5 sm:px-4 sm:pb-4 md:px-3 md:pb-3 md:pt-2">
        <div
          className={
            isDesktop
              ? "relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full border-2 border-primary/25 bg-gradient-to-br from-lumitria-orange-light to-lumitria-gold-light/60 shadow-soft sm:h-[100px] sm:w-[100px] md:h-[112px] md:w-[112px] lg:h-[120px] lg:w-[120px]"
              : "relative h-[70px] w-[70px] shrink-0 overflow-hidden rounded-full border-2 border-primary/25 bg-gradient-to-br from-lumitria-orange-light to-lumitria-gold-light/60 shadow-soft"
          }
        >
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
            <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-muted-foreground sm:text-2xl">
              ?
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary sm:text-base">
              {getInitials(instructor.name)}
            </div>
          )}
        </div>

        <div className="mt-2 flex w-full flex-col items-center gap-0.5 md:mt-3 md:gap-1">
          {instructorTriLines(instructor).map((line) => (
            <div
              key={line.key}
              className={[
                "max-w-full rounded-full border border-white/25 bg-background/80 px-1.5 py-0.5 text-center leading-tight sm:px-2.5 sm:py-1",
                !isDesktop && "px-2",
                line.className,
              ].join(" ")}
            >
              <span className="block max-w-full">{line.text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/** Poster + play — shared by mobile and desktop; opens modal on play. */
const InstructorVideoPreview = ({ onPlay }: { onPlay: () => void }) => (
  <div className="relative w-full overflow-hidden rounded-2xl border border-white/25 bg-black shadow-glow md:rounded-3xl">
    <div className="relative aspect-video w-full">
      <img
        src={INSTRUCTOR_VIDEO_POSTER}
        alt="Lumitria Learning — The Future Starts Here"
        className="h-full w-full object-cover object-center"
        loading="lazy"
        decoding="async"
        sizes="(max-width: 768px) 92vw, min(92vw, 960px)"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
      <button
        type="button"
        onClick={onPlay}
        className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow ring-4 ring-black/10 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background md:h-16 md:w-16 lg:h-20 lg:w-20"
        aria-label="Play instructor video"
      >
        <Play className="ml-0.5 h-7 w-7 md:h-8 md:w-8 lg:h-10 lg:w-10" />
      </button>
    </div>
  </div>
);

/** Time between pair changes (includes wheel animation). */
const MOBILE_ROTATE_MS = 2800;
const MOBILE_WHEEL_DURATION = 0.55;
const MOBILE_WHEEL_EASE = [0.33, 1, 0.68, 1] as const;
/** Vertical arc offset (px) — simulates motion along the top / bottom of a wheel. */
const MOBILE_WHEEL_ARC_Y = 56;
/** Slight roll so cards follow the “rim” (deg). */
const MOBILE_WHEEL_ROLL = 11;
const MOBILE_WHEEL_KEY_TIMES = [0, 0.5, 1] as const;

const MobileInstructorsWheel = ({
  top,
  bottom,
  pairIndex,
  onPlayVideo,
}: {
  top: Instructor | undefined;
  bottom: Instructor | undefined;
  pairIndex: number;
  onPlayVideo: () => void;
}) => {
  const reduced = useReducedMotion();
  const transition = reduced
    ? { duration: 0.05 }
    : {
        duration: MOBILE_WHEEL_DURATION,
        times: [...MOBILE_WHEEL_KEY_TIMES],
        ease: MOBILE_WHEEL_EASE,
      };

  const slot =
    "relative flex min-h-[188px] w-full max-w-full justify-center overflow-x-clip overflow-y-visible py-1";

  return (
    <div className="flex w-full max-w-full flex-col items-stretch gap-3 overflow-x-clip">
      <div className={slot}>
        <AnimatePresence initial={false} mode="sync">
          {top ? (
            <motion.div
              key={`mobile-top-${pairIndex}-${top.id}`}
              initial={
                reduced
                  ? { x: "85vw", opacity: 0.45 }
                  : {
                      x: "82vw",
                      y: 0,
                      rotate: MOBILE_WHEEL_ROLL,
                      opacity: 0.45,
                    }
              }
              animate={
                reduced
                  ? { x: 0, opacity: 1 }
                  : {
                      x: ["82vw", "40vw", 0],
                      y: [0, -MOBILE_WHEEL_ARC_Y, 0],
                      rotate: [MOBILE_WHEEL_ROLL, MOBILE_WHEEL_ROLL * 0.35, 0],
                      opacity: [0.45, 0.78, 1],
                    }
              }
              exit={
                reduced
                  ? { x: "-85vw", opacity: 0.45 }
                  : {
                      x: [0, "-40vw", "-82vw"],
                      y: [0, -MOBILE_WHEEL_ARC_Y, 0],
                      rotate: [0, -MOBILE_WHEEL_ROLL * 0.7, -MOBILE_WHEEL_ROLL],
                      opacity: [1, 0.72, 0.45],
                    }
              }
              transition={transition}
              className="flex w-full justify-center"
            >
              <InstructorCircleCard instructor={top} size="mobile" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mx-auto w-full max-w-full shrink-0">
        <InstructorVideoPreview onPlay={onPlayVideo} />
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Tap play to watch our lead instructor.
        </p>
      </div>

      <div className={slot}>
        <AnimatePresence initial={false} mode="sync">
          {bottom ? (
            <motion.div
              key={`mobile-bot-${pairIndex}-${bottom.id}`}
              initial={
                reduced
                  ? { x: "-85vw", opacity: 0.45 }
                  : {
                      x: "-82vw",
                      y: 0,
                      rotate: -MOBILE_WHEEL_ROLL,
                      opacity: 0.45,
                    }
              }
              animate={
                reduced
                  ? { x: 0, opacity: 1 }
                  : {
                      x: ["-82vw", "-40vw", 0],
                      y: [0, MOBILE_WHEEL_ARC_Y, 0],
                      rotate: [-MOBILE_WHEEL_ROLL, -MOBILE_WHEEL_ROLL * 0.35, 0],
                      opacity: [0.45, 0.78, 1],
                    }
              }
              exit={
                reduced
                  ? { x: "85vw", opacity: 0.45 }
                  : {
                      x: [0, "40vw", "82vw"],
                      y: [0, MOBILE_WHEEL_ARC_Y, 0],
                      rotate: [0, MOBILE_WHEEL_ROLL * 0.7, MOBILE_WHEEL_ROLL],
                      opacity: [1, 0.72, 0.45],
                    }
              }
              transition={transition}
              className="flex w-full justify-center"
            >
              <InstructorCircleCard instructor={bottom} size="mobile" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [mobilePairIndex, setMobilePairIndex] = useState(0);

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
        id: "mrs-eunice",
        name: "Mrs Eunice",
        subject: "Home Economics and Culture",
        imageSrc: "/images/mrs-ipuole.png",
      },
      {
        id: "azegba",
        name: "Azegba James",
        subject: "Igbo",
        imageSrc: "/images/james.png",
      },
      {
        id: "mrs-hope",
        name: "Mrs Hope",
        subject: "Diction",
        imageSrc: "/images/hope.jpeg",
      },
    ],
    [],
  );

  const ringPositionForIndex = (idx: number, count: number) => {
    const safeCount = Math.max(1, count);
    const angle = (idx / safeCount) * Math.PI * 2 - Math.PI / 2; // start at top
    const radiusPct = safeCount <= 6 ? 36 : safeCount <= 8 ? 39 : 41;
    const top = 50 + radiusPct * Math.sin(angle);
    const left = 50 + radiusPct * Math.cos(angle);
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: "translate(-50%, -50%)",
    } as const;
  };

  const pairCount = Math.ceil(instructors.length / 2);

  useEffect(() => {
    if (pairCount <= 1) return;
    const mqMobile = window.matchMedia("(max-width: 767px)");
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let intervalId: ReturnType<typeof setInterval> | undefined;

    const sync = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
      if (!mqMobile.matches || mqReduce.matches) return;
      intervalId = setInterval(() => {
        setMobilePairIndex((i) => (i + 1) % pairCount);
      }, MOBILE_ROTATE_MS);
    };

    sync();
    mqMobile.addEventListener("change", sync);
    mqReduce.addEventListener("change", sync);
    return () => {
      if (intervalId !== undefined) clearInterval(intervalId);
      mqMobile.removeEventListener("change", sync);
      mqReduce.removeEventListener("change", sync);
    };
  }, [pairCount]);

  const mobileTop = instructors[mobilePairIndex * 2];
  const mobileBottom = instructors[mobilePairIndex * 2 + 1];

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
              Loved by <span className="text-gradient">Global Families</span> Worldwide
            </>
          }
          description="Join hundreds of families who trust Lumitria to nurture their children's education and cultural connection."
        />

        <InView className="mb-12 md:mb-16" y={24}>
          <h3 className="font-display text-center text-2xl font-semibold text-foreground md:text-3xl px-4">
            Our Instructors
          </h3>
        </InView>

        <div className="relative left-1/2 w-[100vw] max-w-[100vw] -translate-x-1/2 overflow-x-clip px-3 sm:px-4">
        <InView className="mx-auto mb-14 w-full max-w-full px-2 md:w-[80vw] md:max-w-[min(80vw,1600px)] md:px-0" y={28}>
          <div className="relative mx-auto grid w-full place-items-center">
            {/* Mobile: centered card; wheel slide (top left/right) + 90vw video; pairs rotate */}
            <div className="relative flex w-full max-w-full justify-center overflow-x-clip md:hidden">
              <div
                className="relative w-[min(92vw,480px)] max-w-[92vw] overflow-x-clip overflow-y-visible rounded-[32px] border border-white/45 bg-gradient-to-br from-lumitria-orange/72 via-lumitria-orange/58 to-lumitria-gold/38 px-3 py-5 shadow-soft ring-1 ring-white/25"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-lumitria-orange/28 via-lumitria-gold/14 to-lumitria-orange/12 blur-sm" />
                <MobileInstructorsWheel
                  top={mobileTop}
                  bottom={mobileBottom}
                  pairIndex={mobilePairIndex}
                  onPlayVideo={() => setIsVideoOpen(true)}
                />
              </div>
            </div>

            {/* Desktop / tablet: ring layout */}
            <div className="relative hidden w-full md:block">
              <div className="relative mx-auto aspect-square w-full">
                <div className="absolute inset-0 rounded-[44px] bg-gradient-to-br from-lumitria-orange/28 via-lumitria-gold/14 to-lumitria-orange/12 blur-sm" />

                <div className="absolute inset-0 rounded-[44px] border border-white/45 bg-gradient-to-br from-lumitria-orange/72 via-lumitria-orange/58 to-lumitria-gold/38 shadow-soft ring-1 ring-white/25" />

                <div className="absolute left-1/2 top-1/2 w-[92%] max-w-[960px] -translate-x-1/2 -translate-y-1/2">
                  <InstructorVideoPreview onPlay={() => setIsVideoOpen(true)} />

                  <p className="mt-3 text-center text-sm text-muted-foreground">
                    Tap play to watch our lead instructor.
                  </p>
                </div>

                {instructors.map((instructor, idx) => {
                  const pos = ringPositionForIndex(idx, instructors.length);
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
                      <InstructorCircleCard instructor={instructor} size="desktop" />
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
            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-black shadow-glow">
              {isVideoOpen && (
                <video
                  className="h-full w-full max-h-full max-w-full object-contain object-center"
                  src={INSTRUCTOR_VIDEO_SRC}
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
