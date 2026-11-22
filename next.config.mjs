/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    // Forces HTTPS for future requests. Vercel serves everything over
    // HTTPS already, so this header formalizes that rather than changing
    // behavior — low-risk to add. Omitting the "preload" directive
    // deliberately: submitting to the browser HSTS preload list
    // (hstspreload.org) is a one-way decision for the domain owner to make
    // explicitly, not something to opt a site into from application code.
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

// A Content-Security-Policy header is intentionally NOT included here.
// Getting one right requires knowing the exact set of script/style/font
// origins Next.js's hydration and this app's fonts/analytics actually use
// in the deployed environment, then testing that the site still works
// under it — neither of which is possible in this sandbox (no running
// server, no browser). Shipping a misconfigured CSP would break the site
// silently for real users, which is worse than shipping none. Add one
// after deploying, starting in Report-Only mode.

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    serverComponentsExternalPackages: ["@napi-rs/canvas", "pdfjs-dist"],
  },

  images: {
    remotePatterns: [],
  },

  async headers() {
    return [
      {
        // Apply security headers to all routes.
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Tell crawlers not to index API responses.
        source: "/api/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [];
  },
};

export default nextConfig;
