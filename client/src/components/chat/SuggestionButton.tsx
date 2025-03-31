import React from "react";

interface SuggestionButtonProps {
  text: string;
  onClick: (text: string) => void;
}

const SuggestionButton: React.FC<SuggestionButtonProps> = ({ text, onClick }) => {
  return (
    <button 
      className="bg-[#93c5fd]/30 hover:bg-[#93c5fd]/50 text-[#1e3a8a] px-3 py-1 rounded-full text-sm transition-colors"
      onClick={() => onClick(text)}
    >
      {text}
    </button>
  );
};

export default SuggestionButton;
