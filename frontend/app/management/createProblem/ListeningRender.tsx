import React, { useState } from 'react';
import config from '../../config';
import axios from 'axios';

interface Script {
  title: string;
  content: string;
}

interface MCQ {
  question: string;
  answers: string[];
}

interface TableFilling {
  category: string;
  information: string;
}

interface ShortAnswerQuestion {
  question: string;
  answers: string[];
}

interface MatchingExercise {
  statements: string[];
  features: string[];
}

interface CustomQuestion {
  question: string;
  answer: string;
  explanation: string;
}

interface QuestionPart {
  mcqs: MCQ[];
  tableFilling: TableFilling[];
  shortAnswerQuestions: ShortAnswerQuestion[];
  matchingExercise: MatchingExercise | null;
  customQuestions: CustomQuestion[];
  selectedQuestionType: string;
}

const questionTypes = [
  { label: 'Multiple Choice Questions', value: 'mcq' },
  { label: 'Table Filling', value: 'tableFilling' },
  { label: 'Short Answer Questions', value: 'shortAnswer' },
  { label: 'Matching Exercise', value: 'matching' },
];

const ListeningPage = () => {
  const [sections, setSections] = useState<{
    script: Script | null;
    parts: QuestionPart[];
    error: string;
  }[]>([
    {
      script: null,
      parts: [
        {
          mcqs: [],
          tableFilling: [],
          shortAnswerQuestions: [],
          matchingExercise: null,
          customQuestions: [],
          selectedQuestionType: 'mcq',
        },
      ],
      error: '',
    },
  ]);

  const deleteSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const addPart = (index: number) => {
    setSections((prev) => {
      const newSections = [...prev];
      newSections[index].parts.push({
        mcqs: [],
        tableFilling: [],
        shortAnswerQuestions: [],
        matchingExercise: null,
        customQuestions: [],
        selectedQuestionType: 'mcq',
      });
      return newSections;
    });
  };

  const generateRandomScript = async (index: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}api/generate_listening_script`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = response.data;
      setSections((prev) => {
        const newSections = [...prev];
        newSections[index].script = result;
        newSections[index].error = '';
        return newSections;
      });
    } catch (error) {
      console.error('Error generating script:', error);
      setSections((prev) => {
        const newSections = [...prev];
        newSections[index].script = null;
        newSections[index].error =
          'An error occurred while generating the script.';
        return newSections;
      });
    }
  };

  const generateQuestions = async (index: number, partIndex: number) => {
    const selectedQuestionType =
      sections[index].parts[partIndex].selectedQuestionType;
    switch (selectedQuestionType) {
      case 'mcq':
        await generateMCQs(index, partIndex);
        break;
      case 'tableFilling':
        await generateTableFillingArray(index, partIndex);
        break;
      case 'shortAnswer':
        await generateShortAnswerQuestions(index, partIndex);
        break;
      case 'matching':
        await generateMatchingExercise(index, partIndex);
        break;
      default:
        break;
    }
  };

  const generateMCQs = async (index: number, partIndex: number) => {
    const script = sections[index].script;
    if (!script) return;

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}api/generate_listening_multiple_choice`,
        { script },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result: MCQ[] = response.data;
      setSections((prev) => {
        const newSections = [...prev];
        newSections[index].parts[partIndex].mcqs = result;
        newSections[index].error = '';
        return newSections;
      });
    } catch (error) {
      console.error('Fetch error:', error);
      setSections((prev) => {
        const newSections = [...prev];
        newSections[index].error =
          'An error occurred while generating MCQs.';
        newSections[index].parts[partIndex].mcqs = [];
        return newSections;
      });
    }
  };

  const generateTableFillingArray = async (
    index: number,
    partIndex: number
  ) => {
    const script = sections[index].script;
    if (!script) return;

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}api/generate_listening_table_filling`,
        { script },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result: TableFilling[] = response.data.tableFilling;
      setSections((prev) => {
        const newSections = [...prev];
        newSections[index].parts[partIndex].tableFilling = result;
        newSections[index].error = '';
        return newSections;
      });
    } catch (error) {
      console.error('Fetch error:', error);
      setSections((prev) => {
        const newSections = [...prev];
        newSections[index].error =
          'An error occurred while generating Table Filling.';
        newSections[index].parts[partIndex].tableFilling = [];
        return newSections;
      });
    }
  };

  const generateShortAnswerQuestions = async (
    index: number,
    partIndex: number
  ) => {
    const script = sections[index].script;
    if (!script) return;

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}api/generate_listening_short_answer_question`,
        { script },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSections((prev) => {
        const newSections = [...prev];
        newSections[index].parts[partIndex].shortAnswerQuestions =
          response.data;
        newSections[index].error = '';
        return newSections;
      });
    } catch (error) {
      console.error('Error generating short answer questions:', error);
      setSections((prev) => {
        const newSections = [...prev];
        newSections[index].error =
          'An error occurred while generating short answer questions.';
        newSections[index].parts[partIndex].shortAnswerQuestions = [];
        return newSections;
      });
    }
  };

  const generateMatchingExercise = async (
    index: number,
    partIndex: number
  ) => {
    const script = sections[index].script;
    if (!script) return;

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}api/generate_listening_matchings`,
        { script },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = response.data;

      const statements = data.matchings.map((item: any) => item.question);
      const features = data.matchings.map((item: any) => item.feature);

      setSections((prev) => {
        const newSections = [...prev];
        newSections[index].parts[partIndex].matchingExercise = {
          statements,
          features,
        };
        newSections[index].error = '';
        return newSections;
      });
    } catch (error) {
      console.error('Error generating matching exercise:', error);
      setSections((prev) => {
        const newSections = [...prev];
        newSections[index].error =
          'An error occurred while generating the matching exercise.';
        newSections[index].parts[partIndex].matchingExercise = null;
        return newSections;
      });
    }
  };

  const handleScriptChange = (
    index: number,
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setSections((prev) => {
      const newSections = [...prev];
      newSections[index].script = {
        title: 'Custom Script',
        content: e.target.value,
      };
      return newSections;
    });
  };

  const handleQuestionTypeChange = (
    sectionIndex: number,
    partIndex: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSections((prev) => {
      const newSections = [...prev];
      newSections[sectionIndex].parts[partIndex].selectedQuestionType =
        event.target.value;
      return newSections;
    });
  };

  const addCustomQuestion = (sectionIndex: number, partIndex: number) => {
    setSections((prev) => {
      const newSections = [...prev];
      newSections[sectionIndex].parts[partIndex].customQuestions.push({
        question: '',
        answer: '',
        explanation: '',
      });
      return newSections;
    });
  };

  const handleCustomQuestionChange = (
    sectionIndex: number,
    partIndex: number,
    questionIndex: number,
    field: 'question' | 'answer' | 'explanation',
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSections((prev) => {
      const newSections = [...prev];
      newSections[sectionIndex].parts[partIndex].customQuestions[
        questionIndex
      ][field] = event.target.value;
      return newSections;
    });
  };

  return (
    <div>
      {sections.map((section, sectionIndex) => (
        <div
          key={sectionIndex}
          style={{
            marginBottom: '20px',
            border: '1px solid #ccc',
            padding: '10px',
          }}
        >
          <div>
            <textarea
              placeholder="Type your custom script here..."
              onChange={(e) => handleScriptChange(sectionIndex, e)}
              style={{
                width: '100%',
                height: 'auto',
                minHeight: '100px',
                resize: 'none',
              }}
              value={section.script ? section.script.content : ''}
            />
            <button onClick={() => generateRandomScript(sectionIndex)}>
              Generate Script
            </button>
          </div>

          <button onClick={() => deleteSection(sectionIndex)}>
            Delete Section
          </button>

          {section.parts.map((part, partIndex) => (
            <div
              key={partIndex}
              style={{
                marginTop: '15px',
                padding: '10px',
                border: '1px solid #aaa',
              }}
            >
              <h4>Part {partIndex + 1}</h4>

              <div>
                <label>Select Question Type:</label>
                <select
                  value={part.selectedQuestionType}
                  onChange={(event) =>
                    handleQuestionTypeChange(sectionIndex, partIndex, event)
                  }
                >
                  {questionTypes.map((type, idx) => (
                    <option key={idx} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => generateQuestions(sectionIndex, partIndex)}
                >
                  Generate Questions
                </button>
              </div>

              {/* Custom Questions Section */}
              <div>
                <button onClick={() => addCustomQuestion(sectionIndex, partIndex)}>
                  Add Custom Question
                </button>
                {part.customQuestions.map((customQuestion, questionIndex) => (
                  <div key={questionIndex} style={{ marginTop: '10px' }}>
                    <input
                      type="text"
                      placeholder="Custom Question"
                      value={customQuestion.question}
                      onChange={(e) =>
                        handleCustomQuestionChange(
                          sectionIndex,
                          partIndex,
                          questionIndex,
                          'question',
                          e
                        )
                      }
                      style={{ width: '100%', marginBottom: '5px' }}
                    />
                    <input
                      type="text"
                      placeholder="Answer"
                      value={customQuestion.answer}
                      onChange={(e) =>
                        handleCustomQuestionChange(
                          sectionIndex,
                          partIndex,
                          questionIndex,
                          'answer',
                          e
                        )
                      }
                      style={{ width: '100%', marginBottom: '5px' }}
                    />
                    <input
                      type="text"
                      placeholder="Explanation"
                      value={customQuestion.explanation}
                      onChange={(e) =>
                        handleCustomQuestionChange(
                          sectionIndex,
                          partIndex,
                          questionIndex,
                          'explanation',
                          e
                        )
                      }
                      style={{ width: '100%', marginBottom: '5px' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button onClick={() => addPart(sectionIndex)}>Add Part</button>

          {section.error && <p style={{ color: 'red' }}>{section.error}</p>}
        </div>
      ))}

      <button
        onClick={() =>
          setSections((prev) => [
            ...prev,
            {
              script: null,
              parts: [
                {
                  mcqs: [],
                  tableFilling: [],
                  shortAnswerQuestions: [],
                  matchingExercise: null,
                  customQuestions: [],
                  selectedQuestionType: 'mcq',
                },
              ],
              error: '',
            },
          ])
        }
      >
        Add Section
      </button>
    </div>
  );
};

export default ListeningPage;
