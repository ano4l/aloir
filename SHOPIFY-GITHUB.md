# Aloir Apparel · Shopify and GitHub

Repository: https://github.com/ano4l/aloir

`main` is the Vercel demo/development branch. `shopify` is prepared for the Shopify theme connection. Fetch Shopify's commits from that branch before merging further storefront changes into it. The customer-facing brand is **Aloir Apparel**, confirmed by the merchant on 21 October 2026.

The repository root contains Shopify's standard `assets`, `config`, `layout`, `locales`, `sections`, `snippets` and `templates` folders. Shopify's GitHub integration can consume these directly; no build is required for the theme. Vercel uses the root npm build independently. Demo runtime files are outside theme folders.

## Connect a theme

In Shopify → Online Store → Themes → Import/Add theme → Connect from GitHub, select account `ano4l`, repository `aloir`, then the prepared theme branch. Connecting creates a theme in the library. Preview it against actual store products before publishing.

If GitHub requests installation or authorization of Shopify's app, restrict repository access to `aloir` and complete that authorization with the account owner. Never grant access to all repositories just to connect this store.

Shopify automatically commits theme-editor/code-editor changes back to the connected branch. Fetch and merge those commits before pushing local changes; do not force push over merchant settings. Keep `config/settings_data.json`, page templates and section groups when resolving changes, because they contain merchant configuration.

## Collection map

Verified in the store admin on 21 October 2026:

| Public label | Shopify handle |
| --- | --- |
| Featured | `features` (collection is named Features) |
| Tops | `tops` |
| Dresses | `dresses` |
| Denim | `denim` |
| Sweaters & Knitwear | `sweaters-knitwear` |
| Shoes, Bags & Accessories | `shoes-bags-accessories` |
| Swimwear | `swimwear` |
| Luxe | `luxe` |
| Home | `home` |

The merchandising collection “Home page” is not a public shopping category. Runtime collection counts, imagery, variants and availability come from Shopify, not this document. Empty categories must remain honest and recoverable.

## Required page records

Create page `Explore` at `/pages/explore`, using template **explore**, and page `FAQ` at `/pages/faq`, using template **faq**. These templates render the themed content; page records must also exist in Shopify. The full category directory is Shopify's native `/collections` route; `/collections/all` is the separate all-products listing.

The header supports merchant navigation, while its collection-led defaults expose Explore, Featured and View all. Homepage collection and seasonal tabs use merchant-selectable real collections. Seasonal labels describe styling rather than assuming that every shopper shares one hemisphere's season. No discount is created merely by showing an edit.

## Checkout

Theme code controls the bag and hand-off to Shopify's checkout. Checkout colors, fonts and logo are configured in Shopify Settings → Checkout → Customize. Standard branding is available on Basic or higher; deeper information/shipping/payment customizations depend on Shopify Plus. Do not emulate a payment form inside the theme or claim payment readiness without a verified payment method and shipping setup.

## Verification before publishing

Run `npm ci`, `npm test`, `npm run build`, and Shopify Theme Check. Preview actual collections, tab switching, product variants, quick shop, mobile bag updates and checkout navigation. Inspect empty categories, FAQ and Explore URLs. Stop before placing an order or entering payment details during a visual check.

Official references: [Shopify GitHub integration](https://shopify.dev/docs/storefronts/themes/tools/github), [checkout customization](https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations).
