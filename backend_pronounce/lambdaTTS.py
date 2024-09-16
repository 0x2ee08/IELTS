from TTS.api import TTS
import base64
import json
import os
from playsound import playsound

def lambda_handler(event, context):

    data = json.loads(event['body'])

    text = data['text']
    tts = TTS(model_name="tts_models/en/vctk/vits", progress_bar=True, gpu=False)

    speaker = "p227"

    file_path = "audio.wav"
    tts.tts_to_file(text=text, speaker=speaker, file_path=file_path)

    with open(file_path, "rb") as audio_file:
        audio_base64 = base64.b64encode(audio_file.read()).decode('utf-8')

    res = {'audioBase64': audio_base64}

    os.remove(file_path)

    return json.dumps(res)

