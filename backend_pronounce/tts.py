from TTS.api import TTS


def lambda_handler(event, context):

    data = json.loads(event['body'])

    text = data['text']
    tts = TTS(model_name="tts_models/en/vctk/vits", progress_bar=True, gpu=False)

    # print("Available speakers:", tts.speakers)

    speaker = "p227"

    tts.tts_to_file(text=text, speaker=speaker, file_path="audio.wav")

    return

tts = TTS(model_name="tts_models/en/vctk/vits", progress_bar=True, gpu=False)
