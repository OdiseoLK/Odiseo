import Navbar from '@/components/site/Navbar';
import Atmosphere from '@/components/site/Atmosphere';
import MusicProvider from '@/components/site/MusicProvider';
import KonamiEgg from '@/components/site/KonamiEgg';
import NowBanner from '@/components/site/NowBanner';
import Footer from '@/components/site/Footer';
import { getSettings } from '@/lib/data';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <MusicProvider>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-electric focus:px-4 focus:py-2 focus:text-ink">
        Saltar al contenido
      </a>
      <Atmosphere fixed />
      <Navbar />
      <NowBanner text={settings.now_banner ?? ''} />
      <main id="contenido" className="relative z-10 min-h-screen">{children}</main>
      <Footer settings={settings} />
      <KonamiEgg />
    </MusicProvider>
  );
}
