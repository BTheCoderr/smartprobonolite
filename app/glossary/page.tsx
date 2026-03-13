'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { glossaryTerms, categories, type GlossaryTerm } from '@/lib/data/glossary';

const TERMS_PER_PAGE = 20;

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Terms');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTerms = useMemo(() => {
    let filtered = glossaryTerms;

    // Filter by category
    if (selectedCategory !== 'All Terms') {
      filtered = filtered.filter(term => term.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(term =>
        term.term.toLowerCase().includes(query) ||
        term.definition.toLowerCase().includes(query) ||
        term.category.toLowerCase().includes(query)
      );
    }

    // Sort alphabetically
    return filtered.sort((a, b) => a.term.localeCompare(b.term));
  }, [searchQuery, selectedCategory]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTerms.length / TERMS_PER_PAGE);
  const startIndex = (currentPage - 1) * TERMS_PER_PAGE;
  const endIndex = startIndex + TERMS_PER_PAGE;
  const paginatedTerms = filteredTerms.slice(startIndex, endIndex);

  const toggleTerm = (term: string) => {
    const isExpanding = expandedTerm !== term;
    setExpandedTerm(expandedTerm === term ? null : term);
    
    // Smooth scroll to expanded term after a brief delay to allow DOM update
    if (isExpanding) {
      setTimeout(() => {
        const element = document.getElementById(`term-${term}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              SmartProBono <span className="text-blue-600">Lite</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/demo"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0">
              📚
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-[1.3] pb-1">
              Legal Glossary
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Understand legal terms and concepts to better navigate your case. 
            Search by term, definition, or category.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 border border-gray-200">
          {/* Search Bar */}
          <div className="mb-6">
            <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
              Search Terms
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a legal term or definition..."
                className="w-full px-6 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Filter by Category
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-blue-600">{filteredTerms.length}</span> of{' '}
              <span className="font-semibold">{glossaryTerms.length}</span> terms
              {filteredTerms.length > TERMS_PER_PAGE && (
                <span className="ml-2">
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Terms List */}
        {filteredTerms.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No terms found</h3>
            <p className="text-gray-600">
              Try adjusting your search or selecting a different category.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-8">
              {paginatedTerms.map((term) => (
                <div id={`term-${term.term}`} key={term.term}>
                  <TermCard
                    term={term}
                    isExpanded={expandedTerm === term.term}
                    onToggle={() => toggleTerm(term.term)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Footer Note */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800 text-center">
            <strong>Note:</strong> This glossary provides general definitions and is not a substitute for legal advice. 
            Consult with an attorney for advice specific to your situation.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-12 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              ⚖️
            </div>
            <div className="text-2xl font-bold">SmartProBono</div>
          </div>
          <p className="text-xl text-blue-200 mb-6">
            Built in Rhode Island with purpose · Powered by Ermi AI
          </p>
          <div className="flex justify-center gap-6 text-blue-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/demo" className="hover:text-white transition-colors">Demo</Link>
            <Link href="/glossary" className="hover:text-white transition-colors">Glossary</Link>
          </div>
          <div className="mt-6 text-blue-400">
            <p>&copy; 2025 SmartProBono. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface TermCardProps {
  term: GlossaryTerm;
  isExpanded: boolean;
  onToggle: () => void;
}

function TermCard({ term, isExpanded, onToggle }: TermCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 md:px-6 md:py-5 text-left flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-start flex-wrap gap-2 md:gap-3 mb-2">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 break-words">{term.term}</h3>
            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full whitespace-nowrap flex-shrink-0">
              {term.category}
            </span>
          </div>
          {!isExpanded && (
            <p className="text-gray-600 text-sm md:text-base line-clamp-2 leading-relaxed">
              {term.definition.substring(0, 120)}...
            </p>
          )}
        </div>
        <div className="flex-shrink-0 pt-1">
          <svg
            className={`w-5 h-5 md:w-6 md:h-6 text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 py-4 md:px-6 md:py-5 bg-gray-50 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
          <div className="mb-4 last:mb-0">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Definition</h4>
            <p className="text-gray-800 leading-relaxed text-sm md:text-base">{term.definition}</p>
          </div>

          {term.relatedTerms && term.relatedTerms.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Related Terms</h4>
              <div className="flex flex-wrap gap-2">
                {term.relatedTerms.map((relatedTerm) => (
                  <span
                    key={relatedTerm}
                    className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                  >
                    {relatedTerm}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

