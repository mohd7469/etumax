import React, { useEffect, useState } from 'react';
import { useSeo } from '@/context/SeoContext';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const ProductSitemapRenderer = () => {
  const { generateSitemap } = useSeo();
  const [urls, setUrls] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    // Generate the raw XML string
    const xmlContent = generateSitemap('product');

    // Parse XML to extract data for the HTML view
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
      const urlNodes = xmlDoc.getElementsByTagName('url');

      const parsedUrls = Array.from(urlNodes).map(node => ({
        loc: node.getElementsByTagName('loc')[0]?.textContent || '',
        lastmod: node.getElementsByTagName('lastmod')[0]?.textContent || '-',
        changefreq: node.getElementsByTagName('changefreq')[0]?.textContent || '-',
        priority: node.getElementsByTagName('priority')[0]?.textContent || '-',
      }));

      setUrls(parsedUrls);
    } catch (error) {
      console.error("Failed to parse sitemap XML:", error);
    }
  }, [generateSitemap]);

  const totalPages = Math.ceil(urls.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUrls = urls.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="bg-[#0f111a] text-gray-300 min-h-screen p-6 md:p-10 font-sans">
      <Helmet>
        <title>Product Sitemap (HTML View)</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <div className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
          <span>&gt;</span>
          <span>Sitemaps</span>
          <span>&gt;</span>
          <span className="text-gray-300">Product Sitemap View</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-6">Sitemap View: Products</h1>

        <p className="text-sm text-gray-400 mb-6">
          This is a styled representation of the product sitemap. It contains {urls.length} URLs.
        </p>

        {/* Sitemap Navigation Links */}
        <div className="flex flex-wrap gap-4 text-sm mb-8 bg-[#1a1d27] p-4 rounded-lg border border-gray-800">
          <Link to="/sitemap.xml" className="text-blue-400 hover:text-blue-300 font-medium">Main Sitemap Index</Link>
          <Link to="/sitemaps/products-view" className="text-white font-medium underline underline-offset-4 decoration-blue-500">Product Sitemap</Link>
          <Link to="/sitemaps/categories-view" className="text-blue-400 hover:text-blue-300 font-medium">Category Sitemap</Link>
          <Link to="/page-sitemap.xml" className="text-blue-400 hover:text-blue-300 font-medium">Pages Sitemap</Link>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#161925] shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1d27] text-gray-200 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-gray-700 w-16">#</th>
                <th className="p-4 font-semibold border-b border-gray-700">Product URL</th>
                <th className="p-4 font-semibold border-b border-gray-700 w-40">Last Modified</th>
                <th className="p-4 font-semibold border-b border-gray-700 w-40">Change Freq</th>
                <th className="p-4 font-semibold border-b border-gray-700 w-24">Priority</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-400 divide-y divide-gray-800">
              {currentUrls.map((item, index) => (
                <tr key={index} className="hover:bg-[#1c2030] transition-colors">
                  <td className="p-4">{startIndex + index + 1}</td>
                  <td className="p-4">
                    <a href={item.loc} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all">
                      {item.loc}
                    </a>
                  </td>
                  <td className="p-4">{item.lastmod}</td>
                  <td className="p-4">{item.changefreq}</td>
                  <td className="p-4">{item.priority}</td>
                </tr>
              ))}
              {currentUrls.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No products found in the sitemap.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 bg-[#1a1d27] p-4 rounded-lg border border-gray-800">
            <span className="text-sm text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, urls.length)} of {urls.length} URLs
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 rounded bg-[#252a3b] text-gray-300 hover:bg-[#32394d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm px-3 py-1 bg-[#161925] rounded border border-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded bg-[#252a3b] text-gray-300 hover:bg-[#32394d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSitemapRenderer;