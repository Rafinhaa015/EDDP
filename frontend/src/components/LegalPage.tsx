export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <article className="prose-legal mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{title}</h1>
      {updated && <p className="mt-2 text-sm text-slate-500">Última atualização: {updated}</p>}
      <div className="mt-6">{children}</div>
    </article>
  );
}
