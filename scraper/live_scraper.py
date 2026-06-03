import asyncio
import json
from playwright.async_api import async_playwright


async def scrape_all_reviews():
    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp("http://localhost:9222")
        context = browser.contexts[0]
        page = await context.new_page()

        all_reviews = []

        for page_num in range(1, 11):
            url = f"https://www.capterra.com/p/157515/Spendesk/reviews/?page={page_num}"
            print(f"Page {page_num}/10...")

            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(3000)

            reviews = await page.evaluate("""
                () => {
                    const ratingEls = document.querySelectorAll('[data-testid="rating"]');
                    const results = [];

                    ratingEls.forEach((el) => {
                        // Find the card container
                        let card = el.parentElement;
                        for (let i = 0; i < 10; i++) {
                            if (!card) break;
                            if ((card.className || '').indexOf('p-6') !== -1) break;
                            card = card.parentElement;
                        }
                        if (!card) return;

                        var cardText = card.textContent.trim();

                        // --- Get leaf text nodes in the header (first main child) ---
                        var headerSection = card.children[0];
                        var allEls = headerSection.querySelectorAll('*');
                        var authorInfo = [];
                        allEls.forEach(function(e) {
                            var t = (e.textContent || '').trim();
                            var c = '';
                            if (typeof e.className === 'string') c = e.className;
                            // Only leaf elements with short text (likely author details)
                            if (t && e.children.length === 0 && t.length < 120) {
                                authorInfo.push(t);
                            }
                        });
                        // Filter out UI elements
                        authorInfo = authorInfo.filter(function(t) {
                            return t !== 'Link Copied!' && t.indexOf('icon-') === -1;
                        });

                        // --- Title ---
                        var title = '';
                        var titleMatch = cardText.match(/"([^"]+)"/);
                        if (titleMatch) title = titleMatch[1];

                        // --- Date ---
                        var date = '';
                        var dateMatch = cardText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{1,2},?\\s+\\d{4}/);
                        if (dateMatch) date = dateMatch[0];

                        // --- Used for ---
                        var used_for = '';
                        var usedMatch = cardText.match(/Used the software for:\\s*([^\\n]+)/);
                        if (usedMatch) used_for = usedMatch[1].trim();

                        // Author info: typically [Name, Role, Sector, Used_for, ...]
                        // Filter known strings
                        var filtered = authorInfo.filter(function(t) {
                            return t.indexOf('Used the software for') === -1 &&
                                   t.indexOf('icon-') === -1 &&
                                   t !== 'Link Copied!' &&
                                   t !== 'Like';
                        });

                        // Try to match name by looking for the avatar image
                        var author = '';
                        var role = '';
                        var sector = '';

                        var avatarImg = card.querySelector('[data-testid="reviewer-profile-pic"]');
                        if (avatarImg) {
                            var alt = avatarImg.getAttribute('alt') || '';
                            // alt text is like "Julien G. avatar"
                            var nameFromAlt = alt.replace(/ avatar$/, '').trim();
                            if (nameFromAlt) author = nameFromAlt;
                        }

                        // Get role/sector from text
                        // Remove the "Used the software for:" part and figure out role/sector
                        var headerText = '';
                        if (headerSection) headerText = headerSection.textContent.trim();
                        // Remove "Link Copied!"
                        headerText = headerText.replace('Link Copied!', '');
                        // Remove author name if found
                        if (author) headerText = headerText.replace(author, '');
                        // Remove "Used the software for: X"
                        headerText = headerText.replace(/Used the software for:[^]*$/, '').trim();

                        if (headerText) {
                            // Split by capital letter transitions
                            var parts = headerText.split(/(?=[A-Z][a-z])/).filter(function(p) { return p.trim(); });
                            // Remove "Verified Reviewer" if present
                            parts = parts.filter(function(p) {
                                return p.indexOf('Verified') === -1 && p.indexOf('Reviewer') === -1;
                            });
                            if (parts.length >= 1) role = parts[0].trim();
                            if (parts.length >= 2) sector = parts.slice(1).join('').trim();
                            // Clean up "VR" prefix
                            role = role.replace(/^VR/, '').trim();
                        }

                        // --- Ratings ---
                        var ratings = {};
                        var labels = ['Overall Rating', 'Ease of Use', 'Customer Service', 'Features', 'Value for Money', 'Likelihood to Recommend'];
                        labels.forEach(function(label) {
                            var escaped = label.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
                            var re = new RegExp(escaped + '\\\\s*([\\\\d.]+)%?');
                            var m = cardText.match(re);
                            if (m) {
                                var val = parseFloat(m[1]);
                                if (label === 'Likelihood to Recommend') {
                                    ratings.recommend = val;
                                } else {
                                    ratings[label.toLowerCase().replace(/ /g, '_')] = val;
                                }
                            }
                        });

                        // --- Body ---
                        var body = '';
                        var recIdx = cardText.indexOf('Likelihood to Recommend');
                        if (recIdx >= 0) {
                            body = cardText.slice(recIdx + 30);
                            body = body.replace(/Continue reading.*/, '').trim();
                        }

                        // --- Pros ---
                        var pros = '';
                        var prosMatch = cardText.match(/Pros\\s*([\\s\\S]+?)(?=Negative|$)/);
                        if (prosMatch) pros = prosMatch[1].trim();

                        // --- Cons ---
                        var cons = '';
                        var consMatch = cardText.match(/Cons\\s*([\\s\\S]+?)(?=Review Source|Response from|$)/);
                        if (consMatch) cons = consMatch[1].trim();

                        results.push({
                            author: author,
                            title: title,
                            date: date,
                            role: role,
                            sector: sector,
                            used_for: used_for,
                            overall_rating: ratings.overall_rating || null,
                            ease_of_use: ratings.ease_of_use || null,
                            customer_service: ratings.customer_service || null,
                            features: ratings.features || null,
                            value_for_money: ratings.value_for_money || null,
                            recommend_pct: ratings.recommend || null,
                            pros: pros.slice(0, 500),
                            cons: cons.slice(0, 500),
                            body: body.slice(0, 2000)
                        });
                    });

                    return results;
                }
            """)

            print(f"  -> {len(reviews)} reviews")
            all_reviews.extend(reviews)

        # Dedup by title
        seen = set()
        unique = []
        for r in all_reviews:
            key = (r['title'], r['author'], r['date'])
            if key not in seen and r['title']:
                seen.add(key)
                unique.append(r)

        print(f"\nTotal unique: {len(unique)}")

        with open("scraper/spendesk_reviews.json", "w", encoding="utf-8") as f:
            json.dump({"reviews": unique, "total": len(unique)}, f, indent=2, ensure_ascii=False)

        # Stats
        avg_rating = sum(r['overall_rating'] for r in unique if r['overall_rating']) / max(1, sum(1 for r in unique if r['overall_rating']))
        print(f"Average rating: {avg_rating:.2f}/5")

        for r in unique[:5]:
            print(f"\n  [{r['overall_rating']}/5] {r['title']}")
            print(f"      {r['author']} - {r['role']}")
            if r['sector']: print(f"      Sector: {r['sector']}")
            print(f"      {r['date']} | {r['used_for']}")

        await page.close()

asyncio.run(scrape_all_reviews())
