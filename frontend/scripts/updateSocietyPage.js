const fs = require('fs');

const code = \"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";

// --- Simple Toast System ---
type Toast = { id: number; message: string; type: "success" | "error" | "warning" };

const ToastContainer = ({ toasts, onRemoveToast }: { toasts: Toast[], onRemoveToast: (id: number) => void }) => {
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={\px-4 py-3 rounded shadow-lg text-white font-bold text-sm min-w-[250px] transform transition-all duration-300 \\\}
          onClick={() => onRemoveToast(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
};
// ---------------------------

const SwipeToVote = ({ onVote, isVoting, disabled }: { onVote: (reset: () => void) => void, isVoting: boolean, disabled: boolean }) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = () => {
    if (disabled || isVoting) return;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - 25; 
    const maxX = rect.width - 50; 
    setDragX(Math.max(0, Math.min(newX, maxX)));
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const rect = containerRef.current?.getBoundingClientRect();
    const maxX = rect ? rect.width - 50 : 200;

    if (dragX > maxX * 0.8) {
      setDragX(maxX); 
      onVote(() => setDragX(0)); 
    } else {
      setDragX(0); 
    }
  };

  return (
    <div 
      ref={containerRef}
      className={\elative h-12 rounded-xl border overflow-hidden select-none touch-none \\}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className={\bsolute inset-0 flex items-center justify-center text-sm font-bold tracking-wide \\}>
        {isVoting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Processing...
          </span>
        ) : disabled ? "Voting Disabled" : "Swipe to Vote ➔"}
      </div>
      <div className="absolute top-0 left-0 h-full bg-indigo-600/10" style={{ width: dragX + 25 }}></div>
      <div 
        onPointerDown={handlePointerDown}
        className={\bsolute top-0 left-0 h-full w-12 rounded-xl flex items-center justify-center shadow-sm z-10
          \ 
          \\}
        style={{ transform: \	ranslateX(\px)\ }}
      >
        <span className="font-bold text-lg leading-none mt-[-2px]">v</span>
      </div>
    </div>
  );
};

export default function VotingPage() {
  const router = useRouter();
  const { id: societyId } = useParams();
  
  const searchParams = useSearchParams();
  const isViewOnly = searchParams.get("viewOnly") === "true";
  
  const [positions, setPositions] = useState<any[]>([]);
  const [votingFor, setVotingFor] = useState<number | null>(null);
  const [votedPositions, setVotedPositions] = useState<Set<number>>(new Set()); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [nowTime, setNowTime] = useState(Date.now());
  const [viewedResults, setViewedResults] = useState<Set<number>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // -- Toast State --
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (message: string, type: Toast["type"]) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };
  const removeToast = (id: number) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  };
  const showSuccess = (msg: string) => addToast(msg, "success");
  const showError = (msg: string) => addToast(msg, "error");
  const showWarning = (msg: string) => addToast(msg, "warning");
  // -----------------

  useEffect(() => {
    const token = localStorage.getItem("voting_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    audioRef.current = new Audio('/tick.mp3');
    fetchPositions();
    
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [societyId]);

  useEffect(() => {
    let playTick = false;
    positions.forEach(pos => {
      if (pos.resultTime) {
        const diff = new Date(pos.resultTime).getTime() - nowTime;
        if (diff > 0 && diff <= 600000) { // Play tick only if within 10 minutes (600s)
          playTick = true;
        }
      }
    });
    if (playTick && audioRef.current) {
        audioRef.current.play().catch(e => {});
    }
  }, [nowTime, positions]);


  const fetchPositions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(\http://localhost:3001/admin/societies/\/positions\);
      const data = await res.json();
      setPositions(data);
      
      await checkVotedPositions();
    } catch (err) { 
      console.error(err);
      showError("Failed to load positions");
    } finally {
      setIsLoading(false);
    }
  };

  const checkVotedPositions = async () => {
    try {
      const token = localStorage.getItem("voting_token");
      const userDataStr = localStorage.getItem("user_data");
      
      if (!token || !userDataStr) return;
      
      const userData = JSON.parse(userDataStr);
      const userId = userData.id;

      const res = await fetch(\http://localhost:3001/vote/status/\?societyId=\\, {
        headers: { "Authorization": \Bearer \\ }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.votedPositionIds && Array.isArray(data.votedPositionIds)) {
          setVotedPositions(new Set(data.votedPositionIds));
        }
      }
    } catch (err) {
      console.error("Failed to check voted positions:", err);
    }
  };

  const handleVote = async (candidateId: number, candidateName: string, positionId: number, resetSwipe: () => void) => {
    if (isViewOnly) {
      showWarning("You are not eligible to vote in this society's election");
      resetSwipe();
      return;
    }

    if (votedPositions.has(positionId)) {
      showError(\You have already voted for the \ position\);
      resetSwipe();
      return;
    }

    if (!confirm(\Are you sure you want to vote for \?\\n\\nThis action cannot be undone.\)) {
      resetSwipe(); 
      return;
    }

    setVotingFor(candidateId);
    try {
      const token = localStorage.getItem("voting_token");
      if (!token) {
        showError("Authentication error: Please log in again");
        window.location.href = "/login"; 
        return;
      }

      const res = await fetch("http://localhost:3001/vote", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": \Bearer \\ 
        },
        body: JSON.stringify({ candidateId, societyId, positionId }), 
        cache: "no-store", 
      });

      const data = await res.json();

      if (res.status === 401) {
        showError("Session Expired! Please log in again");
        localStorage.removeItem("voting_token");
        localStorage.removeItem("user_data");
        window.location.href = "/login"; 
        return;
      }

      if (res.ok) {
        setVotedPositions(prev => new Set([...prev, positionId]));
        
        const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
        userData.hasVoted = true;
        localStorage.setItem("user_data", JSON.stringify(userData));

        showSuccess(\You have successfully voted for \!\);
      } else {
        showError(data.message || "Failed to process your vote. Please try again.");
      }
    } catch (err) {
      console.error("Vote error:", err);
      showError("Network error: Failed to connect to the server");
    } finally { 
      setVotingFor(null); 
      resetSwipe(); 
    }
  };

  const triggerResults = (posId: number) => {
    setViewedResults(prev => new Set([...prev, posId]));
    confetti({
      particleCount: 150,
      spread: 120,
      origin: { y: 0.3 }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/dashboard')} className="text-slate-500 hover:text-slate-900 transition flex items-center gap-2 font-medium text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <div className="text-slate-900 font-bold text-sm tracking-wide">Voting Hub</div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 md:p-12 relative z-10">
            <div className="text-center pb-8 mb-8 border-b border-slate-100">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Official Election</h1>
              <p className="text-indigo-600 font-semibold tracking-wide text-sm">Secure & Anonymous Voting Process</p>
            </div>
            {isViewOnly && (
              <div className="bg-red-50 text-red-700 text-center py-3 px-4 mb-10 rounded-lg text-sm font-medium border border-red-100">
                <span className="mr-2">⚠️</span> View Only Mode - You are not eligible to vote in this election
              </div>
            )}
            {votedPositions.size > 0 && !isViewOnly && (
              <div className="bg-emerald-50 text-emerald-700 text-center py-3 px-4 mb-10 rounded-lg text-sm font-medium border border-emerald-100">
                <span className="mr-2">✓</span> You have securely submitted {votedPositions.size} vote{votedPositions.size > 1 ? 's' : ''}
              </div>
            )}
            <div className="space-y-16">
              {positions.map((pos) => {
                let diff = 0;
                if (pos.resultTime) {
                    diff = new Date(pos.resultTime).getTime() - nowTime;
                }
                const isCountdownFinished = pos.resultTime && diff <= 0;
                const isViewingResults = viewedResults.has(pos.id);
                
                const winner = (pos.candidates || []).reduce((prev: any, current: any) => {
                    return (prev && prev.voteCount > current.voteCount) ? prev : current;
                }, null);

                return (
                  <div key={pos.id} className="relative">
                    {/* View results animated header */}
                    {isViewingResults && winner && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-center shadow-sm animate-pulse-once">
                        <span className="text-indigo-800 font-bold uppercase tracking-widest text-sm">Election Concluded</span>
                        <h2 className="text-2xl font-extrabold text-indigo-900 mt-1"> Winner: {winner.name} 🎉 </h2>
                      </div>
                    )}
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                          {pos.name} 
                          {isViewingResults && (winner ? <span className="text-sm font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase tracking-wider">Results Unsealed</span> : null)}
                        </h2>
                        <p className="text-slate-500 font-medium text-sm mt-1 uppercase tracking-wider">
                          {pos.candidates.length} Candidates
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        {pos.resultTime && diff > 0 && (
                            <div className="bg-slate-100 rounded-lg px-4 py-2 flex items-center gap-3 border border-slate-200 shadow-inner">
                                <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Reveal In</span>
                                <div className="text-lg font-mono font-bold text-indigo-600">
                                    {String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0')}:
                                    {String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0')}:
                                    {String(Math.floor((diff / 1000) % 60)).padStart(2, '0')}
                                </div>
                            </div>
                        )}
                        
                        {isCountdownFinished && !isViewingResults && (
                            <button onClick={() => triggerResults(pos.id)} className="bg-indigo-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-indigo-700 transition shadow-md uppercase tracking-wider text-sm flex items-center gap-2 animate-bounce">
                                View Results ➔
                            </button>
                        )}
                        
                        {!isViewingResults && votedPositions.has(pos.id) && (
                          <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                            <span className="mr-2">✓</span> Vote Recorded
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pos.candidates.map((c: any) => (
                        <div key={c.id} className={\group relative bg-white border \ rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform \\}>
                          <div className="relative h-64 overflow-hidden">
                            <img src={c.profilePic || undefined} alt={c.name} className={\w-full h-full object-cover transition-transform duration-700 \\} />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 p-5 w-full flex justify-between items-end">
                              <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">
                                {c.name}
                              </h3>
                            </div>
                            
                            {isViewingResults && winner?.id === c.id && (
                                <div className="absolute top-3 left-3 bg-indigo-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase shadow-lg border border-indigo-400">
                                    🌟 Winner
                                </div>
                            )}
                            
                            {/* Live Result Vote Tag Overlay */}
                            {isViewingResults && (
                                <div className={\bsolute top-3 right-3 \ text-white font-bold font-mono px-4 py-1 rounded-lg text-sm shadow-xl\}>
                                    {c.voteCount} Votes
                                </div>
                            )}
                          </div>
                          <div className="p-5">
                            <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                              {c.description}
                            </p>
                            {!isViewOnly ? (
                              votedPositions.has(pos.id) || isCountdownFinished || isViewingResults ? (
                                <button disabled className="w-full py-3.5 bg-slate-100 text-slate-400 font-bold rounded-lg cursor-not-allowed transition-colors text-sm uppercase tracking-wider">
                                  {isCountdownFinished ? "Voting Closed" : "Completed"}
                                </button>
                              ) : (
                                <SwipeToVote onVote={(reset) => handleVote(c.id, c.name, pos.id, reset)} isVoting={votingFor === c.id} disabled={false} />
                              )
                            ) : (
                              <button disabled className="w-full py-3.5 bg-slate-50 border border-slate-200 text-slate-400 font-bold rounded-lg cursor-not-allowed transition-colors text-sm uppercase tracking-wider">
                                View Only
                              </button>
                            )}
                          </div>
                          {!isViewingResults && votedPositions.has(pos.id) && (
                            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/40 text-white flex items-center justify-center backdrop-blur-sm pointer-events-none">
                              <span className="text-lg transform rotate-[-15deg]">🔒</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="border-b-2 border-slate-100 mt-16 last:hidden" />
                  </div>
                );
              })}
            </div>
            {positions.length === 0 && (
              <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                <p className="text-slate-500 font-medium tracking-wide">
                  No positions active in this election yet.
                </p>
              </div>
            )}
            <div className="mt-16 text-center text-slate-400 text-xs uppercase tracking-widest font-medium">
              End of Ballot
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
\;

fs.writeFileSync('src/app/dashboard/society/[id]/page.tsx', code);
console.log('Done!');