import { Button, Select, SelectSection, SelectItem } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalProps, useDisclosure } from "@nextui-org/react";
import { Divider, Tooltip } from "@nextui-org/react";
import { Input, Textarea } from "@nextui-org/react";
import {Checkbox} from "@nextui-org/react";
import {Accordion, AccordionItem} from "@nextui-org/react";
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

import { saq } from '../data/typeOfQuestion';

interface saqPageProps {
    exercise: saq;
    previousNumberOfQuestion: number;
}

const saqPage: React.FC<saqPageProps> = ({ exercise, previousNumberOfQuestion }) => {

    return (
        <div>
            <Accordion variant="bordered">
                {exercise?.statement?.map((question, index) => (
                    <AccordionItem key={index} aria-label={`Question ${previousNumberOfQuestion + index + 1}`} title={`Question ${previousNumberOfQuestion + index + 1}`}>
                        <Textarea
                            variant="bordered" fullWidth={true} className="mb-4" maxRows={1}
                            value={question}
                        />
                        <p className="mb-4"><strong>Answer:</strong> {exercise.answers[index]}</p>
                        <p className="mb-4"><strong>Explanation:</strong> {exercise.explanation[index]}</p>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

export default saqPage;
