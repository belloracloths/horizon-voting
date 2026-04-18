"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pass }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_name", data.name);
      
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efecd2] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-serif">
      
      {/* Old School Dotted Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1a2f4c 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0 text-center">
        <div className="flex justify-center p-4 bg-white border-4 border-[#d5cbb4] shadow-md inline-flex mx-auto mb-6">
          <img src="/vote.png" alt="Logo" className="h-16 w-auto object-contain drop-shadow-md" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-[#1a2f4c] uppercase tracking-widest">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm font-bold text-[#8b2635] uppercase tracking-widest">
          Campus Voting System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        {/* Old School Form Container */}
        <div className="bg-[#fbf9f4] py-8 px-6 shadow-2xl border-4 border-double border-[#d5cbb4] relative sm:px-10">

          {/* Decorative Corners */}
          <div className="absolute top-2 left-2 w-2 h-2 bg-[#1a2f4c]"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-[#1a2f4c]"></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#1a2f4c]"></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#1a2f4c]"></div>

          <form className="space-y-5" onSubmit={handleLogin}>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1a2f4c] mb-1">Email Address</label>
              <input
                type="email" required placeholder="admin@campus.edu"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 bg-white border-2 border-[#d5cbb4] focus:outline-none focus:border-[#1a2f4c] sm:text-sm text-[#1a2f4c] font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1a2f4c] mb-1">Password</label>
              <input
                type="password" required placeholder="••••••••"
                value={pass} onChange={(e) => setPass(e.target.value)}
                className="block w-full px-4 py-3 bg-white border-2 border-[#d5cbb4] focus:outline-none focus:border-[#1a2f4c] sm:text-sm text-[#1a2f4c] font-bold"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-center">
                <p className="mt-2 text-xs font-bold text-[#c0392b] bg-[#fceef0] border border-[#fadbd8] p-2 text-center">
                  {error}
                </p>
              </div>
            )}

            <div>
              <button
                type="submit" disabled={isLoading}
                className="w-full mt-4 flex justify-center py-3 px-4 shadow-lg text-sm font-bold text-white uppercase tracking-widest bg-[#1a2f4c] border-2 border-[#1a2f4c] hover:bg-[#2c4875] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>Sign in to Dashboard</>
                )}
              </button>
            </div>
            
            <div className="pt-2 text-center text-[10px] font-bold text-[#8b2635] uppercase tracking-widest">
              Only authorized staff may access this portal.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
