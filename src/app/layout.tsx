import "@/app/globals.css";

import { getLocale, setRequestLocale } from "next-intl/server";
import { locales } from "@/i18n/locale";
import { cn } from "@/lib/utils";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  setRequestLocale(locale);

  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "";
  const googleAdsenseCode = process.env.NEXT_PUBLIC_GOOGLE_ADCODE || "";
  
  // 动态设置canonical URL - 开发环境用localhost，生产环境用aidiabetes.net
  const canonicalUrl = webUrl.includes('localhost') 
    ? webUrl 
    : 'https://aidiabetes.net';

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {googleAdsenseCode && (
          <meta name="google-adsense-account" content={googleAdsenseCode} />
        )}

        {/* Favicon 配置 - 让谷歌能正确识别网站图标 */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        
        {/* Canonical URL 配置 - 告诉搜索引擎网站的标准地址 */}
        <link rel="canonical" href={canonicalUrl} />

        {locales &&
          locales.map((loc) => (
            <link
              key={loc}
              rel="alternate"
              hrefLang={loc}
              href={`${canonicalUrl}${loc === "en" ? "" : `/${loc}`}/`}
            />
          ))}
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      </head>
      <body>{children}</body>
    </html>
  );
}
