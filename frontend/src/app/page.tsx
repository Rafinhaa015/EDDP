import { BookOpen, CheckCircle2, Clock, Download, MonitorSmartphone, ShieldCheck, Target, Zap } from 'lucide-react';
import { HeroAuth } from '@/components/HeroAuth';
import { IntroVideo } from '@/components/IntroVideo';

const sessions = [
  {
    n: 1,
    title: 'Mentalidade de Vendedor de Elite',
    time: '~50 min',
    cover: '/covers/mentalidade.svg',
    lessons: ['A Psicologia do NÃO', 'Visão de Longo Prazo e Protagonismo', 'A Reta Final – Foco e Energia Imparável'],
  },
  {
    n: 2,
    title: 'Ensinamentos Básicos de Vendas',
    time: '~1h 10min',
    cover: '/covers/fundamentos.svg',
    lessons: ['O Ciclo Básico de Vendas', 'Como Escutar Mais do que Falar', 'Autoridade e Primeira Impressão'],
  },
  {
    n: 3,
    title: 'Técnicas Práticas e Fechamento',
    time: '~1h 30min',
    cover: '/covers/tecnicas.svg',
    lessons: ['Qualificação de Leads e Dores', 'Contorno das 5 Objeções Mais Comuns', 'Fechamento de Alto Impacto'],
  },
];

const benefits = [
  { icon: Zap, title: 'Microlearning', text: 'Aulas de 15 a 35 minutos, direto ao ponto.' },
  { icon: Target, title: 'Foco na execução', text: 'Scripts, checklists e rotinas prontas para aplicar hoje.' },
  { icon: Download, title: '3 materiais em PDF', text: 'Mapa de Resiliência, Checklist de Atendimento e Script de Vendas.' },
  { icon: MonitorSmartphone, title: 'Qualquer tela', text: 'Assista no celular, tablet ou computador.' },
  { icon: CheckCircle2, title: 'Certificado', text: 'Emitido automaticamente ao concluir 100% do curso.' },
  { icon: ShieldCheck, title: 'Dados protegidos', text: 'Plataforma em conformidade com a LGPD.' },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:py-20">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">
              <BookOpen className="h-3.5 w-3.5" /> Baseado em Flávio Augusto, Caio Carneiro e Andy Elliott
            </span>
            <h1 className="text-4xl leading-[1.05] font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Venda mais a partir <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">desta semana</span>.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-slate-300">
              3h30 de treinamento prático para vendedores e empreendedores iniciantes: mentalidade, fundamentos e técnicas de fechamento — sem enrolação.
            </p>
            <IntroVideo />
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand-400" /> 3h30 de conteúdo</li>
              <li className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-brand-400" /> 9 aulas em 3 sessões</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-400" /> Certificado de conclusão</li>
            </ul>
          </div>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <HeroAuth />
          </div>
        </div>
      </section>

      {/* Sessões */}
      <section className="border-t border-white/5 bg-ink-900/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-bold text-white">O que você vai aprender</h2>
          <p className="mt-2 text-slate-400">Uma trilha em 3 sessões, da mentalidade ao fechamento.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {sessions.map((s) => (
              <article key={s.n} className="card-3d overflow-hidden rounded-2xl border border-white/10 bg-ink-850">
                <img src={s.cover} alt="" className="aspect-[16/9] w-full object-cover" />
                <div className="space-y-4 p-6">
                  <p className="text-xs font-semibold tracking-wider text-brand-400 uppercase">Sessão {s.n} · {s.time}</p>
                  <h3 className="text-lg font-bold text-white">{s.title}</h3>
                  <ul className="space-y-2">
                    {s.lessons.map((l) => (
                      <li key={l} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {l}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold text-white">Feito para você executar</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <Icon className="h-6 w-6 text-brand-400" aria-hidden />
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-1 text-sm text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
