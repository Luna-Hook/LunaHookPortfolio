import type { Metadata } from "next";
import "./globals.css";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const basePath = repositoryName && !repositoryName.endsWith(".github.io") ? `/${repositoryName}` : "";
const siteOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://luna-hook.github.io").origin;

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: { default: "Luna Hook — Developer Portfolio", template: "%s · Luna Hook" },
  description: "Developer portfolio for Luna Hook: Minecraft plugins, Discord integrations, server systems, custom work and commissions.",
  icons: { icon: `${basePath}/favicon.svg`, shortcut: `${basePath}/favicon.svg` },
  openGraph: {
    title: "Luna Hook — Developer Portfolio",
    description: "Plugins, systems, servers, custom work and commissions.",
    type: "website",
    images: [{ url: `${basePath}/og.png`, width: 1200, height: 630, alt: "Luna Hook developer portfolio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luna Hook — Developer Portfolio",
    description: "Plugins, systems, servers, custom work and commissions.",
    images: [`${basePath}/og.png`],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
