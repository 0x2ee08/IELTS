import { Button, Select, SelectSection, SelectItem } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalProps, useDisclosure } from "@nextui-org/react";
import { Divider, Tooltip } from "@nextui-org/react";
import { Input, Textarea } from "@nextui-org/react";
import {Checkbox} from "@nextui-org/react";
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

import { mcq } from '../data/typeOfQuestion';

interface mcqPageProps {
    exercise: mcq;
}

const mcqPage: React.FC<mcqPageProps> = ({ exercise }) => {

    return (
        <div>
            {exercise?.statement?.map((question, index) => (
                <div key={index}>
                    <Textarea
                        label={<span className="custom-label"><strong>Question #{index + 1}</strong></span>}
                        labelPlacement={"outside-left"}
                        variant="bordered" fullWidth={true} className="mb-4" maxRows={1}
                        value={question}
                    />
                    {exercise.choices[index]?.split(',').map((choice, idx) => (
                        (choice === exercise.answers[index]
                            ? <Checkbox className="mr-4" defaultSelected color="success">{choice}</Checkbox>
                            : <Checkbox className="mr-4" isSelected={false}>{choice}</Checkbox>
                        )
                    ))}
                    <p className="mt-2 mb-4">Explanation: {exercise.explanation[index]}</p>
                </div>
            ))}
        </div>
    );
};

export default mcqPage;
