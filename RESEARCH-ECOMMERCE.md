# Eloir: large-catalogue fashion commerce research

Research conducted 9 October 2026. This is a research and planning deliverable; it does not change the theme or Shopify store.

## Decision

Eloir should combine its editorial visual identity with a dependable discovery system: clear clothing categories, meaningful filters, searchable product facts, specific fit information and transparent delivery/returns. The immediate priority is making a large assortment easy to narrow and safe to buy. The priorities and proposed designs below are my recommendations, informed by the linked research; they are not measured conversion predictions.

The actual imported catalogue size, target countries, margins and customer behaviour have not been verified. Recommendations therefore include verification steps before choosing paid tools or making customer promises. The current local theme source was inspected for collection/search filtering, product media, structured data and recommendations. Retailer examples were read from public pages; they were not subjected to a complete interactive checkout audit. Nordstrom's extracted page provided too little detail for useful conclusions and is excluded from the comparison.

## 1. Organize the assortment before importing at scale

Shopify's category metafields provide structured product attributes associated with its standard taxonomy. Use appropriate product categories and consistent option names to make products discoverable. [Shopify category metafields](https://help.shopify.com/en/manual/custom-data/metafields/category-metafields), [taxonomy explorer](https://shopify.github.io/product-taxonomy/).

Proposed catalogue rules for Eloir:

| Data | Rule | Example or verification |
|---|---|---|
| Supplier identity | Preserve supplier SKU, variant IDs and fulfilment mappings | Check a representative product before editing imported options |
| Customer title | Clear garment type plus distinguishing detail | Ribbed V-neck midi dress; only verified fabric claims |
| Category | Use an appropriate Shopify taxonomy category | Dresses, blouses, trousers, knitwear |
| Options | Consistent names and ordered values | Size, Color; avoid Size versus Size: |
| Colour | Keep precise variant name; map to a broader filter family | A supplier's verified shade can belong to a Brown family |
| Sizing | Preserve original system and actual measurements | Alpha, numeric, waist/inseam; do not guess equivalence |
| Attributes | Verified material, length, neckline, sleeve, fit, stretch, care | Leave unknown values empty |
| Fulfilment | Destination eligibility, shipping origin and relevant delivery info | Confirm in Trendsi for each target market |
| Campaigns | Separate editorial membership from actual discount eligibility | Seasonal Edit versus eligible discounted products |

Treat these as a data contract. Run a small sample import first, verify updates and variant matching, then expand. Supplier-owned stock, identifiers and fulfilment fields should have an explicit ownership boundary so catalogue enrichment does not accidentally disrupt sync. This boundary is an operational recommendation, not a claim about which fields Trendsi overwrites.

## 2. Build navigation around products and shopping intent

Public examples show complementary approaches. COS exposes dress subcategories by length, material, colour and occasion, alongside filtering. ASOS has distinct paths by product, body fit and editorial occasion, including workwear and wedding-guest dressing. These are observed discovery patterns, not proof that every menu item would suit Eloir. [COS dresses](https://www.cos.com/en-us/women/dresses), [ASOS dresses](https://www.asos.com/women/dresses/cat/?cid=8799).

Recommended Eloir navigation: New arrivals, Clothing, Seasonal edit and Sale when a genuine sale exists. Clothing should reveal actual stocked categories, with Dresses split by useful subtypes if the assortment supports them. Add a small set of occasion edits such as Everyday, Workwear or Occasion. Retain expressive names like Soft structure as secondary editorial routes; a shopper looking for trousers should also see the literal word Trousers.

Do not display empty categories or promise petite/plus/tall ranges without supporting products. Keep the homepage curated, while complete category pages expose the wider assortment. Season names must follow the market being served rather than assuming the store owner's season applies everywhere.

## 3. Make filters the core of large-catalogue discovery

Shopify documents that collections above 5,000 products do not display native filters, and storefront filters show at most 100 values each. Therefore avoid making an oversized Shop All collection the primary discovery destination. Use meaningful smaller categories; consider an alternative search service only if real needs exceed native capabilities. [Shopify filtering limits and setup](https://help.shopify.com/manual/online-store/search-and-discovery/filters).

Prioritize Size, Availability, Color and Price, then relevant garment attributes. Dresses may need Length, Sleeve and Occasion; trousers may need Fit, Rise and Inseam. Clearly distinguish alphabetic sizes from numeric or waist measurements. Baymard's research found that unclear size types undermine filtering, while grouped and labeled size values make selection easier. [Apparel size-filter research](https://baymard.com/research-articles/apparel-how-to-format-size-options-in-the-size-filter).

Show applied selections as removable chips above the products, preserve them while sorting, and make zero-result recovery easy. Mobile filtering should show a selected-count summary and a clear Apply action; a result count can be added only if it is accurately computed. Baymard supports visible applied-filter overviews and understandable attribute labels. [Filter interface research](https://baymard.com/blog/ecommerce-filter-ui).

Important edge case: test an item where Small/Red is unavailable but Small/Blue and Medium/Red are available. A shopper's size/colour request must not lead to an apparently purchasable combination that is actually sold out. Do not assume product-level availability proves every variant combination is available.

## 4. Search must work beyond autocomplete

Shopify supports synonyms and selective product boosts. Use customer language such as trousers/pants or co-ords/matching sets, when these actually describe the inventory. Shopify already handles common spelling and singular/plural cases; avoid boosting everything. [Shopify search customization](https://help.shopify.com/en/manual/online-store/search-and-discovery/settings).

Eloir needs full search-result filtering and sorting, not just attractive predictive suggestions. Search should support garment type, verified attributes and occasion through consistent content and metadata. No-results pages should retain the query, suggest useful categories, and offer a simple way to broaden the request. NN/g identifies category, product and characteristic searches as important search-system requirements. [NN/g search research overview](https://www.nngroup.com/reports/ecommerce-ux-search-including-faceted-search/).

Create a test set of real catalogue queries: exact product name, dress, black midi dress, linen shirt when linen exists, plus size when supported, a synonym, a typo, a sold-out item and an impossible request. Check relevance and recovery rather than only confirming that some result appears.

## 5. Product lists should preserve browsing progress

Use consistent images and legible titles, actual price, appropriate sale information and visible colour variation when supported. Combine variants coherently where supplier data and fulfilment mappings allow; do not merge products solely because titles look similar. Keep quick shop optional and ensure full product details are easy to reach. Baymard recommends variation grouping and deliberate product-loading patterns. [Product-list guidance](https://baymard.com/blog/product-listing-page-plp-ux).

A Load more enhancement is worth testing, with real pagination links as fallback and discoverable URLs. The important requirement is restoring the shopper's filters, batch and scroll position after visiting a product. Endless scrolling can make rediscovering the previous position especially difficult. [Browsing-position research](https://baymard.com/research-articles/return-same-place).

For Eloir, retain the current native pagination until an enhancement reliably preserves history, back navigation, keyboard focus and footer access. Choose batch size through device testing; loading hundreds of cards at once is not a premium experience.

## 6. Fit confidence belongs beside the size selector

Baymard's apparel research supports sufficient sizing information, human-model imagery, visible size choices and fit-related reviews. Product pages should explain actual measurements, distinguish garment from body measurements, provide cm/inch conversion, and show a nearby size-guide link. A generic conversion chart alone is insufficient. [Apparel buying-confidence research](https://baymard.com/research-articles/apparel-5-best-practices).

Recommended Eloir product content: a concise factual overview, verified fabric composition and stretch, product-specific size table, fit/care notes and front/back/detail photographs. Model height and worn size should appear only when supplied reliably. Real item photos belong on product pages; illustrative campaign imagery must not imply it depicts the merchandise.

Once genuine reviews accumulate, collect fit feedback and customer photos with appropriate permission. Show fit distribution only from real responses. Recent Baymard apparel research treats fit-related review content as a central decision aid. [2026 apparel insights](https://baymard.com/research-articles/apparel-and-accessories-quantitative-ux-insights-2026).

## 7. Shipping and returns are part of the purchase decision

Provide explicit Shipping information and Return policy links in the footer, plus a concise product-page summary. Do not bury them under a general Help link. [Baymard shipping/returns findability](https://baymard.com/research-articles/footer-needs-return-shipping-links).

Trendsi's published shipping page uses destination/weight-dependent rates and distinguishes US products from overseas products. Its US dropship estimates currently differ between those origins. Use destination-specific verified estimates and explain processing assumptions; do not copy one blanket promise across the catalogue. [Trendsi shipping information](https://help.trendsi.com/hc/en-us/articles/8678195060123-Shipping-Information).

Trendsi's return page currently accepts return-service requests for US orders only, requires initiation within seven days and return shipment within seven days of submission, excludes some categories, and does not offer exchanges. Non-US orders are not currently eligible for its return service. These are supplier terms; Eloir must establish its own viable customer policy and refund workflow for its target markets. [Trendsi return policy](https://help.trendsi.com/hc/en-us/articles/8362114469275-Trendsi-Return-Policy).

Trendsi also says destination selection determines eligible products. Confirm the intended markets before importing broadly or advertising international delivery. [Trendsi international eligibility](https://help.trendsi.com/hc/en-us/articles/29711330613531-Trendsi-Expands-Services-to-26-Countries). Supplier terms can change; verify them again before launch.

## 8. Specials should help customers shop a coherent edit

Recommended campaign format: one defined seasonal collection, an accurate benefit, clear eligibility, start/end dates, exclusions and a direct path to eligible products. Decide between a code or automatic discount based on the desired flow, and test the actual checkout result. Shopify discount-combination rules must be checked explicitly. [Discount combinations](https://help.shopify.com/en/manual/discounts/discount-combinations).

Do not treat compare-at pricing and a campaign discount as interchangeable. A crossed-out catalogue price does not establish that a seasonal code has been applied. COS's public listing also illustrates explicit offer-exclusion labels; Eloir should similarly communicate relevant exclusions when the campaign needs them. Baymard's sales research covers the importance of usable promotion and sale experiences. [Sales UX research](https://baymard.com/research-articles/10-sales-ux-best-practices).

My recommended test is a selected-collection seasonal offer with restrained messaging, rather than continuous storewide discounting. Select the amount from contribution margin after supplier cost, shipping subsidy, payment fees, returns and marketing—not from a generic conversion claim. Measure net sales, contribution and return rate alongside conversion.

## 9. Recommendations should distinguish alternatives from outfit additions

Shopify distinguishes related products (substitutes) and complementary products (items used together). Eloir can offer Similar pieces for alternatives and Complete the look for verified coordinating items. Curate the first outfit recommendations and exclude unsuitable or unavailable pieces. [Shopify recommendation configuration](https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-recommendations).

Do not label arbitrary automated alternatives as a styled outfit. Keep recommendations secondary to product facts and the buying action. Cross-selling should not obstruct checkout.

## 10. Mobile quality, performance and accessibility

Measure the live storefront, including its apps. Google's good Core Web Vitals thresholds are LCP at or below 2.5 seconds, INP at or below 200 milliseconds and CLS at or below 0.1, evaluated at the 75th percentile. A local fast preview cannot prove these results. [Google Web Vitals](https://web.dev/articles/vitals).

Protect the main image's loading priority, size images responsively, reserve image space, and lazy-load offscreen media. Review each new app's scripts and visible benefit before adding it. Test collection filtering and product buying on slower mobile conditions, not only the homepage.

Use readable contrast, visible keyboard focus, accessible labels, non-colour selection indicators and reduced motion. Sticky buying bars and dialogs must not hide focused controls. WCAG 2.2 defines target-size and focus-obscuring requirements; larger comfortable touch targets are a practical Eloir design preference, not a claim that WCAG universally requires 44px. [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

## 11. SEO needs structure as well as product copy

Keep categories and products reachable through crawlable links. Enrich relevant collection descriptions without pushing products far down the page. Google's guidance explains why site navigation and ecommerce structured data help it understand products and hierarchy. [Ecommerce site structure](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure), [structured data](https://developers.google.com/search/docs/specialty/ecommerce/include-structured-data-relevant-to-ecommerce).

Review filtered-URL indexing deliberately: index useful curated landing pages, and manage combinatorial filter URLs without accidentally blocking core product discovery. Google documents the crawl burden of faceted navigation. Do not apply a blanket robots or noindex change before inspecting Shopify's actual URLs and existing canonical behaviour. [Google faceted-navigation guidance](https://developers.google.com/crawling/docs/faceted-navigation).

The theme already outputs Shopify's product structured data. Test live price, availability and variant consistency; additional schema should solve a demonstrated gap rather than duplicate existing markup.

## 12. Measure discovery and purchase quality

Use Shopify Search & Discovery reports for search clicks/purchases, no-results terms and no-click queries. These reports do not include predictive-search interactions, so do not interpret them as a complete picture of the search overlay. [Shopify discovery analytics](https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-analytics).

Track the full funnel by device and acquisition channel: collection/search to product, product to cart, cart to checkout, checkout to purchase. Review cancellations and size-related returns too. Baymard identifies cost transparency and guest checkout as important checkout-friction concerns. [Checkout-friction research](https://baymard.com/blog/reduce-cart-abandonment).

Before setting targets, establish a store baseline. Run small usability tasks with representative shoppers: find an in-stock garment in their size, compare two items, understand delivery/returns, and buy an eligible seasonal piece. Separate missing assortment from poor search relevance and confusing interfaces.

## Eloir implementation priorities

These are source-level observations and recommendations, not a live Shopify audit.

| Priority | Work | Owner/scope | Acceptance evidence |
|---|---|---|---|
| P0 | Confirm markets, delivery and customer returns | Merchant + supplier | Destination eligibility and viable policy checked |
| P0 | Catalogue contract and sample import | Merchant/data operations | Identifiers preserved; verified sizes/images/attributes; sync checked |
| P0 | Category architecture and Search & Discovery setup | Shopify configuration | Stocked category links; relevant size/colour/availability filters |
| P0 | Filter and sort full search results | Theme | Query/type preserved through apply/clear/sort and mobile dialog |
| P0 | Product-specific sizing and fulfilment summaries | Theme + catalogue + merchant | Actual measurements and truthful delivery/returns beside buying controls |
| P1 | Refine filter chips on mobile | Theme | Chips stay visible outside closed filter drawer |
| P1 | Selected-variant colour/image consistency | Theme + real product QA | Swatch/filter/product selection shows matching available variant |
| P1 | Improve product cards and list continuity | Theme | Back restores position; prices/variants clear; optional Load more safe |
| P1 | Configure one seasonal campaign | Shopify + merchant | Eligible/ineligible/mixed cart and discount combinations tested |
| P1 | Performance and accessibility review | Live store QA | Mobile field/lab evidence and keyboard/touch checks |
| P2 | Genuine fit reviews and curated outfit additions | Merchant + integrations | Real review provenance; relevant complementary items |
| P2 | Tune search from behaviour | Merchant/analytics | Recurring review of no-result/no-click terms and relevant synonyms |

Current theme strengths: native product/cart forms, predictive search, stock-aware size controls, mobile buying bar, collection filters, editable seasonal campaign, responsive media, related recommendations and product structured data.

Concrete gaps found in source: `sections/main-search.liquid` renders a product grid and pagination without filter/sort controls; `snippets/filters.liquid` assumes collection context and would need query-preserving behaviour before reuse on search. Its applied chips currently reside in the controls block that moves into the mobile filter dialog. Product sizing is driven by a shared guide and optional fit text rather than a structured per-product measurement table. `sections/related-products.liquid` requests related recommendations, not a separate complementary outfit rail.

Suggested sequence: catalogue/market foundation → search and category discovery → product confidence → campaign and live checkout QA → measurement-driven refinements. No paid discovery app should be selected solely because the assortment is called large; first establish actual collection sizes, search requirements and native-system shortcomings.


## Collection-led Aloir Apparel update · 21 October 2026

Current research was reviewed alongside the merchant's actual Shopify catalogue. The decisions below distinguish implementation guidance from supplier, payment and shipping arrangements.

| Finding | Applied decision | Primary source |
| --- | --- | --- |
| Category gateways help shoppers understand the available range before committing to a product list. | Explore highlights populated clothing categories; View all is the complete category directory, separate from all products. | [Baymard category pages](https://baymard.com/blog/ecommerce-category-page) |
| Apparel shoppers need confidence in appearance, fit and size. | Preserve actual product photography, selected-size availability and measurement guidance. Never use editorial imagery as evidence of a real garment's composition or fit. | [Baymard apparel research](https://baymard.com/research-articles/apparel-5-best-practices) |
| Product lists, sorting and filters must work together. | Keep Shopify product filters and query-preserving sort. Collection tabs explicitly show their scope and link to the matching collection. Empty collections offer a path back to stocked categories. | [Baymard product-list research](https://baymard.com/research/ecommerce-product-lists) |
| Checkout friction includes unclear costs and unnecessary account requirements. | Retain native checkout, clear subtotal and delivery-cost context, and block checkout while a bag mutation is pending. Shopify's existing one-page layout and address completion remain enabled. | [Baymard checkout research](https://baymard.com/research-articles/current-state-of-checkout-ux) |
| Theme and checkout customization are separate systems. | Bag styling ships with Liquid. Checkout typography and colors are configured through Shopify's checkout editor, within the store's available controls. | [Shopify checkout documentation](https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations) |
| Shopify's GitHub integration reads standard root theme folders and commits editor changes back to the connected branch. | Keep root theme structure, prepare a dedicated shopify branch, validate before pushing and preserve merchant commits. | [Shopify GitHub integration](https://shopify.dev/docs/storefronts/themes/tools/github) |

The verified public collection handles are features, tops, dresses, denim, sweaters-knitwear, shoes-bags-accessories, swimwear, luxe and home. The merchant's Features collection appears under the customer-facing label Featured. The internal Home page collection is hidden from the category directory. Empty categories are not presented as stocked.

Seasonal discovery uses Light layers, Knitwear and Evening dressing. These are styling paths to existing collections, not invented inventory, discounts or assumptions about the shopper's hemisphere. FAQ answers are merchant-editable and do not promise an unverified return window, delivery time or international destination.

The customer-facing brand was explicitly confirmed as Aloir Apparel. The Vercel demo retains illustrative product data; actual Shopify merchandising stays authoritative. Checkout branding does not activate a gateway or prove that a destination has a shipping rate. No live payment or order was submitted during design checks.
