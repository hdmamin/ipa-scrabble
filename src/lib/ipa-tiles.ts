export interface IPATile {
  char: string;
  type: 'consonant' | 'vowel' | 'affricate' | 'modifier';
  description: string;
  points: number;
  count: number; // Number of tiles in the game
}

// IPA tiles with point values based on phoneme frequency
// Heuristic: Common vowels = 1-2, mid-frequency consonants = 2-4, rare symbols = 5-8
export const IPA_TILES: IPATile[] = [
  // Very common consonants (1 point)
  { char: 'n', type: 'consonant', description: 'alveolar nasal', points: 1, count: 6 },
  { char: 't', type: 'consonant', description: 'voiceless alveolar plosive', points: 1, count: 6 },
  { char: 's', type: 'consonant', description: 'voiceless alveolar fricative', points: 1, count: 4 },

  // Common consonants (2 points)
  { char: 'm', type: 'consonant', description: 'bilabial nasal', points: 2, count: 4 },
  { char: 'l', type: 'consonant', description: 'lateral approximant', points: 2, count: 4 },
  { char: 'k', type: 'consonant', description: 'voiceless velar plosive', points: 2, count: 3 },
  { char: 'r', type: 'consonant', description: 'alveolar trill', points: 2, count: 3 },

  // Mid-frequency consonants (3 points)
  { char: 'p', type: 'consonant', description: 'voiceless bilabial plosive', points: 3, count: 2 },
  { char: 'b', type: 'consonant', description: 'voiced bilabial plosive', points: 3, count: 2 },
  { char: 'd', type: 'consonant', description: 'voiced alveolar plosive', points: 3, count: 2 },
  { char: 'g', type: 'consonant', description: 'voiced velar plosive', points: 3, count: 2 },
  { char: 'f', type: 'consonant', description: 'voiceless labiodental fricative', points: 3, count: 2 },
  { char: 'h', type: 'consonant', description: 'glottal fricative', points: 3, count: 2 },

  // Less common consonants (4-5 points)
  { char: 'v', type: 'consonant', description: 'voiced labiodental fricative', points: 4, count: 2 },
  { char: 'z', type: 'consonant', description: 'voiced alveolar fricative', points: 4, count: 2 },
  { char: 'j', type: 'consonant', description: 'palatal approximant', points: 4, count: 2 },
  { char: 'ʃ', type: 'consonant', description: 'voiceless postalveolar fricative', points: 4, count: 2 },

  // Rare consonants and special sounds (5-6 points)
  { char: 'θ', type: 'consonant', description: 'voiceless dental fricative', points: 5, count: 1 },
  { char: 'ð', type: 'consonant', description: 'voiced dental fricative', points: 5, count: 1 },
  { char: 'ʒ', type: 'consonant', description: 'voiced postalveolar fricative', points: 5, count: 1 },
  { char: 'ŋ', type: 'consonant', description: 'velar nasal', points: 5, count: 1 },
  { char: 'ʔ', type: 'consonant', description: 'glottal stop', points: 6, count: 1 },
  { char: 'ɾ', type: 'consonant', description: 'alveolar tap', points: 5, count: 1 },

  // Affricates (7-8 points - very rare)
  { char: 't͡s', type: 'affricate', description: 'alveolar affricate', points: 7, count: 1 },
  { char: 'd͡z', type: 'affricate', description: 'alveolar affricate', points: 7, count: 1 },
  { char: 't͡ʃ', type: 'affricate', description: 'postalveolar affricate', points: 8, count: 1 },
  { char: 'd͡ʒ', type: 'affricate', description: 'postalveolar affricate', points: 8, count: 1 },

  // Common vowels (1-2 points)
  { char: 'ə', type: 'vowel', description: 'mid central (schwa)', points: 1, count: 5 },
  { char: 'i', type: 'vowel', description: 'close front', points: 1, count: 4 },
  { char: 'ɪ', type: 'vowel', description: 'near-close front', points: 1, count: 4 },
  { char: 'a', type: 'vowel', description: 'open front', points: 2, count: 4 },

  // Mid-frequency vowels (2-3 points)
  { char: 'e', type: 'vowel', description: 'close-mid front', points: 2, count: 3 },
  { char: 'ɛ', type: 'vowel', description: 'open-mid front', points: 2, count: 3 },
  { char: 'æ', type: 'vowel', description: 'near-open front', points: 3, count: 2 },
  { char: 'u', type: 'vowel', description: 'close back', points: 2, count: 3 },
  { char: 'o', type: 'vowel', description: 'close-mid back', points: 2, count: 3 },

  // Less common vowels (3-4 points)
  { char: 'ɑ', type: 'vowel', description: 'open back', points: 3, count: 2 },
  { char: 'ɔ', type: 'vowel', description: 'open-mid back', points: 3, count: 2 },
  { char: 'ɜ', type: 'vowel', description: 'open-mid central', points: 4, count: 1 },

  // Modifiers - special tiles (0-2 points, but have powerup effects)
  { char: 'ˈ', type: 'modifier', description: 'primary stress', points: 0, count: 2 },
  { char: 'ˌ', type: 'modifier', description: 'secondary stress', points: 0, count: 2 },
  { char: 'ː', type: 'modifier', description: 'long', points: 0, count: 2 },
  { char: '̃', type: 'modifier', description: 'nasalization', points: 0, count: 2 },
];

// Create tile bag by expanding counts
export function createTileBag(): IPATile[] {
  const bag: IPATile[] = [];
  for (const tile of IPA_TILES) {
    for (let i = 0; i < tile.count; i++) {
      bag.push({ ...tile });
    }
  }
  return shuffle(bag);
}

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Linguist names for invite codes
export const LINGUIST_NAMES = [
  'chomsky', 'saussure', 'jakobson', 'labov', 'trubetzkoy',
  'hjelmslev', 'bloomfield', 'whorf', 'sapir', 'piaget',
  'halliday', 'chomsky-halle', 'katz', 'fodor', 'harris',
  'sweet', 'jones', 'pike', 'hockett', 'martinet',
  'guillaume', 'tesniere', 'coseriu', 'hymes', 'gumperz',
  'slobin', 'tomasello', 'pink-er', 'chomsky-schutze', 'jackendoff',
  'larson', 'haegeman', 'radford', 'chomsky-lasnik', 'may'
];

// Easter egg words
export const EASTER_EGG_WORDS = {
  'wʌɡ': {
    name: 'wug',
    description: 'The famous wug test! Jean Berko Gleason would be proud.',
    effect: 'wug-rain'
  },
  'tʃɒmski': {
    name: 'Chomsky',
    description: '"Colorless green ideas sleep furiously"',
    effect: 'chomsky-reaction'
  },
  'dʒɪɒn piːtɜ': {
    name: 'Jean Piaget',
    description: 'Cognitive development pioneer',
    effect: 'cognitive-fireworks'
  },
  'luɪz hiːlmzlev': {
    name: 'Louis Hjelmslev',
    description: 'Glossematics founder',
    effect: 'structural-sparkles'
  },
  'fɜːdɪnɑ̃ də sɔsyr': {
    name: 'Ferdinand de Saussure',
    description: 'Father of modern linguistics',
    effect: 'signifier-glow'
  }
};

// Fun linguistics facts
export const LINGUISTICS_FACTS = [
  "The IPA has 107 letters and 52 diacritics!",
  "The most common sound in human languages is /a/.",
  "The click languages (Khoisan) use consonants found nowhere else.",
  "All languages use vowels, but not all use consonants.",
  "Pirahã is one of the simplest phonological inventories known.",
  "Ubykh had 84 consonants but only 2 vowels (now extinct).",
  "The !Xóõ language has the most phonemes of any language.",
  "Japanese has only 5 vowels, like Spanish and Italian.",
  "Some languages lack the /r/ sound entirely!",
  "The schwa /ə/ is the most common vowel sound in English."
];

// Phoneme type fun facts for easter eggs
export const PHONEME_FACTS = {
  fricative: "Fricatives: created by forcing air through a narrow channel",
  plosive: "Plosives: also called stops, they completely block airflow",
  nasal: "Nasals: produced with airflow through the nose",
  vowel: "Vowels: produced with open vocal tract, always voiced in speech",
  affricate: "Affricates: start as stops but release as fricatives",
  approximant: "Approximants: like vowels but articulated as consonants"
};
