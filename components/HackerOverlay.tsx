import React, { useEffect, useRef, useState } from 'react';
import { IconAmongUs, IconMusic } from './Icons';

// Direct link to the "Gedagedigedagedago" / "Shut Up Chicken" meme audio.
// SoundCloud URLs are web pages and cannot be streamed directly in <audio> tags, 
// so we use this direct file source for the exact meme sound requested.
const AUDIO_URL = "https://www.myinstants.com/media/sounds/gedagedigedagedago.mp3"; 

export const HackerOverlay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Handle Audio Autoplay
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4; // Set reasonable volume
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Auto-play was prevented
          console.log("Audio autoplay prevented by browser policy:", error);
        });
      }
    }
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
      if (audioRef.current.paused && !audioRef.current.muted) {
        audioRef.current.play();
      }
    }
  };

  // Matrix Rain Animation Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix configuration
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    
    // Array to track the y position of each column (initialized to 1)
    const drops: number[] = new Array(columns).fill(1);

    const draw = () => {
      // Black background with slight opacity to create the trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0'; // Hacker Green
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        
        // Draw character
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop to top randomly or if it goes off screen
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move drop down
        drops[i]++;
      }
    };

    const intervalId = setInterval(draw, 33); // ~30FPS

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <>
      {/* Background Matrix Canvas */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-0 pointer-events-none opacity-80"
      />

      {/* Audio Element */}
      <audio ref={audioRef} loop src={AUDIO_URL} />

      {/* Foreground Content Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-4">
        
        {/* Animated Character */}
        <div className="relative animate-bounce-custom cursor-pointer" onClick={toggleMute}>
            {/* The Omega Nugget / Among Us Character */}
            <IconAmongUs className="w-28 h-28 text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] filter contrast-125" />
            
            {/* Cowboy Hat */}
            <div className="absolute -top-5 -left-3 w-32 h-10 bg-amber-700 rounded-full border-b-4 border-amber-900 shadow-lg transform -rotate-12 z-10"></div>
            <div className="absolute -top-10 left-6 w-16 h-12 bg-amber-700 rounded-t-lg border-r-4 border-amber-900 transform -rotate-12 z-10"></div>

            {/* Speech Bubble */}
            <div className="absolute -top-12 -right-12 bg-white text-black font-extrabold text-sm p-3 rounded-2xl rounded-bl-none animate-pulse whitespace-nowrap border-2 border-black shadow-lg">
               SHUT UP CHICKEN! 🐔
            </div>
        </div>

        {/* Mute Control */}
        <button 
          onClick={toggleMute}
          className={`
            pointer-events-auto backdrop-blur-md border rounded-full p-3 transition-all duration-300 shadow-lg group
            ${isMuted 
              ? 'bg-red-900/40 border-red-500/50 text-red-400' 
              : 'bg-green-900/40 border-green-500/50 text-green-400 hover:bg-green-900/60'
            }
          `}
          title={isMuted ? "Unmute Background Audio" : "Mute Background Audio"}
        >
           <IconMusic className={`w-5 h-5 ${!isMuted ? 'animate-pulse' : 'opacity-50'}`} />
        </button>
      </div>
      
      {/* Custom Keyframes for the bounce effect */}
      <style>{`
        @keyframes bounce-custom {
            0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
            50% { transform: translateY(-25px) rotate(5deg) scale(1.05); }
        }
        .animate-bounce-custom {
            animation: bounce-custom 0.5s infinite ease-in-out;
        }
      `}</style>
    </>
  );
};