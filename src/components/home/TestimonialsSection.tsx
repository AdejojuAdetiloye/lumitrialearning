import { useState } from "react";
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

const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return "";
  if (url.includes("youtube.com/embed")) return url;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
    }
  }
  return url;
};

const getYouTubeThumbnail = (url: string): string => {
  if (!url) return "";
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
  }
  return "";
};

const videoTestimonials = [
  {
    name: "Adaeze Okonkwo",
    location: "London, UK",
    child: "Mom of David, 11",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "",
  },
  {
    name: "Chukwuma Eze",
    location: "Toronto, Canada",
    child: "Dad of Amara, 9",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "",
  },
  {
    name: "Folake Adeyemi",
    location: "Houston, USA",
    child: "Mom of Tunde, 13",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "",
  },
];

const TestimonialsSection = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const handleVideoClick = (videoUrl: string) => {
    setSelectedVideo(getYouTubeEmbedUrl(videoUrl));
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

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
            Watch What Our Tutors Say
          </h3>
        </InView>

        <div className="mx-auto mb-14 grid max-w-5xl gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {videoTestimonials.map((video, index) => {
            const thumbnail = video.thumbnail || getYouTubeThumbnail(video.videoUrl);

            return (
              <InView key={video.name} delay={index * 0.08} y={32}>
                <Card
                  variant="elevated"
                  className="group cursor-pointer overflow-hidden border-white/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-glow"
                  onClick={() => video.videoUrl && handleVideoClick(video.videoUrl)}
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {thumbnail ? (
                      <>
                        <img
                          src={thumbnail}
                          alt={`${video.name} testimonial`}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/400x225?text=Video+Testimonial";
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-foreground/50 to-transparent transition-colors group-hover:from-foreground/40">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/95 shadow-glow transition-transform duration-300 group-hover:scale-110 md:h-20 md:w-20">
                            <Play className="ml-1 h-8 w-8 text-primary-foreground md:h-10 md:w-10" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 shadow-lg md:h-20 md:w-20">
                          <Play className="ml-1 h-8 w-8 text-primary-foreground md:h-10 md:w-10" />
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <p className="font-semibold text-foreground md:text-base">{video.name}</p>
                    <p className="text-sm text-muted-foreground">{video.child}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="mr-1.5" aria-hidden>
                        {locationFlag(video.location)}
                      </span>
                      {video.location}
                    </p>
                  </CardContent>
                </Card>
              </InView>
            );
          })}
        </div>

        <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && closeVideo()}>
          <DialogContent className="max-w-4xl w-full border-0 bg-transparent p-0 shadow-none">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/20 bg-black shadow-glow">
              {selectedVideo && (
                <iframe
                  src={`${selectedVideo}&autoplay=1`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video testimonial"
                />
              )}
              <button
                type="button"
                onClick={closeVideo}
                className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-background/80 text-foreground backdrop-blur-md transition-colors hover:bg-background"
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
