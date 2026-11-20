import React from 'react';
import { Play, Info, Check, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { HeroBannerSkeleton } from './Skeleton';
import { useAuth } from '../context/AuthContext';

const HeroBanner = ({ movie, isLoading = false, onOpenDetails }) => {
  const navigate = useNavigate();
  const { canWatch } = useAuth();

  if (isLoading || !movie) {
    return <HeroBannerSkeleton />;
  }

  const isAllowed = canWatch(movie.plan_required);

  const handlePlayClick = () => {
    if (isAllowed) {
      navigate(`/watch/${movie.id}`);
    } else {
      navigate('/plans');
    }
  };

  const handleInfoClick = () => {
    if (onOpenDetails) {
      onOpenDetails(movie);
    } else {
      navigate(`/movie/${movie.id}`);
    }
  };

  return (
    <div className="relative w-full h-[65vh] min-h-[460px] max-h-[720px] select-none overflow-hidden">
      {/* Backdrop Image */}
      <div className="absolute inset-0">
        <img
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          priority="true"
          className="w-full h-full object-cover object-center filter brightness-90 transform scale-105"
        />
        {/* Gradient strictly from #0F171E (bottom) to transparent (top) over the poster */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-base/90 via-bg-base/40 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative h-full flex flex-col justify-end px-6 sm:px-12 pb-12 sm:pb-16 max-w-4xl z-10 space-y-4">
        {/* Badges and metadata */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-semibold text-text-muted">
          <span className="bg-blue-dodger text-text-primary px-2.5 py-1 rounded text-xs font-bold tracking-wider">
            {movie.plan_required ? movie.plan_required.toUpperCase() : 'FREE'}
          </span>
          <span className="border border-text-muted/30 px-2 py-0.5 rounded text-xs">
            {movie.rating || '16+'}
          </span>
          <span>{movie.year}</span>
          <span>•</span>
          <span>{movie.duration}</span>
          <span>•</span>
          <span className="text-blue-prime">{movie.genres?.join(', ')}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-text-primary tracking-tight leading-tight line-clamp-2">
          {movie.title}
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-text-muted line-clamp-3 max-w-2xl leading-relaxed">
          {movie.description}
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {isAllowed ? (
            <Button
              variant="primary"
              size="lg"
              icon={Play}
              onClick={handlePlayClick}
              aria-label="Play featured movie"
            >
              Play Now
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/plans')}
              className="bg-blue-prime hover:bg-blue-bright"
            >
              Upgrade to Watch
            </Button>
          )}

          <Button
            variant="secondary"
            size="lg"
            icon={Info}
            onClick={handleInfoClick}
            aria-label="More information"
          >
            More Info
          </Button>

          {/* If movie has progress */}
          {movie.progress > 0 && (
            <span className="text-xs text-blue-prime font-semibold bg-bg-surface/80 px-3 py-2 rounded-lg border border-text-muted/20">
              Resume at {Math.floor(movie.lastPosition / 60)}m ({movie.progress}%)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
