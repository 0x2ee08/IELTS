// mergeAudio.ts

const mergeBase64 = async (
    base64Audio1: string,
    base64Audio2: string,
    gap: number
): Promise<string> => {
    // Use type assertion to include webkitAudioContext
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Helper function to decode base64 audio
    const decodeAudioData = async (base64: string): Promise<AudioBuffer> => {
        const response = await fetch(base64);
        const arrayBuffer = await response.arrayBuffer();
        return await audioContext.decodeAudioData(arrayBuffer);
    };

    // Helper function to create silent audio
    const createSilence = (duration: number): AudioBuffer => {
        const sampleRate = audioContext.sampleRate;
        const numSamples = duration * sampleRate;
        const silence = audioContext.createBuffer(1, numSamples, sampleRate);
        return silence;
    };

    const audioBuffer1 = await decodeAudioData(base64Audio1);
    const audioBuffer2 = await decodeAudioData(base64Audio2);
    const silenceBuffer = createSilence(gap);

    // Create a new buffer for the merged audio
    const mergedBuffer = audioContext.createBuffer(
        1,
        audioBuffer1.length + silenceBuffer.length + audioBuffer2.length,
        audioContext.sampleRate
    );

    // Copy the first audio buffer
    mergedBuffer.copyToChannel(audioBuffer1.getChannelData(0), 0, 0);

    // Copy the silence buffer
    mergedBuffer.copyToChannel(silenceBuffer.getChannelData(0), 0, audioBuffer1.length);

    // Copy the second audio buffer
    mergedBuffer.copyToChannel(audioBuffer2.getChannelData(0), 0, audioBuffer1.length + silenceBuffer.length);

    // Encode the merged audio buffer back to Base64
    const audioData = await audioBufferToBase64(mergedBuffer);
    
    return audioData;
};

// Helper function to encode AudioBuffer to Base64
const audioBufferToBase64 = async (audioBuffer: AudioBuffer): Promise<string> => {
    const audioBlob = await audioBufferToWavBlob(audioBuffer);
    const reader = new FileReader();
    return new Promise((resolve) => {
        reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String);
        };
        reader.readAsDataURL(audioBlob);
    });
};

// Helper function to convert AudioBuffer to WAV Blob
const audioBufferToWavBlob = (audioBuffer: AudioBuffer): Promise<Blob> => {
    return new Promise((resolve) => {
        const wavArray = audioBufferToWav(audioBuffer);
        const wavBlob = new Blob([new Uint8Array(wavArray)], { type: 'audio/wav' });
        resolve(wavBlob);
    });
};

// Utility function to convert AudioBuffer to WAV format
const audioBufferToWav = (audioBuffer: AudioBuffer): Uint8Array => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const bufferLength = audioBuffer.length;
    const wavLength = 44 + bufferLength * numChannels * 2;

    const wavArray = new Uint8Array(wavLength);
    const view = new DataView(wavArray.buffer);
    
    let offset = 0;

    // Write WAV header
    const writeString = (str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
        offset += str.length;
    };

    writeString('RIFF');
    view.setUint32(offset, wavLength - 8, true);
    offset += 4;
    writeString('WAVE');
    writeString('fmt ');
    view.setUint32(offset, 16, true); // Subchunk1Size
    offset += 4;
    view.setUint16(offset, 1, true); // AudioFormat
    offset += 2;
    view.setUint16(offset, numChannels, true); // NumChannels
    offset += 2;
    view.setUint32(offset, sampleRate, true); // SampleRate
    offset += 4;
    view.setUint32(offset, sampleRate * numChannels * 2, true); // ByteRate
    offset += 4;
    view.setUint16(offset, numChannels * 2, true); // BlockAlign
    offset += 2;
    view.setUint16(offset, 16, true); // BitsPerSample
    offset += 2;
    writeString('data');
    view.setUint32(offset, bufferLength * numChannels * 2, true); // Subchunk2Size
    offset += 4;

    // Write PCM samples
    for (let i = 0; i < bufferLength; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
            const sample = audioBuffer.getChannelData(channel)[i];
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
    }

    return wavArray;
};

export { mergeBase64 };
