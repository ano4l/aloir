# Eloir 1.3 validation — 9 October 2026

## Current release

- Shopify Theme Check returned `[]`; JavaScript syntax and all 24 JSON files passed.
- Search filtering and sorting preserved `q=linen`, `type=product`, `options[prefix]=last`, selected size and sort order. Clearing filters retained query/sort and restored matching results.
- Size Medium plus In stock produced zero fixture results; visible chips and clear-all recovery remained available outside the closed mobile filter drawer.
- Product measurement dialog converted 88cm to 34.6in; Escape restored focus to its opener. Range `70–74` retained its source context as `70–74 (cm)` when switching to inches.
- Missing and malformed measurement fixtures rendered no chart. Complete the look rendered selected products and excluded the current product and an unavailable fixture.
- Optional delivery/returns notes and actual configured policy links appeared near the buying controls. All fixture notes and measurements are explicitly illustrative.
- Product and search pages had no page overflow at 375, 768 and 1440px; phone interaction checks used 390px. Independent design evaluation passed desktop/tablet/phone views; its minor search heading hierarchy finding was corrected.
- Existing product add-to-cart still opened the fixture cart with a $98.00 subtotal; removal restored the empty state.
- Current upload ZIP: 81 theme entries, 707,828 bytes; exact `layout/theme.liquid`, no Windows backslash paths. Preview files and documentation are excluded by the packager.
- New screenshots: `product-confidence-desktop.png`, `product-confidence-mobile.png`, `search-discovery-desktop.png`, `search-discovery-mobile.png` under `artifacts/`.

These checks use the local Liquid adapter and simulated catalogue/cart, not a live Shopify store. Shopify filtering, metafields, inventory, Trendsi import/sync, policies, discounts and checkout still require configured-store verification. README.md documents the optional product data definitions; no store records were created automatically.

## Historical 1.2 checks

- Shopify CLI Theme Check: 72 files inspected, no offenses (`[]`).
- JavaScript syntax: `node --check assets/theme.js` passed.
- All 24 JSON templates, groups, locale and configuration files parsed.
- Final responsive checks at 375, 390, 768, 1024, 1440 and 1920px found no horizontal page overflow. Desktop and phone captures loaded all fonts and editorial images.
- Search: predictive fixture matches appeared, Arrow Down moved focus into results, Clear emptied the field and reset expansion, Escape restored focus to Search.
- Quick shop: Small was selectable; sold-out Medium was disabled. Add opened the cart. Closing the cart returned focus to the originating product control.
- Cart simulation: one item showed $98.00; increasing quantity to two showed $196.00 and preserved focus on Increase quantity. Removing it restored the empty state.
- Mobile product: selecting sold-out Medium through its URL showed the selected option in both the page and sticky buying bar; Add remained disabled; no overflow.
- Mobile collection: Filter & sort opened, selection submitted the native `sort_by=price-ascending` URL. The fixture verifies controls and navigation, not Shopify filter results.
- Phone category rail: Next advanced the scroll position and enabled Previous. It is contained without page overflow.
- Seasonal fixture: optional campaign description, code and terms appeared only when enabled. Its link used the discount route and selected collection redirect. Empty homepage fixture rendered zero product cards and no offer claims.
- Original editorial imagery uses optimized WebP, approximately 650 KB combined.
- Corrected upload archive: 77 entries, 702,894 bytes; exact `layout/theme.liquid` entry exists, zero backslash paths, and all 77 extracted entry streams match their source files by SHA-256. Only Shopify theme directories are included, with no preview tooling, fixtures, source editorial PNGs or screenshots.
- Packaging correction: the initial Windows `Compress-Archive` ZIP used backslash entry separators and Shopify rejected it as missing `layout/theme.liquid`. The packager now explicitly writes forward-slash entry names and verifies required exact paths before replacing the ZIP. Shopify upload acceptance still needs confirmation from the store.

Screenshots `artifacts/desktop-premium.png` and `artifacts/mobile-premium.png` show the local Liquid fixture with illustrative merchandise and local copies of Cormorant Garamond and Assistant. The adapter simulates products, predictive responses and cart endpoints. It is not a Shopify-hosted storefront or proof of live commerce.

Independent final design evaluation: PASS (design quality, originality, craft and functionality each 2/3), with fresh 1440, 768 and 375px screenshots. No blocking defects observed. The minor duplicate native search-clear glyph was corrected after review.

A live store connection has not been supplied. Shopify rendering, actual Trendsi imports/sync, inventory adjustment errors, discount redemption, newsletter processing, native filters, customer accounts, localization and checkout still require verification on a configured store. Follow README.md before launch.



# Eloir 1.4 · Vercel demo completion — 18 October 2026

- Premium finishing covers editorial hero framing, asymmetric category edits, balanced featured grid, seasonal composition, product information, newsletter and footer.
- Independent rendered design evaluation passed at 1440, 768 and 375px. Follow-up checks confirmed a two-column tablet featured grid, 44×44px mobile bag controls and no horizontal mobile overflow.
- Browser validation exercised menu focus/Escape, product measurements, add-to-bag, quantity changes, navigation persistence and checkout preview. Twenty-one internal destinations returned successful responses.
- Demo runtime has five passing automated tests covering stateless visitor isolation, authoritative sample pricing, unavailable variants, multipart product forms, quantity removal, deep links/404s, search, quick shop and rendered cart sections. Build renders seven representative routes.
- Checkout accepts no payment; newsletter/contact details are not submitted. No Shopify, Trendsi, supplier inventory or live checkout connection was activated.
- Vercel configuration and deployment instructions are in `vercel.json` and `DEMO.md`. Local checks establish build readiness; an actual hosted Vercel deployment must still be verified after import.
- Browser accessibility automation produced zero passes as well as zero violations, so that output is inconclusive and is not an accessibility-compliance claim.
