import type { Metadata } from 'next';
import Reveal from '@/components/ui/Reveal';
import ProgressBar from '@/components/ui/ProgressBar';
import { getSettings } from '@/lib/data';
import { mdToHtml } from '@/lib/markdown';

export const metadata: Metadata = { title: 'Sobre mí', description: 'Historia, experiencia y habilidades de Odiseo, desarrollador independiente.' };

export default async function AboutPage() {
  const { about } = await getSettings();
  return (
    <div className="container-site pb-24 pt-32">
      <div className="grid gap-14 lg:grid-cols-[320px,1fr]">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <img src={about.photo_url ?? '/covers/avatar.svg'} alt="Retrato de Odiseo" className="glass w-full max-w-[320px] rounded-3xl" />
            <p className="eyebrow mt-6">Desarrollador independiente</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold text-white">Odiseo</h1>
          </div>
        </Reveal>
        <div>
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-white">Historia</h2>
            <div className="prose-site mt-5" dangerouslySetInnerHTML={{ __html: mdToHtml(about.bio) }} />
          </Reveal>

          <Reveal>
            <h2 className="mt-14 font-display text-2xl font-bold text-white">Experiencia</h2>
            <ol className="relative ml-3 mt-6 border-l border-white/10">
              {about.experience.map((e) => (
                <li key={`${e.period}-${e.role}`} className="relative pb-8 pl-7 last:pb-0">
                  <span className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-electric bg-ink" />
                  <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">{e.period}</p>
                  <h3 className="mt-1 font-display font-bold text-white">{e.role} · <span className="text-electric">{e.place}</span></h3>
                  <p className="mt-1 text-sm text-zinc-400">{e.description}</p>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal>
            <h2 className="mt-14 font-display text-2xl font-bold text-white">Habilidades</h2>
            <div className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {about.skills.map((s) => (
                <div key={s.name}>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-sm font-medium text-zinc-300">{s.name}</span>
                    <span className="font-mono text-xs text-electric">{s.level}%</span>
                  </div>
                  <ProgressBar value={s.level} />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
