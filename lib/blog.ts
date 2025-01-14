import prisma, { BlogImages, type BlogContent, type BlogPost } from "@db/index";
import { deleteObject } from "@utils/s3-client";

export type PaginationOptions = {
  page: number;
  limit: number;
  sort?: "asc" | "desc";
  showDrafts?: boolean;
};

type PaginationResult<T> = {
  data: T[];
  total: number;
  pages: number;
};

export async function getPosts(
  game?: string | null,
  language?: string | null,
  options?: PaginationOptions
): Promise<PaginationResult<BlogPost>> {
  try {
    console.log("getPosts", game, language);
    const { page = 1, limit = 12, sort, showDrafts } = options || {};

    const data = await prisma.blogPost.findMany({
      select: {
        id: true,
        slug: true,
        game: true,
        tags: true,
        published: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        contents: {
          select: {
            id: true,
            published: true,
            title: true,
            language: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      where: {
        game: game === null ? undefined : game,
        // contents: {
        //   every: {
        //     language: language === null ? undefined : language,
        //   }
        // },
        // language: language === null ? undefined : language,
        ...(showDrafts ? {} : { published: true }),
      },
      orderBy: {
        createdAt: sort || "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.blogPost.count({
      where: {
        game: game === null ? undefined : game,
        // language: language === null ? undefined : language,
      },
    });

    const pages = Math.ceil(total / limit);

    return {
      data: data.map(
        (post) =>
          ({
            ...post,
            createdAt: post.createdAt.toISOString() as any,
            updatedAt: post.updatedAt.toISOString() as any,
          }) as any
      ),
      total,
      pages,
    };
  } catch (err) {
    console.log("Error getting posts", err);
    return {
      data: [],
      total: 0,
      pages: 0,
    };
  }
}

export async function getPostContents(
  game?: string | null,
  language?: string | null,
  options?: PaginationOptions
): Promise<PaginationResult<BlogContent & { post: BlogPost }>> {
  try {
    const { page = 1, limit = 12, sort } = options || {};

    const data = await prisma.blogContent.findMany({
      select: {
        id: true,
        description: true,
        title: true,
        content: false,
        post: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        language: language === null ? undefined : language,
        published: true,
        post: {
          game: game === null ? undefined : game,
        },
      },
      orderBy: {
        createdAt: sort || "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.blogPost.count({
      where: {
        game: game === null ? undefined : game,
        // language: language === null ? undefined : language,
      },
    });

    const pages = Math.ceil(total / limit);

    return {
      data: data.map(
        (post) =>
          ({
            ...post,
            createdAt: post.createdAt.toISOString() as any,
            updatedAt: post.updatedAt.toISOString() as any,
          }) as any
      ),
      total,
      pages,
    };
  } catch (err) {
    console.log("Error getting posts", err);
    return {
      data: [],
      total: 0,
      pages: 0,
    };
  }
}

export async function getPostContentById(id: string) {
  const post = await prisma.blogContent.findUnique({
    where: {
      id,
    },
    include: {
      post: true,
    },
  });

  if (!post) {
    return null;
  }

  // transform date to string
  (post as any).createdAt = post.createdAt?.toISOString() || "";
  (post as any).updatedAt = post.updatedAt?.toISOString() || "";

  return post;
}

export async function getPostById(id: string) {
  const post = await prisma.blogPost.findUnique({
    where: {
      id,
    },
  });

  if (!post) {
    return null;
  }

  // transform date to string
  (post as any).createdAt = post.createdAt?.toISOString() || "";
  (post as any).updatedAt = post.updatedAt?.toISOString() || "";

  return post;
}

export async function getPostBySlug(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: {
      slug,
    },
  });

  if (!post) {
    return null;
  }

  // transform date to string
  (post as any).createdAt = post.createdAt?.toISOString() || "";
  (post as any).updatedAt = post.updatedAt?.toISOString() || "";

  return post;
}

export async function getPostContentBySlug(slug: string, language: string) {
  let query ={
    where: {
      post: {
        slug,
      },
      language,
    },
    include: {
      post: true,
    },
  };
  let post = await prisma.blogContent.findFirst(query);

  if (!post && language !== "en") {
    post = await prisma.blogContent.findFirst({
      ...query,
      where: {
        ...query.where,
        language: "en",
      },
    });
  }

  if (!post) {
    return null;
  }

  // transform date to string
  (post as any).createdAt = post.createdAt?.toISOString() || "";
  (post as any).updatedAt = post.updatedAt?.toISOString() || "";

  return post;
}

type PaginationImageResult = {
  data: BlogImages[];
  total: number;
  pages: number;
};

export async function getImages(
  game: string,
  options?: PaginationOptions
): Promise<PaginationImageResult> {
  try {
    const { page = 1, limit = 10 } = options || {};

    const data = await prisma.blogImages.findMany({
      where: {
        game,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.blogImages.count({
      where: {
        game,
      },
    });

    const pages = Math.ceil(total / limit);

    return {
      data,
      total,
      pages,
    };
  } catch (err) {
    console.log("Error getting images", err);
    return {
      data: [],
      total: 0,
      pages: 0,
    };
  }
}

export async function deleteImage(id: string): Promise<boolean> {
  try {
    await prisma.blogImages.delete({
      where: {
        id,
      },
    });

    await deleteObject(id);

    return true;
  } catch (err) {
    console.log("Error deleting image", err);
    return false;
  }
}
