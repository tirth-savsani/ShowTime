import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import Button from '../common/Button.jsx';

const FILTER_SECTIONS = [
  {
    id: 'language',
    title: 'Languages',
    options: [
      'Hindi',
      'English',
      'Tamil',
      'Telugu',
      'Kannada',
      'Malayalam',
      'Marathi',
      'Bengali',
      'Gujarati',
      'Punjabi',
    ],
  },
  {
    id: 'genre',
    title: 'Genres',
    options: [
      'Action',
      'Adventure',
      'Animation',
      'Comedy',
      'Crime',
      'Drama',
      'Horror',
      'Romance',
      'Sci-Fi',
      'Thriller',
    ],
  },
  {
    id: 'format',
    title: 'Format',
    options: ['2D', '3D', 'IMAX', '4DX'],
  },
];

export const FilterSidebar = ({
  filters = { language: '', genre: '', format: '' },
  onFilterChange,
  onClearAll,
  isMobileOpen = false,
  onMobileClose,
  className = '',
}) => {
  // Collapsible state for each section (open by default)
  const [collapsed, setCollapsed] = useState({
    language: false,
    genre: false,
    format: false,
  });

  const toggleCollapse = (sectionId) => {
    setCollapsed((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const hasActiveFilters = Boolean(
    filters.language || filters.genre || filters.format
  );

  const filterContent = (
    <div className="space-y-4">
      {/* Header with Clear button */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="text-base font-bold text-ink flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span>Filters</span>
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Accordion Sections */}
      {FILTER_SECTIONS.map((section) => {
        const isCollapsed = collapsed[section.id];
        const activeValue = filters[section.id] || '';

        return (
          <div
            key={section.id}
            className="bg-white rounded-md border border-border overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggleCollapse(section.id)}
              className="w-full px-4 py-3 flex items-center justify-between text-left font-semibold text-sm text-ink hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>{section.title}</span>
                {activeValue && (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
              </span>
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4 text-muted" />
              ) : (
                <ChevronUp className="w-4 h-4 text-muted" />
              )}
            </button>

            {!isCollapsed && (
              <div className="p-3 pt-0 flex flex-wrap gap-2">
                {section.options.map((opt) => {
                  const isSelected = activeValue.toLowerCase() === opt.toLowerCase();
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        onFilterChange(
                          section.id,
                          isSelected ? '' : opt
                        )
                      }
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-white border-primary font-bold shadow-xs'
                          : 'bg-white text-ink border-border hover:border-primary/50 hover:text-primary font-medium'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (260px) */}
      <aside
        className={`hidden lg:block w-[260px] flex-shrink-0 sticky top-24 self-start ${className}`}
      >
        {filterContent}
      </aside>

      {/* Mobile / Tablet Bottom Sheet Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />

          {/* Sheet Modal */}
          <div className="relative bg-white rounded-t-2xl max-h-[85vh] flex flex-col z-10 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle & Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-ink text-base">
                <Filter className="w-4 h-4 text-primary" />
                <span>Filters</span>
              </div>
              <button
                type="button"
                onClick={onMobileClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-gray-100 transition-colors"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filters Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {filterContent}
            </div>

            {/* Sheet Footer Action */}
            <div className="p-4 border-t border-border bg-gray-50 flex items-center gap-3">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    onClearAll();
                  }}
                >
                  Clear All
                </Button>
              )}
              <Button
                variant="primary"
                className="flex-1"
                onClick={onMobileClose}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSidebar;
