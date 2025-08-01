
import torch
import json
import os
import WordMatching as wm
import utilsFileIO
import pronunciationTrainer
import base64
import time
import audioread
import numpy as np
from torchaudio.transforms import Resample

trainer_SST_lambda = {}
trainer_SST_lambda['de'] = pronunciationTrainer.getTrainer("de")
trainer_SST_lambda['en'] = pronunciationTrainer.getTrainer("en")

transform = Resample(orig_freq=48000, new_freq=16000)

import math

def calculate_pronunciation_accuracy(is_letter_correct_all_words: str) -> int:
    errors = 0

    for word in is_letter_correct_all_words.split(' '):
        if '0' in word:
            errors += 1

    if errors <= 1:
        return 9
    elif errors <= 2:
        return 8.5
    elif errors <= 4:
        return 8
    elif errors <= 6:
        return 7.5
    elif errors <= 8:
        return 7
    elif errors <= 10:
        return 6.5
    elif errors <= 12:
        return 6
    elif errors <= 14:
        return 5.5
    elif errors <= 16:
        return 5
    else:
        return 4


def lambda_handler(event, context):

    data = json.loads(event['body'])

    real_text = data['title']
    file_bytes = base64.b64decode(
        data['base64Audio'][22:].encode('utf-8'))
    language = data['language']

    start = time.time()
    file_base_name = utilsFileIO.generateRandomString()+'.ogg'
    random_file_name = './'+file_base_name
    f = open(random_file_name, 'wb')
    f.write(file_bytes)
    f.close()
    print('Time for saving binary in file: ', str(time.time()-start))

    start = time.time()
    signal, fs = audioread_load(random_file_name)

    signal = transform(torch.Tensor(signal)).unsqueeze(0)

    print('Time for loading .ogg file file: ', str(time.time()-start))

    result = trainer_SST_lambda[language].processAudioForGivenText(
        signal, real_text, file_base_name)

    real_text = result['real_text'];
    start = time.time()
    os.remove(random_file_name)
    print('Time for deleting file: ', str(time.time()-start))

    start = time.time()
    real_transcripts_ipa = ' '.join(
        [word[0] for word in result['real_and_transcribed_words_ipa']])
    matched_transcripts_ipa = ' '.join(
        [word[1] for word in result['real_and_transcribed_words_ipa']])

    real_transcripts = ' '.join(
        [word[0] for word in result['real_and_transcribed_words']])
    matched_transcripts = ' '.join(
        [word[1] for word in result['real_and_transcribed_words']])

    words_real = real_transcripts.lower().split()
    mapped_words = matched_transcripts.split()

    is_letter_correct_all_words = ''
    for idx, word_real in enumerate(words_real):

        mapped_letters, mapped_letters_indices = wm.get_best_mapped_words(
            mapped_words[idx], word_real)

        is_letter_correct = wm.getWhichLettersWereTranscribedCorrectly(
            word_real, mapped_letters)  # , mapped_letters_indices)

        is_letter_correct_all_words += ''.join([str(is_correct)
                                                for is_correct in is_letter_correct]) + ' '

    pair_accuracy_category = ' '.join(
        [str(category) for category in result['pronunciation_categories']])
    print('Time to post-process results: ', str(time.time()-start))

    res = {'real_transcript': result['recording_transcript'],
           'ipa_transcript': result['recording_ipa'],
           'pronunciation_accuracy': calculate_pronunciation_accuracy(is_letter_correct_all_words),
           'real_transcripts': real_transcripts, 'matched_transcripts': matched_transcripts,
           'real_transcripts_ipa': real_transcripts_ipa, 'matched_transcripts_ipa': matched_transcripts_ipa,
           'pair_accuracy_category': pair_accuracy_category,
           'start_time': result['start_time'],
           'end_time': result['end_time'],
           'is_letter_correct_all_words': is_letter_correct_all_words}

    return res

# From Librosa


def audioread_load(path, offset=0.0, duration=None, dtype=np.float32):
    """Load an audio buffer using audioread.

    This loads one block at a time, and then concatenates the results.
    """

    y = []
    with audioread.audio_open(path) as input_file:
        sr_native = input_file.samplerate
        n_channels = input_file.channels

        s_start = int(np.round(sr_native * offset)) * n_channels

        if duration is None:
            s_end = np.inf
        else:
            s_end = s_start + \
                (int(np.round(sr_native * duration)) * n_channels)

        n = 0

        for frame in input_file:
            frame = buf_to_float(frame, dtype=dtype)
            n_prev = n
            n = n + len(frame)

            if n < s_start:
                # offset is after the current frame
                # keep reading
                continue

            if s_end < n_prev:
                # we're off the end.  stop reading
                break

            if s_end < n:
                # the end is in this frame.  crop.
                frame = frame[: s_end - n_prev]

            if n_prev <= s_start <= n:
                # beginning is in this frame
                frame = frame[(s_start - n_prev):]

            # tack on the current frame
            y.append(frame)

    if y:
        y = np.concatenate(y)
        if n_channels > 1:
            y = y.reshape((-1, n_channels)).T
    else:
        y = np.empty(0, dtype=dtype)

    return y, sr_native

# From Librosa


def buf_to_float(x, n_bytes=2, dtype=np.float32):
    """Convert an integer buffer to floating point values.
    This is primarily useful when loading integer-valued wav data
    into numpy arrays.

    Parameters
    ----------
    x : np.ndarray [dtype=int]
        The integer-valued data buffer

    n_bytes : int [1, 2, 4]
        The number of bytes per sample in ``x``

    dtype : numeric type
        The target output type (default: 32-bit float)

    Returns
    -------
    x_float : np.ndarray [dtype=float]
        The input data buffer cast to floating point
    """

    # Invert the scale of the data
    scale = 1.0 / float(1 << ((8 * n_bytes) - 1))

    # Construct the format string
    fmt = "<i{:d}".format(n_bytes)

    # Rescale and format the data buffer
    return scale * np.frombuffer(x, fmt).astype(dtype)
