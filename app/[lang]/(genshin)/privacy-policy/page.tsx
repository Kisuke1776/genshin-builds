import { getContentBySlug } from "@lib/mdApi";
import { i18n } from "i18n-config";
import { MDXRemote } from "next-mdx-remote/rsc";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const langs = i18n.locales;

  return langs.map((lang) => ({ lang }));
}

export default async function PrivacyPolicy() {
  const post = getContentBySlug("privacy-policy");
  return (
    <div className="card">
      <article className="prose prose-invert max-w-none">
        <MDXRemote source={post} />
      </article>
    </div>
  );
}
