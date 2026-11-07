"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's moving background: a short, silent loop of leaves against the sky.
 * The poster shows until it plays, and stays for anyone who prefers less motion.
 */
export function HeroVideo({
  src,
  mobileSrc,
  poster,
  className,
}: {
  src: string;
  /** A lighter cut for phones, where the full-resolution file would cost too much data. */
  mobileSrc?: string;
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (query.matches) video.pause();
      else void video.play().catch(() => {});
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return (
    <video
      ref={ref}
      aria-hidden="true"
      className={className}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
    >
      {mobileSrc && <source src={mobileSrc} type="video/mp4" media="(max-width: 767px)" />}
      <source src={src} type="video/mp4" />
    </video>
  );
}
