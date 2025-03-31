import React from "react";

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-end space-x-2">
      <div className="rounded-full w-8 h-8 bg-[#1e3a8a] text-white flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="bg-gray-200 rounded-2xl rounded-bl-none py-2 px-4 max-w-[60px] flex justify-center">
        <span className="w-2 h-2 bg-gray-400 rounded-full mx-0.5 animate-[typing_1s_infinite]" style={{ animationDelay: "0s" }}></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full mx-0.5 animate-[typing_1s_infinite]" style={{ animationDelay: "0.2s" }}></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full mx-0.5 animate-[typing_1s_infinite]" style={{ animationDelay: "0.4s" }}></span>
      </div>
    </div>
  );
};

export default TypingIndicator;
