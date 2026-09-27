---
version: alpha
name: Amazon Commerce System
source: https://www.amazon.com
date: 2026-05-07
description: Functional, conversion-oriented marketplace design with a dark utility header, dominant search bar, light-grey commerce canvas, and modular product/category areas.
colors:
  primary: "#0F1111"
  secondary: "#232F3E"
  tertiary: "#FF9900"
  neutral: "#E3E6E6"
  accent: "#FF9900"
  accentSearch: "#FEBD69"
  accentPrimaryButton: "#FFD814"
  accentPrimaryButtonHover: "#F7CA00"
  ink: "#0F1111"
  canvas: "#E3E6E6"
  page: "#FFFFFF"
  surface: "#FFFFFF"
  navDark: "#131921"
  navSecondary: "#232F3E"
  navText: "#F3F3F3"
  link: "#2162A1"
  linkHover: "#C7511F"
  border: "#D5D9D9"
  strongBorder: "#BBBFBF"
  mutedText: "#565959"
  footerDark: "#131A22"
  success: "#007600"
  warning: "#B12704"
  error: "#B12704"
typography:
  display:
    fontFamily: Arial, sans-serif
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  h1:
    fontFamily: Arial, sans-serif
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.15
  h2:
    fontFamily: Arial, sans-serif
    fontSize: 21px
    fontWeight: 700
    lineHeight: 27px
  h3:
    fontFamily: Arial, sans-serif
    fontSize: 18px
    fontWeight: 700
    lineHeight: 24px
  body:
    fontFamily: Arial, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  small:
    fontFamily: Arial, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  navSmall:
    fontFamily: Arial, sans-serif
    fontSize: 12px
    fontWeight: 700
    lineHeight: 14px
rounded:
  none: 0px
  sm: 3px
  search: 4px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  xxl: 24px
  section: 32px
components:
  header-belt:
    backgroundColor: "{colors.navDark}"
    textColor: "{colors.navText}"
    height: 60px
  header-main:
    backgroundColor: "{colors.navSecondary}"
    textColor: "{colors.navText}"
    height: 39px
  search-field:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    height: 40px
    rounded: "{rounded.search}"
    padding: 10px
  search-submit:
    backgroundColor: "{colors.accentSearch}"
    textColor: "{colors.ink}"
    height: 40px
    width: 48px
    rounded: "{rounded.search}"
  button-buy:
    backgroundColor: "{colors.accentPrimaryButton}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: 8px 14px
  card-category:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: 20px
---

## 1. Source

- URL: https://www.amazon.com
- Date: 2026-05-07
- Short description: Amazon.com homepage, localized to German, with a dark global marketplace header, highly dominant search bar, hero slider, modular category tiles, product carousels, location notice, side-drawer menu, and extensive footer.

## 2. Brand DNA

### Visual Identity

Amazon does not feel like a minimalist brand landing page — it reads as a highly optimised commerce interface. The visual DNA is built from four layers:

1. Dark utility header in navy/anthracite: #131921 and #232F3E.
2. Highly visible search bar as the primary starting point of every journey.
3. Yellow/orange as action and brand signal: search button #FEBD69, CTA #FFD814, smile/accent #FF9900.
4. White-grey modular grid for rapid product exploration.

### Layout Principles

- Header first, brand second, search dominates: the search bar is wider than the logo, account, language selector, and cart combined.
- Maximum information density without decorative complexity.
- Card grid for category entry points, horizontal carousels for product discovery.
- White-on-grey separation instead of heavy shadows.
- Interactive elements receive clear hover outlines, link colours, or yellow CTA surfaces.

### Mood / Product Feel

Pragmatic, direct, catalogue-like, fast, utility-first. Amazon feels like a logistics and retail operation, not an expressive lifestyle brand. Seasonal campaign areas may be soft and colourful, but the core UI remains stable, dark, functional, and transaction-oriented.

## 3. Semantic Tokens

| Role | Token | Value | Usage |
|---|---:|---:|---|
| accent | --amz-accent | #FF9900 | Amazon smile, cart count badge, active brand signals |
| search accent | --amz-search | #FEBD69 | Search button, search-focus warmth |
| primary CTA | --amz-buy | #FFD814 | Buy, continue, primary commerce action |
| primary CTA hover | --amz-buy-hover | #F7CA00 | Hover on buy/continue buttons |
| ink/text | --amz-ink | #0F1111 | Primary text, product names, tile headings |
| canvas/background | --amz-canvas | #E3E6E6 | Page background behind cards |
| page | --amz-page | #FFFFFF | Content surfaces, search field, cards |
| surface/card | --amz-surface | #FFFFFF | Category and carousel surfaces |
| nav dark | --amz-nav-dark | #131921 | Main header |
| nav secondary | --amz-nav-secondary | #232F3E | Secondary navigation, near footer |
| border | --amz-border | #D5D9D9 | Inputs, secondary buttons, tables |
| strong border | --amz-border-strong | #BBBFBF | Popovers, menu dividers, stronger controls |
| muted text | --amz-muted | #565959 | Meta text, helper text, secondary information |
| link | --amz-link | #2162A1 | More-links, domain notice, footer links |
| link hover | --amz-link-hover | #C7511F | Hover/active link reaction |
| success | --amz-success | #007600 | Available, positive delivery notices |
| warning/error | --amz-warning | #B12704 | Price/warning logic, errors and critical commerce notices |

Observed computed values: header #131921, secondary nav #232F3E, text #0F1111, link #2162A1, border/light-grey UI #D5D9D9/#BBBFBF, search button #FEBD69, CTA yellow #FFD814.

## 4. Typography

- Primary: Arial, sans-serif. Amazon Ember is known as the brand typeface, but Arial/sans-serif was observed as the runtime fallback in the DOM.
- Base size: 14px / 20px for body and UI text.
- Header text: 12–14px, often two lines, highly condensed.
- Card headings: approx. 21px, 700, line-height approx. 27px.
- Product labels: 12–13px, compact, directly below images.
- Links: 13–14px, blue #2162A1, no underline until hover.
- Hero campaigns: noticeably larger, heavy and bold, approx. 44–56px depending on the banner.

Hierarchy:

1. Hero campaign headline: display, large, strong.
2. Card headline: 21px bold.
3. Carousel headline: 21px bold, upper left.
4. Product/category label: 12–13px regular.
5. Utility text in header: 12px/14px, second line bold.
6. Footer links: 12–14px, light on dark background.

## 5. Layout System

- Observed viewport width: approx. 1280px.
- Header: 60px main belt plus 39px secondary navigation.
- Main canvas: light-grey block beneath the hero and cards.
- Content width: approx. 1260px, nearly edge-to-edge with small side margins.
- Category grid: 4 columns, cards approx. 295px wide, gutter approx. 20px.
- Tile height: approx. 420px for standard category boxes.
- Card padding: 20px top/sides, 15px bottom.
- Product grid inside cards: mostly 2×2, labels below images.
- Carousel sections: full content width, white background, horizontal product row.
- Footer: multi-layered — first a back-to-top bar, then link columns, then a dark service footer.

Section rhythm:

1. Utility header and secondary navigation.
2. Context popup or address notice.
3. Hero slider.
4. Location/domain notice.
5. Card grid.
6. Wide carousels as visual breathing room.
7. Card grid and carousels again.
8. Dense footer.

## 6. Components

### Buttons

1. Search submit: square/right-aligned search edge, #FEBD69, black icon/text, 40px tall.
2. Buy/continue CTA: pill-like, #FFD814, #0F1111, compact height, hover #F7CA00.
3. Secondary button: white/light, border #D5D9D9, black text.
4. Address-change button: yellow, wider than secondary, inside popover.
5. Carousel arrow: white or semi-transparent surface, large arrow icon, left/right over product rows.
6. Side-menu close: icon button, neutral, top of drawer.
7. Header nav hover item: transparent button/link with a white 1px outline on hover.
8. Footer language/currency button: dark surface, light border, compact controls.

### Cards

9. Category 2×2 card: heading, four image quadrants, link at bottom.
10. Single-image category card: heading, large image, link at bottom.
11. Hero campaign slide: full-width banner surface with large images and arrow controls.
12. Product carousel row: white section, headline, horizontal product images.
13. Location notice card: white bar with blue link.
14. Delivery popover: white popover with arrow, border, two CTAs.
15. Gift-category card: pastel product images, seasonal theme.
16. Bestseller product tile: isolated product image, generous whitespace, horizontally scrolled.
17. Footer service tile: dark sub-brand entries in a grid.
18. Meta/info strip: short notice line about country, delivery, or domain.

### Nav

19. Global header: logo, location, search, language, account, orders, cart.
20. Secondary nav: hamburger, deals, gift cards, Prime Video, customer service.
21. Account flyout trigger: two lines — small text on top, bold on bottom.
22. Language selector: flag plus short code, small arrow.
23. Cart trigger: icon plus counter, orange number.
24. Side drawer: menu sliding in from the left with categories, headings, and sub-lists.

### Hero

25. Seasonal hero: soft campaign colours, large centred theme, product motifs at the edges.
26. Slider controls: large hit areas left/right, visually restrained.

### Forms

27. Search field: dropdown + text field + submit as a single horizontal component.
28. Category select: light-grey dropdown on the left of the search module.
29. Text input: white, border #D5D9D9, focus with orange outline/glow.
30. Select: compact browser/Amazon control with grey surface.
31. Checkbox/radio: standard control, small, close to label.
32. Error message: red-brown #B12704, close to the field, no large illustration.

### Modals/Dropdowns

33. Delivery popover: contextual at the location anchor, white, arrow tip, border.
34. Side menu drawer: fixed left surface, white content, dark login header, overlay context.
35. Dropdown category menu: long list of search categories, compact rows.

## 7. Brand-specific Product Patterns

1. Search-first commerce header: the product experience starts visually with search, not storytelling.
2. Utility header with micro-zones: every header region is its own dense, self-contained interaction block.
3. Dark-to-light marketplace layering: dark navigation on top, grey canvas below, white purchase modules on top of that.
4. 2×2 category-card grammar: heading, four product/category quadrants, bottom link.
5. Big single-shot category entry: for strong campaigns or themes, a card is almost entirely filled by the image.
6. Product carousel slabs: wide white horizontal product rows as visual breathing room between dense tiles.
7. Delivery-context popover: location and delivery availability are not a footer detail — they are an early context layer.
8. Country/domain notice: Amazon treats international redirection as a UI pattern directly beneath the hero.
9. Link blue as commerce escape hatch: small blue links route into deeper category/help pages.
10. No decorative card radius: cards remain square/flat so that density and product images dominate.
11. Orange/yellow split: orange is brand/search, yellow is the buy/continue action.
12. Dense footer ecosystem: the footer is a service directory featuring many Amazon sub-brands, not just navigation.

## 8. Motion / Interaction

Directly observed or derivable from visible controls:

- Header links typically show a white outline on hover.
- Search field focuses with an orange ring/outline, visually highlighting the search module.
- Search button slightly darkens on hover.
- Links shift towards orange/brown (#C7511F) on hover.
- Hero slider and product carousels use arrow navigation.
- Side drawer opens from the left and lays a menu over the page.
- Dropdowns/popovers are contextually coupled to header triggers.
- Back-to-top footer link jumps to the top.
- Interactions are direct, fast, and mostly without soft brand animations.

## 9. Implementation Notes

### CSS-Tokens

```css
:root {
  --amz-nav-dark: #131921;
  --amz-nav-secondary: #232F3E;
  --amz-ink: #0F1111;
  --amz-muted: #565959;
  --amz-canvas: #E3E6E6;
  --amz-surface: #FFFFFF;
  --amz-border: #D5D9D9;
  --amz-border-strong: #BBBFBF;
  --amz-link: #2162A1;
  --amz-link-hover: #C7511F;
  --amz-accent: #FF9900;
  --amz-search: #FEBD69;
  --amz-buy: #FFD814;
  --amz-buy-hover: #F7CA00;
  --amz-success: #007600;
  --amz-warning: #B12704;
  --amz-radius-sm: 3px;
  --amz-header: 60px;
  --amz-subnav: 39px;
}
```

### Component Structure

- `AmazonShell`: Header, Subnav, MainCanvas, Footer.
- `GlobalHeader`: Logo, DeliveryTrigger, SearchBar, LocaleTrigger, AccountTrigger, OrdersLink, CartTrigger.
- `SearchBar`: CategorySelect, SearchInput, SearchSubmit.
- `CategoryCard`: title, gridItems[4], footerLink.
- `ProductCarousel`: title, productTiles, previous/next controls.
- `DeliveryPopover`: message, secondaryAction, primaryAction.
- `SideDrawer`: loginHeader, grouped category lists, expandable rows.
- `FooterDirectory`: backToTop, linkColumns, localeControls, serviceGrid.

### Do

- Make search dominant in the header.
- Keep cards square and white on a light-grey canvas.
- Use links small, blue, and functional.
- Reserve yellow CTAs for commerce actions.
- Do not use orange/yellow as a large-area background.
- Weight product images and categories more heavily than decorative UI.

### Don't

- No heavily rounded SaaS-style cards.
- No large soft shadows like Stripe/Vercel.
- No empty hero marketing surfaces without a product/category reference.
- No uniform pastel world across the whole page — pastel belongs in campaign cards, not in the core UI.
- Do not replace the link-blue tone with a modern neon blue.

## 10. Accuracy Check

### Directly Observed

- Amazon.com with German localisation.
- Header #131921, subnav #232F3E, body/ink #0F1111.
- Arial/sans-serif as computed font.
- Search with category dropdown, 40px height, and search button.
- Card grid with 4 columns, cards approx. 295×420px.
- Category cards, product carousels, hero slider, location notice, delivery popover, side drawer, footer.
- Link colour #2162A1, search button #FEBD69, yellow CTA #FFD814 visible in popovers/buttons.

### Derived

- Amazon Ember as a possible brand font impression, although Arial was observed as the runtime fallback.
- Hover outlines in the header, link hover, and search focus derived from Amazon patterns and visible interactive controls.
- Success/warning/error roles derived from Amazon commerce conventions and the observed red/warning role.
- Components such as price/rating tiles are typical of Amazon but were not prominently visible in this homepage snapshot.

### Uncertain

- Exact hover states were not fully clicked/hovered for every element.
- Hero content is campaign-dependent and can change daily.
- Amazon may show different cards, colours, or rows depending on region, login status, A/B test, and bot detection.

Source: www.designmd-store.com
