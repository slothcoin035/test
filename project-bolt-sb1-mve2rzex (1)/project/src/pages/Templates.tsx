import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { FileText, ArrowRight } from 'lucide-react';

const TEMPLATE_CATEGORIES = [
  { id: 'legal', name: 'Legal Documents', count: 12 },
  { id: 'business', name: 'Business', count: 8 },
  { id: 'personal', name: 'Personal', count: 15 },
  { id: 'academic', name: 'Academic', count: 6 },
];

const FEATURED_TEMPLATES = [
  {
    id: 1,
    name: 'Non-Disclosure Agreement',
    description: 'Standard NDA template for business confidentiality',
    category: 'legal',
  },
  {
    id: 2,
    name: 'Resume Template',
    description: 'Professional resume with modern design',
    category: 'personal',
  },
  {
    id: 3,
    name: 'Business Proposal',
    description: 'Comprehensive business proposal template',
    category: 'business',
  },
];

const Templates = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Document Templates</h1>
        <Button variant="outline">
          Request Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TEMPLATE_CATEGORIES.map((category) => (
          <div
            key={category.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
          >
            <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {category.count} templates
            </p>
            <Button variant="ghost" className="w-full">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Featured Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_TEMPLATES.map((template) => (
            <Link
              key={template.id}
              to={`/editor?template=${template.id}`}
              className="block group"
            >
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {template.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-500">
                  {template.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {template.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Templates;