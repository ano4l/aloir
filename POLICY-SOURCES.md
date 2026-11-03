# Aloir Apparel customer-care policies

Reviewed November 3, 2026. Merchant confirmed US operation and US fulfillment/shipping through Trendsi. No shipping-rate, payment, market or supplier-account settings were changed as part of the storefront work.

## Policy basis

- [Trendsi shipping information](https://help.trendsi.com/hc/en-us/articles/8678195060123-Shipping-Information): standard US-stock dropship estimate 2–5 business days. Overseas products and wholesale orders have different timing. Supplier charges are not automatically the merchant's checkout rates; no free-shipping promise is added.
- [Trendsi returns](https://help.trendsi.com/hc/en-us/articles/8362114469275-Trendsi-Return-Policy): request within 7 days starting with tracking delivery, final package for split orders; send within 7 days of submission; unworn, tagged, original garment bag/SKU. Category exclusions and possible 20% noncompliance deduction are disclosed. Ordinary return postage is customer-paid except damage/shipping error.
- [Initiate a return](https://help.trendsi.com/hc/en-us/articles/8362230753947-Initiate-a-Return): merchant obtains RA and instructions; customer must not be sent to a supplier merchant dashboard.
- [Return processing](https://help.trendsi.com/hc/en-us/articles/9017671312539-Return-Processing-Time): warehouse processing estimate 5–7 business days. Aloir remains responsible for issuing the customer refund. An older processing article says 7 business days to post returns, whereas the main return policy says 7 days; storefront uses the stricter 7 calendar days consistently.
- [Cancellation](https://help.trendsi.com/hc/en-us/articles/8677988957851-Order-Cancellation-Policy): possible within 24 hours, never guaranteed, unavailable once processing/shipped. Its reference to 7 business days for later returns does not override the main return policy's calendar-day rule.
- [30-day option](https://help.trendsi.com/hc/en-us/articles/41136978650779-30-Day-Returns-Option): requires a separate SEEL/REDO integration and customer coverage. No evidence this is active, so no 30-day/free-return promise is made. General marketing claims of free returns are not substituted for the detailed return policy.
- [Shipping surcharge](https://help.trendsi.com/hc/en-us/articles/30553089548059-Shipping-Surcharge-Information): temporary supplier surcharges can occur. Storefront requires final customer charges disclosed before payment, without inventing a fixed rate.
- [FTC prompt delivery guidance](https://www.ftc.gov/business-guidance/resources/selling-internet-prompt-delivery-rules): supplier processing restrictions do not override delayed-shipment cancellation/refund rights.
- [Shopify privacy settings](https://help.shopify.com/en/manual/privacy-and-security/privacy/customer-privacy-settings/privacy-settings): preserve the existing automated native privacy policy and its actual Shopify disclosures. The theme adds Trendsi fulfillment and browser-saved-pieces information below the native policy. The demo policy separately explains that its bag/saves are browser-local and submissions are disabled.

## Implementation

Policy snippets are used by dedicated `page.*-policy.json` templates and the Vercel preview. Shopify's standard `/policies/` content is stored in Shopify admin, not deployed from theme files. Refund, shipping and terms HTML must be synchronized there when these snippets change. Native privacy stays automated; the theme supplement uses `request.path` to target only its URL.

Create visible Shopify pages `customer-care` and `cancellation-policy` and assign the matching templates. Other policy templates are optional fallbacks; native `/policies/` URLs take priority when policies are set. Contact uses the real shop email, with a contact-page fallback. Support email observed publicly in the native Shopify policy: `aloir.apexvantage@gmail.com`.

No specific state of legal registration or business postal address was supplied. Terms avoid an invented jurisdiction or arbitration clause. Privacy controls and actual live checkout/shipping configuration must continue to reflect the merchant's real operations. Source claims are dated research, not an ongoing supplier synchronization.
