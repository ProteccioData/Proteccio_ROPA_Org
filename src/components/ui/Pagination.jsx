// src/ui/Pagination.jsx
import React from "react";

export default function Pagination({ page, setPage, pages }) {
  const range = [];
  const maxButtons = 5;
  const half = Math.floor(maxButtons / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(pages, start + maxButtons - 1);
  if (end - start < maxButtons - 1) start = Math.max(1, end - maxButtons + 1);

  for (let i = start; i <= end; i++) range.push(i);

  return (
    <nav aria-label="Pagination" className="inline-flex items-center gap-2 dark:text-white">
      <button onClick={() => setPage(Math.max(1, page - 1))} className="px-3 py-1 rounded-md border cursor-pointer" disabled={page === 1}>
        Prev
      </button>

      {start > 1 && (
        <>
          <button onClick={() => setPage(1)} className="px-3 py-1 rounded-md border ">1</button>
          {start > 2 && <span className="px-2">…</span>}
        </>
      )}

      {range.map((p) => (
        <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded-md cursor-pointer ${p === page ? "bg-[#5DEE92] text-white dark:text-black" : "border"}`}>
          {p}
        </button>
      ))}

      {end < pages && (
        <>
          {end < pages - 1 && <span className="px-2">…</span>}
          <button onClick={() => setPage(pages)} className="px-3 py-1 rounded-md border">{pages}</button>
        </>
      )}

      <button onClick={() => setPage(Math.min(pages, page + 1))} className="px-3 py-1 rounded-md border cursor-pointer" disabled={page === pages}>
        Next
      </button>
    </nav>
  );
}
