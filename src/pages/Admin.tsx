import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Music, Trash2 } from "lucide-react";
import { User, Session } from "@supabase/supabase-js";

interface DailyMessage {
  id: string;
  day_number: number;
  message: string;
}

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [messages, setMessages] = useState<DailyMessage[]>([]);
  const [musicUrl, setMusicUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadMessages();
      loadMusicUrl();
    }
  }, [user]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_messages")
        .select("*")
        .order("day_number");

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Erro ao carregar mensagens");
    }
  };

  const loadMusicUrl = () => {
    const savedUrl = localStorage.getItem("music_url");
    if (savedUrl) {
      setMusicUrl(savedUrl);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      console.error("Error logging in:", error);
      toast.error(error.message || "Erro ao fazer login");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const redirectUrl = `${window.location.origin}/admin`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;
      toast.success("Conta criada! Faça login para continuar.");
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast.error(error.message || "Erro ao criar conta");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logout realizado");
      navigate("/");
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  const updateMessage = async (id: string, newMessage: string) => {
    try {
      const { error } = await supabase
        .from("daily_messages")
        .update({ message: newMessage })
        .eq("id", id);

      if (error) throw error;
      toast.success("Mensagem atualizada!");
      loadMessages();
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Erro ao atualizar mensagem");
    }
  };

  const saveMusicUrl = () => {
    localStorage.setItem("music_url", musicUrl);
    toast.success("URL da música salva!");
  };

  const resetJourney = async () => {
    try {
      // First get the journey_state record
      const { data: journeyData, error: fetchError } = await supabase
        .from("journey_state")
        .select("id")
        .single();

      if (fetchError) throw fetchError;

      // Then update it with the reset values
      const { error } = await supabase
        .from("journey_state")
        .update({
          started_at: null,
          current_day: 0,
          last_viewed_at: null,
        })
        .eq("id", journeyData.id);

      if (error) throw error;
      toast.success("Jornada resetada!");
    } catch (error) {
      console.error("Error resetting journey:", error);
      toast.error("Erro ao resetar jornada");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-3xl font-serif font-bold mb-6 text-center">
            Admin Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Login
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSignup}
                className="flex-1"
              >
                Criar Conta
              </Button>
            </div>
          </form>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="w-full mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Sair
          </Button>
        </div>

        <Card className="p-6">
          <h1 className="text-3xl font-serif font-bold mb-6">
            Painel Admin
          </h1>

          <div className="space-y-6">
            {/* Music URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Music className="w-4 h-4" />
                URL da Música (Spotify ou SoundCloud)
              </label>
              <div className="flex gap-2">
                <Input
                  value={musicUrl}
                  onChange={(e) => setMusicUrl(e.target.value)}
                  placeholder="https://open.spotify.com/track/..."
                />
                <Button onClick={saveMusicUrl}>
                  <Save className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Cole a URL de uma música/playlist do Spotify ou SoundCloud. Exemplos:<br/>
                Spotify: https://open.spotify.com/track/...<br/>
                SoundCloud: https://soundcloud.com/artista/musica
              </p>
            </div>

            {/* Messages */}
            <div className="space-y-4">
              <h2 className="text-xl font-serif font-semibold">
                Mensagens dos 7 Dias
              </h2>
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <label className="text-sm font-medium">
                    Dia {msg.day_number}
                  </label>
                  <div className="flex gap-2">
                    <Textarea
                      defaultValue={msg.message}
                      onBlur={(e) => {
                        if (e.target.value !== msg.message) {
                          updateMessage(msg.id, e.target.value);
                        }
                      }}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Reset Journey */}
            <div className="pt-6 border-t">
              <Button
                variant="destructive"
                onClick={resetJourney}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Resetar Jornada (volta ao início)
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
