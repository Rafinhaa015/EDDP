import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-brand-400">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">Página não encontrada</h1>
      <Link href="/" className="mt-6 inline-block font-semibold text-brand-400 hover:underline">Voltar ao início</Link>
    </div>
  );
}
