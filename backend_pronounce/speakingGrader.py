import requests
import json
import math
from dotenv import load_dotenv
import os

load_dotenv()

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
GENERATE_MODEL = os.getenv('MODEL_NAME')

def grader(data: dict, question: str):
    # Ensure that 'data' is actually a dictionary
    if isinstance(data, str):
        # Try parsing it into a dictionary if it's a JSON string
        try:
            data = json.loads(data)
        except json.JSONDecodeError as e:
            print(f"Error parsing data: {e}")
            return None, "Invalid data format"

    # Proceed if data is a dictionary
    if not isinstance(data, dict):
        print(f"Expected a dictionary but got {type(data)}")
        return None, "Invalid data format"

    # Initialize feedback and band as JSON-compatible dictionaries
    feedback = {
        'pronunciation': data['is_letter_correct_all_words'],
        'fluency': "none",
        'lexical': None,
        'grammar': None,
        'response': None
    }

    band = {
        'pronunciation': int(data['pronunciation_accuracy']),
        'fluency': convert_to_ielts_band(calculate_fluency(data), 1),
        'lexical': None,
        'grammar': None,
        'response': None,
        'total': None
    }

    # Fetch lexical resource, grammar, and response asynchronously
    lexical_resource, grammar, response = map(
        lambda res: res.get("content", ""),
        [
            get_speaking_lexical_resource(question, data['matched_transcripts']),
            get_speaking_grammar(question, data['matched_transcripts']),
            get_speaking_task_response(question, data['matched_transcripts'])
        ]
    )

    # Assign the fetched values to feedback and band
    feedback['lexical'] = lexical_resource
    feedback['grammar'] = grammar
    feedback['response'] = response

    band['lexical'] = extract_band_number(lexical_resource)
    band['grammar'] = extract_band_number(grammar)
    band['response'] = extract_band_number(response)

    # Calculate total band
    band['total'] = convert_to_ielts_band(
        band['fluency'] + band['pronunciation'] + band['grammar'] + band['response'] + band['lexical'], 45
    )

    return band, feedback  # Return as dictionaries

def extract_band_number(input_string: str):
    import re
    band_regex = r"\[BAND\]:\s*(\d+(\.\d+)?)"
    match = re.search(band_regex, input_string)
    return float(match.group(1)) if match else 0

def calculate_fluency(detail_result: dict):
    transcript_words = detail_result['real_transcript'].strip().split(' ')
    total_words = len(transcript_words)
    audio_length = detail_result['end_time'][-1] - detail_result['start_time'][0]

    # Check for empty transcript
    if total_words == 0 or audio_length <= 0:
        return 0.0  # or some other default value indicating no fluency

    # Speed of speech (words per second)
    SR = total_words / audio_length

    # Calculate speech rate normalization, ensure to handle zero division
    speech_intervals = [detail_result['end_time'][i] - detail_result['start_time'][i] for i in range(len(transcript_words))]
    if len(speech_intervals) < 2:
        return 0.0  # Insufficient data for meaningful calculation

    SRmin = min(1 / interval for interval in speech_intervals if interval > 0)  # Avoid division by zero
    SRmax = max(1 / interval for interval in speech_intervals if interval > 0)  # Avoid division by zero
    
    # Check if SRmin and SRmax are the same
    if SRmax == SRmin:
        SRnorm = 0.0
    else:
        SRnorm = (SR - SRmin) / (SRmax - SRmin)

    # Average pause between words
    pauses = [(detail_result['start_time'][i + 1] - detail_result['end_time'][i])
              for i in range(len(detail_result['start_time']) - 1)]
    APW = sum(pauses) / len(pauses) if pauses else 0  # Prevent division by zero
    APWmin = min(pauses) if pauses else 0
    APWmax = max(pauses) if pauses else 1  # Avoid division by zero
    APWnorm = 1 - (APW - APWmin) / (APWmax - APWmin) if APWmax != APWmin else 0.0

    # Articulation speed normalization
    APSnorm = (3.0 - 2.0) / (3.0 - 1.5)

    # Filler words and pauses
    filler_words = ['um', 'uh', 'like']
    FWC = sum(1 for word in transcript_words if word in filler_words)

    pause_durations = [pause for pause in pauses if pause > 0]
    if pause_durations:  # Check if there are any pause durations
        mean_pause = sum(pause_durations) / len(pause_durations)
        std_dev_pause = math.sqrt(sum((pause - mean_pause) ** 2 for pause in pause_durations) / len(pause_durations))
        threshold = mean_pause + std_dev_pause  # Changed to 1 * std_dev_pause for clarity
        PPH = len([pause for pause in pauses if pause > threshold])
    else:
        mean_pause = 0
        std_dev_pause = 0
        PPH = 0

    HF = FWC + PPH
    HFmin = 0
    HFmax = max(HF, 20)
    HFnorm = 1 - (HF - HFmin) / (HFmax - HFmin) if HFmax != HFmin else 0.0

    # Repetition rate
    R = sum(1 for i in range(len(transcript_words) - 1) if transcript_words[i] == transcript_words[i + 1])
    Rmin = 0
    Rmax = max(R, 10)
    Rnorm = 1 - (R - Rmin) / (Rmax - Rmin) if Rmax != Rmin else 0.0

    # Calculate final fluency score
    fluency = (0.25 * SRnorm) + (0.20 * APWnorm) + (0.15 * APSnorm) + (0.25 * HFnorm) + (0.15 * Rnorm)
    return fluency

def get_speaking_lexical_resource(question: str, answer: str):
    try:
        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENROUTER_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': GENERATE_MODEL,
                'messages': [{
                    'role': 'system',
                    'content': f"""IELTS SPEAKING.
                    QUESTION: {question}.
                    USER_ANSWER: {answer}.
                    GIVE IELTS BAND SCORE [LEXICAL RESOURCES ONLY]
                    DON'T GIVE BAND > 4 IF THE ANSWER IS TOO SHORT OR NOT COVERING THE QUESTION.

                    GIVE IMPROVEMENT BASE ON:
                    a) Identify Vocabulary Range
                    b) Evaluate Paraphrasing Ability
                    c) Idiomatic and Phrasal Verb Usage
                    d) Examine Word Formation and Flexibility

                    Only give me the result, no title, opening, or anything else\n
                    Then, check each word seperately in the answer, if the word is wrong in any category, format it as [wrong_word](correct_word - reason why it false), wrong_word and correct_word must be different.\n
                    For example: the original answer is "word1 word2 word3 ...". Then you need to return:\n
                    [BAND]: (number) [E]: word1 [word2](correct_word2 - suggest_word2) word3...\n
                    -Because word1 and word3 are correct while word2 is not correct"""
                }]
            }
        )

        content = response.json()['choices'][0]['message']['content'].strip()
        return {'content': content}

    except Exception as e:
        return {'error': str(e)}

def get_speaking_grammar(question: str, answer: str):
    try:
        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENROUTER_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': GENERATE_MODEL,
                'messages': [{
                    'role': 'system',
                    'content': f"""IELTS SPEAKING.
                    QUESTION: {question}.
                    USER_ANSWER: {answer}.
                    GIVE IELTS BAND SCORE [GRAMMAR ONLY]
                    DON'T GIVE BAND > 4 IF THE ANSWER IS TOO SHORT OR NOT COVERING THE QUESTION.

                    GIVE IMPROVEMENT BASE ON:
                    a) Evaluate Grammatical Range
                    b) Check for Grammatical Accuracy
                    c) Assess Sentence Flexibility
                    d) Tense Control
                    e) Use of Clauses
                    f) Check for Consistency

                    Only give me the result, no title, opening, or anything else\n
                    Then, check each word seperately in the answer, if the word is wrong in any category, format it as [wrong_word](correct_word - reason why it false), wrong_word and correct_word must be different.\n
                    For example: the original answer is "word1 word2 word3 ...". Then you need to return:\n
                    [BAND]: (number) [E]: word1 [word2](correct_word2 - suggest_word2) word3...\n
                    -Because word1 and word3 are correct while word2 is not correct
                    """
                }]
            }
        )

        content = response.json()['choices'][0]['message']['content'].strip()
        return {'content': content}

    except Exception as e:
        return {'error': str(e)}

def get_speaking_task_response(question: str, answer: str):
    try:
        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENROUTER_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': GENERATE_MODEL,
                'messages': [{
                    'role': 'system',
                    'content': f"""IELTS SPEAKING.
                    QUESTION: {question}.
                    USER_ANSWER: {answer}.
                    GIVE IELTS BAND SCORE [TASK RESPONSE ONLY]
                    DON'T GIVE BAND > 4 IF THE ANSWER IS TOO SHORT OR NOT COVERING THE QUESTION.

                    GIVE IMPROVEMENT BASE ON:
                    a) Assess How Well the Candidate Addresses the Question
                    b) Evaluate the Logical Organization of Ideas
                    c) Check for Relevance and Focus
                    d) Assess the Depth of Response

                    Only give me the result, no title, opening, or anything else\n
                    Then, check each word seperately in the answer, if the word is wrong in any category, format it as [wrong_word](correct_word - reason why it false), wrong_word and correct_word must be different.\n
                    For example: the original answer is "word1 word2 word3 ...". Then you need to return:\n
                    [BAND]: (number) [E]: word1 [word2](correct_word2 - suggest_word2) word3...\n
                    -Because word1 and word3 are correct while word2 is not correct"""
                }]
            }
        )

        content = response.json()['choices'][0]['message']['content'].strip()
        return {'content': content}

    except Exception as e:
        return {'error': str(e)}

def convert_to_ielts_band(score: float, max_score: int):
    d = max_score / 9
    if d == 0:
        return 0
    x = math.floor(score / d)
    lower_bound = x * d
    upper_bound = (x + 1) * d
    middle1 = lower_bound + d / 3
    middle2 = lower_bound + 2 * (d / 3)

    band = x
    if middle1 <= score <= middle2:
        band += 0.5
    elif score > middle2:
        band += 1

    return round(min(max(band, 1), 9), 1)