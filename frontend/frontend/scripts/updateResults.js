const fs = require('fs');

const code = "use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function ElectoralResults() {
  const router = useRouter();
  
  const [societies, setSocieties] = useState<any[]>([]);
  const [selectedSociety, setSelectedSociety] = useState<number | null>(null);
  
  const [positions, setPositions] = useState<any[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  
  const [candidates, setCandidates] = useState<any[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);

  const [viewState, setViewState] = useState<'SELECTING' | 'COUNTDOWN' | 'READY_TO_VIEW' | 'DECRYPTING' | 'GRAPH'>('SELECTING');
  
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchSocieties();
    audioRef.current = new Audio('/tick.mp3');
  }, []);

  useEffect(() => {
    if (viewState === 'GRAPH') {
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.1 },
        colors: ['#c0392b', '#1a2f4c', '#d5cbb4', '#fbf9f4']
      });
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 120,
          origin: { y: 0.4 }
        });
      }, 1000);
    }
  }, [viewState]);

  const fetchSocieties = async () => {
    try {
      const res = await fetch('http://localhost:3001/admin/societies', { cache: 'no-store' });
      const data = await res.json();
      setSocieties(data);
      if (data.length > 0) setSelectedSociety(data[0].id);
    } catch (err) {}
  };

  useEffect(() => {
    if (selectedSociety) fetchPositions(selectedSociety);
  }, [selectedSociety]);

  const fetchPositions = async (socId: number) => {
    try {
      const res = await fetch('http://localhost:3001/admin/societies/' + socId + '/positions', { cache: 'no-store' });
      const data = await res.json();
      setPositions(data);
      if (data.length > 0) {
        setSelectedPosition(data[0].id);
      } else {
        setSelectedPosition(null);
      }
    } catch (err) {}
  };

  const handleLoadResults = async () => {
    if (!selectedPosition) return;
    const pos = positions.find(p => p.id === selectedPosition);
    if (!pos) return;

    if (pos.resultTime) {
      const targetTime = new Date(pos.resultTime).getTime();
      const now = Date.now();
      if (targetTime > now) {
        setViewState('COUNTDOWN');
        return;
      }
    }
    
    // If time has already passed, we can go straight to 'READY_TO_VIEW' or decryption
    setViewState('READY_TO_VIEW');
  };

  const triggerDecryption = async (posId: number) => {
    setViewState('DECRYPTING');
    try {
      const res = await fetch('http://localhost:3001/admin/societies/' + selectedSociety + '/positions', { cache: 'no-store' });
      const allPositions = await res.json();
      const currentPos = allPositions.find((p: any) => p.id === posId);

      if (currentPos && currentPos.candidates) {
        const sortedCandidates = currentPos.candidates.sort((a: any, b: any) => b.voteCount - a.voteCount);
        setCandidates(sortedCandidates);
        const total = sortedCandidates.reduce((sum: number, cand: any) => sum + cand.voteCount, 0);
        setTotalVotes(total);
      }
    } catch (err) {}

    setTimeout(() => {
      setViewState('GRAPH');
    }, 4500); 
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (viewState === 'COUNTDOWN' && selectedPosition) {
      const pos = positions.find(p => p.id === selectedPosition);
      if (!pos || !pos.resultTime) return;
      const targetTime = new Date(pos.resultTime).getTime();
      
      timer = setInterval(() => {
        const now = Date.now();
        const diff = targetTime - now;
        if (diff <= 0) {
          clearInterval(timer);
          setViewState('READY_TO_VIEW');
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        } else {
          setTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / 1000 / 60) % 60),
            seconds: Math.floor((diff / 1000) % 60)
          });
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Audio playback missed", e));
          }
        }
      }, 1000);
    }
    return () => {
      clearInterval(timer);
      if (audioRef.current) audioRef.current.pause();
    };
  }, [viewState, selectedPosition, positions]);

  const maxVotes = Math.max(...candidates.map(c => c.voteCount), 1);
  const winner = candidates.length > 0 && candidates[0].voteCount > 0 ? candidates[0] : null;

  return (
    <div className="min-h-screen bg-[#ece8dc] text-[#333] font-serif relative overflow-hidden">
      <AnimatePresence>
        {(viewState === 'SELECTING' || viewState === 'GRAPH') && (
          <motion.nav 
            initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }}
            className="bg-[#1a2f4c] shadow-2xl border-b-[6px] border-[#c0392b] relative z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              <div className="flex justify-between h-20 items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border-2 border-[#d5cbb4] flex items-center justify-center rotate-45 bg-[#c0392b]">
                    <span className="text-[#fbf9f4] font-bold text-xl -rotate-45">R</span>
                  </div>
                  <h1 className="text-2xl font-bold text-[#fbf9f4] tracking-widest uppercase">Election Results</h1>
                </div>
                <button onClick={() => router.push('/dashboard')} className="bg-[#c0392b] text-[#fbf9f4] px-4 py-2 uppercase tracking-widest text-xs font-bold border-2 border-[#c0392b] hover:bg-[#a93226]">Back</button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {viewState === 'SELECTING' && (
          <motion.div key="sel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto py-20 px-6">
            <div className="bg-[#fbf9f4] border-[8px] border-double border-[#d5cbb4] p-10 mt-10 text-center shadow-xl">
              <h2 className="text-3xl font-extrabold text-[#1a2f4c] uppercase tracking-widest mb-8 border-b-2 border-[#c0392b] inline-block pb-3">Select Election to Unseal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1a2f4c] mb-2">Society</label>
                  <select value={selectedSociety || ''} onChange={e => setSelectedSociety(Number(e.target.value))} className="w-full px-4 py-3 border-2 border-[#d5cbb4] bg-white text-[#1a2f4c] font-bold uppercase tracking-wider focus:outline-none">
                    {societies.map(soc => <option key={soc.id} value={soc.id}>{soc.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1a2f4c] mb-2">Position</label>
                  <select value={selectedPosition || ''} onChange={e => setSelectedPosition(Number(e.target.value))} className="w-full px-4 py-3 border-2 border-[#d5cbb4] bg-white text-[#1a2f4c] font-bold uppercase tracking-wider focus:outline-none">
                    {positions.map(pos => <option key={pos.id} value={pos.id}>{pos.name}</option>)}
                  </select>
                </div>
              </div>
              <button disabled={!selectedPosition} onClick={handleLoadResults} className="bg-[#1a2f4c] text-white px-10 py-4 uppercase tracking-widest font-bold border-2 border-[#1a2f4c] hover:bg-[#2c4875] border-transparent hover:-translate-y-1 transform disabled:opacity-50 disabled:hover:translate-y-0 transition-all">
                Reveal Results
              </button>
            </div>
          </motion.div>
        )}

        {(viewState === 'COUNTDOWN' || viewState === 'READY_TO_VIEW') && (
          <motion.div key="count" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, filter: 'blur(12px)', scale: 1.1 }} transition={{ duration: 1 }} className="absolute inset-0 flex items-center justify-center bg-[#ece8dc] z-30">
            <div className="text-center bg-[#fbf9f4] p-16 border-[12px] border-double border-[#c0392b] shadow-[0_0_50px_rgba(0,0,0,0.3)]">
              <h2 className="text-2xl font-extrabold text-[#1a2f4c] uppercase tracking-[0.3em] mb-4">
                {viewState === 'COUNTDOWN' ? 'Time Until Reveal' : 'Election Concluded'}
              </h2>
              <h3 className="text-sm text-[#8b2635] uppercase tracking-widest font-bold mb-10">{positions.find(p=>p.id===selectedPosition)?.name}</h3>
              
              {viewState === 'COUNTDOWN' ? (
                <div className="flex justify-center gap-6 text-[#1a2f4c]">
                  {[ { label: 'Days', val: timeLeft?.days }, { label: 'Hours', val: timeLeft?.hours }, { label: 'Mins', val: timeLeft?.minutes }, { label: 'Secs', val: timeLeft?.seconds } ].map((t, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="text-5xl md:text-7xl font-mono font-bold border-4 border-[#1a2f4c] bg-white px-4 py-6 w-24 md:w-32 flex justify-center shadow-[4px_4px_0_#d5cbb4]">
                        {t.val !== undefined && !isNaN(t.val) ? String(t.val).padStart(2, '0') : '00'}
                      </div>
                      <span className="mt-4 text-xs uppercase tracking-widest font-bold text-[#888]">{t.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                  <button onClick={() => triggerDecryption(selectedPosition as number)} className="bg-[#c0392b] text-white px-12 py-6 text-xl uppercase tracking-widest font-bold border-4 border-[#1a2f4c] hover:bg-[#a93226] shadow-[6px_6px_0_#1a2f4c] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all">
                    View Results
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {viewState === 'DECRYPTING' && (
          <motion.div key="dec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 flex items-center justify-center bg-black z-40 overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(0, 255, 0, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 0, 0.2) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            <div className="text-left w-full max-w-2xl text-[#0f0] font-mono leading-loose relative z-10 px-10">
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-xl md:text-2xl font-bold mb-6">&gt; INITIALIZING RESULT RETRIEVAL...</motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mb-2">[OK] SECURE BLOCKCHAIN TUNNEL ESTABLISHED</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mb-2">[OK] SMART CONTRACT QUERIED: {positions.find(p=>p.id===selectedPosition)?.name}</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="mb-2 text-yellow-400">[!!] VERIFYING ZERO-KNOWLEDGE PROOFS...</motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="w-full h-4 border border-[#0f0] mt-4 overflow-hidden relative">
                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 2.5, duration: 1.5, ease: 'easeInOut' }} className="h-full bg-[#0f0]"></motion.div>
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4 }} className="mt-4 text-white font-bold blink">&gt; DECRYPTION SUCCESS. RENDERING DATA...</motion.p>
            </div>
          </motion.div>
        )}

        {viewState === 'GRAPH' && (
          <motion.div key="graph" initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }} className="max-w-6xl mx-auto py-12 px-6">
            <div className="bg-[#fbf9f4] border-[8px] border-double border-[#d5cbb4] shadow-2xl p-10 relative z-10 text-center">
              
              {winner && (
                <motion.div initial={{ scale: 0, y: -50 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 0.8, type: "spring", bounce: 0.6 }} className="mb-8">
                   <h2 className="text-[#c0392b] text-xl font-bold uppercase tracking-widest mb-1">Elected for {positions.find(p=>p.id===selectedPosition)?.name}</h2>
                   <h1 className="text-5xl font-extrabold text-[#1a2f4c] uppercase tracking-wider font-serif bg-[#fbf9f4] px-6 py-4 border-4 border-[#1a2f4c] shadow-[6px_6px_0_#d5cbb4] inline-block">🎉 {winner.name} 🎉</h1>
                </motion.div>
              )}

              <div className="text-center mb-6">
                <h2 className="text-2xl font-extrabold text-[#1a2f4c] uppercase tracking-widest font-serif mb-2 pb-2">Full Results Breakdown</h2>
                <div className="mt-2 inline-block bg-[#1a2f4c] text-white px-4 py-1 border-2 border-[#d5cbb4] text-xs">Total Votes Cast: <span className="font-mono text-sm ml-2 text-[#c0392b]">{totalVotes}</span></div>
              </div>
              <div className="mt-8 h-80 flex items-end justify-around gap-4 border-b-4 border-l-4 border-[#1a2f4c] pt-10 pl-8 pb-0 relative bg-[#eae6d8]/30">
                {candidates.map((cand, index) => {
                  const heightPercentage = totalVotes > 0 ? (cand.voteCount / maxVotes) * 100 : 0;
                  const isWinner = index === 0 && cand.voteCount > 0;
                  return (
                    <div key={cand.id} className="flex flex-col items-center flex-1 h-full justify-end group z-10 w-full px-2">
                      <div className="w-full flex items-end justify-center h-full relative">
                        <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 + (index * 0.2) }} className="absolute -top-10 bg-[#1a2f4c] text-white text-xl font-bold font-mono py-1 px-3 border-2 border-[#d5cbb4]">{cand.voteCount}</motion.span>
                        <motion.div initial={{ height: '0%' }} animate={{ height: heightPercentage + '%' }} transition={{ duration: 1.5, type: 'spring', bounce: 0.5, delay: 1 + (index * 0.2) }} className={w-full max-w-[120px] border-2 border-b-0 border-[#1a2f4c] shadow-[4px_0_0_#d5cbb4] }></motion.div>
                      </div>
                      <div className="mt-4 h-16 flex flex-col items-center justify-start w-full relative">
                        <span className="text-xs font-bold text-[#1a2f4c] uppercase tracking-wider text-center w-full bg-[#fbf9f4] px-1 py-1 border-2 border-[#1a2f4c] shadow-[2px_2px_0_#d5cbb4] block mt-1 leading-tight break-words">{cand.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-12 text-center">
                  <button onClick={() => setViewState('SELECTING')} className="bg-transparent border-2 border-[#1a2f4c] text-[#1a2f4c] px-8 py-3 uppercase tracking-widest font-bold hover:bg-[#1a2f4c] hover:text-white transition">View Another Result</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{__html: '.blink { animation: blink-anim 1s step-end infinite; } @keyframes blink-anim { 50% { opacity: 0; } }'}} />
    </div>
  );
}
;

fs.writeFileSync('frontend/src/app/results/page.tsx', code);
console.log('Results page updated successfully.');