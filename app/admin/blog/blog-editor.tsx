"use client";

import type { BlogContent, BlogPost } from "@prisma/client";
import { compileMDX } from "next-mdx-remote/rsc";
import { useRouter } from "next/navigation";
import { useState } from "react";
import remarkGfm from "remark-gfm";

import BlogPostForm from "@components/admin/BlogPostForm";
import { componentsList as genshinComps } from "@components/genshin/PostRender";
import { componentsList as hsrComps } from "@components/hsr/PostRender";
import { componentsList as zenlessComps } from "@components/zenless/PostRender";
import { useDynamicComponents } from "@hooks/use-dynamic-components";
import { Session } from "@lib/session";

type Props = {
  post: BlogPost;
  postContent: BlogContent;
  content: unknown;
  session: Session;
};

export default function BlogEditor({
  post,
  postContent,
  session,
  content,
}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [compiled, setCompiled] = useState<any>(content);
  let comps: any = genshinComps;

  if (post.game === "hsr") {
    comps = hsrComps;
  } else if (post.game === "zenless") {
    comps = zenlessComps;
  }

  const components = useDynamicComponents("[ALL]", comps);

  const router = useRouter();

  const onContentChange = (content: string) => {
    compileMDX({
      source: content,
      components: components,
      options: {
        mdxOptions: {
          development: process.env.NEXT_PUBLIC_VERCEL_ENV !== "production",
          remarkPlugins: [remarkGfm],
        },
      },
    })
      .then((res) => {
        setCompiled(res.content);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  async function onSubmit(data: any) {
    console.log("onSubmit", data);
    setIsLoading(true);
    setError(null);

    const method = postContent.id ? "PATCH" : "POST";

    try {
      const response = await fetch("/api/blog", {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(
          Object.assign(data, {
            id: postContent.id,
            postId: post.id,
            game: post.game,
            authorName: session.user?.globalName || "GenshinBuilds",
            authorAvatar: session.user?.image || "gb.png",
            authorLink:
              session.user?.link || "https://twitter.com/genshin_builds",
          })
        ),
      });

      if (!response.ok) {
        throw new Error("Failed to submit the data. Please try again.");
      }

      router.push(`/admin/blog`);
    } catch (error: any) {
      // Handle error if necessary
      setError(error.message);
      console.error(error);
    } finally {
      setIsLoading(false); // Set loading to false when the request completes
    }
  }

  return (
    <div className="flex">
      <div className="mr-6 w-[600px]">
        {error && <div style={{ color: "red" }}>{error}</div>}
        <BlogPostForm
          isLoading={isLoading}
          onSubmit={onSubmit}
          onContentChange={onContentChange}
          initialData={postContent}
          post={post}
          components={comps}
        />
      </div>
      <div className="relative mx-auto max-w-screen-md">
        <section className="prose prose-invert mt-4 max-w-none">
          {compiled}
        </section>
      </div>
    </div>
  );
}
