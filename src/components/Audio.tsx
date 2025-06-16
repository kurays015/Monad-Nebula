"use client";

import { useRef, useState } from "react";
import { AiOutlineSound, AiFillMuted } from "react-icons/ai";

export default function Audio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);

  const handleToggleMute = () => {
    setMuted(prev => {
      const newMuted = !prev;
      if (audioRef.current) {
        audioRef.current.muted = newMuted;
        if (!audioRef.current.paused && !newMuted) {
          return newMuted;
        }
        audioRef.current.play().catch(() => {});
      }
      return newMuted;
    });
  };

  return (
    <div>
      <audio
        ref={audioRef}
        src="/ben10.mp3"
        autoPlay
        loop
        muted={muted}
        style={{ display: "none" }}
      />

      <button
        onClick={handleToggleMute}
        className="fixed bottom-1 right-1 z-50 bg-black/70 text-white px-4 py-2 rounded-full shadow-lg border border-white hover:bg-purple-400 transition cursor-pointer"
      >
        {muted ? <AiFillMuted /> : <AiOutlineSound />}
      </button>
    </div>
  );
}
