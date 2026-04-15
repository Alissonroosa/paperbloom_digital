'use client';

import { useState, useRef, useCallback } from 'react';
import { Search, Music, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface YouTubeResult {
  videoId: string;
  title: string;
  author: string;
  thumbnail: string;
  duration: string;
}

interface YouTubeSearchProps {
  onSelect: (videoId: string, title: string) => void;
}

export function YouTubeSearch({ onSelect }: YouTubeSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const searchYouTube = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setResults(data.results || []);
      setHasSearched(true);
    } catch {
      setError('Não foi possível buscar. Tente novamente ou cole o link diretamente.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchYouTube(value), 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    searchYouTube(query);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setError(null);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Buscar música... ex: Perfect Ed Sheeran"
            className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Limpar busca"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      {isSearching && (
        <div className="flex items-center justify-center gap-2 py-4 text-pink-500">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Buscando músicas...</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 text-center py-2">{error}</p>
      )}

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 max-h-[320px] overflow-y-auto pr-1"
          >
            {results.map((result) => (
              <motion.button
                key={result.videoId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                type="button"
                onClick={() => onSelect(result.videoId, result.title)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border-2 border-gray-100 hover:border-pink-300 hover:bg-pink-50 transition-all text-left group"
              >
                {result.thumbnail ? (
                  <img
                    src={result.thumbnail}
                    alt=""
                    className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-12 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <Music size={18} className="text-pink-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-pink-700 transition-colors">
                    {result.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 line-clamp-1">{result.author}</p>
                    {result.duration && (
                      <span className="text-xs text-gray-400 flex-shrink-0">{result.duration}</span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {hasSearched && !isSearching && results.length === 0 && !error && (
        <p className="text-sm text-gray-500 text-center py-3">
          Nenhum resultado encontrado. Tente outros termos ou cole o link diretamente.
        </p>
      )}
    </div>
  );
}
