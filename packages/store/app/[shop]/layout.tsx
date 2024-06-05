import Navbar from 'components/layout/navbar';
import { GeistSans } from 'geist/font/sans';
import { ensureStartsWith } from 'lib/utils';
import { ReactNode } from 'react';
import '../globals.css';
import { Resource } from 'sst';
import { getShop } from '@/app/actions';
import { notFound } from 'next/navigation';

const SITE_NAME = 'Peasy Store';
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME!,
    template: `%s | ${SITE_NAME}`
  },
  robots: {
    follow: true,
    index: true
  }
  // ...(twitterCreator &&
  //   twitterSite && {
  //     twitter: {
  //       card: 'summary_large_image',
  //       creator: twitterCreator,
  //       site: twitterSite
  //     }
  //   })
};

export default async function RootLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { shop: string };
}) {
  const shop = await getShop(params.shop);
  if (typeof shop === 'string') return notFound();

  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white">
        <Navbar params={params} />
        <main>{children}</main>
      </body>
    </html>
  );
}
