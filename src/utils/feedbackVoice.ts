const happyLines = [
  'Yay!',
  'Woohoo!',
  'Woof woof!',
  'Meow meow!',
];

const sadLines = [
  'Aww...',
  'Oops...',
  'Uh-oh...',
  'Meow...',
];

let cachedVoice: SpeechSynthesisVoice | null = null;

const pickVoice = (synth: SpeechSynthesis): SpeechSynthesisVoice | null => {
  if (cachedVoice) {
    return cachedVoice;
  }

  const voices = synth.getVoices();
  if (voices.length === 0) {
    return null;
  }

  const englishVoice = voices.find((voice) => voice.lang.startsWith('en'));
  cachedVoice = englishVoice ?? voices[0];
  return cachedVoice;
};

const pickRandomLine = (lines: string[]): string => {
  const index = Math.floor(Math.random() * lines.length);
  return lines[index];
};

export const playFeedbackVoice = (isCorrect: boolean): void => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }

  const synth = window.speechSynthesis;
  const line = isCorrect ? pickRandomLine(happyLines) : pickRandomLine(sadLines);
  const utterance = new SpeechSynthesisUtterance(line);
  const voice = pickVoice(synth);

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = 'en-US';
  }

  utterance.rate = isCorrect ? 1.05 : 0.9;
  utterance.pitch = isCorrect ? 1.35 : 0.75;
  utterance.volume = 1;

  if (synth.speaking) {
    synth.cancel();
  }

  synth.speak(utterance);
};
