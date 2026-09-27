---
version: alpha
name: "ESN"
slug: "esn"
source: "https://www.esn.com/"
extractedAt: "2026-05-21"
description: "Performance-led supplement commerce system built on black-and-white authority, electric cyan conversion accents, condensed uppercase hero typography, rounded CTA pills, and dense product-detail modules such as flavor profiles, trust signals, and sticky purchase bars."

colors:
  primary: "#4EC3E0"
  accent: "#000000"
  accentHover: "#000000"
  accentPressed: "#000000"
  ink: "#000000"
  body: "#232323"
  muted: "#6E7173"
  canvas: "#FFFFFF"
  surface: "#FFFFFF"
  surfaceAlt: "#EDF1F2"
  border: "#DEDede"
  borderStrong: "#B3B3B3"
  link: "#232323"
  success: "#2DB463"
  warning: "#F0BB00"
  error: "#D81A1A"
  conversion-cyan: "#4EC3E0"
  category-designer: "#D74388"
  category-vegan: "#6CC24A"
  category-pro-series: "#8D9093"
  sales-red: "#B70832"
  review-surface: "#F8F9FA"
  skeleton: "#EDF1F2"
  on-primary: "#000000"
  on-dark: "#FFFFFF"

typography:
  hero:
    fontFamily: "'DIN Condensed VF', Helvetica, Arial, sans-serif"
    fontSize: 80px
    fontWeight: 600
    lineHeight: 1.10
    letterSpacing: "-0.02em"
  display:
    fontFamily: "'DIN Condensed VF', Helvetica, Arial, sans-serif"
    fontSize: 64px
    fontWeight: 600
    lineHeight: 1.13
    letterSpacing: "-0.02em"
  headline-lg:
    fontFamily: "'Wix Madefor Text', Helvetica, Arial, sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0em"
  headline-md:
    fontFamily: "'Wix Madefor Text', Helvetica, Arial, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.14
    letterSpacing: "0em"
  title-lg:
    fontFamily: "'Wix MadeFor Display', Helvetica, Arial, sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.00
    letterSpacing: "-0.04rem"
  title-md:
    fontFamily: "'Wix MadeFor Display', Helvetica, Arial, sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.00
    letterSpacing: "-0.03rem"
  button:
    fontFamily: "'Wix Madefor Text', Helvetica, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.11
    letterSpacing: "0.0125em"
  button-cta:
    fontFamily: "'Wix Madefor Text', Helvetica, Arial, sans-serif"
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.10
    letterSpacing: "0.0125em"
  body:
    fontFamily: "'Wix Madefor Text', Helvetica, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.375
    letterSpacing: "0em"
  body-lg:
    fontFamily: "'Wix Madefor Text', Helvetica, Arial, sans-serif"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.30
    letterSpacing: "0em"
  label:
    fontFamily: "'Wix Madefor Text', Helvetica, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.29
    letterSpacing: "0em"
  caption:
    fontFamily: "'Wix Madefor Text', Helvetica, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.33
    letterSpacing: "0em"
  pricing-display:
    fontFamily: "'Wix Madefor Text', Helvetica, Arial, sans-serif"
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.30
    letterSpacing: "0em"

rounded:
  sm: 4px
  md: 8px
  lg: 16px
  xl: 27px
  pill: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  section: 64px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.xl}"
    padding: "16px 16px"
  button-primary-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xl}"
  button-secondary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button}"
    rounded: "{rounded.xl}"
    padding: "16px 16px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.xl}"
    padding: "16px 16px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "0px"
    padding: "0px"
  button-product-cta:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-cta}"
    rounded: "{rounded.xl}"
    padding: "16px 16px"
  card-product-compact:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.body}"
    rounded: "{rounded.lg}"
    padding: "16px"
  card-product-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.body}"
    rounded: "{rounded.pill}"
    padding: "4px 8px"
  card-review:
    backgroundColor: "{colors.review-surface}"
    textColor: "{colors.body}"
    rounded: "{rounded.lg}"
    padding: "16px"
  input-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "4px 4px 0 0"
    padding: "16px"
  select-elevated:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "5px"
    padding: "16px"
  nav-mobile-drawer:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.body}"
    rounded: "0px"
    padding: "24px 16px"
  nav-desktop-dropdown:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.body}"
    rounded: "{rounded.md}"
    padding: "24px 24px 40px"
  bar-sticky-add-to-cart:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.body}"
    rounded: "{rounded.md}"
    padding: "16px 24px"
  panel-flavor-profile:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-dark}"
    rounded: "0px"
    padding: "40px 24px 80px"
  chip-goal:
    backgroundColor: "{colors.surfaceAlt}"
    textColor: "{colors.body}"
    rounded: "{rounded.pill}"
    padding: "4px 8px"
---

## Overview
ESN presents itself less like soft wellness commerce and more like a disciplined performance engine. The visual system starts with stark black-and-white foundations, then injects `{colors.primary}` (`#4EC3E0`) as a conversion color rather than a decorative wash. Headlines use a condensed, uppercase display voice that feels gym-signage-adjacent: fast, direct, and assertive. Body copy, labels, and utility UI switch to a more neutral sans for legibility and trust.

What makes ESN recognizable is not only the cyan CTA, but the contrast between hard-edged communication and softened interaction surfaces. Buttons are rounded pills, compact cards use softened corners, and the shopping flow layers in reassurance modules such as trust badges, review blocks, flavor scoring, and sticky purchase bars. Marketing pages, collection pages, and product detail pages all share the same brand tone, but they operate in slightly different modes: campaign-first on the homepage, utility-first on collections, and evidence-plus-conversion on product detail.

Studied pages:
- Homepage: `https://www.esn.com/en`
- Product detail: `https://www.esn.com/en/products/esn-designer-whey-protein`
- Collection / pricing reference: `https://www.esn.com/en/collections/whey-protein`
- Content / brand page: `https://www.esn.com/en/pages/ueber-uns`

Key Characteristics:
- Use `{typography.hero}` and `{typography.display}` for bold, uppercase, compressed statements rather than elegant editorial headlines.
- Keep the main canvas almost entirely `{colors.canvas}` and `{colors.surface}` so `{colors.primary}` reads as a tactical buying signal.
- Pair dense information modules with generous internal padding from `{spacing.md}` to `{spacing.section}`.
- Favor pill and soft-rectangle radii for actions and metadata, while preserving a mostly flat visual field.
- Treat product imagery as a central UI element, often framed by simple white containers rather than decorative backplates.
- Use black panels, black buttons, and black text to reinforce authority, evidence, and seriousness.
- Build product trust with repeated modules: reviews, lab quality claims, price context, flavor profiles, FAQs, and sticky checkout affordances.

## Colors
### Primary & Action
`{colors.primary}` (`#4EC3E0`) is the conversion cyan. It powers primary CTAs, cart badges, and the most commercially important highlights.
ESN does not scatter it everywhere; its restraint is exactly what makes it effective.

`{colors.accent}` (`#000000`) is the authority color. It appears in secondary buttons, dark modules, headings, and product-detail emphasis areas.
In ESN, black is not neutral chrome; it is part of the brand promise.

`{colors.link}` (`#232323`) keeps links and supporting navigation grounded in the main text tone.
The site avoids bright hyperlink blue and instead keeps text interactions inside the monochrome system.

### Surfaces
`{colors.canvas}` (`#FFFFFF`) is the default page field. Large areas stay white so products, promotions, and copy blocks feel precise rather than lifestyle-heavy.

`{colors.surface}` (`#FFFFFF`) is used for cards, drawers, dropdowns, and sticky bars.
ESN often relies on contour, spacing, and bordering rather than strong fill shifts to separate these modules.

`{colors.surfaceAlt}` (`#EDF1F2`) is the light utility surface.
It appears in chips, skeleton states, overlay headers, and supportive UI sections where a white-on-white distinction would be too subtle.

`{colors.review-surface}` (`#F8F9FA`) is an even lighter content surface used for review and support contexts.
It keeps testimonials feeling clean and credible instead of overly promotional.

### Neutrals & Text
`{colors.ink}` (`#000000`) is the hardest text and icon color.
Reserve it for display statements, active form states, strong separators, and moments where the brand wants to sound most certain.

`{colors.body}` (`#232323`) is the default reading tone.
It softens black slightly without diluting contrast, which suits product education and dense ecommerce copy.

`{colors.muted}` (`#6E7173`) handles secondary copy, inactive support text, and lower-priority labels.
ESN uses it to keep information depth high without turning pages into black blocks.

`{colors.border}` (`#DEDede`) and `{colors.borderStrong}` (`#B3B3B3`) structure cards, quantity controls, form bottoms, and utility divisions.
The system prefers border logic over shadow logic.

### Semantic
`{colors.success}` (`#2DB463`) signals successful form states and affirmative commerce feedback.
It is functional, not celebratory.

`{colors.warning}` (`#F0BB00`) is available for cautionary states but is visually much quieter in the observed pages than success or error.

`{colors.error}` (`#D81A1A`) marks invalid fields and error messaging.
It is paired with border changes more often than with large red backgrounds.

### Brand-Specific Signatures
`{colors.category-designer}` (`#D74388`) appears as a product-family marker for Designer lines.
Use it as a categorical accent, not as a global action color.

`{colors.category-vegan}` (`#6CC24A`) gives vegan products their own identity inside the broader ESN system.

`{colors.category-pro-series}` (`#8D9093`) and `{colors.sales-red}` (`#B70832`) support product segmentation and promotional urgency.
They are brand-specific utilities, not base palette replacements.

`{colors.skeleton}` (`#EDF1F2`) is important because ESN leans on loading states in commerce modules.
The skeleton system stays pale, neutral, and non-distracting.

## Typography
Font families:

| Role | Font stack |
| --- | --- |
| Display / hero | `'DIN Condensed VF', Helvetica, Arial, sans-serif` |
| UI / body / buttons | `'Wix Madefor Text', Helvetica, Arial, sans-serif` |
| Editorial display subheads | `'Wix MadeFor Display', Helvetica, Arial, sans-serif` |

| Type level | Size | Weight | Line-height | Letter-spacing |
| --- | ---: | ---: | ---: | --- |
| `{typography.hero}` | 80px | 600 | 1.10 | -0.02em |
| `{typography.display}` | 64px | 600 | 1.13 | -0.02em |
| `{typography.headline-lg}` | 32px | 700 | 1.25 | 0em |
| `{typography.headline-md}` | 28px | 700 | 1.14 | 0em |
| `{typography.title-lg}` | 32px | 700 | 1.00 | -0.04rem |
| `{typography.title-md}` | 24px | 700 | 1.00 | -0.03rem |
| `{typography.button}` | 18px | 500 | 1.11 | 0.0125em |
| `{typography.button-cta}` | 20px | 700 | 1.10 | 0.0125em |
| `{typography.body-lg}` | 20px | 400 | 1.30 | 0em |
| `{typography.body}` | 16px | 400 | 1.375 | 0em |
| `{typography.label}` | 14px | 700 | 1.29 | 0em |
| `{typography.caption}` | 12px | 400 | 1.33 | 0em |
| `{typography.pricing-display}` | 20px | 700 | 1.30 | 0em |

Principles:
- Split the system by intent: condensed uppercase for ambition, neutral sans for explanation.
- Let big statements shout through compression, not through bright color or giant tracking.
- Keep paragraph tracking mostly neutral; the brand’s typographic character comes from family choice and case, not decorative spacing.
- Use bold and semibold frequently in labels, module titles, and commerce metadata to compress decisions.
- Save `{typography.title-lg}` and `{typography.title-md}` for modules that need a more polished display tone than the hard-edged DIN hero voice.

## Layout
The observed layout system uses breakpoints at 36rem, 48rem, 64rem, and 78rem, with `12` desktop columns, `1.5rem` desktop gutters, `1rem` tablet/mobile gutters, and a core content max-width of `78rem`.
Top and bottom section padding shifts from `{spacing.xl}`-adjacent mobile spacing to a desktop section rhythm equivalent to `{spacing.section}`.
The desktop header grows to `168px`, while mobile and tablet stay at `97px`.
Product lists expand from single-column and two-column mobile logic into three- and four-column commerce grids.

Whitespace philosophy: ESN is not minimal in content, but it is disciplined in framing.
White space is used to keep dense product information readable and to stop campaign modules from collapsing into noise.
Gaps are usually driven by a simple scale of `4 / 8 / 16 / 24 / 40 / 64`, with frequent use of `{spacing.md}`, `{spacing.lg}`, and `{spacing.xl}`.
The system feels measured rather than airy.

## Elevation & Depth
ESN stays mostly flat.
The shadow system exists, but it is light and utility-driven: `0 4px 10px 0 rgb(0 0 0 / 3%)`, `0 0 10px rgb(0 0 0 / 5%)`, `0 0 10px 0 rgba(0,0,0,.1)`, and `0 0 4px 0 rgba(0,0,0,.15)`.
Strong hierarchy is usually built through typography, color contrast, borders, and fixed-position behavior rather than thick shadow stacks.

Where depth does appear, it tends to support interaction: sticky add-to-cart bars, elevated selects, toasts, and drawer-style navigation.
This means screens should feel crisp and commerce-focused, not glassy or tactile.
If something floats, it should be because it is actionable or temporary.

## Components
### Buttons
`button-primary` uses `{colors.primary}` with `{colors.on-primary}` and `{rounded.xl}`.
This is the main conversion CTA and should feel immediate, bright, and legible against the otherwise monochrome system.

`button-secondary` flips to `{colors.accent}` with `{colors.on-dark}`.
ESN uses black-filled buttons often enough that they feel brand-native, not fallback.

`button-ghost` keeps a white surface with black text and the same rounded pill geometry.
It works best when a module already has enough structural contrast and only needs a low-noise action.

`button-text` removes pill logic entirely.
Use it for inline module affordances, accordion triggers, or low-priority utility interactions.

`button-product-cta` is the strongest sales button.
It pairs the cyan fill with uppercase emphasis and heavier weight so the add-to-cart moment feels more urgent than a generic site CTA.

### Cards & Containers
`card-product-compact` is the core commerce tile.
It uses a white surface, `{rounded.lg}`, tight internal grid spacing, and strong product-image anchoring.
The card is compact, practical, and designed for dense comparison.

`card-product-pill` is the small metadata badge used for flavor counts and similar shorthand.
It is lightly bordered, pill-shaped, and intentionally supportive rather than promotional.

`card-review` keeps testimonials on a pale neutral surface.
The visual goal is proof, not decoration.

`bar-sticky-add-to-cart` is the mobile-to-desktop commerce rail that appears when buying should remain in view.
It stays white, slightly elevated, and compact enough to coexist with content rather than replace it.

### Inputs & Forms
`input-default` is one of the most distinctive utility patterns on the site.
Inputs are mostly white, medium-weight, and use a top-rounded, bottom-emphasized field shape rather than a fully pill-shaped control.

`select-elevated` differs from plain text fields by using a full rounded outline, subtle shadow, and heavier label styling.
It reads more like a controlled commerce selector than a simple form input.

The newsletter form follows the same grammar: restrained white field, muted label, success icon tucked into the field area, and a strong black submit button.

### Navigation
`nav-mobile-drawer` is a full-height white side panel with dense link rows, separators, and nested drill-down logic.
It feels more like a structured catalog than a playful burger menu.

`nav-desktop-dropdown` expands into wide white mega-nav panels with thumbnail rows, bestseller circles, category lists, and teaser cards.
The dropdown system is content-heavy, but the white background and clear spacing keep it scannable.

### Pricing
The pricing system prefers strong numeric emphasis without turning into flashy discount graphics.
Prices sit close to product titles, compare-at prices soften into lighter gray, and unit pricing stays visibly secondary.

Quantity selectors use a bordered soft-rectangle shell and stay visually subordinate to the main CTA.
The user should see the buying choice, then the amount control.

### Signature Components
`panel-flavor-profile` is the clearest ESN-specific module.
It turns flavor claims into a structured scorecard with a black backdrop, white text, dot ratings, and tasting-note fields.
This is a product storytelling pattern, not a generic feature list.

`chip-goal` captures user intent categories such as muscle building, endurance, weight loss, and healthy living.
These pills are quiet utility filters that support product relevance without overwhelming the page.

Another brand-specific pattern is the repeated trust stack: star ratings, lab-tested statements, community counts, and science-based claims arranged near the purchase zone.
This repetition is part of the brand system.

## Do's and Don'ts
### Do's
- Use `{typography.hero}` or `{typography.display}` in uppercase for big campaign claims, especially when the message is short and performance-oriented.
- Place `{colors.primary}` on the most important action in a module and let neighboring actions fall back to `{colors.accent}` or `transparent`.
- Keep product cards on `{colors.surface}` with `{rounded.lg}` and restrained bordering instead of adding decorative gradients.
- Use `{spacing.md}` and `{spacing.lg}` generously inside dense commerce modules so technical product data stays readable.
- Pair `{colors.accent}` backgrounds with `{colors.on-dark}` text when a module needs seriousness, trust, or premium emphasis.
- Use `{card-product-pill}` and `{chip-goal}` patterns for compact metadata, especially counts, goals, or product-family shorthand.
- Preserve the black flavor-profile panel as a distinct signature moment rather than restyling it into a generic light card.

### Don'ts
- Do not wash large page areas in `{colors.primary}`; ESN uses cyan sparingly so that action stands out.
- Do not replace `{typography.hero}` with a geometric sans or friendly rounded font; the compressed DIN voice is central to brand recognition.
- Do not introduce soft pastel shadows or glass panels around `{card-product-compact}`; the brand is sharper and flatter than that.
- Do not make primary forms pill-shaped. `{input-default}` should keep its squared bottom logic and utility feel.
- Do not style every CTA as black. Reserve `{button-secondary}` for authority or contrast moments, and keep `{button-primary}` as the conversion beacon.
- Do not turn goal chips into loud badges with saturated fills; `{chip-goal}` should remain neutral and supportive.
- Do not use colorful hyperlinks that fight `{colors.link}` and `{colors.body}`. ESN keeps links inside the monochrome reading system.

## Responsive Behavior
| Breakpoint | Width | Observed role |
| --- | --- | --- |
| xs | 0px | Base mobile stack |
| sm | 576px | Larger phones / early two-up media handling |
| md | 768px | Tablet layout switch |
| lg | 1024px | Desktop nav, wider product logic |
| xl | 1248px | Full desktop width token boundary |
| media-xl | 1366px | Responsive asset sizing checkpoint |

Touch targets should remain at least `44-45px` tall, matching the observed button minimums. Product CTAs and drawer interactions should not shrink below the site’s standard button heights.

Collapsing strategy:
- Collapse the mega-navigation into a full-height side drawer with nested drill-down panels.
- Convert sticky commerce behavior into a bottom-anchored purchase rail on smaller screens.
- Let product grids reduce progressively from 4-up to 3-up, 2-up, and then single-column or compact stacked cards.
- Preserve CTA prominence even when text wraps; ESN would rather stack controls than make the buy button feel tiny.
- Keep trust, review, and flavor modules in the product flow, but allow them to become vertical and full-width.

Image behavior: product photography stays large, clean, and containment-aware.
Commerce thumbnails often use contained object fitting, while some studio-shot contexts switch to cover.
Avoid aggressive cropping that hides packaging identity.

## Iteration Guide
1. Check whether the screen’s main claim actually uses `{typography.hero}` or `{typography.display}`. If the top message feels polite instead of forceful, it is off-brand.
2. Audit the action hierarchy: the single most important action should use `{button-primary}` or `{button-product-cta}` with `{colors.primary}`.
3. Review whitespace inside modules. If product info blocks have less than `{spacing.md}` padding, the result will feel cramped and unlike ESN.
4. Inspect cards and chips. `{card-product-compact}`, `{card-product-pill}`, and `{chip-goal}` should stay simple, white or pale, and softly rounded.
5. Verify form treatment. Inputs should follow `{input-default}` and not drift into fully pill-shaped SaaS controls.
6. Compare dark modules against `{panel-flavor-profile}`. If a black section lacks strong white typography and purposeful structure, refine it.
7. Measure the amount of `{colors.primary}` on the page. If cyan is everywhere, the conversion signal loses its edge.
8. Confirm that evidence modules exist near buying moments: reviews, trust claims, price context, or product-specific scoring should support conversion.

## Known Gaps
Observed directly:
- Global color, spacing, breakpoint, and typography tokens from live CSS.
- Homepage campaign structure and navigation behavior.
- Product detail components including add-to-cart, quantity selector, sticky purchase bar, review references, and flavor profile.
- Collection/listing patterns and compact product-card structure.
- About page content mode and trust-stat storytelling.

Derived conservatively:
- Semantic token naming in the YAML frontmatter.
- Consolidated type scale aliases such as `{typography.hero}` and `{typography.headline-lg}` mapped from observed class families.
- Rounded scale buckets that normalize observed values like `4px`, `5px`, `8px`, `16px`, `27px`, `28px`, and pill treatments.

Uncertain or incomplete:
- No standalone pricing page was found; the collection page was used as the pricing/listing reference.
- Some component states, hover transitions, and niche category accents were inferred from CSS tokens more than from rendered screenshots.
- The exact visual appearance of all promo campaign variants may shift over time, especially seasonal banners and landing pages.
- A few hover/pressed color changes keep the same background and mostly alter text tone, so `accentHover` and `accentPressed` should be treated as conservative placeholders rather than broad brand colors.
