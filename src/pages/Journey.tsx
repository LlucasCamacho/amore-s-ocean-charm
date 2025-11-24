import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MusicPlayer } from "@/components/MusicPlayer";
import oceanHero from "@/assets/ocean-hero.jpg";
import { Sparkles, Heart } from "lucide-react";

interface JourneyState {
  id: string;
  started_at: string | null;
  current_day: number;
  last_viewed_at: string | null;
}

interface DailyMessage {
  id: string;
  day_number: number;
  message: string;
}

const Journey = () => {
  const [journeyState, setJourneyState] = useState<JourneyState | null>(null);
  const [currentMessage, setCurrentMessage] = useState<DailyMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadJourneyState();
  }, []);

  const loadJourneyState = async () => {
    try {
      const { data: stateData, error: stateError } = await supabase
        .from("journey_state")
        .select("*")
        .single();

      if (stateError) throw stateError;

      // Check if we need to advance to the next day
      if (stateData.started_at && stateData.current_day > 0) {
        const startDate = new Date(stateData.started_at);
        const now = new Date();
        const daysSinceStart = Math.floor(
          (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        let newDay = daysSinceStart + 1;
        
        // If we've completed 7 days, restart
        if (newDay > 7) {
          newDay = ((daysSinceStart) % 7) + 1;
          // Update start date to align with the new cycle
          const { error: updateError } = await supabase
            .from("journey_state")
            .update({
              current_day: newDay,
              started_at: new Date(now.getTime() - (daysSinceStart % 7) * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq("id", stateData.id);
          
          if (updateError) throw updateError;
          stateData.current_day = newDay;
        } else if (newDay !== stateData.current_day && newDay <= 7) {
          const { error: updateError } = await supabase
            .from("journey_state")
            .update({ current_day: newDay })
            .eq("id", stateData.id);
          
          if (updateError) throw updateError;
          stateData.current_day = newDay;
        }
      }

      setJourneyState(stateData);

      // Load current message if journey has started
      if (stateData.current_day > 0) {
        const { data: messageData, error: messageError } = await supabase
          .from("daily_messages")
          .select("*")
          .eq("day_number", stateData.current_day)
          .single();

        if (messageError) throw messageError;
        setCurrentMessage(messageData);
      }
    } catch (error) {
      console.error("Error loading journey:", error);
    } finally {
      setLoading(false);
    }
  };

  const startJourney = async () => {
    if (!journeyState) return;

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("journey_state")
        .update({
          started_at: now,
          current_day: 1,
          last_viewed_at: now,
        })
        .eq("id", journeyState.id);

      if (error) throw error;
      await loadJourneyState();
    } catch (error) {
      console.error("Error starting journey:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="star-shimmer">
          <Sparkles className="w-12 h-12 text-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${oceanHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background/90" />
      </div>

      {/* Stars decoration */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent rounded-full star-shimmer"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        {journeyState?.current_day === 0 ? (
          // Welcome Screen
          <Card className="max-w-2xl w-full p-12 text-center backdrop-blur-sm bg-card/95 border-2 border-primary/20 ocean-glow">
            <div className="float-animation mb-8">
              <Heart className="w-20 h-20 mx-auto text-accent" />
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-gradient">
              Uma Jornada Especial
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Durante 7 dias, você descobrirá coisas especiais que eu adoro em você.
              Uma nova mensagem aparecerá a cada dia.
            </p>
            <p className="text-lg text-muted-foreground/80 mb-12 italic">
              Como as ondas do mar e as estrelas do céu, meu amor por você é eterno ✨
            </p>
            <Button
              onClick={startJourney}
              size="lg"
              className="text-xl px-12 py-6 rounded-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all duration-300 ocean-glow"
            >
              Começar a Jornada
            </Button>
          </Card>
        ) : (
          // Daily Message Display
          <Card className="max-w-3xl w-full p-12 text-center backdrop-blur-sm bg-card/95 border-2 border-primary/20 ocean-glow">
            <div className="mb-6">
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mb-6">
                <p className="text-sm font-medium text-foreground">
                  Dia {journeyState.current_day} de 7
                </p>
              </div>
            </div>
            
            <div className="float-animation mb-8">
              <Sparkles className="w-16 h-16 mx-auto text-accent" />
            </div>

            {currentMessage && (
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-gradient mb-8">
                  O que eu adoro em você...
                </h2>
                <p className="text-2xl md:text-3xl leading-relaxed text-foreground font-light">
                  {currentMessage.message}
                </p>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-border/50">
              <p className="text-muted-foreground italic">
                Volte amanhã para a próxima mensagem 🌊💫
              </p>
            </div>

            <Button
              onClick={() => navigate("/admin")}
              variant="ghost"
              size="sm"
              className="mt-6 text-muted-foreground hover:text-foreground"
            >
              Admin
            </Button>
          </Card>
        )}
      </div>

      <MusicPlayer />
    </div>
  );
};

export default Journey;
