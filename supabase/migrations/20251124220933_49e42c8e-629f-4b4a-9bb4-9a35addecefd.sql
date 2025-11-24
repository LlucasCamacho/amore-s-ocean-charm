-- Create messages table to store the 7 daily messages
CREATE TABLE public.daily_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(day_number)
);

-- Create journey state table to track progress
CREATE TABLE public.journey_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE,
  current_day INTEGER DEFAULT 0 CHECK (current_day >= 0 AND current_day <= 7),
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial journey state (only one row should exist)
INSERT INTO public.journey_state (current_day) VALUES (0);

-- Insert default messages
INSERT INTO public.daily_messages (day_number, message) VALUES
  (1, 'Adoro olhar pro fundo dos seus olhos escuros e me sentir hipnotizado.'),
  (2, 'Sua risada ilumina meu dia inteiro.'),
  (3, 'A forma como você me entende sem precisar falar nada.'),
  (4, 'Como você faz tudo parecer mais especial quando está comigo.'),
  (5, 'Sua força e delicadeza ao mesmo tempo.'),
  (6, 'O jeito único que você tem de ver o mundo.'),
  (7, 'Cada momento ao seu lado é um presente.');

-- Enable Row Level Security
ALTER TABLE public.daily_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_state ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (so she can see the messages)
CREATE POLICY "Anyone can view messages"
  ON public.daily_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view journey state"
  ON public.journey_state
  FOR SELECT
  USING (true);

-- Create policies for admin updates (only authenticated users can update)
CREATE POLICY "Authenticated users can update messages"
  ON public.daily_messages
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update journey state"
  ON public.journey_state
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_daily_messages_updated_at
  BEFORE UPDATE ON public.daily_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journey_state_updated_at
  BEFORE UPDATE ON public.journey_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();