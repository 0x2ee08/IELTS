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
                    'content': f"""For this question: {question}. Give me ielts band and improvement about lexical resources of this answer: {answer}
                    a) Identify Vocabulary Range
                    - Assess variety: Does the candidate use a wide range of vocabulary, or do they repeat simple words frequently?
                    - Check for advanced vocabulary: Look for less common or topic-specific words that go beyond basic everyday language. For example, instead of just saying "big," do they use words like "enormous" or "massive"?
                    - Use of collocations: Look for appropriate word combinations (e.g., "take responsibility," "heavy traffic").
                    b) Evaluate Paraphrasing Ability
                    - Rephrasing: Can the candidate express the same idea in different ways, using a variety of words and structures? Paraphrasing is an important skill to avoid repetition and show versatility.
                    - Synonyms: Does the candidate demonstrate an ability to use synonyms effectively? For instance, can they switch between "important" and "crucial" when needed?
                    c) Idiomatic and Phrasal Verb Usage
                    - Idioms and phrases: Look for the natural and correct use of idiomatic expressions (e.g., "raining cats and dogs") and phrasal verbs (e.g., "give up," "put off"). The use of such expressions should enhance the natural flow of speech, not sound forced or unnatural.
                    - Cultural appropriateness: Check whether idiomatic expressions are used appropriately according to the situation.
                    d) Examine Word Formation and Flexibility
                    - Word forms: Are different forms of the same word used correctly? For example, "beautiful" (adjective), "beauty" (noun), or "beautify" (verb). 
                    - Flexibility in use: Is the candidate able to adapt their vocabulary to different topics? Can they talk about both familiar and unfamiliar topics using appropriate vocabulary?

                    Band 9 (Expert)
                    - Uses a wide range of vocabulary fluently and accurately.
                    - Demonstrates full flexibility in paraphrasing.
                    - Uses idiomatic language naturally and appropriately.
                    - No mistakes in word choice or collocations.
                    Band 8 (Very Good)
                    - Uses a wide range of vocabulary with only occasional errors.
                    - Can convey precise meanings and show a strong ability to paraphrase.
                    - Occasionally makes minor errors with idiomatic expressions, but they do not affect meaning.
                    Band 7 (Good)
                    - Varied vocabulary with some awareness of less common words.
                    - Able to discuss both familiar and unfamiliar topics with appropriate vocabulary.
                    - Occasionally uses words inappropriately or makes mistakes in word choice but generally paraphrases well.
                    Band 6 (Competent)
                    - Uses an adequate range of vocabulary to discuss familiar and some unfamiliar topics.
                    - Attempts to paraphrase but sometimes lacks flexibility.
                    - Makes some errors in word choice that may slightly affect meaning.
                    Band 5 (Modest)
                    - Uses a limited range of vocabulary; relies heavily on simple words.
                    - Struggles to paraphrase; often repeats words and phrases.
                    - Makes frequent errors in word choice or context that can affect meaning.
                    - Band 4 (Limited)
                    - Basic vocabulary is used, and the candidate has difficulty expressing ideas.
                    - Repetition of words and errors are frequent, causing confusion.
                    - Very limited ability to paraphrase.
                    Band 3 (Extremely Limited)
                    -Can only use very basic vocabulary and has serious difficulty conveying meaning.
                    - Errors are constant, and communication is severely hindered.

                    Only give me the result, no title, opening, or anything else\n
                    Give me the ielts band of original answer first\n
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
                    'content': f"""For this question: {question}. Give me ielts band and improvement about grammar of this answer: {answer}
                    a) Evaluate Grammatical Range
                    - Sentence structures: Does the candidate use a variety of sentence structures, or are they stuck using mostly simple sentences (e.g., "I like it because it’s nice.")?
                    - Complex structures: Look for complex sentences that include conjunctions (e.g., "although," "because," "which"), conditional sentences, relative clauses, and subordinate clauses. For example, "I enjoy traveling because it allows me to experience new cultures."
                    - Variety in tenses: Does the candidate use different tenses effectively (e.g., present, past, future, continuous, perfect)?
                    b) Check for Grammatical Accuracy
                    - Errors in structure: Identify the frequency of grammatical errors. These can include:
                        +) Incorrect verb tense (e.g., using past instead of present).
                        +) Misuse of subject-verb agreement (e.g., "She go" instead of "She goes").
                        +) Errors in word order (e.g., "He tomorrow will come" instead of "He will come tomorrow").
                    - Impact on meaning: Do the errors affect comprehension? A minor error may not interfere with communication, but consistent errors can cause confusion.
                    c) Assess Sentence Flexibility
                    - Simple vs. complex: Determine how often the candidate uses only simple sentences (e.g., "I like it. It is fun.") compared to complex structures (e.g., "I like it because it's fun and it allows me to learn new things.").
                    - Balance between structures: Look for a good balance between simple and complex sentences. The candidate should not use only one type; variation shows control and flexibility.
                    d) Tense Control
                    - Range of tenses: Does the candidate use a variety of tenses accurately? For example, using the past tense to talk about past events (e.g., "Yesterday, I went to the park") and the future tense to talk about future plans (e.g., "I will visit my family next week").
                    - Consistency: Are tenses consistently correct, or does the candidate mix tenses incorrectly within sentences (e.g., "Yesterday I go to the park")?
                    e) Use of Clauses
                    - Subordinate clauses: Look for sentences that use subordinate clauses (e.g., "If I had known, I would have gone," "The book that I read was interesting"). The use of clauses indicates an ability to handle more complex grammar.
                    - Relative clauses: Look for sentences that include relative clauses (e.g., "The man who is sitting there is my friend").
                    f) Check for Consistency
                    - Consistency of accuracy: Determine whether grammatical accuracy is consistent throughout the test or if errors become more frequent as the candidate speaks for longer.
                    - Consistency in complexity: Can the candidate consistently produce complex structures, or do they revert to simpler forms under pressure?
                    
                    Band 9 (Expert)
                    - Uses a wide range of grammatical structures accurately and fluently.
                    - Consistently produces error-free sentences.
                    - Shows full control of complex structures, tenses, and clauses.
                    - Band 8 (Very Good)
                    - Uses a wide range of structures with only occasional errors.
                    - Demonstrates good control of complex sentence structures.
                    - Errors are rare and do not affect meaning.
                    Band 7 (Good)
                    - Varied sentence structures, including complex sentences.
                    - Makes occasional grammatical mistakes, but they rarely affect communication.
                    - Good range of tenses and some use of subordinate clauses, but there may be some inaccuracy in more complex areas.
                    Band 6 (Competent)
                    - Mix of simple and complex structures, but some awkwardness or mistakes in more complex ones.
                    - Errors are more frequent but do not seriously impede understanding.
                    - Limited use of subordinate clauses or complex structures.
                    Band 5 (Modest)
                    - Uses basic sentence structures with some attempts at complex sentences, often resulting in errors.
                    - Makes frequent grammatical mistakes that can affect meaning.
                    - Limited tense control and errors in structures are common.
                    Band 4 (Limited)
                    - Relies heavily on simple sentences.
                    - Frequent errors in basic grammar that cause misunderstandings.
                    - Rare use of complex structures.
                    Band 3 (Extremely Limited)
                    - Uses only very simple structures with frequent errors.
                    - Grammar mistakes are constant and severely affect communication.

                    Only give me the result, no title, opening, or anything else\n
                    Give me the ielts band of original answer first\n
                    Check each word seperately in the answer, if the word is wrong in any category, format it as [wrong_word](correct_word - reason why it false), wrong_word and correct_word must be different.\n
                    For example: the original answer is "word1 word2 word3 ...". Then you need to return:\n
                    [BAND]: (number) [E]: word1 [word2](correct_word2 - suggest_word2) word3... \n
                    -Because word1 and word3 are correct while word2 is not correct"""
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
                    'content': f"""For this question: {question}. Give me ielts band and improvement about grammar of this answer: {answer}
                    a) Assess How Well the Candidate Addresses the Question
                    - Understanding the prompt: Does the candidate fully understand the question and provide relevant answers, or do they go off-topic?
                    - Complete response: Does the candidate answer all parts of the question?
                    - Development of ideas: Are the ideas clearly explained and developed? A candidate should elaborate on their ideas with examples, reasons, or supporting details, rather than providing brief or vague responses.
                    b) Evaluate the Logical Organization of Ideas
                    - Coherence: Is the candidate able to organize their ideas in a logical, clear manner? This means their responses should flow smoothly from one point to another.
                    - Structure: Look for a clear beginning, middle, and end in their answers. For instance, they should introduce the idea, provide details or examples, and conclude or connect to the next point.
                    - Transitions: Are linking words or phrases used to connect ideas (e.g., "Firstly," "In addition," "However")? Effective use of these phrases enhances the flow of speech.
                    c) Check for Relevance and Focus
                    - Staying on topic: Does the candidate consistently answer the question, or do they go off-topic at times? It’s important that the answer remains focused on the task given.
                    - Avoiding repetition: Look for any unnecessary repetition of ideas. If a candidate repeats the same point without adding anything new, it may suggest a lack of fluency or development in their response.
                    d) Assess the Depth of Response
                    - Depth of explanation: Does the candidate provide just basic responses, or do they go into greater depth by offering explanations, justifications, and examples?
                    - Examples and support: Candidates should support their points with examples or personal experiences where appropriate. For instance, if talking about "Why people enjoy traveling," they should explain and provide reasons like "exploring new cultures" or "experiencing different cuisines."

                    Band 9 (Expert)
                    - Fully addresses all parts of the task with relevant and well-developed responses.
                    - Organizes ideas in a clear, logical, and coherent way with appropriate transitions.
                    - Ideas are fully extended and supported with relevant details and examples.
                    - Fluent with no noticeable hesitation.
                    Band 8 (Very Good)
                    - Addresses all parts of the task well, with relevant responses that are mostly well-developed.
                    - Coherent and logically organized answers, though there may be rare lapses in clarity or flow.
                    - Ideas are supported with relevant examples, though there may be slight room for more depth.
                    - Fluent, with very few hesitations or pauses.
                    Band 7 (Good)
                    - Addresses the task effectively, though some parts may be less fully developed.
                    - Organizes ideas logically with generally good use of linking words and transitions.
                    - Responses are relevant and on-topic but could benefit from more support and detail in places.
                    - Mostly fluent, with occasional hesitations but no major disruptions to coherence.
                    Band 6 (Competent)
                    - Partially addresses the task, but some ideas may not be fully developed or clear.
                    - Ideas are presented with some structure, but the organization may be inconsistent, with less effective use of linking words.
                    - Some ideas are underdeveloped or too simple; more detail and examples are needed.
                    - Hesitations and pauses may sometimes interrupt fluency, but the response is generally coherent.
                    Band 5 (Modest)
                    - Limited response to the task, with several parts of the question not addressed or insufficiently developed.
                    - Weak structure, with some disjointed ideas and a lack of effective transitions.
                    - Basic ideas are repeated without sufficient development or support.
                    - Hesitations and pauses are frequent, affecting coherence and fluency.
                    Band 4 (Limited)
                    - Fails to adequately address the task, providing mostly irrelevant or incomplete responses.
                    - Ideas are poorly organized with frequent confusion and lack of structure.
                    - Very little development of ideas; responses are too brief or off-topic.
                    - Frequent long pauses and hesitations break the fluency and make responses hard to follow.
                    Band 3 (Extremely Limited)
                    - Provides very limited or irrelevant responses.
                    - Ideas are disjointed and difficult to follow, with minimal coherence.
                    - Very brief responses, with little or no development.
                    - Constant pauses and hesitations severely disrupt fluency.

                    Only give me the result, no title, opening, or anything else\n
                    Give me the ielts band of original answer first\n
                    You need to return:\n
                    [BAND]: (number) (errors + suggestions) \n"""
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
