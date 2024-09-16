import os
import base64
import json
import google.auth
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

# If modifying these SCOPES, delete the file token.json
SCOPES = ['https://www.googleapis.com/auth/drive.file']

# Step 1: Authenticate and create the service
def authenticate_drive():
    creds = None
    # Load the token.json file if it exists
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    # If credentials are not available, authenticate the user
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('./credentials.json', SCOPES)
            creds = flow.run_local_server(port=8082, prompt='consent')
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    # Create the drive service
    return build('drive', 'v3', credentials=creds)

# Step 2: Decode the base64 audio and save it as a file
def save_audio_base64_to_file(base64_audio, file_name):
    # Decode the base64 audio
    audio_data = base64.b64decode(
        base64_audio[22:].encode('utf-8'))

    # Write the audio data to a file
    with open(file_name, 'wb') as audio_file:
        audio_file.write(audio_data)
    return file_name

# Step 3: Upload the audio file to Google Drive
def upload_to_drive(file_name, service):
    file_metadata = {'name': file_name}
    media = MediaFileUpload(file_name, mimetype='audio/mpeg')
    file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
    return file.get('id')

# Step 4: Generate a direct streaming link
def create_streaming_link(file_id, service):
    permission = {
        'type': 'anyone',
        'role': 'reader'
    }
    service.permissions().create(fileId=file_id, body=permission).execute()
    link = f"https://drive.google.com/uc?export=download&id={file_id}"
    return link

# Main function to handle the upload
def upload_audio_to_google_drive(base64_audio, file_name):
    service = authenticate_drive()
    
    # Save the base64 audio data to a file
    audio_file_path = save_audio_base64_to_file(base64_audio, file_name)
    
    # Upload the file to Google Drive
    file_id = upload_to_drive(audio_file_path, service)
    
    # Generate a shareable link
    shareable_link = create_streaming_link(file_id, service)
    
    # Clean up by removing the local audio file after uploading
    os.remove(audio_file_path)
    
    return shareable_link

# Example usage
def lambda_handler(event, context):
    data = json.loads(event['body'])

    base64_audio = data['audioBase64']
    
    # File name to save
    file_name = 'audio_file.mp3'
    
    # Upload and get the shareable link
    link = upload_audio_to_google_drive(base64_audio, file_name)
    print('File uploaded successfully. Access it at:', link)

    res = {'audioData': link}

    return json.dumps(res)
