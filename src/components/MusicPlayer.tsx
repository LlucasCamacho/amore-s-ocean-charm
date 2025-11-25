import { useState, useEffect } from "react";

export const MusicPlayer = () => {
  const [musicUrl, setMusicUrl] = useState("");

  useEffect(() => {
    const savedMusicUrl = localStorage.getItem("music_url");
    if (savedMusicUrl) {
      setMusicUrl(savedMusicUrl);
    }
  }, []);

  if (!musicUrl) return null;

  // Check if it's a SoundCloud URL
  const isSoundCloud = musicUrl.includes("soundcloud.com");

  if (isSoundCloud) {
    // Extract track URL and create embed
    let embedUrl = "";
    
    // If it's already an embed URL, use it
    if (musicUrl.includes("w.soundcloud.com/player/")) {
      embedUrl = musicUrl;
    } else {
      // Convert regular SoundCloud URL to embed URL
      embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(musicUrl)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
    }

    return (
      <div className="fixed bottom-6 right-6 z-50 w-80">
        <iframe
          width="100%"
          height="166"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={embedUrl}
          className="rounded-lg shadow-lg ocean-glow"
        />
      </div>
    );
  }

  // Fallback to regular audio player for non-SoundCloud URLs
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80">
      <audio controls loop src={musicUrl} preload="auto" className="w-full rounded-lg shadow-lg ocean-glow" />
    </div>
  );
};
