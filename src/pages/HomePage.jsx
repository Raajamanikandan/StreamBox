import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';
import Modal from '../components/Modal';
import { MovieDetailsContent } from './MovieDetailsPage';
import { useMovies } from '../context/MovieContext';

const HomePage = () => {
  const { movies, isLoading } = useMovies();
  const [modalMovie, setModalMovie] = useState(null);

  const safeMovies = Array.isArray(movies) ? movies : [];

  // Featured hero movie (e.g. first item or designated featured)
  const featuredMovie = safeMovies[0];

  // Rows logic
  const continueWatching = safeMovies.filter((m) => m.progress && m.progress > 0);
  const trendingMovies = safeMovies.slice(0, 6);
  const newReleases = [...safeMovies].reverse().slice(0, 6);
  const actionMovies = safeMovies.filter((m) => m.genres?.includes('Action'));
  const scifiMovies = safeMovies.filter((m) => m.genres?.includes('Sci-Fi'));

  const handleOpenDetails = (movie) => {
    setModalMovie(movie);
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Hero Banner */}
        <HeroBanner
          movie={featuredMovie}
          isLoading={isLoading}
          onOpenDetails={handleOpenDetails}
        />

        {/* Rows */}
        <div className="relative -mt-10 sm:-mt-16 z-20 space-y-4">
          {/* Continue Watching Row (with progress bar) */}
          {continueWatching.length > 0 && (
            <MovieRow
              title="Continue Watching"
              subtitle="Pick up right where you left off"
              movies={continueWatching}
              isLoading={isLoading}
              onOpenDetails={handleOpenDetails}
              showProgress={true}
            />
          )}

          {/* Trending Row */}
          <MovieRow
            title="Trending on StreamBox"
            subtitle="Most watched titles this week"
            movies={trendingMovies}
            isLoading={isLoading}
            onOpenDetails={handleOpenDetails}
          />

          {/* New Releases */}
          <MovieRow
            title="New Releases"
            subtitle="Fresh blockbusters and original series"
            movies={newReleases}
            isLoading={isLoading}
            onOpenDetails={handleOpenDetails}
          />

          {/* Sci-Fi & Cyberpunk */}
          {scifiMovies.length > 0 && (
            <MovieRow
              title="Sci-Fi & Cyberpunk Universes"
              subtitle="Mind-bending adventures and futuristic epics"
              movies={scifiMovies}
              isLoading={isLoading}
              onOpenDetails={handleOpenDetails}
            />
          )}

          {/* Action & Thrillers */}
          {actionMovies.length > 0 && (
            <MovieRow
              title="High-Octane Action & Thrillers"
              subtitle="Pulse-pounding suspense and fight choreography"
              movies={actionMovies}
              isLoading={isLoading}
              onOpenDetails={handleOpenDetails}
            />
          )}
        </div>
      </main>

      {/* Quick Details Modal */}
      <Modal
        isOpen={!!modalMovie}
        onClose={() => setModalMovie(null)}
        maxWidth="max-w-3xl"
      >
        {modalMovie && (
          <MovieDetailsContent
            movie={modalMovie}
            isModal={true}
            onClose={() => setModalMovie(null)}
          />
        )}
      </Modal>

      <Footer />
    </div>
  );
};

export default HomePage;
