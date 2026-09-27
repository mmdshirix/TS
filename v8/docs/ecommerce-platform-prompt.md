# AI-Powered E-Commerce Platform — Development Prompt

## Project Overview

Build an AI-powered website-builder platform similar to Shopify, with integrated AI capabilities: an AI chatbot, an AI shopping assistant, a CRM AI, and a Marketing AI, alongside store management. The platform is a Next.js application connecting to an existing PostgreSQL database. The goal is a modern, seamless platform that lets Instagram-based businesses create their own online stores.

Do **not** change the structure of the existing chatbot builder in any way. The chatbot must be embedded inside the user panel as its own collapsible tab, with all of its existing sub-tabs/items intact underneath it.

## Platform Architecture

### Core Structure

- **Main platform (admin panel):** `platform-talksell.ir` — the existing Next.js chatbot-builder application, extended with AI e-commerce capability.
- **Store fronts:** each store gets its own subdomain (e.g. `mysite.tsll.ir`).
- **Storefront app:** a **separate, independent Next.js application** dedicated to rendering published stores on `tsll.ir` subdomains. It connects to the same existing PostgreSQL database but is otherwise a fully separate codebase/deployment from `platform-talksell.ir`. When a store owner publishes their store, it must be reachable at `mysite.tsll.ir`.
- **Chatbot system:** fully-functional integrated AI chatbot.
- **Payment systems:** multi-gateway support (Zarinpal, BalePay, Card-to-Card).
- **Database:** existing PostgreSQL, to be connected (not recreated).
- **Additional service:** a Python microservice for Bale-bot integration, run per-store alongside the existing Docker containers.

### Domain & Hosting

- Admin panel: `platform-talksell.ir`
- Store subdomains: `*.tsll.ir`
- Primary storefront app domain: `tsll.ir` — a separate Next.js app for storefronts, deployed via Docker.
- The root `tsll.ir` domain itself (not a subdomain) must show a scroll-less landing page:
  - Title: "TalkSell — AI-powered store platform"
  - Subtitle: "A path for managers to grow and scale their online businesses with AI"
  - Two buttons beneath the text: **"Start now"** and **"View the TalkSell website"**

## UI/UX Requirements

### General Design Principles

- Modern, smooth animations to convey an AI-powered, cutting-edge feel
- Fully responsive (mobile and desktop) — both the admin panel and every published storefront
- Clean, intuitive interface
- Drag-and-drop functionality for store builders
- Professional, premium aesthetic

### AI Store Templates (Pre-built Themes)

Use the `design-md` folder for design references and the `themes` folder for sample images. The platform must include ready-made templates for:

- Clothing & Apparel
- Cosmetics & Beauty
- Accessories & Jewelry
- Bags & Shoes
- Perfumes & Fragrances
- Mobile Phones & Accessories

**Important:** use the sample UI images from the `themes` folder for template previews.

## Admin Dashboard Structure (Collapsible Menu)

### 1. Dashboard
- Overview
- General statistics
- Recent orders
- Website analytics/visits

### 2. My Store
- Store Settings
- Create Store (multi-step wizard)
- Change Theme (template selection)
- Edit Landing Page (homepage builder with drag-and-drop)
- Edit Product Page (single product page customization)
- Product Management (add/edit/delete products)
- Payment Gateway Settings
- SMS Panel (SMS.ir & MeliPayamak integration)
- Reviews & Comments
- Explorer Manager (Instagram Reels-style content)

### 3. AI Chatbot
- All existing tabs from the current chatbot platform, unchanged — nested under this one collapsible tab.

### 4. Orders
- Complete order management system

### 5. AI Assistant
- SEO Assistant
- Analytics & Statistics Assistant
- Marketing Assistant
- CRM Assistant

### 6. Bale Bot Connection
- Bot configuration and management

### 7. Documentation & Tutorials
- Complete step-by-step guides

## Landing Page Builder Features

### Drag-and-Drop Components

- **Banner** — carousel support, text overlay, link insertion capability
- **Text Section** — title and content blocks, customizable text styling
- **Products** — product grid/list display, customizable layouts
- **Categories** — category grid/display, linked to products
- **Contact Information** — phone number display, contact form option
- **Call-to-Action Buttons** — customizable text and links, multiple style options
- **Store Address** — physical address display, map integration option
- **Social Media Links** — Instagram, Telegram, etc., customizable icons
- **Store Identity** — logo upload, store name editing, browser tab icon (favicon), color scheme customization

All components must be creatable, drag-and-drop reorderable, and editable on the storefront's home/landing page.

## Store Creation Wizard

Multi-step, simplified process with a step-by-step tutorial alongside it:

1. Store Information — name, description, category
2. Theme Selection — choose from pre-made templates
3. Branding — logo, colors, favicon
4. Payment Setup — configure preferred payment gateways
5. Product Setup — add initial products (optional)
6. Review & Launch — final confirmation

## Store Editing Capabilities

- Full header and footer customization
- Row editing and reordering
- Complete landing page customization
- Product page editing

All of the above must be fully editable by that store's own admin.

## Navigation & Integration Requirements

### Navigation Bar

- Must include an AI Chatbot access point
- Seamless connection between the website and the chatbot
- Integration with: store information, Contact Us page, About Us page, and product information (in JSON format for chat display)

### Critical Integration Points

- The chatbot must display product cards with full product information.
- Store data must stay properly synced between the website and the chatbot.
- The JSON product data structure must be accessible for chatbot display.
- API endpoints must be properly configured on the WordPress site (`talksell.ir`).
- Wherever a piece of this integration needs backend support on `talksell.ir`, build a dedicated WordPress plugin (kept separate from the platform codebase) that implements the required JSON payloads, API endpoints, and sync system on the WordPress side.

## Explorer Feature (Instagram Reels Style)

**Purpose:** a section where users upload Instagram-style content and link products to posts, to give Instagram-based shop pages a simple, modern storefront experience.

**Features:**
- Infinite scroll, like Instagram Reels
- Upload Instagram videos (posts/reels)
- Product tagging — pin relevant products to videos
- Interactive elements: like button, share button, comment section
- Product card overlay — clicking it redirects to the product page
- Sticky product card — shows the tagged product's info while scrolling

## E-Commerce Features

### Product Management

- **Product types:** Physical, Digital (downloadable), Services — all three must be fully supported by stores.
- **Product page features:**
  - Image gallery
  - Video embedding
  - Product name and specifications
  - Pricing
  - Detailed description — rich text, editable as a paragraph, with images insertable inline
  - Rating & review system
  - Sticky "Add to Cart" button (appears on scroll)
  - Like and share functionality

### Store Features

- Product display: grid and list views (user-toggleable)
- Search: product search functionality/button
- Categories: category browsing, category grid
- Cart: complete shopping cart
- Checkout: customizable checkout fields, editable from the admin panel
- Order management: complete order tracking and product/order status management
- Customer reviews: review management system
- A `/shop` page listing all products

### Checkout & Payment

Admin-configurable, with exactly three gateway types, each independently toggleable; whichever are enabled appear as selectable options on the checkout page:

1. **Zarinpal**
2. **BalePay** — both in-app and bot-based payments
3. **Card-to-Card** — the store admin enters a card number and IBAN (Sheba) in the admin panel; the customer is then shown a form to upload their payment receipt.

## SMS & Communication

- SMS.ir and MeliPayamak integration, configured according to their respective documentation, for OTP (one-time password) functionality.
- Credentials/settings are configured by the store operator themselves, but the full configuration procedure must be documented step by step in the in-app documentation.

## AI Assistant Features

All AI assistants are powered by DeepSeek and must be highly specialized, accurate, and give real, professional-grade business value — not generic output.

### SEO Assistant
- Meta tags and descriptions
- Content optimization suggestions
- Keyword recommendations
- Product description improvements

### Analytics Assistant
- Visitor statistics analysis
- Sales data interpretation
- Customer behavior insights
- Performance metrics

### Marketing Assistant
- Campaign suggestions
- Discount code generation (with an admin-specified percentage)
- Marketing strategy recommendations
- Customer targeting advice
- Promotional content ideas

### CRM Assistant
- Customer insights and analysis
- Customer segmentation
- Customer retention strategies
- Personalization recommendations

### AI Integration
- Powered by DeepSeek AI
- Highly specialized and accurate
- Real-time suggestions and analytics
- Predictive analytics for business decisions

## Bale Bot Integration

- **Python service:** a separate Python app running on the server alongside the existing Docker containers.
- **Per-store bots:** each store can have its own Bale bot. When a new store is created, a corresponding Python bot instance/service is provisioned for it on the server.
- **Environment variables:** users configure their bot's environment variables from the admin panel so their bot can run.
- **In-app payments:** BalePay integration for mini-app payments inside Bale.
- **AI chatbot:** the Bale bot is connected to the store's AI chatbot system.
- **Documentation:** a complete guide walking users through creating a Bale bot and configuring its environment variables in the admin panel.

## WordPress Integration (talksell.ir)

The existing WordPress site (`talksell.ir`) must be extended with:
- JSON API endpoints
- Product data endpoints
- Chatbot integration endpoints
- Synchronization with the main platform

## Technical Specifications

### Frontend
- Framework: Next.js (a separate app dedicated to storefronts)
- Styling: modern CSS with smooth animations
- Responsive: mobile-first design approach
- State management: efficient state handling for real-time updates

### Backend
- Database: existing PostgreSQL
- Authentication: secure user authentication system
- API: RESTful API design
- Real-time: WebSocket for chat and other real-time features

### Deployment
- Docker containers (existing)
- Python service integration (per-store Bale bots)
- Subdomain routing (`*.tsll.ir`)
- SSL certificate management

### Security
- Secure payment processing
- Data encryption
- User data protection
- Secure API endpoints

## Documentation Requirements

Complete, step-by-step tutorials covering:
- Store creation process
- Chatbot configuration
- Payment gateway setup
- Bale bot setup
- Product management
- Theme customization
- AI assistant usage
- SMS panel configuration
- Marketing tools usage

## Success Criteria

- Seamless platform experience from store creation to launch
- Full integration between the website and the AI chatbot
- Professional, modern design with smooth animations
- Complete e-commerce functionality with multiple payment options
- AI-powered features that provide real business value
- Responsive design on all devices
- Easy-to-use interface for non-technical users
- Instagram-focused features (Explorer, product tagging)
- Reliable performance with zero critical issues
- The whole system must run with precision — no problems for either the admin or the customer — reproducing the simple experience of building an online store, tailored for Instagram-based shop pages
- Comprehensive documentation and user guides
