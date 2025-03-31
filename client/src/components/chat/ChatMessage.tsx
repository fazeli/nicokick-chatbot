import React, { useState, useEffect, useRef } from "react";
import { useSpeech } from "@/hooks/use-speech";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, isUser, timestamp }) => {
  // Get speech settings directly from localStorage
  const rate = parseFloat(localStorage.getItem('speechRate') || '1');
  const pitch = parseFloat(localStorage.getItem('speechPitch') || '1');
  const volume = parseFloat(localStorage.getItem('speechVolume') || '1');
  
  // Initialize speech with user settings
  const { speak, stop, isSpeaking, isSupported, voices } = useSpeech({
    rate,
    pitch,
    volume
  });
  
  // Use useEffect to handle stopping speech on unmount and to update when localStorage changes
  useEffect(() => {
    // Function to update settings based on localStorage
    const handleStorageChange = () => {
      // This will update the useSpeech hook indirectly by remounting component
      if (isSpeaking) {
        stop();
      }
    };
    
    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup listener and stop speaking on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (isSpeaking) {
        stop();
      }
    };
  }, [isSpeaking, stop]);
  
  // Extract plain text content for speech
  const getPlainTextForSpeech = () => {
    try {
      const contentObj = JSON.parse(content);
      if (contentObj.type === 'product-info') {
        return `${contentObj.text} ${contentObj.products.map((p: any) => 
          `${p.name}. ${p.description}`).join('. ')} ${contentObj.conclusion}`;
      } else if (contentObj.type === 'order-status') {
        return `Order ${contentObj.orderNumber} Status. Status: ${contentObj.status}. 
                ${contentObj.shippingMethod ? `Shipping Method: ${contentObj.shippingMethod}.` : ''} 
                ${contentObj.estimatedDelivery ? `Estimated Delivery: ${contentObj.estimatedDelivery}.` : ''} 
                ${contentObj.message}`;
      } else if (contentObj.type === 'human-support') {
        return `${contentObj.text} Our customer support is available Monday to Friday, 9am to 8pm Eastern Standard Time, 
                and Saturday to Sunday, 10am to 6pm Eastern Standard Time. 
                Estimated wait time: ${contentObj.waitTime}`;
      } else if (contentObj.type === 'faq-topics') {
        return `${contentObj.text} Available topics: ${contentObj.topics.join(', ')}`;
      }
    } catch (e) {
      // Not JSON, return as is
      return content;
    }
    return content;
  };

  // Function to handle text-to-speech
  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(getPlainTextForSpeech());
    }
  };
  
  // Function to render product cards if they exist in the content
  const renderContent = () => {
    // Check if content has JSON format with product data
    try {
      const contentObj = JSON.parse(content);
      if (contentObj.type === 'product-info') {
        return (
          <>
            <p className="text-gray-800 mb-3">{contentObj.text}</p>
            <div className="space-y-3 mb-3">
              {contentObj.products.map((product: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-2 flex">
                  <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    <p className="text-xs text-gray-600">{product.description}</p>
                    {product.details && Object.entries(product.details).map(([key, value]: [string, any]) => (
                      <p key={key} className="text-xs text-gray-600">{key}: {value}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-800">{contentObj.conclusion}</p>
          </>
        );
      } else if (contentObj.type === 'order-status') {
        return (
          <>
            <p className="text-gray-800 font-medium mb-1">
              Order #{contentObj.orderNumber} Status
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Status:</span>
                <span className={`text-sm font-medium ${
                  contentObj.status === 'Shipped' ? 'text-[#10b981]' : 
                  contentObj.status === 'Delivered' ? 'text-[#10b981]' : 
                  contentObj.status === 'Processing' ? 'text-[#f59e0b]' : 'text-gray-700'
                }`}>{contentObj.status}</span>
              </div>
              {contentObj.shippingMethod && (
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Shipping Method:</span>
                  <span className="text-sm">{contentObj.shippingMethod}</span>
                </div>
              )}
              {contentObj.estimatedDelivery && (
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Est. Delivery:</span>
                  <span className="text-sm">{contentObj.estimatedDelivery}</span>
                </div>
              )}
              {contentObj.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tracking:</span>
                  <a href="#" className="text-sm text-[#3b82f6] hover:underline">{contentObj.trackingNumber}</a>
                </div>
              )}
            </div>
            <p className="text-gray-800">{contentObj.message}</p>
          </>
        );
      } else if (contentObj.type === 'human-support') {
        return (
          <>
            <p className="text-gray-800 mb-3">{contentObj.text}</p>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-700 mb-2">Our customer support is available:</p>
              <p className="text-sm text-gray-700 mb-3">
                Mon-Fri: 9am - 8pm EST<br />
                Sat-Sun: 10am - 6pm EST
              </p>
              <button className="bg-[#06b6d4] hover:bg-[#06b6d4]/80 text-white w-full py-2 rounded-lg font-medium transition-colors">
                Connect with Support
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">Estimated wait time: {contentObj.waitTime}</p>
            </div>
          </>
        );
      } else if (contentObj.type === 'faq-topics') {
        return (
          <>
            <p className="text-gray-800 mb-2">{contentObj.text}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {contentObj.topics.map((topic: string, index: number) => (
                <button 
                  key={index}
                  className="bg-[#93c5fd]/30 hover:bg-[#93c5fd]/50 text-[#1e3a8a] px-3 py-1 rounded-full text-sm transition-colors"
                  onClick={() => {
                    // This click handler won't actually work here as we're rendering content
                    // We'll handle topic clicks in the parent ChatBot component
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </>
        );
      }
    } catch (e) {
      // Not a JSON string, so just return the content as is
    }
    
    // If we couldn't parse it as a special format, or it's not one of our special types,
    // just return the content as regular text
    return <p className={isUser ? "text-white" : "text-gray-800"}>{content}</p>;
  };

  if (isUser) {
    return (
      <div className="flex flex-row-reverse items-end space-x-2 space-x-reverse">
        <div className="bg-[#3b82f6] text-white rounded-2xl rounded-br-none p-3 max-w-[80%] shadow-sm">
          {renderContent()}
          <span className="text-xs text-blue-100 mt-1 block">{timestamp}</span>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex items-end space-x-2">
        <div className="rounded-full w-8 h-8 bg-[#1e3a8a] text-white flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="bg-white rounded-2xl rounded-bl-none p-3 max-w-[80%] shadow-sm relative">
          {renderContent()}
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">{timestamp}</span>
            
            {isSupported && (
              <button 
                onClick={handleSpeak}
                className={`text-xs ml-2 p-1 rounded-full transition-colors ${
                  isSpeaking 
                    ? "bg-red-100 text-red-600 hover:bg-red-200" 
                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                }`}
                aria-label={isSpeaking ? "Stop speaking" : "Listen to this message"}
                title={isSpeaking ? "Stop speaking" : "Listen to this message"}
              >
                {isSpeaking ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default ChatMessage;
