#!/usr/bin/env bun
/**
 * Download and process CMUdict for IPA word validation
 */

import fs from 'fs';
import path from 'path';

// ARPABET to IPA conversion
const ARPABET_TO_IPA: Record<string, string> = {
  'AA': 'ɑ', 'AE': 'æ', 'AH': 'ə', 'AO': 'ɔ', 'AW': 'aʊ',
  'AY': 'aɪ', 'EH': 'ɛ', 'ER': 'ɜ', 'EY': 'eɪ', 'IH': 'ɪ',
  'IY': 'i', 'OW': 'oʊ', 'OY': 'ɔɪ', 'UH': 'ʊ', 'UW': 'u',
  'B': 'b', 'CH': 't͡ʃ', 'D': 'd', 'DH': 'ð', 'F': 'f',
  'G': 'ɡ', 'HH': 'h', 'JH': 'd͡ʒ', 'K': 'k', 'L': 'l',
  'M': 'm', 'N': 'n', 'NG': 'ŋ', 'P': 'p', 'R': 'r',
  'S': 's', 'SH': 'ʃ', 'T': 't', 'TH': 'θ', 'V': 'v',
  'W': 'w', 'Y': 'j', 'Z': 'z', 'ZH': 'ʒ',
};

async function downloadCMUDict(): Promise<string> {
  const url = 'https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict';
  console.log('Downloading CMUdict...');

  const response = await fetch(url);
  const text = await response.text();
  console.log(`Downloaded ${text.split('\n').length} lines`);
  return text;
}

function convertARPABetToIPA(arpabet: string): string {
  const phonemes = arpabet.split(/\s+/);
  const ipaPhonemes: string[] = [];

  for (const phoneme of phonemes) {
    if (!phoneme) continue;

    const stressMatch = phoneme.match(/^([A-Z]+)([0-2])$/);
    if (!stressMatch) continue;

    const base = stressMatch[1];
    const stress = stressMatch[2];

    const ipa = ARPABET_TO_IPA[base];
    if (!ipa) continue;

    if (stress === '1') {
      ipaPhonemes.push('ˈ' + ipa);
    } else if (stress === '2') {
      ipaPhonemes.push('ˌ' + ipa);
    } else {
      ipaPhonemes.push(ipa);
    }
  }

  return ipaPhonemes.join('');
}

interface CMUData {
  entries: Record<string, string[]>;
  ipaToWords: Record<string, string[]>;
}

function processCMUDict(cmudictText: string): CMUData {
  console.log('Processing CMUdict...');

  const entries: Record<string, string[]> = {};
  const ipaToWords: Record<string, string[]> = {};

  let processedCount = 0;
  const lines = cmudictText.split('\n');

  for (const line of lines) {
    if (!line.trim() || line.startsWith(';;;')) continue;

    const parts = line.trim().split(/\s+/);
    if (parts.length < 2) continue;

    const word = parts[0].toLowerCase().replace(/['\-()0-9]/g, '');
    const arpabet = parts.slice(1).join(' ');

    if (!word || !arpabet) continue;

    const ipa = convertARPABetToIPA(arpabet);
    if (!ipa) continue;

    // Store word -> IPA mappings
    if (!entries[word]) {
      entries[word] = [];
    }
    if (Array.isArray(entries[word]) && !entries[word].includes(ipa)) {
      entries[word].push(ipa);
    }

    // Store IPA -> words mappings
    if (!ipaToWords[ipa]) {
      ipaToWords[ipa] = [];
    }
    if (Array.isArray(ipaToWords[ipa]) && !ipaToWords[ipa].includes(word)) {
      ipaToWords[ipa].push(word);
    }

    processedCount++;
  }

  console.log(`Processed ${processedCount} word entries`);
  console.log(`Found ${Object.keys(ipaToWords).length} unique IPA pronunciations`);

  return { entries, ipaToWords };
}

function saveData(data: CMUData): void {
  const outputDir = path.join(process.cwd(), 'public', 'data');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const jsonPath = path.join(outputDir, 'cmudict-ipa.json');
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Saved CMUdict IPA to ${jsonPath}`);

  const stats = fs.statSync(jsonPath);
  console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

async function main() {
  try {
    const cmudictText = await downloadCMUDict();
    const processedData = processCMUDict(cmudictText);
    saveData(processedData);
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
