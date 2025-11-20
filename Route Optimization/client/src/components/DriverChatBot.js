import React, { useState, useEffect, useRef } from 'react';
import './DriverChatBot.css';

function DriverChatBot({ optimizedRoute, startLocation, onSpeak }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        // Use setTimeout to ensure state is updated
        setTimeout(() => {
          handleSendMessage(transcript);
        }, 100);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg = {
        type: 'bot',
        text: "Hello! I'm your route assistant. I can help you with directions, tell you where to go next, and answer questions about your route. Try asking: 'Where do I go first?', 'How many stops?', or 'What's the total distance?'"
      };
      setMessages([welcomeMsg]);
      speak(welcomeMsg.text);
    }
  }, [isOpen]);

  // Announce first stop when route is optimized
  useEffect(() => {
    if (optimizedRoute && optimizedRoute.route && optimizedRoute.route.length > 0 && isOpen) {
      const firstStop = optimizedRoute.route.find(stop => stop.order === 1);
      if (firstStop) {
        const announcement = `Your first stop is ${firstStop.address || firstStop.name}, ${(firstStop.vehicleDistance || 0).toFixed(1)} kilometers away. Estimated travel time is ${Math.round(firstStop.estimatedVehicleTime || 0)} minutes.`;
        const msg = { type: 'bot', text: announcement };
        setMessages(prev => [...prev, msg]);
        speak(announcement);
      }
    }
  }, [optimizedRoute, isOpen]);

  const speak = (text) => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    
    if (onSpeak) {
      onSpeak(text);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSendMessage = (text = null) => {
    const messageText = text || inputValue;
    if (!messageText || !messageText.trim()) return;

    const trimmedText = messageText.trim();
    const userMsg = { type: 'user', text: trimmedText };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Process user message and generate response
    setTimeout(() => {
      const response = generateResponse(trimmedText.toLowerCase());
      const botMsg = { type: 'bot', text: response };
      setMessages(prev => [...prev, botMsg]);
      speak(response);
    }, 500);
  };

  const generateResponse = (userInput) => {
    // Route-related queries
    if (userInput.includes('first stop') || userInput.includes('where to go') || userInput.includes('next stop')) {
      if (optimizedRoute && optimizedRoute.route) {
        const firstStop = optimizedRoute.route.find(stop => stop.order === 1);
        if (firstStop) {
          return `Your first stop is ${firstStop.address || firstStop.name}. It's ${(firstStop.vehicleDistance || 0).toFixed(1)} kilometers away and will take approximately ${Math.round(firstStop.estimatedVehicleTime || 0)} minutes to reach.`;
        }
      }
      return "I don't see an optimized route yet. Please optimize your route first.";
    }

    if (userInput.includes('how many stops') || userInput.includes('total stops')) {
      if (optimizedRoute && optimizedRoute.statistics) {
        return `You have ${optimizedRoute.statistics.totalStops} stops in total.`;
      }
      return "I don't have route information yet. Please optimize your route first.";
    }

    if (userInput.includes('total distance') || userInput.includes('how far')) {
      if (optimizedRoute && optimizedRoute.statistics) {
        return `The total distance for your route is ${optimizedRoute.statistics.totalVehicleDistance?.toFixed(1) || 'unknown'} kilometers.`;
      }
      return "I don't have route information yet. Please optimize your route first.";
    }

    if (userInput.includes('total time') || userInput.includes('how long')) {
      if (optimizedRoute && optimizedRoute.statistics) {
        return `The total estimated time for your route is ${Math.round(optimizedRoute.statistics.estimatedVehicleTime || 0)} minutes of driving.`;
      }
      return "I don't have route information yet. Please optimize your route first.";
    }

    if (userInput.includes('urgent') || userInput.includes('priority')) {
      if (optimizedRoute && optimizedRoute.route) {
        const urgentStops = optimizedRoute.route.filter(stop => stop.urgent);
        if (urgentStops.length > 0) {
          return `You have ${urgentStops.length} urgent ${urgentStops.length === 1 ? 'stop' : 'stops'}. ${urgentStops.map(s => s.address || s.name).join(', ')}`;
        }
        return "You don't have any urgent stops in your current route.";
      }
      return "I don't have route information yet. Please optimize your route first.";
    }

    // Weather queries
    if (userInput.includes('weather') || userInput.includes('rain') || userInput.includes('snow')) {
      return "I can see weather information in the route details. Check the weather alerts section for current conditions.";
    }

    // General help
    if (userInput.includes('help') || userInput.includes('what can you do') || userInput.includes('commands')) {
      return "I can help you with:\n• First stop: 'Where do I go first?' or 'What's my first stop?'\n• Total stops: 'How many stops?' or 'Total stops'\n• Distance: 'What's the total distance?' or 'How far?'\n• Time: 'How long will it take?' or 'Total time'\n• Urgent stops: 'Do I have urgent stops?' or 'Priority stops'\n• Weather: 'What's the weather?'\n• General: 'Hello', 'Hi', or just ask me anything about your route!";
    }

    // Greetings
    if (userInput.includes('hello') || userInput.includes('hi') || userInput.includes('hey')) {
      return "Hello! How can I help you with your route today? You can ask me about your first stop, total distance, time, or urgent stops.";
    }

    // Default response
    return "I'm here to help with your route. You can ask me:\n• 'Where do I go first?' - Get your first destination\n• 'How many stops?' - Total number of stops\n• 'What's the total distance?' - Route distance\n• 'How long will it take?' - Estimated time\n• 'Do I have urgent stops?' - Check urgent deliveries\n• 'Help' - See all available commands";
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        className={`DriverChatBot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) {
            stopSpeaking();
            stopListening();
          }
        }}
        title="Open route assistant"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="DriverChatBot-window">
          <div className="DriverChatBot-header">
            <div className="DriverChatBot-header-content">
              <div className="DriverChatBot-avatar">🤖</div>
              <div>
                <div className="DriverChatBot-title">Route Assistant</div>
                <div className="DriverChatBot-status">
                  {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Online'}
                </div>
              </div>
            </div>
            <button
              className="DriverChatBot-close"
              onClick={() => {
                setIsOpen(false);
                stopSpeaking();
                stopListening();
              }}
            >
              ✕
            </button>
          </div>

          <div className="DriverChatBot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`DriverChatBot-message ${msg.type}`}>
                <div className="DriverChatBot-message-content">{msg.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="DriverChatBot-input-area">
            <div className="DriverChatBot-controls">
              <button
                className={`DriverChatBot-voice-btn ${isListening ? 'listening' : ''}`}
                onClick={isListening ? stopListening : startListening}
                title={isListening ? 'Stop listening' : 'Start voice input'}
                disabled={!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)}
              >
                🎤
              </button>
              {isSpeaking && (
                <button
                  className="DriverChatBot-stop-btn"
                  onClick={stopSpeaking}
                  title="Stop speaking"
                >
                  ⏸
                </button>
              )}
            </div>
            <input
              type="text"
              className="DriverChatBot-input"
              placeholder="Ask me about your route..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              className="DriverChatBot-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default DriverChatBot;

