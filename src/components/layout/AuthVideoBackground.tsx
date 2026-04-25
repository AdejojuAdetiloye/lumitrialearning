type AuthVideoBackgroundProps = {
  src?: string;
};

export default function AuthVideoBackground({ src = "/video/lumitria-hero-video.mp4" }: AuthVideoBackgroundProps) {
  return (
    <div className="pointer-events-none fixed inset-0" aria-hidden>
      {/* Keep background below fixed header */}
      <div className="absolute inset-x-0 top-[4.25rem] bottom-0 md:top-[4.5rem]">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>

      {/* Slightly stronger veil for auth readability */}
      <div className="absolute inset-x-0 top-[4.25rem] bottom-0 bg-gradient-to-b from-[#1b120c]/75 via-black/65 to-[#090a0d]/85 md:top-[4.5rem]" />
      <div className="absolute inset-x-0 top-[4.25rem] bottom-0 bg-black/15 md:top-[4.5rem]" />
      <div className="absolute inset-x-0 top-[4.25rem] bottom-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.12),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(249,115,22,0.09),transparent_60%)] md:top-[4.5rem]" />
      <div className="absolute inset-x-0 top-[4.25rem] bottom-0 mesh-hero-bg opacity-35 md:top-[4.5rem]" />
    </div>
  );
}

