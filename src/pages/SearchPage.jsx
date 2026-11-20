import React, { useState, useEffect, useMemo } from 'react';
import { Search, Film, X, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import Modal from '../components/Modal';
import { MovieCardSkeleton } from '../components/Skeleton';
import { MovieDetailsContent } from './MovieDetailsPage';
import { moviesApi } from '../services/api';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [modalMovie, setModalMovie] = useState(null);

  // Debounced search logic (300ms)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    const debounceTimer = setTimeout(async () => {
      try {
        const data = await moviesApi.search(searchTerm);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search Header & Input */}
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
            Search StreamBox
          </h1>
          <p className="text-sm text-text-muted">
            Find movies, original franchises, genres, or favorite cast members.
          </p>

          <div className="relative pt-2">
            <div className="absolute inset-y-0 left-0 pl-4 pt-2 flex items-center pointer-events-none text-text-muted">
              <Search className="w-5 h-5" />
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, genre, or actor (e.g. Cyberpunk, Action, Keanu)..."
              autoFocus
              className="w-full bg-bg-surface text-text-primary placeholder:text-text-muted/60 border border-text-muted/20 rounded-lg py-3.5 pl-12 pr-12 text-sm sm:text-base outline-none transition-all duration-200 focus:border-blue-prime focus:ring-2 focus:ring-blue-prime shadow-lg"
            />

            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 pt-2 flex items-center text-text-muted hover:text-text-primary"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results Area */}
        <div>
          {isSearching ? (
            <div className="space-y-4">
              <p className="text-xs text-text-muted font-medium">Searching catalog...</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <MovieCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : hasSearched && results.length > 0 ? (
            <div className="space-y-4">
              <p className="text-xs text-text-muted font-medium">
                Found <span className="text-text-primary font-bold">{results.length}</span> titles matching "{searchTerm}"
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {results.map((movie) => (
                  <div key={movie.id} className="flex justify-center">
                    <MovieCard
                      movie={movie}
                      onOpenDetails={(m) => setModalMovie(m)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : hasSearched && results.length === 0 ? (
            /* Empty State */
            <div className="bg-bg-surface border border-text-muted/20 rounded-lg p-12 text-center max-w-md mx-auto space-y-3 mt-8">
              <div className="w-12 h-12 rounded-full bg-bg-base flex items-center justify-center text-text-muted mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">No results found</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                We couldn't find any movies matching "{searchTerm}". Check your spelling or try searching for a different keyword.
              </p>
            </div>
          ) : (
            /* Initial Browse Prompt */
            <div className="text-center py-16 space-y-3">
              <Film className="w-12 h-12 text-blue-prime/50 mx-auto" />
              <p className="text-sm text-text-muted">
                Type in the search bar above to instantly query titles, genres, and cast members.
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

export default SearchPage;
