"use client";

import { BlogPost, type BlogContent } from "@prisma/client";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { useState, type FormEvent } from "react";

import Button from "@components/admin/Button";
import { languages } from "@utils/locale-to-lang";

const FileUploader = dynamic(() => import("@components/admin/FileUploader"), {
  ssr: false,
});

const ImageGallery = dynamic(() => import("@components/admin/ImageGallery"), {
  ssr: false,
});

const ComponentGallery = dynamic(
  () => import("@components/admin/ComponentGallery"),
  {
    ssr: false,
  }
);
const PromptTL = dynamic(() => import("@components/admin/PromptGenerator"), {
  ssr: false,
});
const PromptImproveGenerator = dynamic(
  () => import("@components/admin/PromptImproveGenerator"),
  {
    ssr: false,
  }
);
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type Props = {
  onSubmit: (event: any) => void;
  onContentChange: (content: string) => void;
  isLoading: boolean;
  post?: BlogPost;
  initialData?: BlogContent;
  components: any[];
};

function BlogPostForm({
  onSubmit,
  isLoading,
  onContentChange,
  post,
  initialData,
  components,
}: Props) {
  const [expanded, setExpanded] = useState<boolean>(
    !initialData?.id ? true : false
  );
  const [title, setTitle] = useState<string>(initialData?.title || "");
  const [description, setDescription] = useState<string>(
    initialData?.description || ""
  );
  const [image, setImage] = useState<string>(initialData?.image || "");
  const [tags, setTags] = useState<string>(post?.tags || "");
  const [isPublished, setIsPublished] = useState<boolean>(
    initialData?.published || false
  );
  const [content, setContent] = useState<string>(initialData?.content || "");

  const handleOnSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit(
      Object.assign(Object.fromEntries(formData), {
        content,
        published: isPublished,
      })
    );
  };

  return (
    <form
      onSubmit={handleOnSubmit}
      className="grid grid-cols-1 gap-6 border-r border-zinc-700 bg-zinc-900 p-3"
    >
      <div className="relative">
        <div
          className={clsx("relative flex flex-col gap-2 pb-3 transition-all", {
            "pointer-events-none max-h-[70px] overflow-y-hidden opacity-80 blur-[1px]":
              !expanded,
          })}
        >
          <label className="block">
            <span className="text-zinc-400">Title</span>
            <input
              type="text"
              name="title"
              placeholder={post?.slug || "title"}
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              className="mt-1 block w-full rounded-md border-zinc-700 bg-zinc-900 shadow-sm focus:border-zinc-200 focus:ring focus:ring-zinc-200 focus:ring-opacity-0"
              required
            />
          </label>
          <label className="block">
            <span className="text-zinc-400">Language</span>
            <select
              name="language"
              className="mt-1 block w-full rounded-md border-zinc-700 bg-zinc-900 shadow-sm focus:border-zinc-200 focus:ring focus:ring-zinc-200 focus:ring-opacity-0"
              required
              defaultValue={initialData?.language || "en"}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-zinc-400">Description</span>
            <input
              type="text"
              name="description"
              placeholder="description"
              className="mt-1 block w-full rounded-md border-zinc-700 bg-zinc-900 shadow-sm focus:border-zinc-200 focus:ring focus:ring-zinc-200 focus:ring-opacity-0"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              required
            />
          </label>
          <label className="block">
            <span className="text-zinc-400">image</span>
            <ImageGallery
              game={post?.game ?? "genshin"}
              onSelect={(filename) => setImage(filename.replace("/blog/", ""))}
              render={
                <input
                  type="text"
                  name="image"
                  placeholder={post?.image || "image"}
                  className="mt-1 block w-full rounded-md border-zinc-700 bg-zinc-900 shadow-sm focus:border-zinc-200 focus:ring focus:ring-zinc-200 focus:ring-opacity-0"
                  onChange={(e) => setImage(e.target.value)}
                  value={image}
                  required={post?.image ? false : true}
                />
              }
            />
          </label>
          <label className="block">
            <span className="text-zinc-400">tags</span>
            <input
              type="text"
              name="tags"
              placeholder="tag1,tag2"
              className="mt-1 block w-full rounded-md border-zinc-700 bg-zinc-900 shadow-sm focus:border-zinc-200 focus:ring focus:ring-zinc-200 focus:ring-opacity-0"
              onChange={(e) => setTags(e.target.value)}
              value={tags}
              required
            />
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="rounded border-zinc-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 focus:ring-offset-0"
            />
            <span className="ml-2">Published</span>
          </label>
        </div>
        <div className="absolute bottom-0 left-1/2 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              setExpanded(!expanded);
            }}
            className="absolute bottom-0 left-1/2 z-20 flex -translate-x-1/2 transform items-center gap-1 rounded-xl border border-zinc-600 bg-zinc-900 py-1 pl-3 pr-2 text-sm font-medium text-white transition-all hover:border-white hover:bg-white hover:text-zinc-900"
          >
            {expanded ? "Collapse" : "Expand"}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className={clsx("h-5 w-5", {
                "rotate-180": expanded,
              })}
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      <label className="block">
        <span className="text-zinc-400">Content</span>
        <MDEditor
          className="border-zinc-700 bg-zinc-900"
          preview="edit"
          visibleDragbar={true}
          height={300}
          minHeight={300}
          maxHeight={1500}
          value={content}
          onChange={(e) => {
            setContent(e!);
            onContentChange(e!);
          }}
        />
      </label>
      <div className="flex w-full gap-2">
        <ImageGallery game={post?.game ?? "genshin"} />
        <FileUploader game={post?.game ?? "genshin"} />
        <ComponentGallery
          game={post?.game ?? "genshin"}
          components={components}
        />
        {post?.id ? (
          <PromptTL
            postId={post?.id}
            language={initialData?.language || "en"}
            setTitle={setTitle}
            setDescription={setDescription}
            setContent={setContent}
            setIsPublished={setIsPublished}
          />
        ) : (
          <PromptImproveGenerator
            title={title}
            description={description}
            content={content}
            game={post?.game ?? "genshin"}
            language={initialData?.language || "en"}
            setTitle={setTitle}
            setDescription={setDescription}
            setContent={setContent}
            setIsPublished={setIsPublished}
          />
        )}
      </div>
      {/* <div className="flex w-full gap-2">
        <Button
          state="secondary"
          disabled={isLoading}
          className="w-[50%] font-semibold"
        >
          Save
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full font-semibold"
        >
          {isLoading ? "Loading..." : isPublished ? "Unpublish" : "Publish"}
        </Button>
      </div> */}
      <Button type="submit" disabled={isLoading} className="font-semibold">
        {isLoading ? "Loading..." : "Submit"}
      </Button>
    </form>
  );
}

export default BlogPostForm;
