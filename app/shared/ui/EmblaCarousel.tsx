"use client";

import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EmblaCarouselProps {
  children: ReactNode;
  options?: EmblaOptionsType;
  showArrows?: boolean;
  showDots?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
}

export const EmblaCarousel = ({
  children,
  options = {},
  showArrows = true,
  showDots = false,
  autoplay = false,
  autoplayDelay = 3000,
}: EmblaCarouselProps) => {
  const slides = useMemo(() => React.Children.toArray(children), [children]);

  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect(emblaApi);

    const handleSelect = () => onSelect(emblaApi);
    const handleReInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      onSelect(emblaApi);
    };

    emblaApi.on("select", handleSelect);
    emblaApi.on("reInit", handleReInit);

    return () => {
      emblaApi.off("select", handleSelect);
      emblaApi.off("reInit", handleReInit);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!autoplay || !emblaApi) return;
    if (slides.length <= 1) return;

    const id = window.setInterval(() => {
      if (!emblaApi) return;

      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, autoplayDelay);

    return () => window.clearInterval(id);
  }, [emblaApi, autoplay, autoplayDelay, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="relative">
        <div className="overflow-hidden">
          <div className="flex gap-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative" aria-label="Carousel">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2">{slides}</div>
      </div>

      {showArrows && slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Previous slide"
            className={[
              "absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full shadow-lg transition-all",
              "bg-white/90 hover:bg-white",
              "disabled:opacity-40 disabled:pointer-events-none",
            ].join(" ")}
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>

          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Next slide"
            className={[
              "absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full shadow-lg transition-all",
              "bg-white/90 hover:bg-white",
              "disabled:opacity-40 disabled:pointer-events-none",
            ].join(" ")}
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </>
      )}

      {showDots && scrollSnaps.length > 1 && (
        <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Carousel pagination">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selectedIndex ? "true" : "false"}
              className={[
                "h-2 rounded-full transition-all",
                index === selectedIndex ? "bg-primary w-6" : "bg-gray-300 w-2 hover:bg-gray-400",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
};