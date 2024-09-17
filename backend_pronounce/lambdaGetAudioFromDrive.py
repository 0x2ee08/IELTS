import requests
import base64
import json

def fetch_audio(url):
    response = requests.get(url)
    response.raise_for_status()
    audio_base64 = base64.b64encode(response.content).decode('utf-8')
    return audio_base64

def lambda_handler(event, context):
    data = json.loads(event['body'])

    url = data['url']
    
    audio_base64 = fetch_audio(url)

    res = {'audioBase64': audio_base64}

    return json.dumps(res)
