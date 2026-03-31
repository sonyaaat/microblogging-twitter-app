import LoginForm from '../../../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-120px] right-[-120px] w-[320px] h-[320px] bg-gradient-to-br from-blue-400 to-pink-400 opacity-30 blur-3xl rounded-full z-0" />
      <div className="absolute bottom-[-120px] left-[-120px] w-[320px] h-[320px] bg-gradient-to-tr from-pink-400 to-blue-400 opacity-30 blur-3xl rounded-full z-0" />
      <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center z-10">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent select-none">Microlog</h1>
        <LoginForm />
      </div>
    </main>
  );
}
