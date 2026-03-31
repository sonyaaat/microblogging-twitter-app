export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">MicroblogApp</h1>
        <p className="text-lg text-gray-400">Welcome! Please <a href="/login" className="text-blue-500 underline">login</a> to continue.</p>
      </div>
    </main>
  );
}
