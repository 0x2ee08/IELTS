import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import style from './react-markdown-styles.module.css';
import markdownIt from 'markdown-it';


interface MarkdownContentProps {
    content: string;
}

const preprocessContent = (content: string) => {
    const usernameRegex = /@(\w+)/g;

    let transformedContent = content.replace(usernameRegex, (match, username) => {
        return `<a href="/loader/profile?id=${username}">${match}</a>`;
    });

    const underlineRegex = /\+\+([^\+]+)\+\+/g;

    transformedContent = transformedContent.replace(underlineRegex, (match, text) => {
      return `<u>${text}</u>`;
    });

    return transformedContent;
};




const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
    const processedContent = preprocessContent(content);

    return (
        <div>
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
