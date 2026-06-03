import asyncio
from playwright.async_api import async_playwright

HTML = """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
@page { margin: 16mm 14mm; size: A4; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; color: #1a1a2e; font-size: 10pt; line-height: 1.45; }

.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 2px solid #2563eb; }
.header h1 { font-size: 16pt; color: #2563eb; }
.header .sub { font-size: 8.5pt; color: #64748b; margin-top: 2px; }
.header .badge { background: #2563eb; color: white; padding: 4px 10px; border-radius: 4px; font-size: 8pt; font-weight: 600; }

.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
.card { background: #f8fafc; border-radius: 6px; padding: 10px 12px; border: 1px solid #e2e8f0; }
.card h3 { font-size: 8.5pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.card .big { font-size: 20pt; font-weight: 700; color: #1e293b; }
.card .desc { font-size: 8pt; color: #64748b; margin-top: 2px; }

.section { margin-bottom: 12px; }
.section h2 { font-size: 11pt; color: #1e293b; margin-bottom: 6px; padding-bottom: 3px; border-bottom: 1px solid #e2e8f0; }

.bar-container { margin: 4px 0; }
.bar-row { display: flex; align-items: center; margin: 3px 0; font-size: 9pt; }
.bar-row .label { width: 24px; text-align: right; margin-right: 6px; font-weight: 600; }
.bar-row .bar-bg { flex: 1; height: 14px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
.bar-row .bar-fill { height: 100%; border-radius: 3px; }
.bar-row .count { width: 28px; text-align: right; font-size: 8pt; color: #64748b; margin-left: 6px; }

.strength-item { margin-bottom: 4px; }
.strength-item .tag { display: inline-block; background: #dcfce7; color: #166534; padding: 1px 6px; border-radius: 3px; font-size: 7.5pt; font-weight: 600; margin-right: 4px; }
.strength-item .text { font-size: 9pt; color: #334155; }
.weakness-item .tag { background: #fee2e2; color: #991b1b; display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 7.5pt; font-weight: 600; margin-right: 4px; }

.recommend-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 8px 12px; margin-top: 8px; }
.recommend-box h4 { font-size: 9pt; color: #1e40af; margin-bottom: 3px; }
.recommend-box ul { list-style: none; font-size: 8.5pt; color: #334155; }
.recommend-box ul li::before { content: "-> "; color: #2563eb; font-weight: 600; }

.footer { margin-top: 10px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 7.5pt; color: #94a3b8; text-align: center; }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>Spendesk &mdash; Analyse des avis Capterra</h1>
    <div class="sub">scraping &middot; analytics &middot; intelligence concurrentielle</div>
  </div>
  <div class="badge">225 avis</div>
</div>

<div class="grid2">
  <div class="card">
    <h3>Note Moyenne</h3>
    <div class="big">4.72 / 5</div>
    <div class="desc">sur 225 avis Capterra vérifiés</div>
  </div>
  <div class="card">
    <h3>Recommandation</h3>
    <div class="big">94%</div>
    <div class="desc">score moyen de recommandation</div>
  </div>
</div>

<div class="section">
  <h2>R&eacute;partition des notes</h2>
  <div class="bar-container">
    <div class="bar-row"><div class="label">5★</div><div class="bar-bg"><div class="bar-fill" style="width:80%;background:#22c55e;"></div></div><div class="count">180</div></div>
    <div class="bar-row"><div class="label">4★</div><div class="bar-bg"><div class="bar-fill" style="width:17%;background:#86efac;"></div></div><div class="count">38</div></div>
    <div class="bar-row"><div class="label">3★</div><div class="bar-bg"><div class="bar-fill" style="width:2%;background:#facc15;"></div></div><div class="count">4</div></div>
    <div class="bar-row"><div class="label">2★</div><div class="bar-bg"><div class="bar-fill" style="width:0.4%;background:#fb923c;"></div></div><div class="count">1</div></div>
    <div class="bar-row"><div class="label">1★</div><div class="bar-bg"><div class="bar-fill" style="width:0.8%;background:#ef4444;"></div></div><div class="count">2</div></div>
  </div>
</div>

<div class="grid2">
  <div class="section">
    <h2>Points forts</h2>
    <div class="strength-item"><span class="tag">#1</span><span class="text">Tr&egrave;s facile &agrave; utiliser &mdash; gestion intuitive des notes de frais</span></div>
    <div class="strength-item"><span class="tag">#2</span><span class="text">Finit le papier et les re&ccedil;us manuels</span></div>
    <div class="strength-item"><span class="tag">#3</span><span class="text">Int&eacute;gration fluide avec les outils comptables</span></div>
    <div class="strength-item"><span class="tag">#4</span><span class="text">Suivi des d&eacute;penses en temps r&eacute;el</span></div>
    <div class="strength-item"><span class="tag">#5</span><span class="text">Gestion des cartes d&rsquo;entreprise et virtuelles</span></div>
  </div>
  <div class="section">
    <h2>Points faibles</h2>
    <div class="weakness-item"><span class="tag">#1</span><span class="text">Suivi des cong&eacute;s / absents basique ou absent</span></div>
    <div class="weakness-item"><span class="tag">#2</span><span class="text">Gestion des contrats &agrave; am&eacute;liorer</span></div>
    <div class="weakness-item"><span class="tag">#3</span><span class="text">Support client parfois lent</span></div>
    <div class="weakness-item"><span class="tag">#4</span><span class="text">Fonctionnalit&eacute;s RH avanc&eacute;es moins matures que les concurrents</span></div>
    <div class="weakness-item"><span class="tag">#5</span><span class="text">Appli mobile : d&eacute;lais de synchro occasionnels</span></div>
  </div>
</div>

<div class="recommend-box">
  <h4>Positionnement concurrentiel &mdash; Opportunit&eacute; Skello</h4>
  <ul>
    <li><strong>Gap identifi&eacute; :</strong> Les utilisateurs Spendesk citent r&eacute;guli&egrave;rement l&rsquo;absence de fonctionnalit&eacute;s RH (cong&eacute;s, contrats) &mdash; le c&oelig;ur de m&eacute;tier de Skello. Positionner Skello comme la couche RH compl&eacute;mentaire aux comptes Spendesk est un angle clair.</li>
    <li><strong>Cible outbound :</strong> PME fran&ccedil;aises (50-500 employ&eacute;s) utilisant Spendesk pour les notes de frais mais g&eacute;rant les RH avec Excel.</li>
    <li><strong>M&eacute;thodologie scraping :</strong> Playwright + session Chrome r&eacute;elle pour contourner Cloudflare. 225 avis sur 10 pages. Aucun actor pr&eacute;-construit &mdash; parsing DOM sur mesure.</li>
    <li><strong>Stack technique :</strong> Scraper Python &rarr; JSON &rarr; Next.js 14 + Chart.js + Tailwind sur Vercel.</li>
  </ul>
</div>

<div class="footer">
  Anthony Martin &middot; Skello GTM Case Study &middot; Juin 2026 &middot; Source : capterra.com/p/157515/Spendesk/reviews
</div>

</body>
</html>"""

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_content(HTML, wait_until="networkidle")
        await page.pdf(path="spendesk_insights.pdf", format="A4", print_background=True, margin={"top": "0mm", "bottom": "0mm", "left": "0mm", "right": "0mm"})
        await browser.close()
        print("PDF generated: spendesk_insights.pdf")

asyncio.run(main())
