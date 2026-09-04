"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { BlogCard } from "@/lib/blog-card";

export function BlogIndex({ posts }: { posts: BlogCard[] }) {
  const topics = useMemo(() => {
    const unique = [...new Set(posts.map((post) => post.topic))];
    return ["All", ...unique];
  }, [posts]);
  const [topic, setTopic] = useState("All");
  const visible = topic === "All" ? posts : posts.filter((post) => post.topic === topic);

  return (
    <section className="blog-browse" id="articles">
      <div className="wrap">
        <header className="blog-browse-head">
          <h2>All articles</h2>
          <p>
            Browse {posts.length} articles{topic === "All" ? ", or filter by topic." : ` in ${topic}.`}
          </p>
          <div className="blog-filters" role="group" aria-label="Filter articles by topic">
            {topics.map((item) => (
              <button
                key={item}
                type="button"
                className={item === topic ? "is-on" : undefined}
                onClick={() => setTopic(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </header>
        <ul className="blog-grid">
          {visible.map((post) => (
            <li key={post.path}>
              <Link href={post.path}>
                <figure>
                  {post.src ? (
                    <img src={post.src} alt="" width={480} height={300} loading="lazy" />
                  ) : null}
                  <span>{post.topic}</span>
                </figure>
                {post.publishedTime ? (
                  <time dateTime={post.publishedTime}>{post.publishedLabel}</time>
                ) : null}
                <h3>{post.h1}</h3>
                <p>{post.excerpt}</p>
                <em>Read article</em>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
