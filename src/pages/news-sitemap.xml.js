import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog');
  const siteUrl = context.site?.toString() || 'https://www.aitechsafar.com';

  // Google News sitemaps should only include articles from the last 48 hours,
  // but we include all recent articles (last 30 days) for broader discovery coverage.
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentPosts = posts
    .filter(post => post.data.pubDate >= thirtyDaysAgo)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const newsItems = recentPosts.map(post => {
    const postUrl = `${siteUrl}/${post.id}.html`;
    const pubDate = post.data.pubDate.toISOString();
    const title = post.data.title
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    return `  <url>
    <loc>${postUrl}</loc>
    <news:news>
      <news:publication>
        <news:name>AI Tech Safar</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsItems}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
