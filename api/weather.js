export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // Try multiple RSS sources
    const feeds = [
      "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
      "https://www.thehindu.com/news/national/feeder/default.rss",
      "https://feeds.feedburner.com/ndtvnews-top-stories"
    ];

    for (const url of feeds) {
      try {
        const r = await fetch(url, { headers: { "User-Agent": "ULife/1.0" } });
        if (!r.ok) continue;
        const xml = await r.text();

        // Extract first 3 items from RSS
        const items = [];
        const matches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi);
        for (const m of matches) {
          const titleMatch = m[1].match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
          if (titleMatch && items.length < 3) {
            let title = titleMatch[1].trim().replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
            if (title && title.length > 10) items.push(title);
          }
        }

        if (items.length > 0) {
          return res.status(200).json({ headlines: items, source: url.includes('timesofindia') ? 'Times of India' : url.includes('thehindu') ? 'The Hindu' : 'NDTV' });
        }
      } catch (e) { continue; }
    }

    res.status(200).json({ headlines: [], source: null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
