import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { MovieCardSkeleton } from './Skeleton';

const MovieRow = ({
  title,
  subtitle,
  movies = [],
  isLoading = false,
  onOpenDetails,
  showProgress = false
}) => {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!isLoading && movies.length === 0) return null;

  return (
    <section className="relative my-8 sm:my-10 px-4 sm:px-8 group/row">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            {title}
          </h2>
          {subtitle && <p className="text-xs sm:text-sm text-text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="relative">
        {/* Left Scroll Trigger */}
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 h-28 w-10 sm:w-12 bg-bg-base/80 hover:bg-bg-surface text-text-primary flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-200 border border-text-muted/20 rounded-r-lg shadow-lg focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-prime"
        >
          <ChevronLeft className="w-6 h-6 text-text-muted hover:text-text-primary" />
        </button>

        {/* Horizontal Carousel */}
        <div
          ref={rowRef}
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-3 px-1"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <MovieCardSkeleton key={i} />)
            : movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onOpenDetails={onOpenDetails}
                  showProgress={showProgress}
                />
              ))}
        </div>

        {/* Right Scroll Trigger */}
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 h-28 w-10 sm:w-12 bg-bg-base/80 hover:bg-bg-surface text-text-primary flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-200 border border-text-muted/20 rounded-l-lg shadow-lg focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-prime"
        >
          <ChevronRight className="w-6 h-6 text-text-muted hover:text-text-primary" />
        </button>
      </div>
    </section>
  );
};

export default MovieRow;
