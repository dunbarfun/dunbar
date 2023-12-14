import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();
  return (
    <div className="grid flex-1 h-full justify-center items-center bg-background-primary">
      <div className="text-white flex flex-col items-center">
        <h1 className="text-2xl font-semibold">Seems like you are lost</h1>
        <h2 className="text-xl font-medium mt-1">
          Let&#39;s take you back home
        </h2>

        <button
          onClick={() => router.push('/')}
          className="mt-4 text-xl px-8 py-2 bg-primary rounded-full"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
