import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moviesApi } from '../services/api';
import { useMovies } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import Button from '../components/Button';
import { AlertCircle, Lock } from 'lucide-react';

const WatchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { movies, recordProgress } = useMovies();
  const { canWatch } = useAuth();

  const [streamData, setStreamData] = useState(null);
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadStream = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch movie details
        const currentMovie = movies.find((m) => m.id === id) || (await moviesApi.getById(id));
        if (!isMounted) return;
        setMovie(currentMovie);

        // Check plan access
        if (!canWatch(currentMovie.plan_required)) {
          setError('PLAN_REQUIRED');
          setIsLoading(false);
          return;
        }

        // Fetch stream URL and signed token from backend
        // url = MEDIA_BASE_URL + "/media/" + hls_path
        const stream = await moviesApi.getStream(id);
        if (!isMounted) return;
        setStreamData(stream);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Video temporarily unavailable');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadStream();

    return () => {
      isMounted = false;
    };
  }, [id, movies, canWatch]);

  const handleProgressUpdate = useCallback(
    (positionSeconds, durationSeconds) => {
      if (id) {
        recordProgress(id, positionSeconds, durationSeconds);
      }
    },
    [id, recordProgress]
  );

  return (
    <div className="fixed inset-0 z-50 bg-bg-deep flex items-center justify-center overflow-hidden">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-text-muted/30 border-t-blue-prime rounded-full animate-spin" />
          <p className="text-sm font-medium text-text-muted">Loading secure HLS stream...</p>
        </div>
      ) : error === 'PLAN_REQUIRED' ? (
        <div className="bg-bg-surface border border-text-muted/20 rounded-lg p-8 max-w-md w-full mx-4 text-center space-y-5 animate-fade-in shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-blue-dodger/20 text-blue-dodger mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Subscription Upgrade Required</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            "{movie?.title}" requires an active <strong className="text-blue-dodger uppercase">{movie?.plan_required}</strong> plan. Upgrade your plan to start streaming immediately.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button variant="primary" onClick={() => navigate('/plans')}>
              View Plans
            </Button>
          </div>
        </div>
      ) : error ? (
        <div className="bg-bg-surface border border-error/30 rounded-lg p-8 max-w-md w-full mx-4 text-center space-y-5 animate-fade-in shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-error/20 text-error mx-auto flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Video temporarily unavailable</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Could not connect to the media server. Please verify your connection or check back shortly.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      ) : streamData ? (
        <VideoPlayer
          streamUrl={streamData.url}
          token={streamData.token}
          title={movie?.title || streamData.title || 'StreamBox Media'}
          initialPosition={movie?.lastPosition || 0}
          onProgressUpdate={handleProgressUpdate}
          onBack={() => navigate(-1)}
        />
      ) : null}
    </div>
  );
};

export default WatchPage;
