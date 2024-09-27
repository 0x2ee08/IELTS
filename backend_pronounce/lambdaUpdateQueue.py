import json
import os
import queue
import threading
import base64
import requests
from pymongo import MongoClient
from dotenv import load_dotenv
import lambdaSpeechToScore
import speakingGrader

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))
db = client["ieltsweb"]

submissions = queue.Queue()
submissions.put(1)
submissions.put(2)
submissions.put(3)
duplicateQueue = set()

processing = False
lock = threading.Lock()

def lambda_handler(event, context):
    global processing

    data = json.loads(event['body'])
    submissionId = data['submission_id']

    print("Receive:", submissionId)
    submissions.put(submissionId)
    duplicateQueue.add(submissionId)

    if not processing:
        processing = True
        threading.Thread(target=process_submissions).start()

    return {'statusCode': 200, 'body': json.dumps({'message': 'Submission ID added to the queue'})}


def download_audio_from_google_drive(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.content 
    else:
        print(f"Failed to download audio from {url}")
        return None

def process_submissions():
    user_answer_collection = db["user_answer"]
    response = user_answer_collection.find({"status": False, "type": "Speaking"})
    for submission in response:
        print(submission)
        if submission['id'] not in duplicateQueue:
            duplicateQueue.add(submission['id'])
            submissions.put(submission['id'])
    while not submissions.empty():  
        submission_id = submissions.get()
        try:
            print("Processing:", submission_id)
            user_answer_collection = db["user_answer"]
            response = user_answer_collection.find_one({"id": submission_id})
            
            if response:
                # Create an array named result
                result = []
                audioData = response['audioData']
                questions = response['questions']

                for i in range(len(audioData)):
                    audio_url = audioData[i]
                    audio_content = download_audio_from_google_drive(audio_url)

                    if audio_content:
                        audio_base64 = base64.b64encode(audio_content).decode('utf-8')

                        event = {
                            'body': json.dumps({
                                'title': '',
                                'base64Audio': 'data:audio/ogg;base64,' + audio_base64,
                                'language': 'en'
                            })
                        }

                        try:
                            pronunciation_result = lambdaSpeechToScore.lambda_handler(event, None)
                            graderResponse = speakingGrader.grader(pronunciation_result, questions[i])
                            band, feedback = graderResponse

                            result.append({
                                'audioData': audio_url,
                                'band': band,
                                'feedback': feedback,
                                'data': pronunciation_result
                            })
                        except Exception as e:
                            # Log the exception for debugging purposes
                            print(f"Error processing audio {audio_url}: {str(e)}")

                            result.append({
                                'audioData': audio_url,
                                'band': {
                                    'pronunciation': 0,
                                    'fluency': 0,
                                    'lexical': 0,
                                    'grammar': 0,
                                    'response': 0,
                                    'total': 0
                                },
                                'feedback': {
                                    'pronunciation': "",
                                    'fluency': "",
                                    'lexical': "",
                                    'grammar': "",
                                    'response': "cannot process audio"
                                },
                                'data': {}
                            })
                    else:
                        print(f"Audio download failed for {audio_url}")
            
                response['result'] = result
                
                user_answer_collection.update_one({"id": submission_id}, {"$set": {"result": result, "status": True}})
                duplicateQueue.discard(submission_id)

                print(f"Successfully save submission for: {submission_id}")

            else:
                print(f"No audioData found for submission ID: {submission_id}")

        finally:
            submissions.task_done()

    global processing
    processing = False

