import { Button, Select, SelectSection, SelectItem } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalProps, useDisclosure } from "@nextui-org/react";
import { Divider, Tooltip } from "@nextui-org/react";
import { Input, Textarea } from "@nextui-org/react";
import {Checkbox} from "@nextui-org/react";
import {Accordion, AccordionItem} from "@nextui-org/react";
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

import { mcq } from '../data/typeOfQuestion';

interface mcqPageProps {
    exercise: mcq;
    previousNumberOfQuestion: number;
}

const mcqPage: React.FC<mcqPageProps> = ({ exercise, previousNumberOfQuestion }) => {

    return (
        <div>
            <Accordion variant="bordered">
                {exercise?.statement?.map((question, index) => (
                    <AccordionItem key={index} aria-label={`Question ${previousNumberOfQuestion + index + 1}`} title={`Question ${previousNumberOfQuestion + index + 1}`}>
                        <Textarea
                            variant="bordered" fullWidth={true} className="mb-4" maxRows={1}
                            value={question}
                        />
                        <div className="flex flex-col mb-2">
                            {exercise.choices[index]?.split(', ').map((choice, idx) => (
                                (choice === exercise.answers[index]
                                    ? <Checkbox className="mb-1" isSelected={true} color="success">{choice}</Checkbox>
                                    : <Checkbox className="mb-1" isSelected={false}>{choice}</Checkbox>
                                )
                            ))}
                        </div>
                        <p className="mb-4"><strong>Explanation:</strong> {exercise.explanation[index]}</p>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

export default mcqPage;
