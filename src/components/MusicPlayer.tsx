import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

export const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicUrl, setMusicUrl] = useState("");
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const savedMusicUrl = localStorage.getItem("music_url");
    if (savedMusicUrl) {
      // Convert Google Drive view links to direct download links
      let processedUrl = savedMusicUrl;
      if (savedMusicUrl.includes("drive.google.com/file/d/")) {
        const fileId = savedMusicUrl.match(/\/d\/([^/]+)/)?.[1];
        if (fileId) {
          processedUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
      }
      setMusicUrl(processedUrl);
    }
  }, []);

  const togglePlay = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          await audioRef.current.play();
          setIsPlaying(true);
          setError(false);
        }
      } catch (err) {
        console.error("Erro ao reproduzir música:", err);
        setError(true);
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setError(true);
      setIsPlaying(false);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  if (!musicUrl) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={togglePlay}
        size="lg"
        className={`rounded-full w-14 h-14 backdrop-blur-sm shadow-lg ocean-glow ${
          error 
            ? "bg-destructive/80 hover:bg-destructive" 
            : "bg-primary/80 hover:bg-primary"
        }`}
        title={error ? "Erro ao carregar música. Verifique a URL." : isPlaying ? "Pausar música" : "Tocar música"}
      >
        {isPlaying ? (
          <Volume2 className="h-6 w-6" />
        ) : (
          <VolumeX className="h-6 w-6" />
        )}
      </Button>
      <audio ref={audioRef} loop src={musicUrl} preload="auto" />
    </div>
  );
};
