import React from "react";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, isUser, timestamp }) => {
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
        <div className="bg-white rounded-2xl rounded-bl-none p-3 max-w-[80%] shadow-sm">
          {renderContent()}
          <span className="text-xs text-gray-500 mt-1 block">{timestamp}</span>
        </div>
      </div>
    );
  }
};

export default ChatMessage;
