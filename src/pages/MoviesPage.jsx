import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import Modal from '../components/Modal';
import { MovieCardSkeleton } from '../components/Skeleton';
import { MovieDetailsContent } from './MovieDetailsPage';
import { useMovies } from '../context/MovieContext';
import { MOCK_GENRES } from '../services/mockData';
import { Filter } from 'lucide-react';

const MoviesPage = () => {
  const { movies, isLoading } = useMovies();
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [modalMovie, setModalMovie] = useState(null);

  const safeMovies = Array.isArray(movies) ? movies : [];

  const filteredMovies = safeMovies.filter((movie) => {
    const matchesGenre =
      selectedGenre === 'All' || (movie.genres && movie.genres.includes(selectedGenre));
    const matchesPlan =
      selectedPlan === 'all' || movie.plan_required?.toLowerCase() === selectedPlan.toLowerCase();
    return matchesGenre && matchesPlan;
  });

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
            Movies Catalog
          </h1>
          <p className="text-sm text-text-muted">
            Explore our curated collection of award-winning features, 4K HDR originals, and timeless sagas.
          </p>
        </div>

        {/* Filters bar: #232F3E surface */}
        <div className="bg-bg-surface border border-text-muted/20 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Genre tags */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto py-1">
            {MOCK_GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap select-none ${
                  selectedGenre === genre
                    ? 'bg-blue-prime text-text-primary shadow-sm'
                    : 'bg-bg-base/80 text-text-muted hover:text-text-primary hover:bg-bg-base'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Plan filter dropdown */}
          <div className="flex items-center gap-2 self-end md:self-auto text-xs font-medium text-text-muted">
            <Filter className="w-4 h-4 text-blue-prime" />
            <span>Tier:</span>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="bg-bg-base text-text-primary border border-text-muted/20 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-prime outline-none"
            >
              <option value="all">All Tiers</option>
              <option value="mobile">Mobile Only</option>
              <option value="super">Super (HD)</option>
              <option value="premium">Premium (4K)</option>
            </select>
          </div>
        </div>

        {/* Movies Grid */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {filteredMovies.map((movie) => (
                <div key={movie.id} className="flex justify-center">
                  <MovieCard
                    movie={movie}
                    onOpenDetails={(m) => setModalMovie(m)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-bg-surface border border-text-muted/20 rounded-lg p-12 text-center space-y-3">
              <p className="text-base font-semibold text-text-primary">
                No movies match the selected filters
              </p>
              <p className="text-xs text-text-muted">
                Try selecting a different genre or clearing your plan filter.
              </p>
            </div>
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

export default MoviesPage;
