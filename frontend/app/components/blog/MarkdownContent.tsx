import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import style from './react-markdown-styles.module.css';

interface MarkdownContentProps {
    content: string;
}

const preprocessContent = (content: string) => {
    const usernameRegex = /@(\w+)/g;

    const transformedContent = content.replace(usernameRegex, (match, username) => {
        return `<a href="/loader/profile?id=${username}" class="text-blue-600 hover:underline cursor-pointer">${match}</a>`;
    });

    return transformedContent;
};

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
    const processedContent = preprocessContent(content);

    return (
        <div className="border-l-4 border-gray-500 p-2 mb-4">
            <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                className={style.reactMarkDown}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownContent;
