import React from 'react';

interface UserContentBlockProps {
  text: string;
  onTyping?: () => void;
}

const UserContentBlock: React.FC<UserContentBlockProps> = ({text, onTyping}) => {
  const preformattedTextStyles: React.CSSProperties = {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };

  const processText = (inputText: string): React.ReactNode[] => {
    const sections: React.ReactNode[] = [];
    sections.push(<div key={`text-0`} style={preformattedTextStyles}>{inputText}</div>);
    // inputText.split(SNIPPET_MARKERS.begin).forEach((section, index) => {
    //   if (index === 0 && !section.includes(SNIPPET_MARKERS.end)) {
        
    //     return;
    //   }

    //   const endSnippetIndex = section.indexOf(SNIPPET_MARKERS.end);
    //   if (endSnippetIndex !== -1) {
    //     const snippet = section.substring(0, endSnippetIndex);
    //     sections.push(
    //         <FoldableTextSection key={`foldable-${index}`} content={snippet}/>
    //     );

    //     const remainingText = section.substring(endSnippetIndex + SNIPPET_MARKERS.end.length);
    //     if (remainingText) {
    //       sections.push(<div key={`text-after-${index}`}
    //                          style={preformattedTextStyles}>{remainingText}</div>);
    //     }
    //   } else {
    //     sections.push(<div key={`text-start-${index}`} style={preformattedTextStyles}>{section}</div>);
    //   }
    // });
    return sections;
  };

  const content = processText(text);

  return (
    <div className='px-2.5 py-2.5'> { content } </div>
  );
};

export default UserContentBlock;
