import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Panel', template: '%s | Panel de la wiki' },
  // El panel no se indexa ni se comparte (spec CMS §4.7).
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="@container min-h-dvh bg-[#00122E] text-white">{children}</div>;
}
