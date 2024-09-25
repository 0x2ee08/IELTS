from flask import Flask, render_template, request
import webbrowser
import os
from flask_cors import CORS
import json

import lambdaTTS
import lambdaSpeechToScore
import lambdaGetSample
import lambdaSaveToGGDrive
import lambdaGetAudioFromDrive

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

rootPath = ''

@app.route(rootPath+'/api_pronounce/getAudioFromText', methods=['POST'])
def getAudioFromText():
    event = {'body': json.dumps(request.get_json(force=True))}
    return lambdaTTS.lambda_handler(event, [])

@app.route(rootPath+'/api_pronounce/getAudioFromDrive', methods=['POST'])
def getAudioFromDrive():
    event = {'body': json.dumps(request.get_json(force=True))}
    return lambdaGetAudioFromDrive.lambda_handler(event, [])

@app.route(rootPath+'/api_pronounce/saveToGGDrive', methods=['POST'])
def saveToGGDrive():
    event = {'body': json.dumps(request.get_json(force=True))}
    return lambdaSaveToGGDrive.lambda_handler(event, [])

@app.route(rootPath+'/api_pronounce/getSample', methods=['POST'])
def getNext():
    event = {'body':  json.dumps(request.get_json(force=True))}
    return lambdaGetSample.lambda_handler(event, [])

@app.route(rootPath+'/api_pronounce/GetAccuracyFromRecordedAudio', methods=['POST'])
def GetAccuracyFromRecordedAudio():

    event = {'body': json.dumps(request.get_json(force=True))}
    lambda_correct_output = lambdaSpeechToScore.lambda_handler(event, [])
    return lambda_correct_output

if __name__ == "__main__":
    language = 'en'
    print(os.system('pwd'))
    # webbrowser.open_new('http://localhost:3000/')
    app.run(host="localhost", port=5002, debug=True)
