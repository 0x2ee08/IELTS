'use client'

import React, { useState, useEffect } from "react";

interface VoiceSelectorProps {
    tts: string;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ tts }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("Microsoft Jenny Online (Natural)-English (United States) (en-US)");
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  // Fetch voices on component mount
  useEffect(() => {
    const fetchVoices = () => {
      const synth = window.speechSynthesis;
      let availableVoices = synth.getVoices();

      if (availableVoices.length === 0) {
        synth.onvoiceschanged = () => {
          availableVoices = synth.getVoices();
          const englishVoices = availableVoices
            .filter((v) => v.lang.startsWith('en'))
            .sort((a, b) => a.name.localeCompare(b.name));
          setVoices(englishVoices);
          if (englishVoices.length > 0) {
            setSelectedVoice(englishVoices[0].name); // Set default voice
          }
        };
      } else {
        // Filter and sort voices if already available
        const englishVoices = availableVoices
          .filter((v) => v.lang.startsWith('en'))
          .sort((a, b) => a.name.localeCompare(b.name));
        setVoices(englishVoices);
        if (englishVoices.length > 0) {
          setSelectedVoice(englishVoices[0].name); // Set default voice
        }
      }
    };

    fetchVoices();
  }, []);

  const handleSpeak = () => {
    if (!window.speechSynthesis) {
      alert("Sorry, your browser does not support tts-to-speech.");
      return;
    }

    const newUtterance = new SpeechSynthesisUtterance(tts);
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) {
      newUtterance.voice = voice;
    }

    newUtterance.rate = rate; // Set the speech rate
    newUtterance.pitch = pitch; // Set the speech pitch

    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(newUtterance);
    setUtterance(newUtterance); // Save the current utterance
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Stop the current speech
    }
  };

  return (
    <div className="mb-4">
      <p className="mb-4">Select Voices: </p>

      {/* Just for debug */}
      {tts}

      <div className="mb-4">
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="p-2 border rounded"
        >
          {voices.map((voice, index) => (
            <option key={index} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
        <span className="tts-gray-700 ml-4">Recommendation: Microsoft Jenny Online (Natural) - English (United States) (en-US)</span>
      </div>

      <div className="mb-4">
        <label className="mr-2">Speed: </label>
        <input
          type="range"
          min="0.25"
          max="2"
          value={rate}
          step="0.25"
          onChange={(e) => setRate(parseFloat(e.target.value))}
          className="w-full"
        />
        <span>{rate.toFixed(2)}x</span>
      </div>

      <button
        onClick={handleSpeak}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
      >
        Play
      </button>

      <button
        onClick={handleStop}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2, ml-2"
      >
        Stop
      </button>
    </div>
  );
};

export default VoiceSelector;
