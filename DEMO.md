# Eloir · Vercel demo

The root project deploys a demonstration of the Liquid theme to Vercel. It does not connect to Shopify, Trendsi, a payment processor or an email service. The original theme remains in the standard Shopify folders and can still be packaged separately.

## Run locally

Use Node.js 22 and npm:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:9393. Set the PORT environment variable to choose another port. The old visual fixture in `tools/preview/server.cjs` remains available for theme-only checks.

```sh
npm test
npm run build
```

The build copies WebP images, CSS, JavaScript and licensed local fonts into `public/`, compiles Liquid snippets and renders seven representative pages. Generated output is ignored by Git and rebuilt on Vercel. No credentials or environment variables are required.

## Deploy on Vercel

1. Import `https://github.com/ano4l/aloir`, selecting the `main` branch.
2. Use the repository root as Root Directory and **Other** as Framework Preset.
3. Keep the checked-in configuration: build `npm run build`, output `public`, Node.js 22.x. npm installs from the lockfile.
4. Deploy. Vercel serves assets from its CDN and rewrites page requests to `api/index.js`.
5. Check the homepage and a direct product link such as `/products/preview-0`. Verify add to bag, refresh persistence, quick shop, search, filters, checkout preview and newsletter feedback.

The Vercel configuration explicitly bundles the Liquid source files needed by the Node function. Build-time compilation avoids filesystem writes in deployed functions. Carts are request-specific, with validated IDs and quantities stored in the visitor's browser, so shared server instances cannot leak one visitor's bag to another.

## Included journeys

- Editorial homepage, seasonal edit, category collections and collection index.
- Product variants, sold-out state, measurements with unit conversion and coordinated pieces.
- Quick shop, saved pieces, predictive search, filters and sorting.
- Persistent sample shopping bag with quantity updates.
- Story, measurement guide, contact information, demo policies and proper 404 responses.
- Checkout preview that creates no order and requests no payment information.
- Newsletter feedback that clearly states no subscription is collected.

Five illustrative pieces and USD sample prices demonstrate the catalogue. Saved pieces and the bag stay in the visitor's browser. Browsers blocking local storage retain the bag only for the current page. A preview notice and noindex headers identify the site as a demonstration.

## Commerce boundaries

The demo does not verify supplier inventory, composition, sizing, shipping coverage, discounts or live checkout. Confirm actual merchandise and supplier terms when activating Shopify. The browser adapter lives exclusively in `tools/demo/client` and is not included in the theme ZIP.

## Shopify package

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/package-theme.ps1
```

The ZIP contains only Shopify theme folders; demo data and Vercel infrastructure stay separate.
