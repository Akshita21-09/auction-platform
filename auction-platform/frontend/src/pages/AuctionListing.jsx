import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { auctionService } from '../services/auctionService';
import AuctionCard from '../components/auction/AuctionCard';
import Loader from '../components/common/Loader';
import { CATEGORIES, SORT_OPTIONS } from '../utils/helpers';
import { FiSearch, FiFilter, FiGrid, FiList, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const AuctionListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [auctions, setAuctions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    status: searchParams.get('status') || 'active',
    sort: searchParams.get('sort') || '-createdAt',
    page: Number(searchParams.get('page')) || 1,
  });

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: 12,
        sort: filters.sort,
      };
      if (filters.search) params.search = filters.search;
      if (filters.category && filters.category !== 'All') params.category = filters.category;
      if (filters.status) params.status = filters.status;

      const res = await auctionService.getAll(params);
      setAuctions(res.data.auctions);
      setPagination(res.data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAuctions();
    // Sync filters to URL
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category !== 'All') params.category = filters.category;
    if (filters.status !== 'active') params.status = filters.status;
    if (filters.sort !== '-createdAt') params.sort = filters.sort;
    if (filters.page > 1) params.page = filters.page;
    setSearchParams(params, { replace: true });
  }, [filters, fetchAuctions]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: key !== 'page' ? 1 : value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: 'All', status: 'active', sort: '-createdAt', page: 1 });
  };

  const hasActiveFilters = filters.search || filters.category !== 'All' || filters.status !== 'active' || filters.sort !== '-createdAt';

  return (
    <div className="pt-16 min-h-screen">
      {/* Header */}
      <div className="bg-dark-700/50 border-b border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Live Auctions</h1>
          <p className="text-slate-400">
            {loading ? 'Loading...' : `${pagination.total} auction${pagination.total !== 1 ? 's' : ''} found`}
          </p>

          {/* Search bar */}
          <div className="mt-5 flex gap-3">
            <div className="relative flex-1 max-w-xl">
              <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
                placeholder="Search auctions..."
                className="input pl-11 bg-dark-800"
              />
              {filters.search && (
                <button
                  onClick={() => updateFilter('search', '')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary gap-2 ${showFilters ? 'border-primary-500 text-primary-400' : ''}`}
            >
              <FiFilter size={16} /> Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary-500" />
              )}
            </button>
            <div className="hidden sm:flex items-center gap-1 bg-dark-800 border border-dark-600 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary-500/20 text-primary-400' : 'text-slate-500 hover:text-white'}`}
              >
                <FiGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary-500/20 text-primary-400' : 'text-slate-500 hover:text-white'}`}
              >
                <FiList size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter panel */}
        {showFilters && (
          <div className="card border border-dark-600 p-5 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Filter Auctions</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                  <FiX size={12} /> Clear all
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => updateFilter('category', cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        filters.category === cat
                          ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                          : 'bg-dark-800 border-dark-600 text-slate-400 hover:border-dark-500 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                <div className="flex gap-2">
                  {[
                    { value: 'active', label: '🟢 Active' },
                    { value: 'ended', label: '⚪ Ended' },
                    { value: '', label: '🔵 All' },
                  ].map(({ value, label }) => (
                    <button
                      key={label}
                      onClick={() => updateFilter('status', value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        filters.status === value
                          ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                          : 'bg-dark-800 border-dark-600 text-slate-400 hover:border-dark-500 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={e => updateFilter('sort', e.target.value)}
                  className="input text-sm"
                >
                  {SORT_OPTIONS.map(({ label, value }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {[...Array(12)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-44 bg-dark-600 rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-dark-600 rounded w-3/4" />
                  <div className="h-3 bg-dark-600 rounded w-1/2" />
                  <div className="h-6 bg-dark-600 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-display font-bold text-white mb-2">No auctions found</h3>
            <p className="text-slate-400 mb-6">Try adjusting your filters or search terms</p>
            <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
          </div>
        ) : (
          <>
            <div className={`grid gap-5 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 max-w-2xl'
            }`}>
              {auctions.map(auction => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => updateFilter('page', filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="btn-secondary p-2 disabled:opacity-40"
                >
                  <FiChevronLeft size={18} />
                </button>

                <div className="flex gap-1">
                  {[...Array(Math.min(pagination.pages, 7))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => updateFilter('page', page)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                          filters.page === page
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-700 text-slate-400 hover:bg-dark-600 hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => updateFilter('page', filters.page + 1)}
                  disabled={filters.page >= pagination.pages}
                  className="btn-secondary p-2 disabled:opacity-40"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuctionListing;
