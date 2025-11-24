import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

export const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicUrl, setMusicUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // You can set a default music URL here or load from settings
    // For now, users will need to add their own music URL
    const savedMusicUrl = localStorage.getItem("music_url");
    if (savedMusicUrl) {
      setMusicUrl(savedMusicUrl);
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!musicUrl) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={togglePlay}
        size="lg"
        className="rounded-full w-14 h-14 bg-primary/80 backdrop-blur-sm hover:bg-primary shadow-lg ocean-glow"
      >
        {isPlaying ? (
          <Volume2 className="h-6 w-6" />
        ) : (
          <VolumeX className="h-6 w-6" />
        )}
      </Button>
      <audio ref={audioRef} loop src={musicUrl} />
    </div>
  );
};
