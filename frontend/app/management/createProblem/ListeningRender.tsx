import React, { useState, useEffect } from "react";

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState<string>("The Influence of Technology on Modern Education");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState<number>(1); // Speech rate
  const [pitch, setPitch] = useState<number>(1); // Speech pitch

  // Fetch voices on component mount
  useEffect(() => {
    const fetchVoices = () => {
      const synth = window.speechSynthesis;
      let availableVoices = synth.getVoices();

      if (availableVoices.length !== 0) {
        setVoices(availableVoices);
        setSelectedVoice(availableVoices[0].name); // Set default voice
      } else {
        // If voices are not available immediately, listen for the 'voiceschanged' event
        synth.onvoiceschanged = () => {
          availableVoices = synth.getVoices();
          setVoices(availableVoices);
          setSelectedVoice(availableVoices[0].name); // Set default voice
        };
      }
    };

    fetchVoices();
  }, []);

  const handleSpeak = () => {
    if (!window.speechSynthesis) {
      alert("Sorry, your browser does not support text-to-speech.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = rate; // Set the speech rate
    utterance.pitch = pitch; // Set the speech pitch

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Text to Speech Converter</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to convert to speech"
        className="w-full p-2 border rounded mb-4"
        rows={4}
      ></textarea>
      
      <div className="mb-4">
        <label className="mr-2">Select Voice: </label>
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
      </div>

      <div className="mb-4">
        <label className="mr-2">Rate: </label>
        <input
          type="range"
          min="0.5"
          max="2"
          value={rate}
          step="0.1"
          onChange={(e) => setRate(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <label className="mr-2">Pitch: </label>
        <input
          type="range"
          min="0"
          max="2"
          value={pitch}
          step="0.1"
          onChange={(e) => setPitch(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <button
        onClick={handleSpeak}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Convert to Speech
      </button>
    </div>
  );
};

export default TextToSpeech;
