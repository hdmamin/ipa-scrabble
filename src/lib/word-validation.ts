import CMUDictData from '@/../public/data/cmudict-ipa.json';

interface CMUData {
  entries: Record<string, string[]>;
  ipaToWords: Record<string, string[]>;
}

// Type assertion for the imported data
const cmuData: CMUData = CMUDictData as unknown as CMUData;

/**
 * Validate if an IPA sequence corresponds to a valid word in the dictionary
 * @param ipaSequence The IPA sequence to validate
 * @returns Array of matching words (empty if not found)
 */
export function validateIPAWord(ipaSequence: string): string[] {
  if (!ipaSequence || ipaSequence.trim() === '') {
    return [];
  }

  const normalized = ipaSequence.trim();

  // Direct lookup
  const words = cmuData.ipaToWords[normalized];
  if (words && words.length > 0) {
    return [...words];
  }

  // Try without stress markers (more lenient)
  const withoutStress = normalized.replace(/[ˈˌ]/g, '');
  const wordsWithoutStress = cmuData.ipaToWords[withoutStress];
  if (wordsWithoutStress && wordsWithoutStress.length > 0) {
    return [...wordsWithoutStress];
  }

  return [];
}

/**
 * Get all IPA pronunciations for an English word
 * @param word The English word to look up
 * @returns Array of IPA pronunciations
 */
export function getWordPronunciations(word: string): string[] {
  if (!word || word.trim() === '') {
    return [];
  }

  const normalized = word.toLowerCase().replace(/['\-()]/g, '');
  const pronunciations = cmuData.entries[normalized];

  return pronunciations ? [...pronunciations] : [];
}

/**
 * Check if a word exists in the dictionary (any pronunciation)
 * @param word The English word to check
 * @returns True if the word exists
 */
export function wordExists(word: string): boolean {
  const pronunciations = getWordPronunciations(word);
  return pronunciations.length > 0;
}

/**
 * Get word suggestions for a partial IPA sequence
 * @param partialIPA The partial IPA to match
 * @param maxSuggestions Maximum number of suggestions to return
 * @returns Array of suggested words with their IPA
 */
export function getSuggestions(partialIPA: string, maxSuggestions: number = 10): Array<{ word: string; ipa: string }> {
  const suggestions: Array<{ word: string; ipa: string }> = [];
  const normalized = partialIPA.toLowerCase().trim();

  if (!normalized) {
    return suggestions;
  }

  // Find IPA sequences that start with the partial
  for (const [ipa, words] of Object.entries(cmuData.ipaToWords)) {
    if (ipa.startsWith(normalized) || normalized.startsWith(ipa)) {
      for (const word of words) {
        suggestions.push({ word, ipa });
        if (suggestions.length >= maxSuggestions) {
          return suggestions;
        }
      }
    }
  }

  return suggestions;
}

/**
 * Get statistics about the dictionary
 * @returns Object with dictionary stats
 */
export function getDictionaryStats() {
  const totalWords = Object.keys(cmuData.entries).length;
  const totalPronunciations = Object.keys(cmuData.ipaToWords).length;
  const avgPronunciationsPerWord = totalPronunciations / totalWords;

  return {
    totalWords,
    totalPronunciations,
    avgPronunciationsPerWord: avgPronunciationsPerWord.toFixed(2)
  };
}

/**
 * Get random words with their IPA for examples
 * @param count Number of random words to return
 * @returns Array of random word-IPA pairs
 */
export function getRandomWords(count: number = 5): Array<{ word: string; ipa: string }> {
  const words = Object.keys(cmuData.entries);
  const shuffled = words.sort(() => Math.random() - 0.5).slice(0, count);

  return shuffled.map(word => {
    const pronunciations = cmuData.entries[word];
    return {
      word,
      ipa: pronunciations[0]
    };
  });
}

// Export the full data for advanced use cases
export { cmuData };
