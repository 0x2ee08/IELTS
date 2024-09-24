import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, Divider } from '@nextui-org/react';
import { EyeIcon } from '../icons/EyeIcon';
import '../cssCustomFiles/dot.css';
import '../cssCustomFiles/error.css'

interface Band {
    pronunciation: number;
    fluency: number;
    lexical: number;
    grammar: number;
    response: number;
    total: number;
}

interface Feedback {
    pronunciation: string;
    fluency: string;
    lexical: string;
    grammar: string;
    response: string;
}

interface TableProps {
    feedback: Feedback;
    band: Band;
}

const FeedbackTable: React.FC<TableProps> = ({ feedback, band }) => {
    const [tooltipContent, setTooltipContent] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    useEffect(() => {
        console.log(band, feedback);
    });

    const extractMaxNumber = (input: string): number => {
        const regex = /\[([^\]]+)\]/g;
        let match;
        let count = 0;

        while ((match = regex.exec(input)) !== null) {
            count++;
        }
        return count - 2;
    };

    const countWordsWithZero = (input: string): number => {
        const words = input.split(' ');
        const count = words.filter(word => word.includes('0')).length;
        return count;
    }

    const getDotColorClass = (value: number) => {
        if (value >= 8) return 'dot-green';
        if (value >= 6) return 'dot-orange';
        return 'dot-red';
    };

    const formatTextWithSuggestions = (input: string): string => {
        let formattedText = input.replace(/\[BAND\]:\s*\d+(\.\d+)?\s*/, '');
        formattedText = formattedText.replace(/\[E\]:\s*/, '');
        formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, word, suggestion) => {
            return `<span class="highlight" data-suggestion="${suggestion}">${word}</span>`;
        });
        formattedText = formattedText.replace(/\* \*\*([^*]+)\*\*/g, (match, boldText) => {
            return `<br/><strong>${boldText.trim()}</strong>`;
        });
        return formattedText;
    };

    const handleTooltipClick = (category: string, feedbackDetail: string) => {
        setTooltipContent(formatTextWithSuggestions(feedbackDetail));
        setActiveCategory(category); // Set the active category for the label
    };

    const convertToIELTSBand = (maxScore: number, score: number) => {
        const d = maxScore / 9;
        const x = Math.floor(score / d);
        const lowerBound = x * d;
        const upperBound = (x + 1) * d;
        const middle1 = lowerBound + d / 3;
        const middle2 = lowerBound + 2 * (d / 3);
        let band = x;
        if (score >= middle1 && score <= middle2) {
            band += 0.5;
        } else if (score > middle2 && score <= upperBound) {
            band += 1;
        }
        return Math.min(Math.max(band, 1), 9);
    }

    return (
        <div className='rounded-xl'>
            <Table aria-label="Score" removeWrapper className='mb-4'>
                <TableHeader>
                    <TableColumn style={{ fontSize: '1rem', fontWeight: 'bold', color: 'black' }}>
                        Scoring criteria
                    </TableColumn>
                    <TableColumn style={{ fontSize: '1rem', fontWeight: 'bold', color: 'black' }}>
                        Band
                    </TableColumn>
                    <TableColumn style={{ fontSize: '1rem', fontWeight: 'bold', color: 'black' }}>
                        Number of errors
                    </TableColumn>
                    <TableColumn style={{ fontSize: '1rem', fontWeight: 'bold', color: 'black' }}>
                        Action
                    </TableColumn>
                </TableHeader>
                <TableBody>
                    <TableRow key="1">
                        <TableCell style={{ fontSize: '1rem' }}>Fluency and coherence</TableCell>
                        <TableCell style={{ fontSize: '1rem' }}>
                            <span
                                className={`dot ${getDotColorClass(band.fluency)}`}
                                style={{display: 'inline-block',width: '10px',height: '10px',borderRadius: '50%',marginRight: '10px',}}
                            />
                            {band.fluency}
                        </TableCell>
                        <TableCell style={{ fontSize: '1rem' }}>0</TableCell>
                        <TableCell style={{ fontSize: '1rem' }}>
                            {null}
                        </TableCell>
                    </TableRow>
                    <TableRow key="2">
                        <TableCell style={{ fontSize: '1rem' }}>Lexical resource</TableCell>
                        <TableCell style={{ fontSize: '1rem' }}>
                            <span
                                className={`dot ${getDotColorClass(band.lexical)}`}
                                style={{display: 'inline-block',width: '10px',height: '10px',borderRadius: '50%',marginRight: '10px',}}
                            />
                            {band.lexical}
                        </TableCell>
                        <TableCell style={{ fontSize: '1rem' }}>{extractMaxNumber(feedback.lexical)}</TableCell>
                        <TableCell style={{ fontSize: '1rem' }}>
                            <Tooltip content={'Detail'} placement="left">
                                <span 
                                    className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                    onClick={() => handleTooltipClick('Lexical resource', feedback.lexical)}
                                >
                                    <EyeIcon />
                                </span>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                    <TableRow key="3">
                        <TableCell style={{ fontSize: '1rem' }}>Grammatical range and accuracy</TableCell>
                        <TableCell style={{ fontSize: '1rem' }}>
                            <span
                                className={`dot ${getDotColorClass(band.grammar)}`}
                                style={{display: 'inline-block',width: '10px',height: '10px',borderRadius: '50%',marginRight: '10px',}}
                            />
                            {band.grammar}
                        </TableCell>
                        <TableCell style={{ fontSize: '1rem' }}>{extractMaxNumber(feedback.grammar)}</TableCell>
                        <TableCell style={{ fontSize: '1rem' }}>
                            <Tooltip content={'Detail'} placement="left">
                                <span 
                                    className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                    onClick={() => handleTooltipClick('Grammatical range and accuracy', feedback.grammar)}
                                >
                                    <EyeIcon />
                                </span>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                    <TableRow key="4">
                        <TableCell style={{ fontSize: '1rem' }}>Pronunciation</TableCell>
                        <TableCell style={{ fontSize: '1rem' }}>
                            <span
                                className={`dot ${getDotColorClass(band.pronunciation)}`}
                                style={{display: 'inline-block',width: '10px',height: '10px',borderRadius: '50%',marginRight: '10px',}}
                            />
                            {band.pronunciation}
                        </TableCell>
                        <TableCell style={{ fontSize: '1rem' }}>{countWordsWithZero(feedback.pronunciation)}</TableCell>
                        <TableCell style={{ fontSize: '1rem' }}>
                            {null}
                        </TableCell>
                    </TableRow>
                    <TableRow key="5">
                        <TableCell style={{ fontSize: '1rem' }}>Task Response</TableCell>
                        <TableCell style={{ fontSize: '1rem' }}>
                            <span
                                className={`dot ${getDotColorClass(band.response)}`}
                                style={{display: 'inline-block',width: '10px',height: '10px',borderRadius: '50%',marginRight: '10px',}}
                            />
                            {band.response}
                        </TableCell>
                        <TableCell style={{ fontSize: '1rem' }}>Click to see</TableCell>
                        <TableCell style={{ fontSize: '1rem' }}>
                            <Tooltip content={'Detail'} placement="left">
                                <span 
                                    className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                    onClick={() => handleTooltipClick('Task response', feedback.response)}
                                >
                                    <EyeIcon />
                                </span>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                    <TableRow key="6">
                        <TableCell style={{ fontSize: '1rem' }}><strong>Total</strong></TableCell>
                        <TableCell style={{ fontSize: '1rem' }}>
                            <span
                                className={`dot ${getDotColorClass(convertToIELTSBand(36, band.fluency + 
                                                                                        band.grammar + 
                                                                                        band.lexical + 
                                                                                        band.pronunciation))}`}
                                style={{display: 'inline-block',width: '10px',height: '10px',borderRadius: '50%',marginRight: '10px',}}
                            />
                            {convertToIELTSBand(36, band.fluency + band.grammar + band.lexical + band.pronunciation)}
                        </TableCell>
                        <TableCell style={{ fontSize: '1rem' }}>{countWordsWithZero(feedback.pronunciation) +
                                                                extractMaxNumber(feedback.grammar) + 
                                                                extractMaxNumber(feedback.lexical)}</TableCell>
                        <TableCell style={{ fontSize: '1rem' }}>
                            {null}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Divider className='mb-4'/>
            <div
                className='tooltip-content mb-4'
                dangerouslySetInnerHTML={{
                    __html: activeCategory
                    ? `<strong>${activeCategory}</strong>: ${tooltipContent || ''}`
                    : ''
                }}
            />

        </div>
    );
};

export default FeedbackTable;
