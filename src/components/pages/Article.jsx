import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import Pagination from "../ui/Pagination";
import {
  downloadArticleCover,
  getArticles,
} from "../../services/ArticleService";

// const mockArticles = [
//   {
//     id: "a1",
//     title: "Sample Article 1",
//     excerpt: "A quick look at how small retailers can leverage software to cut waste and stabilise prices.",
//     image: "https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1200&auto=format&fit=crop",
//     publishedAt: "2025-10-01T10:00:00Z",
//     body: `<p>This is a sample article body. Replace with real HTML or render markdown.</p><p>Tip: fetch article content from your CMS and sanitize HTML.</p>`
//   },
//   // duplicate/other items for pagination...
//   {
//     id: "a2",
//     title: "Sample Article 2",
//     excerpt: "UX patterns and micro-animations that increase conversions in 2025.",
//     image: "https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1200&auto=format&fit=crop",
//     publishedAt: "2025-09-18T09:00:00Z",
//     body: "<p>Content...</p>"
//   },
//   // add several items so pagination shows multiple pages
//   ...Array.from({ length: 14 }).map((_, i) => ({
//     id: `a${i + 3}`,
//     title: `Sample Article ${i + 3}`,
//     excerpt: `Short excerpt for sample article ${i + 3}.`,
//     image: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop",
//     publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
//     body: `<p>Sample article body ${i + 3}.</p>`
//   }))
// ];

export default function ArticlesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const perPage = 6;

  // For real app, fetch server-side with page/perPage params.
  // const total = mockArticles.length;
  // const pages = Math.max(1, Math.ceil(total / perPage));
  // const pageItems = useMemo(() => mockArticles.slice((page - 1) * perPage, page * perPage), [page]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: perPage,
    pages: 1,
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const res = await getArticles({
          page,
          limit: perPage,
          sortBy: "created_at",
          sortOrder: "DESC",
          // search: searchTerm || undefined,
        });

        setArticles(res.data.articles || []);
        setPagination(res.data.pagination || {});
      } catch (err) {
        console.error("Failed to load articles", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [page]);

  const truncateWords = (text, limit = 20) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= limit) return text;
    return words.slice(0, limit).join(" ") + "...";
  };

  return (
    <div className="  dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-8xl mx-auto px-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Articles
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Latest posts published by admins. Tap to read in full.
            </p>
          </div>
        </header>

        <main>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a) => (
              <motion.article
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow hover:shadow-lg transition"
              >
                <Link to={`/article/${a.id}`} className="block">
                  <div className="h-44 w-full overflow-hidden">
                    <img
                      src={
                        a.coverPhoto
                          ? downloadArticleCover(a.id)
                          : "https://images.unsplash.com/photo-1503264116251-35a269479413?q=80&w=1200&auto=format&fit=crop"
                      }
                      alt={a.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {a.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">
                      {truncateWords(a.description, 20) ||
                        "No description available"}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-300">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-[#1a7f4d] dark:text-[#5DEE92] font-medium">
                        Read
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>

          <div className="mt-8 flex items-center justify-center">
            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              setPage={setPage}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
