/**
 * ==============================================================================
 * SITE CONFIGURATION (Single Source of Truth)
 * ==============================================================================
 * Edit this single file to completely rebrand and reconfigure your website
 * and application for any new online business or SaaS product.
 * ==============================================================================
 */

const siteConfig = {
  // Brand Identity
  brand: {
    name: "LaunchFlow",
    tagline: "The Zero-Cost Launchpad for Modern Online Businesses",
    description: "Launch your next digital product, service, or micro-SaaS with a production-grade, secure, and responsive web foundation. Completely free to host and deploy.",
    logoText: "LaunchFlow",
    logoIcon: "⚡", // Or replace with SVG in HTML
    accentWord: "Fast.",
  },

  // Color Palette (Populates CSS custom properties dynamically)
  colors: {
    primary: "#2563eb",       // Electric Blue
    primaryHover: "#1d4ed8",  // Darker Blue
    secondary: "#0f172a",     // Slate Dark
    accent: "#10b981",        // Emerald Green (Success / Conversion)
    backgroundLight: "#ffffff",
    surfaceLight: "#f8fafc",
    textLight: "#0f172a",
    mutedLight: "#64748b",
    borderLight: "#e2e8f0",

    // Dark Mode Palette
    backgroundDark: "#0b0f19",
    surfaceDark: "#131b2e",
    textDark: "#f8fafc",
    mutedDark: "#94a3b8",
    borderDark: "#1e293b",
  },

  // Contact Information
  contact: {
    supportEmail: "support@launchflow-demo.com",
    salesEmail: "sales@launchflow-demo.com",
    phone: "+1 (800) 555-0199",
    address: "742 Evergreen Terrace, Suite 100, San Francisco, CA 94107",
    workingHours: "Monday - Friday, 9:00 AM - 6:00 PM EST",
  },

  // Social & Community Links
  social: {
    twitter: "https://twitter.com/launchflow",
    github: "https://github.com/launchflow-starter",
    linkedin: "https://linkedin.com/company/launchflow",
    discord: "https://discord.gg/launchflow",
  },

  // SEO & OpenGraph Metadata
  seo: {
    defaultTitle: "LaunchFlow — Complete Website & App Starter Template",
    titleTemplate: "%s | LaunchFlow",
    defaultDescription: "High-performance, secure, responsive web starter project with integrated API, form validation, and zero-cost Cloudflare Pages deployment.",
    canonicalUrl: "https://launchflow.pages.dev",
    ogImage: "/favicon.svg",
    twitterHandle: "@launchflow",
    locale: "en_US",
    themeColor: "#2563eb",
  },

  // Navigation Links
  navigation: {
    main: [
      { label: "Home", href: "/" },
      { label: "Features", href: "/#features" },
      { label: "App Demo", href: "/app.html" },
      { label: "Pricing", href: "/#pricing" },
      { label: "About", href: "/about.html" },
      { label: "Contact", href: "/contact.html" },
    ],
    footer: {
      product: [
        { label: "Application Demo", href: "/app.html" },
        { label: "Feature Matrix", href: "/#features" },
        { label: "Pricing Calculator", href: "/#pricing" },
        { label: "API Health", href: "/api/health" },
      ],
      company: [
        { label: "About Us", href: "/about.html" },
        { label: "Contact Support", href: "/contact.html" },
        { label: "GitHub Repo", href: "https://github.com/launchflow-starter" },
      ],
      legal: [
        { label: "Privacy Policy", href: "/privacy.html" },
        { label: "Terms of Service", href: "/terms.html" },
        { label: "Security Checklist", href: "/about.html#security" },
      ],
    },
  },

  // Feature Highlights (rendered on Homepage)
  features: [
    {
      icon: "⚡",
      title: "Zero-Cost Hosting",
      description: "Deploys natively to Cloudflare Pages, Vercel, or GitHub Pages with free SSL, global CDN edge distribution, and unlimited traffic.",
    },
    {
      icon: "🛡️",
      title: "Hardened Security",
      description: "Pre-configured Content Security Policy (CSP), anti-clickjacking headers, server-side input sanitization, and IP rate-limiting protection.",
    },
    {
      icon: "📱",
      title: "Responsive by Design",
      description: "Engineered from mobile-first principles with lightweight vanilla CSS variables. Zero heavy CSS framework bloat or runtime lag.",
    },
    {
      icon: "🔌",
      title: "Plug-and-Play Backend",
      description: "Cloudflare Pages serverless functions handling API health, secure contact submissions, rate limiting, and mock CRUD persistence.",
    },
    {
      icon: "🎨",
      title: "Centralized Rebranding",
      description: "Change colors, brand name, copy, and SEO tags from a single configuration file without touching nested HTML tags.",
    },
    {
      icon: "🚀",
      title: "SaaS Foundation Ready",
      description: "Includes an interactive client dashboard demo, local storage state persistence, and pre-wired authentication hooks for Supabase or custom auth.",
    },
  ],

  // Pricing Plans (rendered on Homepage)
  pricing: [
    {
      name: "Starter",
      badge: "Free Forever",
      price: "$0",
      period: "forever",
      description: "Everything you need to test an idea and deploy your first digital storefront.",
      features: [
        "100% Free Hosting (Cloudflare Pages)",
        "Automated Global SSL Certificate",
        "Full Website & Legal Pages",
        "Client-Side State Storage",
        "Community GitHub Support",
      ],
      ctaText: "Start Building Free",
      ctaHref: "/app.html",
      highlighted: false,
    },
    {
      name: "Growth",
      badge: "Most Popular",
      price: "$29",
      period: "one-time",
      description: "Ideal for serious solopreneurs launching micro-SaaS and client portals.",
      features: [
        "Everything in Starter",
        "Edge API Form Handling",
        "Pre-Wired Supabase Auth & DB Hook",
        "IP-Based Rate Limiting Module",
        "Automated SEO Metadata Generator",
        "Priority Email Support",
      ],
      ctaText: "Get Growth Pack",
      ctaHref: "/contact.html?plan=growth",
      highlighted: true,
    },
    {
      name: "Agency",
      badge: "Scale Up",
      price: "$99",
      period: "one-time",
      description: "Unlimited commercial license to build and flip websites for client engagements.",
      features: [
        "Everything in Growth",
        "Unlimited Client Projects",
        "White-label Codebase & Documentation",
        "Custom Domain Multi-Site Script",
        "1-on-1 Architecture Review",
      ],
      ctaText: "Get Agency License",
      ctaHref: "/contact.html?plan=agency",
      highlighted: false,
    },
  ],

  // Frequently Asked Questions
  faq: [
    {
      question: "Is this starter template completely free to host?",
      answer: "Yes. The entire frontend and serverless edge functions deploy 100% free on Cloudflare Pages, Vercel Hobby, or GitHub Pages. You do not need a paid domain or credit card to launch with an automatic HTTPS subdomain.",
    },
    {
      question: "How do I change the brand name and colors?",
      answer: "Simply open `site.config.js` and edit the brand name, colors, and links. The changes automatically cascade across all pages and components without manual HTML edits.",
    },
    {
      question: "Does this template depend on WordPress or Showit?",
      answer: "No. This template uses clean, modern open-source web standards (HTML5, CSS3, ES6+ JavaScript, and Serverless Functions). You own every line of code with zero platform lock-in or recurring software fees.",
    },
    {
      question: "Can I connect an external database like Supabase or Firebase?",
      answer: "Yes. The project includes modular database integration instructions and pre-structured API endpoints (`/functions/api/data.js`) designed to interface with Supabase, Cloudflare D1, or Firebase.",
    },
  ],
};

// Export for Node environments (testing and SSR) or attach to window for browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = siteConfig;
} else if (typeof window !== "undefined") {
  window.siteConfig = siteConfig;
}
