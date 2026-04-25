import React from 'react';
import './HoverSplitText.css';

interface HoverSplitTextProps {
  text: string;
  className?: string;
  highlightWord?: string;
  highlightClass?: string;
}

const HoverSplitText: React.FC<HoverSplitTextProps> = ({ 
  text, 
  className = '', 
  highlightWord, 
  highlightClass = '' 
}) => {
  const words = text.split(' ');

  return (
    <span className={`hover-split-text ${className}`}>
      {words.map((word, wordIndex) => {
        const isHighlight = highlightWord && word.includes(highlightWord);
        const baseCharClass = isHighlight ? `hover-split-char ${highlightClass}` : 'hover-split-char';
        
        return (
          <React.Fragment key={wordIndex}>
            <span className="hover-split-word">
              <span className="hover-split-before">
                {word.split('').map((char, charIndex) => (
                  <span key={charIndex} className={`${baseCharClass} ${char.toLowerCase() === 'g' ? 'char-g' : ''}`.trim()}>
                    {char}
                  </span>
                ))}
              </span>
              <span className="hover-split-after" aria-hidden="true">
                {word.split('').map((char, charIndex) => (
                  <span key={charIndex} className={`${baseCharClass} ${char.toLowerCase() === 'g' ? 'char-g' : ''}`.trim()}>
                    {char}
                  </span>
                ))}
              </span>
            </span>
            {wordIndex < words.length - 1 && ' '}
          </React.Fragment>
        );
      })}
    </span>
  );
};

export default HoverSplitText;
