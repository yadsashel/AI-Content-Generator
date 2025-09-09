import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Copy, Edit, Trash, Image as ImageIcon } from "lucide-react";

// Mock data for development
const samplePrompts = {
  "Social Media Post": [
    "Write a short, catchy social media post promoting a new Moroccan Amlou product in 2–3 sentences.",
    "Create an Instagram caption highlighting the health benefits of Amlou in a fun way.",
    "Generate a witty Facebook post announcing our weekend Amlou discount."
  ],
  Email: [
    "Write a professional email to a customer announcing a 10% discount on our Moroccan Amlou products for this weekend only.",
    "Compose a warm welcome email for new subscribers introducing them to Amlou MiZahra and our story.",
    "Draft an email to inform customers about our new Amlou flavors launching this month."
  ],
  "Blog Article": [
    "Write a 300-word blog article about the history and health benefits of Moroccan Amlou.",
    "Generate a blog post explaining why Amlou is the perfect addition to breakfast or snacks.",
    "Write an informative blog post comparing traditional Moroccan Amlou recipes with modern variations."
  ],
  "Ad Copy": [
    "Create a short, persuasive ad copy to promote our Moroccan Amlou on Instagram Ads.",
    "Write a catchy Google Ads description for a special Amlou weekend sale.",
    "Generate a promotional text for a flyer advertising our new Amlou flavors."
  ],
  Caption: [
    "Write a fun Instagram caption for a picture of our freshly made Amlou.",
    "Create a short, engaging Twitter caption to announce a discount on Amlou.",
    "Generate a Pinterest caption highlighting the natural ingredients in our Amlou."
  ],
  AnythingElse: [
    "Write an Instagram caption for a picture of our freshly made Amlou.",
    "Create a short, engaging Twitter caption to announce a discount on Amlou.",
    "Generate a Pinterest caption highlighting the natural ingredients in our Amlou.",
    "Freeform: type anything—AI can generate posts, ads, blog intros, emails, captions, or anything you need!"
  ],
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Modal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1D2036] rounded-lg p-6 w-full max-w-sm text-center">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-white/70 mb-4">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-white bg-white/10 hover:bg-white/20 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// New component for the floating cursor effect
const TypingEffectCursor = () => {
  return (
    <span className="inline-block w-2 h-4 ml-1 bg-white animate-pulse"></span>
  );
};

const MarkdownRenderer = ({ content }) => {
  // Split the content into lines
  const lines = content.split('\n');
  const boldRegex = /\*\*(.*?)\*\*/g;
  const listRegex = /^- /;

  return (
    <div className="prose prose-invert max-w-none">
      {lines.map((line, index) => {
        let formattedLine = line;

        // Check for headings first
        if (line.startsWith('### ')) {
          formattedLine = <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
        } else if (line.startsWith('## ')) {
          formattedLine = <h2 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(3)}</h2>;
        } else if (listRegex.test(line)) {
          // Handle bullet points
          const listItem = line.substring(2);
          const boldParts = listItem.split(boldRegex).map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
          );
          formattedLine = <li key={index} className="pl-4 mt-1">{boldParts}</li>;
        } else {
          // Handle regular text and bolding
          const boldParts = formattedLine.split(boldRegex).map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
          );
          if (line.trim() === '') {
            formattedLine = <br key={index} />;
          } else {
            formattedLine = <p key={index} className="mb-2">{boldParts}</p>;
          }
        }
        return formattedLine;
      })}
    </div>
  );
};


export default function App() {
  const [contentType, setContentType] = useState("AnythingElse");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [userPlan, setUserPlan] = useState("free");
  const [credits, setCredits] = useState(0);
  const [activeChat, setActiveChat] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [copiedMessage, setCopiedMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const chatContainerRef = useRef(null);
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [lastGeneratedPostId, setLastGeneratedPostId] = useState(null);

  useEffect(() => {
    document.title = "Dashboard";
    fetchUserInfo();
    fetchPosts();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeChat]);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserPlan(data.plan);
        setCredits(data.credit_remaining ?? "∞");
      }
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const formattedHistory = data.map(post => ({
          id: post.id,
          title: post.title,
          messages: JSON.parse(post.messages),
          createdAt: new Date(post.created_at),
        }));
        setHistory(formattedHistory);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  const handleSelectChat = (chatId) => {
    const chat = history.find(c => c.id === chatId);
    setActiveChat(chat);
    setPrompt("");
    setShowSidebar(false);
  };

  const handleNewChat = () => {
    setActiveChat(null);
    setPrompt("");
    setShowSidebar(false);
  };

  const handleGenerate = async () => {
    if (!prompt || loading) return;

    setLoading(true);
    setShowImagePrompt(false);

    const userMessage = { role: "user", content: prompt };
    const currentChatMessages = activeChat ? [...activeChat.messages] : [];
    const tempMessages = [...currentChatMessages, userMessage, { role: "assistant", content: "" }];

    const tempChat = activeChat
      ? { ...activeChat, messages: tempMessages }
      : { id: "temp", title: prompt.substring(0, 30), messages: tempMessages, createdAt: new Date() };

    setActiveChat(tempChat);
    setPrompt("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/generate_stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          post_id: activeChat?.id || null,
        }),
      });

      if (res.status === 403) {
        const data = await res.json();
        alert(data.error || "No credits left. Please upgrade your plan.");
        window.location.href = "/pricing";
        return;
      }
      if (!res.ok || !res.body) {
        throw new Error("Failed to get a response from the server.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      const updateContent = (newChunk) => {
        fullResponse += newChunk;
        setActiveChat(prev => {
          if (!prev) return null;
          const updatedMessages = prev.messages.slice(0, -1).concat([{ role: "assistant", content: fullResponse }]);
          return { ...prev, messages: updatedMessages };
        });
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        updateContent(chunk);
      }

      // Check the final message content to decide if image prompt should be shown
      const finalChat = activeChat ? { ...activeChat, messages: activeChat.messages.slice(0, -1).concat([{ role: "assistant", content: fullResponse }]) } : tempChat;
      const lastMessage = finalChat.messages[finalChat.messages.length - 1];
      if (lastMessage && lastMessage.content.includes("Do you want to create an image")) {
        setShowImagePrompt(true);
      }

      fetchUserInfo();
      fetchPosts();

    } catch (err) {
      console.error(err);
      setActiveChat(prev => {
        if (!prev) return null;
        const updatedMessages = prev.messages.slice(0, -1).concat([{ role: "assistant", content: "❌ Request failed. Try again." }]);
        return { ...prev, messages: updatedMessages };
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    setImageLoading(true);
    setShowImagePrompt(false);
    if (!activeChat) return;

    try {
      const token = localStorage.getItem("token");
      const lastAssistantMessage = activeChat.messages[activeChat.messages.length - 1];

      if (!lastAssistantMessage || lastAssistantMessage.role !== 'assistant') {
        throw new Error("No assistant message to generate an image from.");
      }

      const imageUrl = await generateImage(lastAssistantMessage.content, token);

      if (imageUrl) {
        setActiveChat(prev => {
          if (!prev) return null;
          const updatedMessages = prev.messages.map((msg, index) => {
            if (index === prev.messages.length - 1) {
              return { ...msg, imageUrl: imageUrl };
            }
            return msg;
          });
          return { ...prev, messages: updatedMessages };
        });
        
        // Update the backend with the new image URL
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/posts/${activeChat.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messages: JSON.stringify(activeChat.messages.map((msg, index) => {
            if (index === activeChat.messages.length - 1) {
              return { ...msg, imageUrl: imageUrl };
            }
            return msg;
          })) }),
        });
        
      } else {
        alert("Failed to generate image.");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Error generating image: " + error.message);
    } finally {
      setImageLoading(false);
    }
  };

  const generateImage = async (textPrompt, token) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/generate_image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: textPrompt })
      });

      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const data = await res.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Image generation API call failed:", error);
      return null;
    }
  };
  
  const handleRenameChat = async (e, chatId) => {
    e.stopPropagation();
    const newTitle = window.prompt("Enter new chat name:");
    if (!newTitle) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/posts/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (res.ok) {
        setHistory(prevHistory =>
          prevHistory.map(chat =>
            chat.id === chatId ? { ...chat, title: newTitle } : chat
          )
        );
        if (activeChat && activeChat.id === chatId) {
          setActiveChat(prevActiveChat => ({ ...prevActiveChat, title: newTitle }));
        }
      } else {
        console.error("Failed to rename chat:", res.statusText);
      }
    } catch (err) {
      console.error("Failed to rename chat:", err);
    }
  };

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!chatToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/posts/${chatToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
      setActiveChat(null);
    } catch (err) {
      console.error("Failed to delete chat:", err);
    } finally {
      setShowDeleteModal(false);
      setChatToDelete(null);
    }
  };

  const handleCopy = (content) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(content);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Failed to copy text', err);
      }
      document.body.removeChild(textArea);
    }
    setCopiedMessage('Copied!');
    setTimeout(() => setCopiedMessage(''), 2000);
  };

  const handleShare = (platform, content) => {
    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(content)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?summary=${encodeURIComponent(content)}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(content)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank");
  };

  const SocialShareButtons = ({ content }) => {
    return (
      <div className="flex space-x-2 mt-4">
        <button onClick={() => handleShare('facebook', content)} className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-600 rounded-md text-white hover:bg-blue-700 transition">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.04c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm2.5 12.04h-2.5v7.92h-3v-7.92h-1.5v-2.5h1.5v-1.5c0-1.66 1.34-3 3-3h2.5v2.5h-2.5v1.5h2.5v2.5z"/></svg>
          Facebook
        </button>
        <button onClick={() => handleShare('twitter', content)} className="flex items-center space-x-1 px-3 py-2 text-sm bg-sky-500 rounded-md text-white hover:bg-sky-600 transition">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.134 1.195-.898-.957-2.179-1.554-3.593-1.554-2.724 0-4.934 2.21-4.934 4.934 0 .386.044.761.128 1.121-4.102-.206-7.754-2.177-10.201-5.167-.424.729-.667 1.57-.667 2.477 0 1.71.87 3.226 2.185 4.103-.807-.027-1.565-.247-2.226-.616v.061c0 2.396 1.703 4.39 3.956 4.847-.414.113-.852.174-1.298.174-.317 0-.626-.031-.926-.088.631 1.968 2.45 3.401 4.606 3.441-1.69 1.326-3.81 2.112-6.115 2.112-.398 0-.791-.023-1.176-.069 2.188 1.403 4.795 2.22 7.585 2.22 9.102 0 14.075-7.531 14.075-14.075 0-.214-.005-.429-.014-.643.967-.7 1.808-1.571 2.479-2.564z"/></svg>
          Twitter
        </button>
        <button onClick={() => handleShare('linkedin', content)} className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-700 rounded-md text-white hover:bg-blue-800 transition">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.657 1.343 3 3 3h18c1.657 0 3-1.343 3-3V3c0-1.657-1.343-3-3-3zm-10.985 19h-2.915v-9h2.915v9zm-1.449-10.378c-.961 0-1.742-.78-1.742-1.742 0-.961.78-1.742 1.742-1.742.962 0 1.743.781 1.743 1.742 0 .962-.781 1.742-1.743 1.742zm11.449 10.378h-2.898v-4.502c0-.532-.01-.983-.019-1.332-.017-.591-.017-1.025.597-1.025.613 0 1.57.513 1.57 2.032v4.827h-2.915v-4.22c0-1.536-1.018-2.657-2.316-2.657-1.296 0-1.898.887-1.898 2.592v4.285h-2.915v-9h2.915v1.277c.414-.658.918-1.427 2.05-1.427 1.43 0 2.548.881 3.208 2.508v-.004c.062.176.104.37.132.585h.001l.006.027c.026.115.039.229.052.345.012.116.023.23.034.346.011.116.02.23.029.345.009.115.018.23.027.345.009.115.017.23.025.345.008.115.015.229.022.345.007.116.014.23.021.345.006.115.012.23.018.344.005.115.01.229.015.344.004.115.008.229.011.344.003.114.006.229.008.344.002.115.003.229.004.344v.004h-.001c-.001.002-.002.003-.004.005-.002.002-.004.003-.006.004-.002.002-.004.003-.006.005-.001.001-.002.002-.003.002z"/></svg>
          LinkedIn
        </button>
      </div>
    );
  };
  
  return (
    <div className="bg-[#0B1020] text-white min-h-screen flex flex-col md:flex-row">
      {/* Backdrop for mobile */}
      {showSidebar && (
        <div 
          onClick={() => setShowSidebar(false)} 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        ></div>
      )}

      {/* Sidebar for chat history */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-[#171A2E] z-50 transition-transform duration-300 transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex-none md:w-80 md:p-4`}>
        <div className="flex items-center justify-between p-4 mb-4">
          <h2 className="text-xl font-bold">My Chats</h2>
          <div className="flex space-x-2">
            <button onClick={handleNewChat} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </button>
            <button onClick={() => setShowSidebar(false)} className="md:hidden p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto px-4 space-y-2">
          {history.length === 0 ? (
            <p className="text-white/50 text-sm">No chat history. Start a new chat!</p>
          ) : (
            history.map(chat => (
              <div
                key={chat.id}
                className={`p-3 rounded-lg cursor-pointer transition flex items-center justify-between group ${activeChat?.id === chat.id ? 'bg-[#2D335A]' : 'bg-[#1D2036] hover:bg-[#2D335A]'}`}
                onClick={() => handleSelectChat(chat.id)}
              >
                <div className="flex-grow overflow-hidden">
                  <h4 className="text-sm font-semibold truncate">{chat.title || "Untitled Chat"}</h4>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleRenameChat(e, chat.id)} className="p-1 rounded-md hover:bg-white/10">
                    <Edit size={16} />
                  </button>
                  <button onClick={(e) => handleDeleteChat(e, chat.id)} className="p-1 rounded-md hover:bg-white/10 text-red-400">
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {/* This is the section with the Plan and Credits information */}
        <div className="mt-auto p-4 border-t border-white/10">
          <p className="text-sm">Plan: <strong>{userPlan}</strong></p>
          <p className="text-sm">Credits: <strong>{credits}</strong></p>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Mobile header with menu button */}
        <div className="flex-none p-4 md:hidden flex items-center bg-[#171A2E] border-b border-white/10">
          <button onClick={() => setShowSidebar(true)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <h1 className="text-lg font-bold ml-4">{activeChat?.title || "New Chat"}</h1>
        </div>

        {/* Main chat area */}
        <div className="flex-grow p-6 overflow-y-auto space-y-6" ref={chatContainerRef}>
          {!activeChat ? (
            <motion.div initial="hidden" animate="show" className="text-center space-y-4 pt-20">
              <h1 className="text-4xl font-extrabold md:text-6xl bg-gradient-to-r from-fuchsia-400 via-sky-300 to-violet-300 bg-clip-text text-transparent">
                Start a New Chat
              </h1>
              <p className="text-white/70 md:text-lg max-w-2xl mx-auto">
                Select an existing chat from the left or type a prompt below to create new content.
              </p>
            </motion.div>
          ) : (
            activeChat.messages.map((msg, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`p-4 rounded-lg max-w-3xl ${msg.role === 'user' ? 'bg-[#2D335A] text-white' : 'bg-[#1D2036] text-white/80'}`}>
                  <p className="font-semibold capitalize mb-1">{msg.role}</p>
                  {msg.role === 'assistant' ? (
                    <>
                      <MarkdownRenderer content={msg.content} />
                      {msg.imageUrl && (
                        <div className="mt-4">
                          <img src={msg.imageUrl} alt="Generated Image" className="rounded-lg w-full max-w-xs mx-auto" />
                        </div>
                      )}
                      {imageLoading && index === activeChat.messages.length - 1 && (
                        <div className="flex justify-center items-center mt-4">
                          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
                        </div>
                      )}
                      {index === activeChat.messages.length - 1 && showImagePrompt && (
                        <div className="flex space-x-2 mt-4 items-center">
                          <p className="text-sm text-white/70">
                            Do you want to create a fitting image for this post?
                          </p>
                          <button onClick={handleGenerateImage} className="flex items-center space-x-1 px-3 py-2 text-sm bg-purple-600 rounded-md text-white hover:bg-purple-700 transition">
                            <ImageIcon size={16} />
                            Generate Image
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                  {msg.role === 'assistant' && (
                    <div className="flex space-x-2 mt-2">
                      <button 
                        onClick={() => handleCopy(msg.content)} 
                        className="relative flex items-center space-x-1 p-1 text-white/70 hover:text-white transition"
                      >
                        <Copy size={16} />
                        {copiedMessage && (
                          <span className="text-xs absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-700 text-white rounded px-2 py-1">
                            {copiedMessage}
                          </span>
                        )}
                      </button>
                      <SocialShareButtons content={msg.content} />
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="p-4 rounded-lg bg-[#1D2036] text-white/80 max-w-3xl">
                <p className="font-semibold capitalize mb-1">assistant</p>
                <div className="flex items-center">
                  <p>Thinking</p>
                  <TypingEffectCursor />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="flex-none p-6 bg-[#171A2E] border-t border-white/10">
          <div className="flex items-center space-x-4 max-w-4xl mx-auto">
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="hidden md:block rounded-xl border border-white/10 bg-[#0B1020]/60 px-4 py-3 text-white"
            >
              {Object.keys(samplePrompts).map(key => (
                <option key={key}>{key}</option>
              ))}
            </select>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter' && !loading) handleGenerate(); }}
              placeholder="Start a new chat or continue the conversation..."
              className="flex-grow rounded-xl border border-white/10 bg-[#0B1020]/60 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="p-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </button>
          </div>
        </div>
      </div>
      <Modal 
        isOpen={showDeleteModal}
        title="Confirm Delete"
        message="Are you sure you want to delete this chat? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}