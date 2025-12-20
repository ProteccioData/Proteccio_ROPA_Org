import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getArticleById,
  downloadArticleCover,
} from "../../services/ArticleService";
import { useToast } from "../ui/ToastProvider";

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

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    async function loadArticle() {
      try {
        setLoading(true);
        const res = await getArticleById(id);
        setArticle(res.data.article);
      } catch (err) {
        console.error("Failed to load article", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [id]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/article/${article.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: shareUrl,
        });
        return;
      } catch (err) {
        console.error("Failed to share article", err);
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      addToast("success", "Link copied to clipboard");
    } catch (err) {
      addToast("error", "Failed to copy link");
    }
  }

  if (error || !article) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl border shadow text-center">
          <h2 className="text-xl font-semibold">Article not found</h2>
          <button
            onClick={() => navigate("/articles")}
            className="mt-4 px-3 py-2 rounded-md border"
          >
            Back to articles
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 pt-24">
        <div className="text-gray-600 dark:text-gray-300">
          Loading article...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gray-900 transition-colors duration-300 pt-8">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow"
        >
          <div className="h-64 w-full overflow-hidden">
            <img
              src={
                article.coverPhoto
                  ? downloadArticleCover(article.id)
                  : "https://images.unsplash.com/photo-1503264116251-35a269479413?q=80&w=1200&auto=format&fit=crop"
              }
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {article.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {new Date(article.createdAt).toLocaleString()}
            </p>

            <article className="prose dark:prose-invert mt-6 dark:text-gray-300">
              {/* example body rendering — in a real app convert markdown to HTML safely */}
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </article>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => navigate("/articles")}
                className="px-3 py-2 rounded-md border dark:text-white cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleShare}
                className="px-3 py-2 bg-[#5DEE92] text-white dark:text-black cursor-pointer rounded-md"
              >
                Share
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
