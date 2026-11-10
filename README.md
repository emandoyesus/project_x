# tradeX

Mobile-first React campus board prototype.

## Run

Use Node.js 22 LTS or newer. Run `npm install`, then `npm run dev`.
Run `npm run build` for the production bundle and `npm run preview` to inspect it.
Deploy the generated `dist/` directory to a static host with HTTPS.

## Current scope

Search, category filters, saved posts, and local post creation work in the browser.
Posts and saved items persist in localStorage on the same browser; clearing site data removes them. Seed listings are demonstrations. No accounts or student verification are provided.

Before a public community launch, connect authenticated accounts and a database, enforce server-side validation and authorization, and implement reporting/moderation and contact workflows. Replace demo listings and publish appropriate privacy information.

## Manual acceptance checks

Check 320px, 390px, 768px and desktop widths for overflow. Search and combine filters, save a post, reload, and confirm persistence. Create a post using only a keyboard; confirm focus remains inside the dialog, Escape closes it, and focus returns to the trigger. Check empty search results and zoom at 200%. Verify mobile navigation stays above device safe areas.

## Service navigation

Home combines all listings. Delivery, Exchange, Games, and Style each provide a dedicated board and preselected posting category. Mobile uses a fixed service navigation bar; desktop uses a horizontal bar. Service URL fragments support opening a specific board directly. Existing saved listings retain their categoriees.
