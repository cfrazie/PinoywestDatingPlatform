// GiftStore Component
// Main gift browsing and purchasing interface

import React, { useState, useEffect } from 'react';
import { useGiftStore } from '../../hooks/useGiftStore';
import type { GiftFilters, GiftCategory, GiftType } from '../../types/gift.types';
import { GIFT_CATEGORY_LABELS } from '../../types/gift.types';
import { Gift, Heart, Sparkles, ShoppingCart } from 'lucide-react';

interface GiftStoreProps {
  userId?: string;
  onSelectGift?: (giftId: string) => void;
}

export function GiftStore({ userId, onSelectGift }: GiftStoreProps) {
  const { catalog, loading, error, fetchCatalog } = useGiftStore(userId);
  const [filters, setFilters] = useState<GiftFilters>({});
  const [selectedCategory, setSelectedCategory] = useState<GiftCategory | undefined>();
  const [selectedType, setSelectedType] = useState<GiftType | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCatalog(filters);
  }, [filters, fetchCatalog]);

  const handleCategoryChange = (category: GiftCategory | undefined) => {
    setSelectedCategory(category);
    setFilters(prev => ({ ...prev, category }));
  };

  const handleTypeChange = (type: GiftType | undefined) => {
    setSelectedType(type);
    setFilters(prev => ({ ...prev, type }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, searchTerm }));
  };

  const categories: (GiftCategory | undefined)[] = [
    undefined,
    'virtual_romantic',
    'virtual_friendly',
    'virtual_premium',
    'physical_flowers',
    'physical_jewelry',
    'physical_food',
    'physical_experience',
    'physical_tech',
    'physical_custom',
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          <Gift className="inline-block w-10 h-10 mr-2 text-pink-500" />
          Gift Store
        </h1>
        <p className="text-gray-600">
          Send special gifts to your loved ones
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search gifts..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Type Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => handleTypeChange(undefined)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !selectedType
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => handleTypeChange('virtual')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedType === 'virtual'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Sparkles className="inline-block w-4 h-4 mr-1" />
            Virtual Gifts
          </button>
          <button
            onClick={() => handleTypeChange('physical')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedType === 'physical'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ShoppingCart className="inline-block w-4 h-4 mr-1" />
            Physical Gifts
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category || 'all'}
              onClick={() => handleCategoryChange(category)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category ? GIFT_CATEGORY_LABELS[category] : 'All Categories'}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <p className="mt-4 text-gray-600">Loading gifts...</p>
        </div>
      )}

      {/* Gift Grid */}
      {!loading && catalog && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {catalog.gifts.map((gift) => (
            <div
              key={gift.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => onSelectGift?.(gift.id)}
            >
              <div className="aspect-square bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                <span className="text-6xl">
                  {gift.type === 'virtual' ? '✨' : '🎁'}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{gift.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {gift.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-pink-600">
                      ${gift.price_usd.toFixed(2)}
                    </span>
                    {gift.price_php && (
                      <span className="text-sm text-gray-500 ml-2">
                        ₱{gift.price_php.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {gift.type === 'virtual' && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      Virtual
                    </span>
                  )}
                  {gift.type === 'physical' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Physical
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && catalog && catalog.gifts.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No gifts found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters or search term
          </p>
        </div>
      )}

      {/* Pagination */}
      {catalog && catalog.total > catalog.pageSize && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: Math.ceil(catalog.total / catalog.pageSize) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchCatalog(filters, page)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                catalog.page === page
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
