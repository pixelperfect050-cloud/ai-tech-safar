import { getCollection, render } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog');
  
  const exportData = await Promise.all(
    posts
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map(async (post) => {
        const { remarkPluginFrontmatter } = await render(post);
        return {
          id: post.id,
          slug: post.id.split('/').pop(),
          url: `/${post.id}.html`,
          title: post.data.title,
          description: post.data.description,
          pubDate: post.data.pubDate.toISOString(),
          updatedDate: post.data.updatedDate ? post.data.updatedDate.toISOString() : null,
          category: post.data.category,
          tags: post.data.tags || [],
          heroImage: post.data.heroImage || null,
          featured: post.data.featured || false,
          author: post.data.author || "AI Tech Safar",
          body: post.body,
        };
      })
  );

  return new Response(JSON.stringify({
    exportDate: new Date().toISOString(),
    totalPosts: exportData.length,
    site: context.site?.toString() || "https://www.aitechsafar.com",
    posts: exportData,
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ai-tech-safar-export.json"',
    },
  });
}
