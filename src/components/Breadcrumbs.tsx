
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { ViewState } from '../types';

interface BreadcrumbItem {
  label: string;
  view?: ViewState;
  companyId?: string | null;
  context?: 'COMPLIANCE' | 'DATA_PROTECTION';
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (view: ViewState, itemId?: string, companyId?: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6 animate-fade-in">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight size={14} className="text-gray-300" />}
          <button
            onClick={() => item.view && onNavigate(item.view, undefined, item.companyId || undefined)}
            className={`hover:text-brand-primary transition-colors flex items-center gap-1.5 ${
              index === items.length - 1 ? 'text-brand-primary font-bold' : ''
            }`}
            disabled={!item.view || index === items.length - 1}
          >
            {index === 0 && <Home size={14} />}
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};
