import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import Pagination from "../ui/Pagination";
import {
  downloadArticleCover,
  getArticles,
} from "../../services/ArticleService";
import { useTranslation } from "react-i18next";
import { addTranslationNamespace } from "../../i18n/config";

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
  const [ready , setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      addTranslationNamespace("en" , "pages" , "Article"),
      addTranslationNamespace("hindi" , "pages" , "Article"),
      addTranslationNamespace("sanskrit" , "pages" , "Article"),
      addTranslationNamespace("telugu" , "pages" , "Article"),
    ]).then(() => setReady(true))
  })

  const { t } = useTranslation("pages" , {keyPrefix: "Article"})

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

  if (!ready) return <div>Loading....</div>

  return (
    <div className="  dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-8xl mx-auto px-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("articles")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("latest_posts_published_by_admins_tap_to_read_in_fu")}
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
                        {t("read")}
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
