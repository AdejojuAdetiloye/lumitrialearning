import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Code, Atom, Palette, Globe, ArrowRight, Check, Award } from "lucide-react";

const courses = [
  {
    icon: Atom,
    title: "Mathematics",
    description:
      "Build strong confidence in numbers, algebra, geometry, and problem‑solving with clear explanations and plenty of guided practice.",
    ages: "All Ages",
    color: "primary",
    features: ["Number sense", "Algebra & geometry", "Exam preparation"],
    sessionLengthMinutes: 60,
    curriculum: [
      "Number sense, place value, and operations",
      "Fractions, decimals, percentages, and ratios",
      "Algebraic thinking, equations, and word problems",
      "Geometry: shapes, angles, area, and volume",
      "Data handling, graphs, and real‑life applications",
      "Exam strategies and timed practice questions",
      "Personalised support for schoolwork and homework",
      "Building confidence and a growth mindset in maths",
    ],
    outcomes: [
      "Stronger confidence in core maths topics",
      "Ability to solve multi‑step word problems clearly",
      "Better exam and test performance",
      "Improved mental maths and logical reasoning",
    ],
  },
  {
    icon: Globe,
    title: "English",
    description:
      "Develop fluent reading, clear writing, and confident speaking skills for school, exams, and real‑life communication.",
    ages: "All Ages",
    color: "secondary",
    features: ["Reading comprehension", "Creative & essay writing", "Speaking & listening"],
    sessionLengthMinutes: 60,
    curriculum: [
      "Reading comprehension using short stories, articles, and passages",
      "Vocabulary building and correct word usage in context",
      "Grammar, sentence structure, and punctuation",
      "Creative writing: stories, descriptions, and narratives",
      "Essay and letter writing for school and exams",
      "Speaking and presentation skills for class and interviews",
      "Listening skills and note‑taking from audio and video",
      "Editing and improving written work for clarity and impact",
    ],
    outcomes: [
      "Stronger reading and comprehension skills",
      "Clearer, more accurate writing for school and exams",
      "Improved speaking confidence in class and at home",
      "Better overall English grades and communication skills",
    ],
  },
  {
    icon: Atom,
    title: "Biology",
    description:
      "Understand how living things work, from cells and body systems to plants, ecosystems, and human health.",
    ages: "All Ages",
    color: "accent",
    features: ["Cells & body systems", "Plant & animal life", "Health & genetics"],
    sessionLengthMinutes: 60,
    curriculum: [
      "Cells, tissues, and organs of the human body",
      "Body systems: circulation, breathing, digestion, and more",
      "Plant structure, growth, and reproduction",
      "Ecosystems, food chains, and balance in nature",
      "Health, disease prevention, and hygiene",
      "Genetics, inheritance, and simple DNA concepts",
      "Real‑life case studies linking biology to everyday life",
      "Exam‑style questions and structured revision",
    ],
    outcomes: [
      "Clear understanding of key biology topics in school",
      "Ability to explain how major body systems work together",
      "Improved performance in biology tests and exams",
      "Greater curiosity about health, science, and the natural world",
    ],
  },
  {
    icon: Atom,
    title: "Physics",
    description:
      "Learn how the world works through motion, forces, energy, electricity, and simple experiments that make physics practical.",
    ages: "All Ages",
    color: "primary",
    features: ["Forces & motion", "Energy & waves", "Electricity basics"],
    sessionLengthMinutes: 60,
    curriculum: [
      "Forces, motion, speed, and acceleration",
      "Energy forms, transfer, and conservation",
      "Work, power, and simple machines",
      "Electricity: circuits, current, voltage, and safety",
      "Light, sound, and basic wave concepts",
      "Everyday physics in transport, sports, and technology",
      "Using formulas, units, and calculations with confidence",
      "Past questions and exam‑style problem practice",
    ],
    outcomes: [
      "Better understanding of core physics ideas and formulas",
      "Improved confidence with calculations and units",
      "Stronger results in physics tests and exams",
      "Ability to connect physics concepts to real‑life situations",
    ],
  },
  {
    icon: Atom,
    title: "Chemistry",
    description:
      "Discover the building blocks of matter, simple reactions, acids and bases, and everyday applications of chemistry.",
    ages: "All Ages",
    color: "secondary",
    features: ["Atoms & elements", "Reactions & equations", "Everyday chemistry"],
    sessionLengthMinutes: 60,
    curriculum: [
      "Particles, atoms, elements, compounds, and mixtures",
      "Periodic table basics and common element families",
      "Types of chemical reactions and simple word equations",
      "Acids, bases, and everyday neutralisation examples",
      "States of matter and changes such as melting and boiling",
      "Simple lab‑style activities and safety awareness",
      "Interpreting charts, diagrams, and experiment results",
      "Targeted exam question practice and revision",
    ],
    outcomes: [
      "Comfort with key chemistry language and ideas",
      "Ability to describe and balance simple reactions",
      "Better performance in chemistry topics at school",
      "Greater appreciation of chemistry in daily life and industry",
    ],
  },
  {
    icon: Code,
    title: "Coding",
    description:
      "Learn to think like a programmer and build simple games, apps, and websites using beginner‑friendly tools and languages.",
    ages: "All Ages",
    color: "accent",
    features: ["Computational thinking", "Games & apps", "Web basics"],
    sessionLengthMinutes: 60,
    curriculum: [
      "Computational thinking and problem‑solving skills",
      "Block‑based coding with tools like Scratch",
      "Introduction to Python and JavaScript fundamentals",
      "Designing and building simple games and animations",
      "Web basics with HTML, CSS, and simple interactivity",
      "Debugging and improving existing code",
      "Mini‑projects that children can proudly show family",
      "Exploring real‑world uses of coding in careers",
    ],
    outcomes: [
      "Stronger logical thinking and problem‑solving",
      "Ability to build simple games, stories, or mini‑apps",
      "Early exposure to real programming languages",
      "Increased interest in technology and STEM careers",
    ],
  },
  {
    icon: Palette,
    title: "Yoruba & Igbo",
    description:
      "Help children connect deeply with their heritage through Yoruba and Igbo language, everyday conversation, and culture.",
    ages: "All Ages",
    color: "primary",
    features: ["Speaking & listening", "Reading & writing", "Culture & traditions"],
    sessionLengthMinutes: 60,
    curriculum: [
      "Basic greetings, introductions, and everyday phrases",
      "Correct pronunciation and listening practice",
      "Numbers, colours, family words, and common expressions",
      "Simple reading and writing of words and short sentences",
      "Songs, stories, and proverbs from Yoruba and Igbo culture",
      "Respectful expressions to elders and family members",
      "Practice conversations children can use with relatives",
      "Cultural topics: food, festivals, and traditional values",
    ],
    outcomes: [
      "Ability to greet and hold simple conversations in Yoruba and Igbo",
      "Better listening and pronunciation of key phrases",
      "Stronger connection to heritage and family",
      "Increased pride and comfort using heritage languages",
    ],
  },
  {
    icon: Globe,
    title: "French",
    description:
      "Introduce learners to French for school, travel, and international opportunities with practical vocabulary and simple conversation.",
    ages: "All Ages",
    color: "secondary",
    features: ["Core vocabulary", "Basic conversation", "School & exam support"],
    sessionLengthMinutes: 60,
    curriculum: [
      "French alphabet, sounds, and basic pronunciation",
      "Greetings, introductions, and polite expressions",
      "Numbers, days, months, and everyday classroom language",
      "Talking about family, hobbies, food, and school life",
      "Simple reading activities and short dialogues",
      "Writing short sentences, messages, and descriptions",
      "Listening to native speakers through audio and video",
      "Support with school topics and exam‑style questions",
    ],
    outcomes: [
      "Confidence with everyday French words and phrases",
      "Ability to introduce oneself and talk about simple topics",
      "Better grades in school French and stronger foundations",
      "Motivation to continue learning French for future study or travel",
    ],
  },
];

const colorClasses = {
  primary: {
    bg: "bg-lumitria-orange-light",
    icon: "text-primary",
    badge: "bg-primary/10 text-primary",
  },
  secondary: {
    bg: "bg-lumitria-green-light",
    icon: "text-secondary",
    badge: "bg-secondary/10 text-secondary",
  },
  accent: {
    bg: "bg-lumitria-gold-light",
    icon: "text-accent",
    badge: "bg-accent/10 text-accent-foreground",
  },
};

const Courses = () => {
  return (
    <>
      <Helmet>
        <title>Our Courses | Lumitria - Expert Tutoring for Global Families</title>
        <meta 
          name="description" 
          content="Explore our comprehensive courses: Coding & Programming, STEM Excellence, African Culture, and Creative Arts. Expert-led programs designed for global families worldwide." 
        />
        <link rel="canonical" href="https://lumitrialearning.org/courses" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="overflow-x-hidden pt-20 md:pt-24 pb-12 md:pb-16">
          {/* Hero Section */}
          <section className="relative py-16 md:py-20 mesh-hero-bg">
            <div className="container mx-auto max-w-[1280px] px-4 sm:px-6">
              <div className="max-w-3xl mx-auto text-center">
                <span className="inline-block text-primary font-semibold text-xs md:text-sm uppercase tracking-[0.2em] mb-3 md:mb-4">
                  Our Programs
                </span>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4 md:mb-6 px-4 sm:px-0 leading-tight">
                  Courses Designed for{" "}
                  <span className="text-gradient">Excellence</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground px-4 sm:px-0 leading-[1.7]">
                  Expert-led programs that combine quality education with cultural connection, 
                  designed for global families worldwide.
                </p>
              </div>
            </div>
          </section>

          {/* Courses Grid */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="grid sm:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
                {courses.map((course, index) => {
                  const colors = colorClasses[course.color as keyof typeof colorClasses];
                  const Icon = course.icon;
                  
                  return (
                    <Card
                      key={course.title}
                      variant="elevated"
                      className="opacity-0 animate-fade-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3 md:mb-4">
                          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${colors.bg} flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 md:w-7 md:h-7 ${colors.icon}`} />
                          </div>
                          <span className={`text-xs font-semibold px-2 md:px-3 py-1 rounded-full ${colors.badge}`}>
                            {course.ages}
                          </span>
                        </div>
                        <CardTitle className="font-display text-xl md:text-2xl mb-2">{course.title}</CardTitle>
                        <CardDescription className="text-sm md:text-base">
                          {course.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4 md:space-y-6 flex flex-col">
                        {/* Curriculum */}
                        <div>
                          <h3 className="font-semibold text-sm md:text-base text-foreground mb-2 md:mb-3 flex items-center gap-2">
                            <Award className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            Curriculum Highlights
                          </h3>
                          <ul className="space-y-2">
                            {course.curriculum.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
                                <Check className="w-3 h-3 md:w-4 md:h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Learning Outcomes */}
                        <div>
                          <h3 className="font-semibold text-sm md:text-base text-foreground mb-2 md:mb-3">What You Will Learn</h3>
                          <ul className="space-y-2">
                            {course.outcomes.map((outcome, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                <span>{outcome}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* CTA */}
                        <Link to="/register" className="mt-2 md:mt-4 pt-2 md:pt-3">
                          <Button variant="hero" className="w-full">
                            Enroll in {course.title}
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-12 md:py-16 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 md:mb-4 px-4 sm:px-0">
                  Ready to Get Started?
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8 px-4 sm:px-0">
                  Choose the course that best fits your interests and enroll today.
                </p>
                <Link to="/register">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto">
                    Enroll Now
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Courses;

