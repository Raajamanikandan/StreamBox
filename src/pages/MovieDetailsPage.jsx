import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, ArrowLeft, Clock, Calendar, Users, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Skeleton from '../components/Skeleton';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MovieDetailsContent = ({ movie, isModal = false, onClose }) => {
  const navigate = useNavigate();
  const { canWatch } = useAuth();

  if (!movie) return null;

  const isAllowed = canWatch(movie.plan_required);

  const handlePlayClick = () => {
    if (isAllowed) {
      navigate(`/watch/${movie.id}`);
    } else {
      navigate('/plans');
    }
  };

  return (
    <div className="text-text-primary">
      {/* Banner Backdrop */}
      <div className="relative w-full aspect-video sm:aspect-[21/9] max-h-[440px] bg-bg-surface overflow-hidden">
        <img
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        {/* Gradient strictly from #0F171E (bottom) to transparent (top) */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-bg-surface/50 to-transparent" />
        
        {/* Required plan badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-blue-dodger text-text-primary px-3 py-1 rounded text-xs font-bold tracking-wider uppercase shadow-md">
            {movie.plan_required} Plan Required
          </span>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            {movie.title}
          </h1>

          {/* Metadata chips */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-text-muted font-medium">
            <span className="border border-text-muted/30 px-2 py-0.5 rounded text-xs font-bold">
              {movie.rating || '16+'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {movie.year}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {movie.duration}
            </span>
            <span>•</span>
            <span className="text-blue-prime font-semibold">
              {movie.status === 'processing' ? 'Processing stream...' : '4K Ultra HD'}
            </span>
          </div>
        </div>

        {/* Genre Chips */}
        <div className="flex flex-wrap gap-2">
          {movie.genres?.map((genre, idx) => (
            <span
              key={idx}
              className="bg-bg-base text-text-muted border border-text-muted/20 px-3 py-1 rounded-full text-xs font-semibold"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base text-text-muted leading-relaxed">
          {movie.description}
        </p>

        {/* Cast list */}
        {movie.cast && movie.cast.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-text-muted/20">
            <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Starring</span>
            </div>
            <p className="text-sm text-text-primary">{movie.cast.join(', ')}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-text-muted/20">
          {isAllowed ? (
            <Button
              variant="primary"
              size="lg"
              icon={Play}
              onClick={handlePlayClick}
              className="shadow-lg"
            >
              {movie.progress > 0 ? `Resume (${movie.progress}%)` : 'Play Movie'}
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                icon={Sparkles}
                onClick={() => navigate('/plans')}
                className="shadow-lg"
              >
                Upgrade to Watch
              </Button>
              <span className="text-xs text-text-muted">
                Requires <strong className="text-blue-dodger uppercase">{movie.plan_required}</strong> or higher plan.
              </span>
            </div>
          )}

          {!isModal && (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(-1)}
            >
              Back to Catalog
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { movies, isLoading } = useMovies();

  const movie = movies.find((m) => m.id === id);

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-text-muted hover:text-blue-prime transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back
        </button>

        {isLoading ? (
          <div className="bg-bg-surface rounded-lg p-8 space-y-6">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <Skeleton className="h-8 w-1/2 rounded" />
            <Skeleton className="h-4 w-full rounded" />
          </div>
        ) : movie ? (
          <div className="bg-bg-surface rounded-lg border border-text-muted/20 shadow-2xl overflow-hidden">
            <MovieDetailsContent movie={movie} />
          </div>
        ) : (
          <div className="bg-bg-surface rounded-lg p-12 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-error mx-auto" />
            <h2 className="text-xl font-bold text-text-primary">Movie not found</h2>
            <p className="text-sm text-text-muted">
              The movie you are looking for does not exist or has been removed.
            </p>
            <Button variant="primary" onClick={() => navigate('/movies')}>
              Browse All Movies
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export { MovieDetailsContent };
export default MovieDetailsPage;
