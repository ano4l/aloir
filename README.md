# Aloir Apparel — Shopify theme & Vercel demo 1.5

A bespoke Online Store 2.0 theme built with Liquid, JSON templates, CSS and vanilla JavaScript. The homepage follows the supplied photographic triptych and asymmetric editorial composition. Original editorial images are illustrative brand imagery, not photographs of imported merchandise.

The repository also includes an isolated Vercel demo with sample products, browser-persisted bag, search and filters. Run `npm ci` and `npm run dev`, then open http://127.0.0.1:9393. Run `npm test` and `npm run build` before deployment. See [DEMO.md](DEMO.md) for Vercel import settings and demo boundaries.

Version 1.5 organizes the storefront around the merchant's real collections: Featured (`features`), Tops, Dresses, Denim and Sweaters & Knitwear, plus the complete category directory. It adds Explore and FAQ page templates, keyboard-accessible collection and seasonal tabs, consistent Aloir Apparel branding and safe checkout hand-off during bag updates. See [SHOPIFY-GITHUB.md](SHOPIFY-GITHUB.md) for branch connection and page setup. GitHub Actions validate both the theme and the demo.

## Install

1. Upload `dist/eloir-theme.zip` in Shopify admin → Online Store → Themes → Import theme → Upload zip file. Keep it unpublished while configuring and reviewing.
2. Open Customize. In Theme settings, set the Aloir Apparel wordmark or upload a logo, choose fonts and colours, and upload a favicon. Set the store's name separately in Shopify Settings → General.
3. Import products through Trendsi and publish them to the Online Store channel. Add them to actual Shopify collections. The theme reads Shopify products, variants, prices, images and availability; supplier sync and fulfillment remain Trendsi's responsibility.
4. On the homepage, select a real collection in **Featured collection**. Add collection category blocks for New Arrivals, Dresses, Sets, Tops, Knitwear and Outerwear as needed. Empty unconfigured collections show an honest empty state.
5. Replace each hero panel and both story images using their image settings. Uploaded images use Shopify responsive image delivery. Packaged editorial images are defaults only. Adjust headings, descriptions and destinations in the same sections.
6. Configure the header menu and footer menu blocks in the editor. Create Our Story, Contact, Size Guide and other pages, and add their real links. Assign the contact template to the Contact page. Configure Shopify policies and link them in footer menus.
7. Configure storefront filters in Shopify Search & Discovery. The collection page displays the native filters and sort options supplied by Shopify.
8. Configure customer accounts, payment methods, shipping, taxes, markets, currency and checkout in Shopify admin. Newsletter submissions use Shopify's customer form; marketing consent and email campaigns require store configuration.

## Editing

The default homepage moves from Editorial hero directly into Featured collection, followed by Wardrobe introduction, Category grid, Seasonal edit & offers, Editorial story and Newsletter. Styling principles give the story useful wardrobe guidance. Category edits become a swipeable row on phones, with previous/next controls. All sections can be reordered in the editor. Optional Journal uses actual Shopify blog articles. Header/footer are section groups.

For seasonal offers, select a real collection in **Seasonal edit & offers**. Create the matching discount in Shopify first, including eligibility, dates and exclusions. Enter the existing discount code, accurate offer description and terms, then enable offer messaging. Its button opens Shopify's discount route and redirects to the collection. The theme does not create or validate discounts; messaging is disabled by default. Disable it when the campaign ends. Automatic discounts can use the offer description and terms with the code left blank.

Product pages use native product forms, size/colour controls, a media gallery, optional dynamic checkout and accordions. Selected variants update availability, prices, savings and the mobile buying bar. Quick shop lets customers choose options without leaving the collection. Search includes native Shopify predictive product suggestions. Collection pages provide mobile filter/sort dialogs with native form fallbacks. Cart updates show quantity and subtotal feedback.

Create product metafields `custom.size_fit` and `custom.care_instructions` for individual product information, or edit the default accordion content. Choose a Size Guide page in the Product section for the fit-guide dialog. Only publish delivery, returns and sizing details that match your store and actual supplier products.

Saved pieces are stored in the shopper's browser. They do not sync between devices or customer accounts.

## Catalogue discovery and product confidence

Search results and collections use the filters configured in Shopify Search & Discovery. Search controls preserve the query and product scope when applying filters, sorting or clearing selections. Applied filter chips remain visible above products on phones. Configure consistent product categories, Size/Color option names and verified product attributes before scaling your Trendsi import. Shopify native filters do not display on collections containing more than 5,000 products; use meaningful smaller clothing categories.

Create these optional **product** metafield definitions in Shopify Settings → Custom data → Products:

| Namespace and key | Type | Purpose |
|---|---|---|
| `custom.size_chart` | JSON | Product-specific measurement table |
| `custom.delivery_summary` | Multi-line text | Verified delivery information near the buying controls |
| `custom.returns_summary` | Multi-line text | Verified return eligibility near the buying controls |
| `custom.complete_the_look` | Product reference, list of values | Curated coordinating merchandise |

Measurement JSON example below describes the **structure only**. Replace all measurements with verified supplier values for the actual garment; never paste this sample into a live product as factual sizing:

```json
{
  "unit": "cm",
  "measurement_type": "garment",
  "columns": ["Bust", "Waist", "Length"],
  "rows": [
    { "size": "Small", "values": [88, 70, 60] },
    { "size": "Medium", "values": [92, 74, 62] }
  ],
  "note": "Replace with verified product-specific measurement guidance."
}
```

Use `cm` or `in` for the source unit and `garment` or `body` for the measurement type. Each row must have one value per column. Numeric values can be converted between centimetres and inches; range/text values retain their supplied wording and source-unit context. Include only the measurements available for the product. The shared Size Guide page remains useful for how-to-measure instructions; it does not replace the individual garment's table. Missing or invalid measurement data must not imply known sizes.

Complete the look uses the product's curated reference list, with an optional product-list fallback configured in the section editor. It excludes the current product and unavailable products and remains hidden when no eligible merchandise is selected. Related products remain a separate source of alternatives. Product references should identify genuinely coordinating pieces, rather than simply whatever the supplier suggests.

Delivery and returns summaries are optional and must match your actual destination, supplier constraints and store policies. Populate Shopify's shipping/refund policies to enable real policy links. The theme creates no shipping guarantees or return entitlements. Review supplier terms and your customer-facing commitments before launch.

For operational guidance and the next catalogue-import steps, see `RESEARCH-ECOMMERCE.md`. The theme enhancements do not install Search & Discovery, import products, create metafield definitions or change supplier mappings automatically.

## Architecture

- `layout/theme.liquid`: document, metadata, global typography, section groups and dialogs.
- `templates/`: resource templates composed from editable sections.
- `sections/`: homepage modules, product/collection/cart/search and supporting content.
- `snippets/`: shared product cards, images, prices, filters and cart markup.
- `assets/theme.css` and `assets/theme.js`: responsive styling and progressive interactions.
- `config/` and `locales/`: merchant settings and locale data.

Native Shopify checkout processes payment. Theme code does not process cards. Product stock is read from Shopify; the theme adds no fake scarcity or activity.

## Development and checks

```powershell
npx --yes @shopify/cli@latest theme check --path .
npx --yes @shopify/cli@latest theme dev --store YOUR-STORE.myshopify.com
```

For a local visual fixture without Shopify credentials:

```powershell
npm ci --prefix tools/preview
node tools/preview/server.cjs
```

Open http://127.0.0.1:9293. This renders the actual Liquid sections through a limited local adapter, with clearly labeled illustrative products and local copies of the configured open-source fonts. Use `/?empty=1` for the homepage without product fixtures and `/?offer=1` for a clearly labeled test campaign. The fixture simulates quick shop, predictive results and cart add/update/remove for interaction checks. It does not establish that Shopify commerce works. Native form processing, checkout, image CDN, discounts, filtering and inventory sync require a real store. `tools`, source editorial PNGs, documentation and validation artifacts are excluded from the upload package; merchant PNG assets remain eligible for packaging.

## Before launch

Review a Shopify-hosted preview with actual Trendsi merchandise. Verify each size/colour, sold-out state, variant image, cart add/update/remove, discounts, newsletter success/error, filters and sorting, account links, localization and a test checkout. Review all policies, contact details, delivery estimates, image rights and product copy. Test mobile widths and keyboard navigation. Publish only after store configuration and live-flow review are complete.
