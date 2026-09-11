import Script from "next/script";

/**
 * Falls back to the id given for this project so it works out of the box,
 * but stays overridable via env so a project copied from this template
 * doesn't silently ship with someone else's Analytics property.
 */
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-8C8ZD033W9";

export function GoogleAnalytics() {
  return (
    <>
      <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
                });
              `,
          }}
      />
    </>
  );
}
