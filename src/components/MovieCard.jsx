import React from 'react';
import { Play, Info, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie, onOpenDetails, showProgress = false, priority = false }) => {
  const navigate = useNavigate();

  const handlePlayClick = (e) => {
    e.stopPropagation();
    navigate(`/watch/${movie.id}`);
  };

  const handleCardClick = () => {
    if (onOpenDetails) {
      onOpenDetails(movie);
    } else {
      navigate(`/movie/${movie.id}`);
    }
  };

  // Plan badge label
  const planLabel = movie.plan_required ? movie.plan_required.toUpperCase() : 'FREE';

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View ${movie.title}`}
      className="group relative flex-shrink-0 w-44 sm:w-56 cursor-pointer select-none rounded-lg bg-bg-surface overflow-hidden border border-text-muted/20 transition-transform duration-200 hover:scale-105 hover:z-20 hover:border-blue-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-prime shadow-md"
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full bg-bg-surface overflow-hidden">
        <img
          src={movie.poster}
          alt={movie.title}
          loading={priority ? 'eager' : 'lazy'}
          className="w-full h-full object-cover transition-opacity duration-200"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Plan Required Badge: blue #0078F8 */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="bg-blue-dodger text-text-primary text-[10px] sm:text-xs font-bold tracking-wider px-2 py-0.5 rounded shadow-sm">
            {planLabel}
          </span>
        </div>

        {/* Hover overlay with action buttons */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3.5 gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayClick}
              aria-label={`Play ${movie.title}`}
              className="w-9 h-9 rounded-full bg-blue-prime hover:bg-blue-bright active:bg-blue-royal text-text-primary flex items-center justify-center transition-colors shadow-md focus-visible:ring-2 focus-visible:ring-blue-prime"
            >
              <Play className="w-4 h-4 fill-text-primary ml-0.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              aria-label={`More details for ${movie.title}`}
              className="w-9 h-9 rounded-full bg-bg-surface/90 hover:bg-bg-surface text-text-primary border border-text-muted/30 flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-blue-prime"
            >
              <Info className="w-4 h-4 text-text-muted hover:text-text-primary" />
            </button>
          </div>

          <div className="text-xs text-text-muted font-medium flex items-center gap-2">
            <span>{movie.year}</span>
            <span>•</span>
            <span>{movie.duration}</span>
            {movie.rating && (
              <>
                <span>•</span>
                <span className="border border-text-muted/30 px-1 py-0.2 rounded text-[10px]">
                  {movie.rating}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Continue Watching Progress bar: #00A8E1 */}
        {showProgress && movie.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-text-muted/30 z-10">
            <div
              className="h-full bg-blue-prime transition-all duration-300"
              style={{ width: `${Math.min(100, movie.progress)}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Details below image */}
      <div className="p-3 bg-bg-surface">
        <h4 className="text-sm font-semibold text-text-primary truncate" title={movie.title}>
          {movie.title}
        </h4>
        <div className="mt-1 flex items-center justify-between text-xs text-text-muted">
          <span>{movie.genres?.[0] || 'Feature'}</span>
          {showProgress && movie.progress > 0 ? (
            <span className="text-[11px] text-blue-prime font-semibold">
              {movie.progress}% watched
            </span>
          ) : (
            <span>{movie.year}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
