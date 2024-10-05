from TTS.api import TTS
import base64
import json
import os

def lambda_handler(event, context):

    data = json.loads(event['body'])

    text = data['text']
    speaker = data['speaker']
    tts = TTS(model_name="tts_models/en/vctk/vits", progress_bar=True, gpu=False)

    file_path = "audio.wav"
    tts.tts_to_file(text=text, speaker=speaker, file_path=file_path)

    with open(file_path, "rb") as audio_file:
        audio_data = audio_file.read()
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')

    audio_base64_with_prefix = f"data:audio/wav;base64,{audio_base64}"

    res = {'audioBase64': audio_base64_with_prefix}
    
    os.remove(file_path)

    return json.dumps(res)

