---
version: alpha
name: Shopify
slug: shopify
source: https://www.shopify.com/
extractedAt: 2026-05-18
description: "Commerce-first brand system with near-black green canvases, electric Shopify mint CTAs, low-weight oversized ShopifySans headlines, compact rounded controls, cinematic product panels, and pragmatic pricing tables."

colors:
  primary: "#008060"
  accent: "#36F4A4"
  accentHover: "#45F298"
  accentPressed: "#0A4D4D"
  ink: "#18181B"
  body: "#3F3F46"
  muted: "#71717A"
  canvas: "#FFFFFF"
  surface: "#FAFAFA"
  surfaceAlt: "#F4F4F5"
  border: "#D4D4D8"
  borderStrong: "#A1A1AA"
  link: "#008060"
  success: "#15883B"
  warning: "#E89900"
  error: "#EE0004"
  darkCanvas: "#02090A"
  darkSurface: "#061A1C"
  darkSurfaceAlt: "#121C1E"
  darkPanel: "#051517"
  darkBorder: "#142024"
  darkMuted: "#A1A1AA"
  shopGreen: "#95BF47"
  mintGlow: "#36F4A4"
  pistachio: "#D4F9E0"
  aloe: "#C1FBD4"
  limeSpark: "#D0F224"
  purpleAccent: "#978DE7"
  commercePurple: "#751BE9"
  posLime: "#EEFAB3"
  footerBg: "#02090A"
  on-primary: "#FFFFFF"
  on-accent: "#02090A"
  on-dark: "#FFFFFF"
  on-light: "#18181B"

typography:
  display: {fontFamily: "ShopifySans, Inter-Variable, Helvetica, Arial, sans-serif", fontSize: 96px, fontWeight: 300, lineHeight: 1.08, letterSpacing: "-0.025em"}
  hero: {fontFamily: "ShopifySans, Inter-Variable, Helvetica, Arial, sans-serif", fontSize: 70px, fontWeight: 330, lineHeight: 1.08, letterSpacing: "-0.015em"}
  headline-lg: {fontFamily: "ShopifySans, Inter-Variable, Helvetica, Arial, sans-serif", fontSize: 56px, fontWeight: 330, lineHeight: 1.08, letterSpacing: "-0.01em"}
  title-lg: {fontFamily: "ShopifySans, Inter-Variable, Helvetica, Arial, sans-serif", fontSize: 44px, fontWeight: 330, lineHeight: 1.10, letterSpacing: "-0.01em"}
  title-md: {fontFamily: "ShopifySans, Inter-Variable, Helvetica, Arial, sans-serif", fontSize: 34px, fontWeight: 330, lineHeight: 1.14, letterSpacing: "0em"}
  title-sm: {fontFamily: "ShopifySans, Inter-Variable, Helvetica, Arial, sans-serif", fontSize: 26px, fontWeight: 360, lineHeight: 1.20, letterSpacing: "0em"}
  body-lg: {fontFamily: "ShopifySans, Inter-Variable, Helvetica, Arial, sans-serif", fontSize: 20px, fontWeight: 400, lineHeight: 1.40, letterSpacing: "0em"}
  body: {fontFamily: "ShopifySans, Inter-Variable, Helvetica, Arial, sans-serif", fontSize: 18px, fontWeight: 400, lineHeight: 1.40, letterSpacing: "0em"}
  body-sm: {fontFamily: "ShopifySans, Inter-Variable, Helvetica, Arial, sans-serif", fontSize: 14px, fontWeight: 420, lineHeight: 1.30, letterSpacing: "0em"}
  label: {fontFamily: "ShopifySans, Inter-Variable, Helvetica, Arial, sans-serif", fontSize: 14px, fontWeight: 450, lineHeight: 1.30, letterSpacing: "0em"}
  button: {fontFamily: "ShopifySans, Inter-Variable, Helvetica, Arial, sans-serif", fontSize: 16px, fontWeight: 600, lineHeight: 1.50, letterSpacing: "0em"}
  caption: {fontFamily: "ShopifySans, Inter-Variable, Helvetica, Arial, sans-serif", fontSize: 12px, fontWeight: 450, lineHeight: 1.33, letterSpacing: "0.02em"}
  legal: {fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", fontSize: 12px, fontWeight: 400, lineHeight: 1.50, letterSpacing: "0em"}
  pricing-display: {fontFamily: "ShopifySans, Inter-Variable, Helvetica, Arial, sans-serif", fontSize: 60px, fontWeight: 330, lineHeight: 1.00, letterSpacing: "-0.015em"}
  code: {fontFamily: "IBMPlexMono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 14px, fontWeight: 400, lineHeight: 1.50, letterSpacing: "0em"}

rounded:
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 32px
  pill: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  section: 112px
  pageMarginMobile: 16px
  pageMarginDesktop: 90px

components:
  button-primary: {backgroundColor: "{colors.primary}", textColor: "{colors.on-primary}", typography: "{typography.button}", rounded: "{rounded.lg}", padding: 12px 24px, border: "2px solid {colors.primary}"}
  button-primary-active: {backgroundColor: "{colors.accentPressed}", textColor: "{colors.on-primary}", rounded: "{rounded.lg}"}
  button-mint: {backgroundColor: "{colors.accent}", textColor: "{colors.on-accent}", typography: "{typography.button}", rounded: "{rounded.lg}", padding: 14px 28px}
  button-mint-active: {backgroundColor: "{colors.accentHover}", textColor: "{colors.on-accent}", rounded: "{rounded.lg}"}
  button-dark: {backgroundColor: "{colors.darkCanvas}", textColor: "{colors.on-dark}", typography: "{typography.button}", rounded: "{rounded.lg}", padding: 12px 24px}
  button-secondary: {backgroundColor: "transparent", textColor: "{colors.ink}", typography: "{typography.button}", rounded: "{rounded.lg}", padding: 12px 22px, border: "2px solid {colors.borderStrong}"}
  button-secondary-on-dark: {backgroundColor: "transparent", textColor: "{colors.on-dark}", typography: "{typography.button}", rounded: "{rounded.lg}", padding: 12px 22px, border: "2px solid rgba(255,255,255,0.30)"}
  button-ghost: {backgroundColor: "transparent", textColor: "{colors.ink}", typography: "{typography.button}", rounded: "{rounded.lg}", padding: 10px 16px}
  button-pricing-toggle: {backgroundColor: "{colors.surfaceAlt}", textColor: "{colors.ink}", typography: "{typography.label}", rounded: "{rounded.pill}", padding: 4px 6px}
  card-feature-dark: {backgroundColor: "{colors.darkPanel}", textColor: "{colors.on-dark}", rounded: "{rounded.xl}", border: "1px solid {colors.darkBorder}", padding: 24px}
  card-feature-light: {backgroundColor: "{colors.surface}", textColor: "{colors.ink}", rounded: "{rounded.xl}", border: "1px solid {colors.border}", padding: 24px}
  card-pricing: {backgroundColor: "{colors.canvas}", textColor: "{colors.ink}", rounded: "{rounded.xl}", border: "1px solid {colors.border}", padding: 32px}
  card-pricing-highlight: {backgroundColor: "{colors.darkSurfaceAlt}", textColor: "{colors.on-dark}", rounded: "{rounded.xl}", border: "1px solid {colors.darkBorder}", padding: 32px}
  nav-global: {backgroundColor: "{colors.darkCanvas}", textColor: "{colors.on-dark}", typography: "{typography.label}", height: 72px}
  nav-mega-card: {backgroundColor: "{colors.darkPanel}", textColor: "{colors.on-dark}", rounded: "{rounded.xl}", border: "1px solid {colors.darkBorder}", padding: 24px 16px}
  input-email: {backgroundColor: "{colors.canvas}", textColor: "{colors.ink}", typography: "{typography.body}", rounded: "{rounded.lg}", border: "1px solid {colors.borderStrong}", padding: 14px 16px}
  input-dark: {backgroundColor: "{colors.darkSurface}", textColor: "{colors.on-dark}", typography: "{typography.body}", rounded: "{rounded.lg}", border: "1px solid {colors.darkBorder}", padding: 14px 16px}
  product-dashboard-panel: {backgroundColor: "{colors.darkSurface}", textColor: "{colors.on-dark}", rounded: "{rounded.xl}", border: "1px solid rgba(255,255,255,0.08)", shadow: "0px 8px 48px rgba(24,24,27,0.24), 0px 4px 8px rgba(24,24,27,0.16)"}
  commerce-glow-panel: {backgroundColor: "{colors.darkPanel}", textColor: "{colors.on-dark}", rounded: "{rounded.xl}", border: "1px solid {colors.darkBorder}", shadow: "0px 0px 10px {colors.mintGlow}"}
  docs-fallback-page: {backgroundColor: "{colors.canvas}", textColor: "{colors.body}", typography: "{typography.legal}", rounded: "{rounded.sm}"}
---

**Overview**

Shopify's current public design system is split between a high-impact marketing mode and a quieter documentation/support mode. The marketing mode is immediately recognizable: a very dark green-black canvas, pale product imagery, huge low-weight ShopifySans type, compact rounded buttons, and a sharp hit of electric mint for action. It feels premium and operational at the same time, avoiding generic SaaS blue in favor of commerce greens, luminous edges, and dense product proof.

The pricing and product pages introduce a lighter commerce-utility mode. Cards become white or near-white, borders do more work than shadows, and the typography turns into scannable comparison structures. The Help Center page observed during extraction is much plainer, using Helvetica Neue, white canvas, simple links, and a small rounded action; treat it as a support fallback rather than the flagship brand expression.

Research coverage:

- Homepage: strongest evidence for hero scale, dark nav, mint CTAs, mega-menu behavior, and cinematic product panels.
- POS product page: strongest evidence for feature storytelling, product screenshots, retail-specific pale lime, and dark-to-light section rhythm.
- Pricing page: strongest evidence for plan cards, segmented billing toggle, comparison tables, payment-method rows, and utility colors.
- Help Center content page: evidence for the simplified support fallback, with Helvetica Neue, white canvas, dark text, and small 6px controls.

Key Characteristics:

- Use {colors.darkCanvas} as the signature marketing stage, not pure black.
- Pair oversized, low-weight {typography.display} with compact body copy.
- Reserve {colors.accent} for primary dark-surface CTAs, glows, and high-value moments.
- Build cards with rounded 12-16px corners and thin borders before adding shadows.
- Let product UI imagery and dashboard panels provide texture instead of illustration-only decoration.
- Keep navigation dark, fixed, and layered, with mega-menu panels sliding from the top.
- In pricing, shift to light cards, clear borders, pill toggles, and highly legible comparison rows.

**Colors**

Primary & Action:

- primary, {colors.primary}: The classic Shopify commerce green appears on pricing/product CTAs and links. It should feel trustworthy and operational, especially on light surfaces.
- accent, {colors.accent}: Electric mint is the most distinctive current action color on dark marketing pages. Use it sparingly for "Start free trial" style conversion points and luminous emphasis.
- accentHover, {colors.accentHover}: A slightly brighter mint for hover or active emphasis when the CTA sits on {colors.darkCanvas}.
- accentPressed, {colors.accentPressed}: A deep teal-green for pressed states, dark active controls, or heavier commerce UI states.
- link, {colors.link}: Links inherit the commerce-green action language on light pages. On dark pages, prefer {colors.darkMuted} unless the link is a primary conversion path.

Action color notes:

- On dark pages, {colors.accent} carries more brand recognition than {colors.primary}.
- On light pages, {colors.primary} is calmer and more readable than electric mint.
- Do not use {colors.shopGreen} as the main CTA unless the screen is specifically logo-led or heritage-brand-led.

Surfaces:

- canvas, {colors.canvas}: The base for pricing pages, support pages, and product copy sections. It keeps Shopify's practical commerce layer clean.
- surface, {colors.surface}: Used for soft page bands and light cards where a pure white card would feel too stark.
- surfaceAlt, {colors.surfaceAlt}: A zinc-tinted alternate surface used in pricing controls, subtle table areas, and neutral UI regions.
- darkCanvas, {colors.darkCanvas}: The signature Shopify marketing background. It should read as green-black, cinematic, and deep.
- darkSurface, {colors.darkSurface}: The main dark panel fill for dashboards, nav layers, and inset product UI modules.
- darkSurfaceAlt, {colors.darkSurfaceAlt}: A lifted dark panel for highlighted pricing or large commerce blocks.
- darkPanel, {colors.darkPanel}: Mega-menu cards and compact dark feature panels use this slightly green surface.

Surface notes:

- Dark surfaces should stay green-black, not neutral charcoal.
- Light utility pages should use zinc neutrals to avoid looking like a separate brand.
- Product screenshots can sit on dark panels even inside otherwise light sections.

Neutrals & Text:

- ink, {colors.ink}: Primary copy on light surfaces. It is a zinc-black rather than a warm black.
- body, {colors.body}: Secondary text and less dominant headings on light backgrounds.
- muted, {colors.muted}: Description text, pricing metadata, and comparison notes.
- border, {colors.border}: Default light-card separator and pricing table line.
- borderStrong, {colors.borderStrong}: Stronger borders for secondary controls or emphasized divisions.
- darkMuted, {colors.darkMuted}: Descriptive text on dark nav and product panels.
- on-dark, {colors.on-dark}: High-contrast white for headings, CTAs, and nav labels on dark canvases.

Semantic:

- success, {colors.success}: Confirmation, included-feature checks, and positive commerce metrics.
- warning, {colors.warning}: Cautionary notices and billing/pricing warnings.
- error, {colors.error}: Error copy and failed form validation. Keep it functional, not decorative.

Brand-specific signatures:

- shopGreen, {colors.shopGreen}: The heritage Shopify bag green. Use it for brand marks or subtle brand references rather than replacing current CTA mint.
- mintGlow, {colors.mintGlow}: The glow color used around high-energy commerce panels and AI/product moments.
- pistachio, {colors.pistachio}: A pale supporting green for badges or soft backgrounds.
- aloe, {colors.aloe}: A lighter botanical green for success-adjacent surfaces.
- limeSpark, {colors.limeSpark}: A sharper accent used as a small spark, tag, or visual signal.
- purpleAccent, {colors.purpleAccent}: Secondary campaign accent seen in current assets and gradients.
- commercePurple, {colors.commercePurple}: A deeper digital-commerce accent for integrations, AI, or high-contrast graphics.
- posLime, {colors.posLime}: POS-specific pale lime used to soften retail feature areas.
- footerBg, {colors.footerBg}: Footer and dark closing sections return to the near-black brand stage.

**Typography**

Shopify's marketing system centers on `ShopifySans, Inter-Variable, Helvetica, Arial, sans-serif`. The extracted bundles include specialty campaign faces such as PolySans, Trap, GT Super, GoodSans, and Druk, but the durable product-marketing language is ShopifySans. The Help Center fallback observed used `Helvetica Neue, Helvetica, Arial, sans-serif`, so support surfaces can be more neutral.

| Level | Size | Weight | Line Height | Letter Spacing |
|---|---:|---:|---:|---:|
| display | 96px | 300 | 1.08 | -0.025em |
| hero | 70px | 330 | 1.08 | -0.015em |
| headline-lg | 56px | 330 | 1.08 | -0.01em |
| title-lg | 44px | 330 | 1.10 | -0.01em |
| title-md | 34px | 330 | 1.14 | 0em |
| title-sm | 26px | 360 | 1.20 | 0em |
| body-lg | 20px | 400 | 1.40 | 0em |
| body | 18px | 400 | 1.40 | 0em |
| body-sm | 14px | 420 | 1.30 | 0em |
| label | 14px | 450 | 1.30 | 0em |
| button | 16px | 600 | 1.50 | 0em |
| caption | 12px | 450 | 1.33 | 0.02em |
| legal | 12px | 400 | 1.50 | 0em |
| pricing-display | 60px | 330 | 1.00 | -0.015em |
| code | 14px | 400 | 1.50 | 0em |

Principles:

- Make large headings light, not heavy; {typography.display} should feel expansive and editorial.
- Use negative tracking only at larger sizes; body and controls stay at zero tracking.
- Keep CTA text compact and confident with {typography.button}, usually 16px and semibold.
- Let pricing numerals use {typography.pricing-display} with tight line height and low weight.
- Avoid swapping in decorative campaign fonts unless reproducing a campaign-specific Shopify page.

**Layout**

The spacing system follows a 4px base with practical jumps: {spacing.md} for local grouping, {spacing.lg} for card interiors, {spacing.xl} for feature rhythm, and {spacing.section} for major marketing breaks. Desktop pages use wide margins around 90px and large content containers up to roughly 1152-1440px. Mobile collapses to 16px margins with stacked cards and full-width CTAs.

Grids are asymmetric but controlled. Marketing sections often pair one large product visual with a tight column of text or cards; mega-menus use three-column grids on desktop and stacked card links on mobile. Pricing pages prefer equal-width plan cards, then comparison tables with sticky or repeated plan context.

Whitespace philosophy: Shopify uses generous vertical space around headline moments but denser spacing inside operational UI. Keep hero areas airy, then make product panels, pricing tables, and nav menus efficient enough to scan quickly.

Observed layout patterns:

- Hero sections privilege one decisive headline, one short paragraph, and one dominant CTA cluster.
- Product pages alternate dark cinematic proof sections with lighter explanatory bands.
- Mega-menu content has more structure than a simple dropdown: image tiles, icon cards, muted descriptions, and arrow reveals.
- Pricing pages use card grids first, then table density for detailed comparison.
- Support pages abandon cinematic layout in favor of direct text, simple links, and page-level padding.

**Elevation & Depth**

Shopify is mostly border-led and surface-led. Light pricing cards use {colors.border} and {rounded.xl} more than heavy shadow. Dark product panels use subtle layered shadows such as `0px 8px 48px rgba(24,24,27,0.24), 0px 4px 8px rgba(24,24,27,0.16)` to imply real interface depth.

Depth is strongest around product UI, not around generic content. Use glow only when referencing mint commerce energy: {components.commerce-glow-panel} can highlight AI, checkout, or dashboard activity, but normal cards should remain quiet. Avoid glass effects and decorative blur fields unless they are part of a dark nav or product-panel background treatment.

**Components**

Buttons:

- button-primary: The reliable light-surface Shopify CTA. It uses {colors.primary}, white text, and a compact 12px radius so it feels commerce-grade rather than playful.
- button-primary-active: A deep teal active state for primary CTAs. It should appear only while pressed or selected, never as the default hero color.
- button-mint: The signature dark-hero CTA. Its {colors.accent} fill on {colors.darkCanvas} is one of the fastest ways to make a screen feel like Shopify.
- button-mint-active: A brighter mint state for active interaction. Keep text dark with {colors.on-accent}.
- button-dark: Used on light marketing or pricing sections when the page needs a high-contrast command. It mirrors the dark canvas rather than introducing a new black.
- button-secondary: A bordered option for light pages. It should sit beside primary CTAs without competing for conversion.
- button-secondary-on-dark: A transparent dark-surface outline button. Use white text and a soft translucent border.
- button-ghost: Text-like navigation or low-priority commands. Keep spacing tight and avoid pill styling.
- button-pricing-toggle: The monthly/yearly segmented control pattern. It should be pill-shaped, compact, and placed near plan cards.

Cards & Containers:

- card-feature-dark: The default marketing feature card on dark pages. It uses {colors.darkPanel}, {colors.darkBorder}, and rounded corners to create quiet depth.
- card-feature-light: A neutral light feature card for secondary content. Use it when the surrounding page is already bright or pricing-adjacent.
- card-pricing: The base plan card. It should be white, bordered, rounded, and information-dense.
- card-pricing-highlight: A dark emphasized plan card for recommended or Plus-like offers. It must use white text and preserve the same rounded geometry as other plan cards.
- product-dashboard-panel: A brand-specific interface container for screenshots, commerce metrics, charts, checkout previews, and admin-like mockups. It may use more shadow than text cards.
- commerce-glow-panel: A high-energy product module with mint glow. Use for rare hero/product proof moments, not for every card.

Inputs & Forms:

- input-email: Email capture fields are rectangular with rounded 12px corners, clear border, and body-size text. Pair them directly with {components.button-mint} or {components.button-primary}.
- input-dark: Dark forms appear embedded in the hero canvas. Use dark panel fill, a thin green-black border, and white text.
- docs-fallback-page: Support/docs fallback pages are deliberately plain. Use simple typography, white background, dark gray text, and small 6px radii.

Navigation:

- nav-global: The global nav is fixed, dark, and 72px tall. It uses white labels, small semibold text, and Shopify logo prominence without over-framing.
- nav-mega-card: Mega-menu feature links become compact dark cards on mobile and image-led tiles on desktop. Hover motion is subtle: opacity, vertical slide, and image scale.

Pricing:

- Use {components.card-pricing} for normal tiers and {components.card-pricing-highlight} for the plan that needs emphasis.
- Use {typography.pricing-display} for monthly prices, with small captions for billing terms and trial notes.
- Keep comparison rows flat and bordered; do not wrap every row in its own card.
- Payment-method logo rows can be compact, monochrome, and aligned with plan content.

Signature Components:

- Product dashboard panels are the main brand-specific module. They simulate admin, checkout, POS, analytics, or commerce automation without becoming decorative cards.
- Dark mega-menu tiles combine icon/image, title, muted copy, and an arrow reveal. This pattern should feel navigational and product-rich at once.
- Mint glow panels communicate momentum, AI, automation, or conversion. They should be rare enough to feel meaningful.
- Pricing toggles and plan tables are practical commerce artifacts; they are part of the visual identity because Shopify sells operational clarity.

Component hierarchy:

- First tier: primary CTAs, hero product panels, nav, and pricing plan cards.
- Second tier: feature cards, email forms, comparison rows, and mega-menu tiles.
- Third tier: captions, legal notes, payment logos, and supporting badges.
- Keep the first tier visually quieter than a typical campaign page would; Shopify's confidence comes from scale, contrast, and proof.
- Let repeated utility components align to the same 12-16px radius so the site feels systemized across marketing and pricing.

**Do's and Don'ts**

Do:

- Use {colors.darkCanvas} for hero, nav, footer, and product-story sections.
- Put {components.button-mint} on dark heroes when the primary action is conversion.
- Set major headlines in {typography.display} or {typography.hero} with low weight and tight tracking.
- Use {colors.surfaceAlt} and {colors.border} to structure pricing rather than heavy shadows.
- Keep corners in the 12-16px range with {rounded.lg} and {rounded.xl}.
- Use product-dashboard-panel modules to show commerce proof, not generic abstract shapes.
- Let {colors.accent} appear as a precise signal in CTAs, glow, and key metrics.

Don't:

- Do not replace Shopify's dark green-black canvas with generic navy, slate, or pure black.
- Do not make every accent green; reserve {colors.accent} for conversion and signature energy.
- Do not set hero headlines in heavy 700+ weights; Shopify's scale comes from size and low weight.
- Do not add glassmorphism, frosted panels, or decorative gradients that were not observed.
- Do not turn pricing rows into floating nested cards; use tables, borders, and plan cards.
- Do not use rounded pills for every button; default CTAs use {rounded.lg}, while toggles use {rounded.pill}.
- Do not use the Help Center fallback style for flagship marketing pages.

**Responsive Behavior**

| Breakpoint | Width | Behavior |
|---|---:|---|
| xs | 0px | Single-column layout, 16px margins, full-width CTAs |
| sm | 500px | Support pages increase padding; simple forms can sit inline |
| md | 768px | Cards can form two-column grids; nav mega-menu still mobile-first |
| lg | 1024px | Desktop nav appears; mega-menu becomes multi-column |
| xl | 1280px | Wider nav spacing and large product panels |
| 2xl | 1440px | Max-width content with generous side margins |

Touch targets should be at least 44px high. Shopify buttons often exceed that with 12-14px vertical padding and 16px type. Nav list rows on mobile should feel card-like, with roomy 24px vertical padding when they contain icons and descriptions.

Collapsing strategy:

- Stack hero copy above product imagery on mobile.
- Convert desktop mega-menu columns into dark rounded link cards.
- Make pricing plans a vertical stack before comparison tables.
- Keep primary CTA visible near the top; secondary nav can hide behind menu controls.
- Preserve product screenshots with aspect-ratio constraints and crop with object-fit, not distortion.

Image behavior: product and merchant imagery should be crisp, commerce-specific, and full-bleed within rounded containers. Dashboard screenshots can scale larger than their frame for cinematic crop, but text should remain legible at desktop sizes.

Responsive visual checks:

- At mobile widths, no heading should require horizontal scrolling or letter squeezing.
- Dark nav panels should fill the viewport width and keep their card links tappable.
- Pricing cards should preserve plan hierarchy even when stacked.
- Product dashboard panels should crop from the edges, not from the core metric or checkout content.
- CTA pairs should stack only when the available inline width makes the secondary action feel cramped.

**Iteration Guide**

1. Check the first viewport: it should contain either {colors.darkCanvas} or a strong Shopify product/pricing surface.
2. Verify the primary CTA: dark heroes should use {components.button-mint}; light pages should use {components.button-primary}.
3. Audit type weight: hero and section headlines should stay around 300-360, not bold.
4. Confirm neutral palette: light surfaces should use {colors.canvas}, {colors.surface}, {colors.surfaceAlt}, and zinc borders.
5. Inspect card geometry: most cards should use {rounded.xl}; pills should be limited to toggles and badges.
6. Look for product specificity: include dashboard, checkout, POS, pricing, or merchant modules before adding abstract decoration.
7. Test mobile collapse: nav, pricing cards, forms, and feature grids should stack without shrinking text below {typography.body-sm}.
8. Limit glow: only one or two modules should use {components.commerce-glow-panel} energy on a screen.

**Known Gaps**

Observed directly: homepage HTML/CSS, pricing HTML/CSS, POS product page HTML/CSS, and a Help Center content page response on 2026-05-18. The strongest evidence is for colors, type scale variables, radii, nav behavior, pricing cards, and dark product panels.

Derived: semantic color names, component names, and some hover/pressed mappings were inferred from repeated CSS values and class naming. Exact computed values can vary by breakpoint because Shopify's bundles redefine type tokens across media queries.

Uncertain: the live docs/support experience may differ when fully hydrated or authenticated. Campaign pages use additional display fonts, but those appear page-specific, so they are documented as exceptions rather than core tokens.

Source pages reviewed:

- https://www.shopify.com/
- https://www.shopify.com/pos
- https://www.shopify.com/pricing
- https://help.shopify.com/en/manual/intro-to-shopify

Extraction notes:

- CSS bundles exposed ShopifySans, Inter-Variable, IBMPlexMono, and multiple campaign display families.
- Repeated values such as {colors.accent}, {colors.darkCanvas}, {colors.border}, and {colors.muted} drove the stable token choices.
- Some CSS colors appeared only in media, campaign, or icon contexts and were not promoted to core tokens.
