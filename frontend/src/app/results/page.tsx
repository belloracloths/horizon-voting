"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function ElectoralResults() {
  const router = useRouter();

  return (
    <div style={{padding: "50px", textAlign: "center"}}>
      <h2>Results Have Been Moved</h2>
      <p>Please check your society voting dashboard for live results.</p>
      <button onClick={() => router.push('/dashboard')}>
        Return to Dashboard
      </button>
    </div>
  );
}