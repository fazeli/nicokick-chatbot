import React, { KeyboardEvent } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend }) => {
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSend();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button className="text-[#64748b] p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Add attachment">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
        </svg>
      </button>
      
      <div className="relative flex-1">
        <input 
          type="text" 
          placeholder="Type your message here..." 
          className="w-full border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:border-[#3b82f6]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      
      <button 
        className={`${
          value.trim() ? 'bg-[#3b82f6] hover:bg-[#1e3a8a]' : 'bg-[#3b82f6]/50 cursor-not-allowed'
        } text-white p-2 rounded-full transition-colors`}
        onClick={onSend}
        disabled={!value.trim()}
        aria-label="Send message"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      </button>
    </div>
  );
};

export default ChatInput;
