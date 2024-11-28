# Type of question
```
const questionTypes = [
    "Choose a question type",
    "Yes/No/Not Given",
    "True/False/Not Given",
    "Fill in the blank with one word only",
    "Fill in the blank with no more than two words",
    "Matching Heading",
    "Matching Paragraph Information",
    "Matching Features",
    "Matching Sentence Endings",
    "Multiple Choice One Answer",
    "Multiple Choice Multiple Answer"
];
```

# Yes No Not Given
```
{
    "1": {
        "question": "question 1",
        "answer": "answer 1",
        "explaination": "explaination 1",
    },
    "2": {
        "question": "question 2",
        "answer": "answer 2",
        "explaination": "explaination 2",
    },
    ...
    "6": {
        "question": "question 6",
        "answer": "answer 6",
        "explaination": "explaination 6",
    }
}
```
# True False Not Given
```
{
    "1": {
        "question": "question 1",
        "answer": "answer 1",
        "explaination": "explaination 1",
    },
    "2": {
        "question": "question 2",
        "answer": "answer 2",
        "explaination": "explaination 2",
    },
    ...
    "6": {
        "question": "question 6",
        "answer": "answer 6",
        "explaination": "explaination 6",
    }
}
```
# Multiple Choice Question, One Answer
```
{
    "1": {
        "question": "question 1",
        "options": ["option 1.1", "option 1.2", ..., "option 1.4"]
        "answer": "answer 1",
        "explaination": "explaination 1"
    },
    "2": {
        "question": "question 2",
        "options": ["option 2.1", "option 2.2", ..., "option 2.4"]
        "answer": "answer 2",
        "explaination": "explaination 2"
    },
    ...
    "6": {
        "question": "question 6",
        "options": ["option 6.1", "option 6.2", ..., "option 6.4"]
        "answer": "answer 6",
        "explaination": "explaination 6"
    }
}
```
# Multiple Choice Question, multiple answer
```
{
    "1": {
        "question": "question 1",
        "options": ["option 1.1", "option 1.2", ..., "option 1.6"]
        "answer": "answer 1",
        "explaination": "explaination 1"
    },
    "2": {
        "question": "question 2",
        "options": ["option 2.1", "option 2.2", ..., "option 2.6"]
        "answer": "answer 2",
        "explaination": "explaination 2"
    },
    ...
    "6": {
        "question": "question 6",
        "options": ["option 6.1", "option 6.2", ..., "option 6.6"]
        "answer": "answer 6",
        "explaination": "explaination 6"
    }
}
```
# Fill one word
```
{
    "1": {
        "question": "sentence 1, with the missing word replaced with ........ Note: exactly EIGHT dots",
        "answer": "answer 1 [WORD MUST OCCUR IN THE PARAGRAPH]",
        "explaination": "explaination 1",
    },
    "2": {
        "question": "sentence 2",
        "answer": "answer 2",
        "explaination": "explaination 2",
    },
    ...
    "6": {
        "question": "sentence 6",
        "answer": "answer 6",
        "explaination": "explaination 6",
    }
}
```
# Fill two words
```
{
    "1": {
        "question": "sentence 1, with the missing word(s) replaced with ........ Note: exactly EIGHT dots",
        "answer": "answer 1 Note: [WORD(s) MUST OCCUR IN THE PARAGRAPH]",
        "explaination": "explaination 1",
    },
    "2": {
        "question": "sentence 2",
        "answer": "answer 2",
        "explaination": "explaination 2",
    },
    ...
    "6": {
        "question": "sentence 6",
        "answer": "answer 6",
        "explaination": "explaination 6",
    }
}
```
# Matching Heading
```
{
    "options": ["option 1", "option 2", "option 3", "option 4", ..., "option 8"],
    "Section 1": {
        "answer": "answer 1",
        "explaination": "explaination 1"
    },
    "Section 2": {
        "answer": "answer 2",
        "explaination": "explaination 2"
    },
    ...
    "Section 6": {
        "answer": "answer 6",
        "explaination": "explaination 6"
    }
}
```
# Matching paragraph info
```
{
    "options": ["option 1", "option 2", "option 3", "option 4", ..., "option 8"],
    "Section 1": {
        "answer": "answer 1",
        "explaination": "explaination 1"
    },
    "Section 2": {
        "answer": "answer 2",
        "explaination": "explaination 2"
    },
    ...
    "Section 6": {
        "answer": "answer 6",
        "explaination": "explaination 6"
    }
}
```
# Matching Feature
```
{
    "options": ["option 1", "option 2", "option 3", "option 4", ..., "option 8"],
    "Feature 1": {
        "question": "feature 1",
        "answer": "answer 1",
        "explaination": "explaination 1"
    },
    "Feature 2": {
        "question": "feature 2",
        "answer": "answer 2",
        "explaination": "explaination 2"
    },
    ...
    "Feature 6": {
        "question": "feature 6",
        "answer": "answer 6",
        "explaination": "explaination 6"
    }
}
```
# Matching sentence ending
```
{
    "options": ["option 1", "option 2", "option 3", "option 4", ..., "option 8"],
    "Sentence 1": {
        "question": "opening sentence 1",
        "answer": "answer 1",
        "explaination": "explaination 1"
    },
    "Sentence 2": {
        "question": "opening sentence 2",
        "answer": "answer 2",
        "explaination": "explaination 2"
    },
    ...
    "Sentence 6": {
        "question": "opening sentence 6",
        "answer": "answer 6",
        "explaination": "explaination 6"
    }
}
```