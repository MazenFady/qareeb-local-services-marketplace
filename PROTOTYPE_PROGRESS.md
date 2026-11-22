# Qareeb (قريب) — Local Services Booking Marketplace Prototype
## UI-Only Prototype Progress & Handoff Report

**Project Name:** Qareeb (قريب) — Local Services & Appointment Marketplace  
**Directory:** `C:\Users\Techno Shield\.gemini\antigravity\scratch\local-services-marketplace`  
**Current Status:** Completed & Fully Interactive UI Prototype  
**Date:** November 2026  

---

### 1. Executive Summary & Product Concept

**Qareeb (قريب)** is a responsive, bilingual (Arabic & English) web marketplace designed to seamlessly connect neighborhood customers with local appointment-based service providers — specifically barbershops, hair salons, nail lounges, skincare/facial clinics, and wellness spas.

This project delivers a **UI-only prototype** for exploring visual aesthetics, responsive ergonomics, multi-role workflows, and user experience. It uses realistic mock data and responsive client-side state transitions with **zero external backend, real database, payment processing, or SMS/email gateway connected**.

A prominent **Demo Role Switcher** is pinned to the top of every screen, allowing immediate switching between three distinct user experiences:
1. **Customer View**
2. **Provider Portal**
3. **Platform Administrator Console**

---

### 2. Detailed Screen-by-Screen Implementation

#### 2.1 Demo Role Switcher & Universal Navigation
- **Role Switcher Header**: Sticky top announcement bar featuring an active role indicator (`Customer View` / `Provider Portal` / `Admin Console`) and a persistent demo disclaimer reminding users that this is a simulated experience.
- **Brand Identity**: Custom "Qareeb / قريب" emblem with an amber-to-terracotta gradient, localized taglines, and adaptive styling.
- **Language Switcher**: Dedicated one-click button toggling between **English (LTR)** and **العربية (RTL)**. Switches the entire document layout (`dir="rtl"` vs `dir="ltr"`), typography (Plus Jakarta Sans vs Cairo/Tajawal), chevron directions, and all visible interface strings.
- **Theme Switcher**: Instant toggle between **Light Mode** (pearl background, crisp contrast, refined borders) and **Dark Mode** (deep slate `#090D16` and `#111827`, luminous amber/emerald accents, zero eye strain).
- **Session Persistence**: Language, theme, and active role selections persist across browser refreshes via `localStorage`.
- **Mobile Responsive Drawer**: Off-canvas sliding menu for seamless navigation on smartphone screens (tested at 375px viewport).

#### 2.2 Customer Experience
- **Distinctive Homepage**:
  - **Hero Discovery Section**: Headline with verified provider count badge, description, and an integrated search box with inputs for Service Keyword, Location/Neighborhood, Availability Date dropdown ("Today", "Tomorrow", "This Weekend"), and "Find Services" action.
  - **Popular Service Categories**: Interactive category cards covering barbers, hair and beauty, skincare and laser, doctors and medical clinics, bridal and makeup, and other local services. Counts reflect current mock provider records; categories without mock providers show zero.
  - **"Available Today" Section**: Filtered showcase of providers with verified same-day openings to bypass waitlists.
  - **"Popular Near You" Section**: Neighborhood-trending salons with high customer engagement.
  - **"Top-Rated Specialists" Section**: Curated leaderboard of providers sorted by review ratings (4.9★+).
  - **Trust & Value Highlights**: Three-pillar cards highlighting 100% Vetted & Licensed partners, Real-Time Instant Slots, and Verified Client Reviews.
- **Search & Discovery Page**:
  - **Refinement Sidebar**: Filter by keyword, neighborhood/city, category, price tier (Budget-Friendly, Standard, Premium), minimum rating (Any, 4.0+, 4.5+), and availability ("Anytime" vs "Available Today only").
  - **Sorting**: Instant sorting by Recommended, Highest Rated, and Lowest Price.
  - **Provider Cards**: Rich cards with venue photos, instant booking / top-rated badges, verified ratings with review counts, distance indicator, next available time slot, starting price, and "View Details" & "Book Appointment" buttons.
  - **Empty State**: Friendly fallback card with one-click filter reset when search yields no matches.
- **Public Service-Provider Profile**:
  - **Hero & Cover Photo**: High-resolution venue photography with verified partner badge and responsive back button.
  - **Floating Business Card**: Provider avatar, business title, rating, review count, neighborhood, and prominent primary "Book Appointment" button.
  - **About & Philosophy**: Rich narrative detailing business heritage, hygiene philosophy, and specialty services.
  - **Business Highlights**: Feature chips including 10+ Years Experience, Hospital-Grade Sanitization, Complimentary Espresso & Wi-Fi, Private Parking, and Award-Winning Senior Artists.
  - **Categorized Service Menu**: Detailed catalog of treatments with prices, durations in minutes, descriptions, and direct "+ Book Appointment" buttons that pre-populate the booking wizard.
  - **Venue & Work Portfolio Gallery**: Tabbed photo gallery showcasing venue atmosphere and client haircuts/styling results with hover captions.
  - **Customer Ratings & Reviews**: Star breakdown meter (88% 5-star, 10% 4-star, 2% 3-star), verified appointment badges, client testimonials, and management responses. Includes an interactive "Share Your Experience" review simulation.
  - **Interactive Visual Vector Map Placeholder**: Styled SVG vector street grid with city zoning, animated pulse pin for the provider's exact venue, "Get Directions" simulation, and an address copy button with clipboard toast notification.
  - **Direct Contact & Social Links**: WhatsApp button (simulates opening direct WhatsApp chat with notification), Instagram handle link, and Facebook link.
- **5-Step Simulated Booking Flow Wizard**:
  - **Step 1 (Select Services)**: Checkboxes to select or bundle multiple services with live running duration and total price calculation.
  - **Step 2 (Specialist Selection)**: Choose between "Any Available Specialist (Fastest)" or specific named staff members with avatars and individual ratings.
  - **Step 3 (Date & Time)**: Interactive date selector (Today, Tomorrow, Weekend) and slot picker categorized into Morning, Afternoon, and Evening slots.
  - **Step 4 (Client Details & Notes)**: Booking summary review card plus inputs for Client Name, Phone Number, and Special Requests.
  - **Step 5 (Instant Confirmation)**: Confirmation screen displaying a generated reservation reference code (e.g. `#BK-8021`), summary details, "Add to Calendar" action, and "View in My Bookings" button.
- **"My Bookings" Screen**:
  - **Tabbed Overview**: "Upcoming", "Past & Completed", and "Cancelled".
  - **Booking Cards**: Display provider name, service bundle, specialist, scheduled date & time, price, status badge, and booking ID.
  - **Interactive Actions**:
    - **Cancel Appointment**: Prompts confirmation, updates state immediately, marks booking as cancelled, updates badge to red, and moves it to the Cancelled tab.
    - **Reschedule**: Triggers simulated reschedule request toast.
    - **Re-book**: Immediately re-opens the booking wizard for that provider.

#### 2.3 Service Provider Experience (Provider Portal)
- **Operations Dashboard**:
  - **Header & Live Controls**: Displays active provider name ("The Royal Fade Gentlemen's Lounge"), online status badge, "Public Preview" shortcut, and "Take a Break / Vacation Mode" toggle.
  - **Today's KPI Cards**: Today's Bookings count, Pending Approval count, Estimated Daily Revenue (EGP), and Slot Occupancy (%).
  - **Incoming Booking Requests Queue**: Live cards showing client name, phone, requested service, specialist, and price. Includes **Accept Request** (moves request into today's timeline and updates stats) and **Decline** (dismisses request with notification).
  - **Today's Schedule Timeline**: Chronological hourly schedule with client names, services, and an interactive **Mark as Completed** button that updates booking status live.
- **Services & Prices Manager**:
  - Catalog table displaying all menu items with category, price, duration, and status.
  - Inline "+ Add New Service" form allowing the provider to specify Title (EN/AR), Price, and Duration, immediately appending the new service to the menu.
- **Schedule & Working Hours**:
  - Day-by-day weekly schedule editor with opening and closing time inputs and Open / Closed (Day Off) toggles.
  - Emergency Vacation Mode switch that pauses online booking.
- **Reviews & Reputation Manager**:
  - List of customer reviews with a simulated "Reply to Client" form that publishes a public response from the management.
- **Public Profile Preview Mode**:
  - Dedicated preview screen that renders the provider's public page as seen by customers, framed with a green preview banner and a "Return to Provider Dashboard" shortcut.

#### 2.4 Platform Administrator Experience (Admin Console)
- **Overview Dashboard & KPI Stats**:
  - High-level marketplace metrics: Active Providers (148), Registered Clients (4,230), Monthly Bookings (12,850), Gross Volume (EGP 412,500), and Platform Satisfaction (4.9 / 5). These are illustrative mock metrics.
  - Action Required Queue highlighting pending verifications and flagged dispute tickets.
  - Regional platform health statistics (verification speed, booking completion rate, dispute resolution rate).
- **Provider Approval Queue**:
  - Table of pending merchant onboarding applications showing business name, commercial registration number, category, owner details, and verified documents (`Commercial License`, `Health & Safety Permit`).
  - Interactive **Approve & Publish** action (approves application, removes from queue, adds provider to the search directory) and **Reject Application** action.
- **Global Bookings Ledger**:
  - Platform-wide audit table tracking all customer appointments across all providers with real-time status badges (`Confirmed`, `Pending`, `Completed`, `Cancelled`).
- **Content & Dispute Moderation Queue**:
  - Reported reviews with severity flags (`Suspected Spam / Competitor`, `Pricing / Service Dispute`, `Inappropriate Language`).
  - Interactive **Dismiss Report** (keeps review published) and **Hide / Censor Review** (removes review from public view) actions.
- **Automated Moderation & Forbidden Keywords**:
  - Blacklisted words tag cloud with interactive "Add Keyword" input and remove tag buttons.
  - Automated rule toggles: Auto-block phone numbers and external URLs, Auto-flag sensitive vocabulary, and Auto-notify business owner on 1-star reviews.

---

### 3. Interactive vs. Simulated Breakdown

| Feature Area | Working Frontend State (Interactive) | Intentionally Simulated (No Backend) |
| :--- | :--- | :--- |
| **Demo Role Switcher** | 100% interactive: switches entire app layout, menus, permissions, and dashboards in 1 click. | No real user login, session tokens, or JWTs. |
| **Language & RTL** | 100% interactive: flips layout (`dir="rtl"` / `dir="ltr"`), typography, and translates all strings into Arabic & English. | No external translation API (uses built-in dictionary). |
| **Theme Toggle** | 100% interactive: switches CSS variables for Light Mode and Dark Mode with full contrast. | Stored in `localStorage`, no remote profile sync. |
| **Search & Filters** | 100% interactive: live filtering by category, keyword, price tier, rating, and availability. | Mock in-memory provider array. |
| **5-Step Booking Flow** | 100% interactive: selects services, specialist, date, time slots, validates form, generates `#BK-xxxx` ID, and adds booking to user's appointments and provider schedule. | No real payment gateway (Stripe/PayPal), credit card forms, or booking hold database locks. |
| **Booking Actions** | 100% interactive: Cancel booking updates status live to Cancelled; Reschedule triggers confirmation toast. | No real cancellation penalty or webhook notification. |
| **Provider Portal** | 100% interactive: Accept/Decline incoming requests moves them to schedule timeline; Add Service updates service catalog; Toggle vacation mode pauses booking. | No real SMS alerts sent to client phone numbers. |
| **Admin Console** | 100% interactive: Approve/Reject merchant applications; Dismiss/Hide flagged reviews; Add/Remove forbidden keywords; Toggle moderation rules. | No real government registry check or credit scoring. |
| **Map & Directions** | 100% interactive: SVG styled vector map with road grid, zones, pulse pin, and clipboard copy. | No paid Google Maps / Mapbox JavaScript API key. |
| **Social Links** | 100% interactive: Clicking WhatsApp, Instagram, or Facebook displays informative toast notifications with actual handles. | Does not open external apps or leak phone numbers. |

---

### 4. How to Run and Preview the Prototype

#### Option A: 1-Click Launch (Recommended)
Double-click `run.bat` located inside the project directory:
```
C:\Users\Techno Shield\.gemini\antigravity\scratch\local-services-marketplace\run.bat
```
If Node.js is present, it will automatically launch the lightweight local web server on `http://localhost:3000` and open your default browser. If Node.js is not in the system PATH, it automatically opens `index.html` directly in your browser.

#### Option B: Open `index.html` Directly
Because all scripts and stylesheets are organized cleanly without build-time compilation requirements, you can open `index.html` directly in any modern browser:
```
file:///C:/Users/Techno%20Shield/.gemini/antigravity/scratch/local-services-marketplace/index.html
```

#### Option C: Run Local Node Server
From PowerShell or Command Prompt inside the project folder:
```powershell
node server.js
```
Then navigate to `http://localhost:3000`.

---

### 5. Recommended Next Steps for Turning Prototype into Production

1. **Backend & API Architecture**:
   - Build a RESTful or GraphQL API (Node.js/Express, NestJS, or Go) to replace `js/state.js` and `js/mock-data.js`.
   - Implement PostgreSQL or MongoDB schema for `Providers`, `Services`, `Specialists`, `Bookings`, `Users`, and `Reviews`.
2. **Real Authentication & Role-Based Access Control (RBAC)**:
   - Replace the demo role switcher with secure authentication (OAuth2 / Supabase Auth / Clerk / Firebase Auth) with distinct roles: `customer`, `provider_owner`, `provider_staff`, and `platform_admin`.
3. **Calendar Availability Engine**:
   - Connect live provider calendars with slot conflict prevention (handling double-booking edge cases and buffer times between treatments).
4. **Payment & Escrow Gateway**:
   - Integrate local payment processors (e.g., Mada, Apple Pay, STC Pay, Stripe) supporting deposit holds, pay-at-venue, or automated split payments for platform commissions.
5. **Real-time Notifications**:
   - Integrate WhatsApp Business API and SMS gateways (Twilio / Unifonic) for instant appointment confirmations, reminders 2 hours before the visit, and cancellation notices.
6. **Live Mapping**:
   - Replace the SVG vector placeholder with Google Maps Platform or Mapbox GL with geolocation autocomplete.
