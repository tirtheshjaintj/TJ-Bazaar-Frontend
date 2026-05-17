import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import axiosInstance from '../config/axiosConfig';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type Message = {
  sender: 'AI' | 'You';
  text: string;
  image?: string;
};

type AvatarMood = 'idle' | 'thinking' | 'happy' | 'listening';

/* ─────────────────────────────────────────────
   Inline styles (CSS-in-JS via style objects +
   a single injected <style> tag for keyframes
   and pseudo-selectors that React can't do)
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  :root {
    --bz-bg: #07070f;
    --bz-s1: #0d0d1c;
    --bz-s2: #121228;
    --bz-s3: #1a1a38;
    --bz-border: rgba(110,90,255,0.14);
    --bz-border2: rgba(110,90,255,0.32);
    --bz-accent: #7c6fff;
    --bz-pink: #ff6fb0;
    --bz-teal: #5fffd4;
    --bz-gold: #ffd580;
    --bz-text: #eeeaff;
    --bz-text2: #9890c0;
    --bz-text3: #55507a;
    --bz-font-display: 'Syne', sans-serif;
    --bz-font-body: 'DM Sans', sans-serif;
  }

  /* Scrollbar */
  .bz-messages::-webkit-scrollbar { width: 3px; }
  .bz-messages::-webkit-scrollbar-track { background: transparent; }
  .bz-messages::-webkit-scrollbar-thumb { background: var(--bz-border2); border-radius: 10px; }

  /* Keyframes */
  @keyframes bz-aurora-drift {
    0%   { transform: translate(0,0) scale(1); }
    100% { transform: translate(50px,40px) scale(1.2); }
  }
  @keyframes bz-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes bz-breathe {
    0%,100% { transform: scale(1); opacity: 0.5; }
    50%      { transform: scale(1.06); opacity: 1; }
  }
  @keyframes bz-blink {
    0%,88%,100% { transform: scaleY(1); }
    93%          { transform: scaleY(0.08); }
  }
  @keyframes bz-float {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes bz-msg-in {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bz-typing-bounce {
    0%,60%,100% { transform: translateY(0); }
    30%          { transform: translateY(-7px); }
  }
  @keyframes bz-pulse-dot {
    0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(95,255,212,0.5); }
    50%      { opacity: 0.6; box-shadow: 0 0 0 5px rgba(95,255,212,0); }
  }
  @keyframes bz-mic-ring {
    0%   { box-shadow: 0 0 0 0 rgba(255,111,176,0.6); }
    100% { box-shadow: 0 0 0 14px rgba(255,111,176,0); }
  }
  @keyframes bz-btn-glow {
    0%,100% { box-shadow: 0 0 16px rgba(124,111,255,0.3); }
    50%      { box-shadow: 0 0 28px rgba(124,111,255,0.6); }
  }
  @keyframes bz-chip-in {
    from { opacity: 0; transform: translateY(8px) scale(0.94); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes bz-sparkle {
    0%   { opacity: 0; transform: translate(-50%,-50%) scale(0.3) rotate(0deg); }
    40%  { opacity: 1; transform: translate(-50%,-50%) scale(1.2) rotate(180deg); }
    100% { opacity: 0; transform: translate(-50%,-50%) scale(0) rotate(360deg); }
  }
  @keyframes bz-cart-pop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.35); }
    100% { transform: scale(1); }
  }
  @keyframes bz-strip-slide-up {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }
  @keyframes bz-notif-ping {
    0%   { transform: scale(1); opacity: 1; }
    75%,100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes bz-panel-open {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes bz-fab-enter {
    from { opacity: 0; transform: scale(0.5) rotate(-30deg); }
    to   { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  @keyframes bz-gradient-rotate {
    to { --bz-angle: 360deg; }
  }

  /* Utility classes */
  .bz-msg-in   { animation: bz-msg-in 0.42s cubic-bezier(0.16,1,0.3,1) both; }
  .bz-chip-in  { animation: bz-chip-in 0.3s cubic-bezier(0.16,1,0.3,1) both; }

  /* Avatar eye blink */
  .bz-eye { animation: bz-blink 5s ease-in-out infinite; }
  .bz-eye:nth-child(2) { animation-delay: 0.12s; }

  /* Status dot */
  .bz-status-dot { animation: bz-pulse-dot 2s ease-in-out infinite; }

  /* Mic active ring */
  .bz-mic-active { animation: bz-mic-ring 1.2s ease-out infinite; }

  /* Chip hover */
  .bz-chip:hover {
    border-color: var(--bz-accent) !important;
    color: var(--bz-accent) !important;
    background: rgba(124,111,255,0.1) !important;
    transform: translateY(-2px);
  }
  .bz-chip-action:hover {
    border-color: var(--bz-teal) !important;
    color: var(--bz-teal) !important;
    background: rgba(95,255,212,0.08) !important;
  }

  /* Product card hover */
  .bz-product-card:hover {
    border-color: var(--bz-accent) !important;
    box-shadow: 0 0 24px rgba(124,111,255,0.12) !important;
  }

  /* Button hovers */
  .bz-btn-cart:hover  { background: rgba(124,111,255,0.22) !important; }
  .bz-btn-buy:hover   { opacity: 0.88; transform: translateY(-1px); }
  .bz-send-btn:hover  { opacity: 0.88; transform: scale(1.06); }

  /* Input glow on focus */
  .bz-input-wrap:focus-within {
    border-color: var(--bz-accent) !important;
    box-shadow: 0 0 18px rgba(124,111,255,0.12) !important;
  }

  /* Fab button hover */
  .bz-fab:hover { transform: scale(1.08) rotate(8deg); }

  /* Cart bar hover */
  .bz-cart-bar:hover { background: rgba(124,111,255,0.12) !important; }
`;

/* ─────────────────────────────────────────────
   Avatar Face SVG — animated, mood-aware
───────────────────────────────────────────── */
const AvatarFace = ({ mood }: { mood: AvatarMood }) => {
  const mouthW = mood === 'happy' ? 22 : mood === 'thinking' ? 10 : 18;
  const mouthColor = mood === 'happy' ? '#5fffd4' : mood === 'thinking' ? '#7c6fff' : '#ff6fb0';
  const eyeOffsetY = mood === 'thinking' ? -2 : 0;

  return (
    <svg viewBox="0 0 72 72" width="72" height="72" style={{ position: 'relative', zIndex: 1 }}>
      {/* Face bg */}
      <defs>
        <radialGradient id="faceBg" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#2a1a45" />
          <stop offset="100%" stopColor="#0d0d1c" />
        </radialGradient>
        <radialGradient id="faceGlow" cx="35%" cy="35%" r="55%">
          <stop offset="0%" stopColor="rgba(124,111,255,0.28)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <circle cx="36" cy="36" r="36" fill="url(#faceBg)" />
      <circle cx="36" cy="36" r="36" fill="url(#faceGlow)" />

      {/* Eyes */}
      <motion.ellipse
        cx="24" cy={33 + eyeOffsetY} rx="4.5" ry="4.5"
        fill="#7c6fff"
        animate={{ ry: [4.5, 4.5, 0.4, 4.5], opacity: [1, 1, 1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.88, 0.93, 1] }}
        style={{ filter: 'drop-shadow(0 0 5px #7c6fff)' }}
      />
      <motion.ellipse
        cx="48" cy={33 + eyeOffsetY} rx="4.5" ry="4.5"
        fill="#7c6fff"
        animate={{ ry: [4.5, 4.5, 0.4, 4.5], opacity: [1, 1, 1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.90, 0.95, 1], delay: 0.12 }}
        style={{ filter: 'drop-shadow(0 0 5px #7c6fff)' }}
      />

      {/* Eye shine */}
      <circle cx="26" cy="31" r="1.5" fill="rgba(255,255,255,0.6)" />
      <circle cx="50" cy="31" r="1.5" fill="rgba(255,255,255,0.6)" />

      {/* Mouth */}
      <motion.rect
        x={36 - mouthW / 2} y="47" width={mouthW} height="3.5" rx="2"
        fill={mouthColor}
        animate={{ width: mouthW, x: 36 - mouthW / 2, fill: mouthColor }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{ filter: `drop-shadow(0 0 4px ${mouthColor})` }}
      />

      {/* Thinking dots */}
      {mood === 'thinking' && (
        <>
          {[0, 1, 2].map(i => (
            <motion.circle
              key={i} cx={29 + i * 7} cy="50" r="2"
              fill="#7c6fff"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
            />
          ))}
        </>
      )}
    </svg>
  );
};

/* ─────────────────────────────────────────────
   Typing Indicator
───────────────────────────────────────────── */
const TypingIndicator = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '12px 16px',
    background: 'var(--bz-s2)', border: '1px solid var(--bz-border)',
    borderRadius: '16px 16px 16px 4px', width: 'fit-content' }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 7, height: 7, borderRadius: '50%',
        background: ['var(--bz-accent)', 'var(--bz-pink)', 'var(--bz-teal)'][i],
        animation: `bz-typing-bounce 1.1s ease-in-out ${i * 0.18}s infinite`,
      }} />
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   Quick Reply Chips
───────────────────────────────────────────── */
const QuickChips = ({ chips, onSelect }: { chips: string[]; onSelect: (c: string) => void }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, paddingTop: 4 }}>
    {chips.map((c, i) => {
      const isAction = c.startsWith('→');
      return (
        <button
          key={c}
          className={`bz-chip${isAction ? ' bz-chip-action' : ''} bz-chip-in`}
          onClick={() => onSelect(c.replace('→ ', ''))}
          style={{
            animationDelay: `${i * 0.06}s`,
            padding: '6px 13px', borderRadius: 100,
            border: `1px solid ${isAction ? 'rgba(95,255,212,0.3)' : 'var(--bz-border)'}`,
            background: isAction ? 'rgba(95,255,212,0.05)' : 'var(--bz-s2)',
            color: isAction ? 'var(--bz-teal)' : 'var(--bz-text2)',
            fontFamily: 'var(--bz-font-body)', fontSize: 12,
            cursor: 'pointer', transition: 'all 0.22s', whiteSpace: 'nowrap',
          }}
        >
          {c}
        </button>
      );
    })}
  </div>
);

/* ─────────────────────────────────────────────
   Message Bubble
───────────────────────────────────────────── */
const MessageBubble = ({
  msg, index, speaking, onSpeak, onStopSpeak,
}: {
  msg: Message; index: number;
  speaking: number | null;
  onSpeak: (text: string, idx: number) => void;
  onStopSpeak: () => void;
}) => {
  const isAI = msg.sender === 'AI';
  return (
    <div className="bz-msg-in" style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isAI ? 'flex-start' : 'flex-end',
      animationDelay: `${index * 0.04}s`,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--bz-text3)',
        marginBottom: 4, paddingInline: 4,
        fontFamily: 'var(--bz-font-display)',
      }}>
        {msg.sender}
      </div>
      <div style={{
        maxWidth: '82%', padding: '12px 15px', borderRadius: isAI ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
        background: isAI
          ? 'var(--bz-s2)'
          : 'linear-gradient(135deg, rgba(124,111,255,0.22), rgba(255,111,176,0.12))',
        border: `1px solid ${isAI ? 'var(--bz-border)' : 'rgba(124,111,255,0.28)'}`,
        color: 'var(--bz-text)', fontSize: 14, lineHeight: 1.65,
        fontFamily: 'var(--bz-font-body)', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        position: 'relative',
      }}>
        {msg.text}
        {msg.image && (
          <img src={msg.image} alt="sent" style={{
            display: 'block', marginTop: 10, borderRadius: 10,
            maxHeight: 160, maxWidth: '100%', objectFit: 'cover',
            border: '1px solid var(--bz-border)',
          }} />
        )}
        {isAI && (
          <button
            onClick={() => speaking === index ? onStopSpeak() : onSpeak(msg.text, index)}
            title={speaking === index ? 'Stop' : 'Read aloud'}
            style={{
              position: 'absolute', bottom: 8, right: 10,
              background: 'none', border: 'none', cursor: 'pointer',
              color: speaking === index ? 'var(--bz-teal)' : 'var(--bz-text3)',
              fontSize: 12, padding: 2, transition: 'color 0.2s',
            }}
          >
            {speaking === index ? '⏹' : '🔊'}
          </button>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Chatbot Component
───────────────────────────────────────────── */
const Chatbot: React.FC = () => {
  /* ── State ── */
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('chatMessages');
      return saved ? JSON.parse(saved) : [{ sender: 'AI', text: 'Hey! I\'m BazaarAI 👋 I can help you find the perfect product, compare options, or add things to your cart. What are you looking for today?' }];
    } catch {
      return [{ sender: 'AI', text: 'Hey! I\'m BazaarAI. How can I help you today?' }];
    }
  });
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarMood, setAvatarMood] = useState<AvatarMood>('idle');
  const [cartCount, setCartCount] = useState(0);
  const [showCartBump, setShowCartBump] = useState(false);
  const [statusText, setStatusText] = useState('Online · Ready to help');
  const [notifPing, setNotifPing] = useState(false);

  /* Quick chips shown after first AI message */
  const defaultChips = [
    'What\'s the best deal today?',
    'Help me compare products',
    '→ Add to Cart',
    '→ Buy Now',
  ];

  /* ── Refs ── */
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const styleInjected = useRef(false);

  /* ── Inject global CSS once ── */
  useEffect(() => {
    if (styleInjected.current) return;
    styleInjected.current = true;
    const tag = document.createElement('style');
    tag.textContent = GLOBAL_CSS;
    document.head.appendChild(tag);
    return () => { document.head.removeChild(tag); };
  }, []);

  /* ── Speech Recognition init ── */
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (e: any) => {
      let t = '';
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setInput(t);
    };
    rec.onend = () => { setListening(false); setStatusText('Online · Ready to help'); setAvatarMood('idle'); };
    recognitionRef.current = rec;
  }, []);

  /* ── Auto scroll ── */
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  /* ── Notify when closed and AI responded ── */
  useEffect(() => {
    if (!isOpen && messages[messages.length - 1]?.sender === 'AI' && messages.length > 1) {
      setNotifPing(true);
    }
  }, [messages, isOpen]);

  /* ── Sparkle burst ── */
  const spawnSparkles = useCallback((x: number, y: number) => {
    const glyphs = ['✦', '·', '✧', '★', '◆'];
    const colors = ['var(--bz-accent)', 'var(--bz-pink)', 'var(--bz-teal)', 'var(--bz-gold)'];
    for (let i = 0; i < 8; i++) {
      const el = document.createElement('div');
      const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.5;
      const dist = 40 + Math.random() * 40;
      el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      el.style.cssText = `
        position:fixed; pointer-events:none; z-index:9999;
        left:${x}px; top:${y}px;
        color:${colors[Math.floor(Math.random() * colors.length)]};
        font-size:${10 + Math.random() * 10}px;
        animation: bz-sparkle 0.8s ease-out ${Math.random() * 0.2}s forwards;
        transform: translate(-50%,-50%);
      `;
      // Animate outward via JS
      document.body.appendChild(el);
      const kf: Keyframe[] = [
        { transform: `translate(-50%,-50%) scale(0.3)`, opacity: 0 },
        { transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(1.2)`, opacity: 1, offset: 0.4 },
        { transform: `translate(calc(-50% + ${Math.cos(angle) * dist * 1.6}px), calc(-50% + ${Math.sin(angle) * dist * 1.6}px)) scale(0)`, opacity: 0 },
      ];
      el.animate(kf, { duration: 700 + Math.random() * 200, easing: 'cubic-bezier(0.16,1,0.3,1)', delay: Math.random() * 150, fill: 'forwards' })
        .onfinish = () => el.remove();
    }
  }, []);

  /* ── Cart bump ── */
  const bumpCart = useCallback((e?: React.MouseEvent) => {
    setCartCount(c => c + 1);
    setShowCartBump(true);
    setTimeout(() => setShowCartBump(false), 600);
    if (e) spawnSparkles(e.clientX, e.clientY);
  }, [spawnSparkles]);

  /* ── Voice toggle ── */
  const toggleListening = () => {
    if (!recognitionRef.current) {
      Swal.fire({ title: 'Not supported', text: 'Speech recognition is unavailable in this browser.', icon: 'info', background: '#0d0d1c', color: '#eeeaff', confirmButtonColor: '#7c6fff' });
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      setAvatarMood('idle');
      setStatusText('Online · Ready to help');
    } else {
      recognitionRef.current.start();
      setListening(true);
      setAvatarMood('listening');
      setStatusText('Listening...');
    }
  };

  /* ── TTS ── */
  const speakText = (text: string, index: number) => {
    if (speaking !== null) {
      window.speechSynthesis.cancel();
      setSpeaking(null);
      if (speaking === index) return;
    }
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-US'; utt.rate = 1; utt.pitch = 1;
    utt.onend = () => setSpeaking(null);
    window.speechSynthesis.speak(utt);
    setSpeaking(index);
  };

  const stopSpeaking = () => { window.speechSynthesis.cancel(); setSpeaking(null); };

  /* ── Image ── */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Swal.fire({ icon: 'error', title: 'Invalid file', text: 'Please upload a valid image file.', background: '#0d0d1c', color: '#eeeaff', confirmButtonColor: '#7c6fff' });
      e.target.value = '';
      return;
    }
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => { setSelectedImage(null); setPreviewUrl(null); };

  /* ── Clear chat ── */
  const clearChatHistory = () => {
    Swal.fire({
      title: 'Clear history?',
      text: 'This will remove the entire conversation.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c6fff',
      cancelButtonColor: '#ff6fb0',
      confirmButtonText: 'Clear it',
      background: '#0d0d1c',
      color: '#eeeaff',
    }).then(r => {
      if (r.isConfirmed) {
        setMessages([{ sender: 'AI', text: 'Fresh start! What can I help you find?' }]);
        localStorage.removeItem('chatMessages');
      }
    });
  };

  /* ── Submit / send ── */
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const userMessage: Message = { sender: 'You', text: input };
    if (previewUrl) userMessage.image = previewUrl;

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setSelectedImage(null);
    setPreviewUrl(null);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages.map(m => ({ ...m, image: undefined }))));

    setAvatarMood('thinking');
    setStatusText('Thinking...');

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('prompt', input);

      // Extract productId from URL
      const match = window.location.href.match(/\/product\/([a-fA-F0-9]{24})(?:[#/?]|$)/);
      if (match?.[1]) formData.append('productId', match[1]);

      formData.append('history', JSON.stringify(updatedMessages));
      if (selectedImage) formData.append('image', selectedImage);

      const response = await axiosInstance.post('/groq', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      const botMessage: Message = { sender: 'AI', text: response.data.toString() };
      const final = [...updatedMessages, botMessage];
      setMessages(final);
      localStorage.setItem('chatMessages', JSON.stringify(final.map(m => ({ ...m, image: undefined }))));
      setAvatarMood('happy');
      setStatusText('Online · Ready to help');
      setTimeout(() => setAvatarMood('idle'), 2000);
    } catch {
      const errorMsg: Message = { sender: 'AI', text: 'Sorry, something went wrong. Please try again.' };
      const withError = [...updatedMessages, errorMsg];
      setMessages(withError);
      localStorage.setItem('chatMessages', JSON.stringify(withError));
      setAvatarMood('idle');
      setStatusText('Online · Ready to help');
    } finally {
      setLoading(false);
    }
  };

  /* ── Chip select ── */
  const handleChipSelect = (chip: string) => {
    if (chip === 'Add to Cart') { bumpCart(); return; }
    if (chip === 'Buy Now') {
      Swal.fire({ title: 'Redirecting to checkout…', icon: 'success', timer: 1200, showConfirmButton: false, background: '#0d0d1c', color: '#eeeaff' });
      return;
    }
    setInput(chip);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  /* ── Open/close ── */
  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setNotifPing(false);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const closeChat = () => setIsOpen(false);
  const minimizeChat = () => setIsMinimized(true);
  const restoreChat = () => setIsMinimized(false);

  /* ─────────────────────────────────────────────
     Render
  ───────────────────────────────────────────── */
  return (
    <div style={{ fontFamily: 'var(--bz-font-body)' }}>

      {/* ── FAB (floating action button) ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="bz-fab"
            initial={{ scale: 0, rotate: -30, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            onClick={openChat}
            style={{
              position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
              width: 58, height: 58, borderRadius: '50%', border: 'none',
              background: 'linear-gradient(135deg, #7c6fff, #ff6fb0)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 1px rgba(124,111,255,0.3), 0 8px 32px rgba(124,111,255,0.35)',
              transition: 'transform 0.22s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {/* Chat icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
            </svg>
            {/* Notification ping */}
            {notifPing && (
              <span style={{
                position: 'absolute', top: 0, right: 0,
                width: 14, height: 14, borderRadius: '50%',
                background: 'var(--bz-teal)', border: '2px solid #07070f',
                animation: 'bz-notif-ping 2s cubic-bezier(0,0,0.2,1) infinite',
              }} />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              bottom: 0, right: 0,
              width: '100%',
              maxWidth: 420,
              height: '100dvh',
              maxHeight: 720,
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(7,7,15,0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderLeft: '1px solid var(--bz-border)',
              borderTop: '1px solid var(--bz-border)',
              borderTopLeftRadius: 20,
              zIndex: 999,
              overflow: 'hidden',
            }}
          >
            {/* Aurora blobs inside panel */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
              {[
                { w: 320, h: 200, color: '#7c6fff', top: -60, left: -60, delay: '0s' },
                { w: 260, h: 260, color: '#ff6fb0', top: '50%', right: -80, delay: '-4s' },
                { w: 200, h: 200, color: '#5fffd4', bottom: -60, left: '30%', delay: '-8s' },
              ].map((b, i) => (
                <div key={i} style={{
                  position: 'absolute', borderRadius: '50%',
                  width: b.w, height: b.h,
                  background: `radial-gradient(circle, ${b.color}, transparent)`,
                  filter: 'blur(60px)', opacity: 0.12,
                  top: b.top, left: (b as any).left, right: (b as any).right, bottom: (b as any).bottom,
                  animation: `bz-aurora-drift 12s ease-in-out ${b.delay} infinite alternate`,
                }} />
              ))}
              {/* Grain overlay */}
              <div style={{
                position: 'absolute', inset: 0, opacity: 0.035,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              }} />
            </div>

            {/* Left glow border */}
            <div style={{
              position: 'absolute', left: 0, top: '8%', bottom: '8%', width: 1,
              background: 'linear-gradient(to bottom, transparent, var(--bz-accent), var(--bz-pink), var(--bz-teal), transparent)',
              opacity: 0.5, zIndex: 1,
            }} />

            {/* ── HEADER — Avatar Zone ── */}
            <div style={{
              position: 'relative', zIndex: 2,
              padding: '20px 18px 14px',
              borderBottom: '1px solid var(--bz-border)',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

                {/* Avatar */}
                <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                  {/* Spinning gradient ring */}
                  <div style={{
                    position: 'absolute', inset: -5, borderRadius: '50%',
                    background: 'conic-gradient(var(--bz-accent), var(--bz-pink), var(--bz-teal), var(--bz-accent))',
                    animation: 'bz-spin 8s linear infinite',
                    mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #fff 0)',
                    WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #fff 0)',
                  }} />
                  {/* Breathing outer ring */}
                  <div style={{
                    position: 'absolute', inset: -2, borderRadius: '50%',
                    border: '1px solid var(--bz-border2)',
                    animation: 'bz-breathe 4s ease-in-out infinite',
                  }} />
                  {/* Face */}
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    border: '1px solid var(--bz-border2)', overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <AvatarFace mood={avatarMood} />
                  </div>
                  {/* Glow under avatar */}
                  <div style={{
                    position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
                    width: 50, height: 16, borderRadius: '50%',
                    background: 'var(--bz-accent)', filter: 'blur(10px)', opacity: 0.25,
                  }} />
                </div>

                {/* Title + status */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--bz-font-display)', fontSize: 17,
                    fontWeight: 700, color: 'var(--bz-text)', letterSpacing: '0.02em',
                  }}>BazaarAI</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <div className="bz-status-dot" style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: listening ? 'var(--bz-pink)' : 'var(--bz-teal)',
                    }} />
                    <span style={{ fontSize: 12, color: 'var(--bz-text3)', fontFamily: 'var(--bz-font-body)' }}>
                      {statusText}
                    </span>
                  </div>
                </div>

                {/* Header controls */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {/* Clear */}
                  <button onClick={clearChatHistory} title="Clear history" style={{
                    width: 30, height: 30, borderRadius: 8, border: '1px solid var(--bz-border)',
                    background: 'var(--bz-s1)', color: 'var(--bz-text3)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                    transition: 'all 0.2s',
                  }}>⟳</button>
                  {/* Minimize */}
                  <button onClick={minimizeChat} title="Minimize" style={{
                    width: 30, height: 30, borderRadius: 8, border: '1px solid var(--bz-border)',
                    background: 'var(--bz-s1)', color: 'var(--bz-text3)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    transition: 'all 0.2s',
                  }}>—</button>
                  {/* Close */}
                  <button onClick={closeChat} title="Close" style={{
                    width: 30, height: 30, borderRadius: 8, border: '1px solid var(--bz-border)',
                    background: 'var(--bz-s1)', color: 'var(--bz-text3)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    transition: 'all 0.2s',
                  }}>✕</button>
                </div>
              </div>
            </div>

            {/* ── CART BAR ── */}
            {cartCount > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bz-cart-bar"
                style={{
                  position: 'relative', zIndex: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 18px', borderBottom: '1px solid var(--bz-border)',
                  background: 'rgba(124,111,255,0.06)', cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🛒</span>
                  <motion.span
                    animate={showCartBump ? { scale: [1, 1.5, 1] } : {}}
                    transition={{ duration: 0.4 }}
                    style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'var(--bz-accent)', color: '#fff',
                      fontSize: 11, fontWeight: 700, fontFamily: 'var(--bz-font-display)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >{cartCount}</motion.span>
                  <span style={{ fontSize: 13, color: 'var(--bz-text2)' }}>
                    {cartCount} item{cartCount > 1 ? 's' : ''} in cart
                  </span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--bz-accent)', fontFamily: 'var(--bz-font-display)', fontWeight: 600 }}>
                  Checkout →
                </span>
              </motion.div>
            )}

            {/* ── MESSAGES ── */}
            <div
              ref={chatRef}
              className="bz-messages"
              style={{
                position: 'relative', zIndex: 2,
                flex: 1, overflowY: 'auto',
                padding: '16px 16px 8px',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}
            >
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i} msg={msg} index={i}
                  speaking={speaking}
                  onSpeak={speakText}
                  onStopSpeak={stopSpeaking}
                />
              ))}

              {/* Quick chips after first AI message */}
              {messages.length <= 1 && !loading && (
                <QuickChips chips={defaultChips} onSelect={handleChipSelect} />
              )}

              {/* Typing indicator */}
              {loading && (
                <div className="bz-msg-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--bz-text3)', paddingInline: 4, fontFamily: 'var(--bz-font-display)' }}>BazaarAI</div>
                  <TypingIndicator />
                </div>
              )}
            </div>

            {/* ── INPUT ZONE ── */}
            <div style={{
              position: 'relative', zIndex: 2,
              padding: '10px 14px 16px',
              borderTop: '1px solid var(--bz-border)',
            }}>
              {/* Image preview */}
              <AnimatePresence>
                {previewUrl && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ marginBottom: 8, position: 'relative', width: 'fit-content' }}
                  >
                    <img src={previewUrl} alt="preview" style={{
                      height: 80, borderRadius: 10, objectFit: 'cover',
                      border: '1px solid var(--bz-border2)',
                    }} />
                    <button onClick={removeImage} style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'var(--bz-pink)', border: 'none',
                      color: '#fff', fontSize: 10, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit}>
                <div className="bz-input-wrap" style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--bz-s2)', border: '1px solid var(--bz-border)',
                  borderRadius: 14, padding: '6px 6px 6px 14px',
                  transition: 'border-color 0.25s, box-shadow 0.25s',
                }}>
                  {/* Mic */}
                  <motion.button
                    type="button"
                    onClick={toggleListening}
                    animate={listening ? { scale: [1, 1.15, 1] } : {}}
                    transition={listening ? { repeat: Infinity, duration: 1.1 } : {}}
                    className={listening ? 'bz-mic-active' : ''}
                    style={{
                      width: 34, height: 34, borderRadius: 10, border: 'none',
                      background: listening ? 'rgba(255,111,176,0.18)' : 'rgba(124,111,255,0.12)',
                      color: listening ? 'var(--bz-pink)' : 'var(--bz-accent)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, flexShrink: 0, transition: 'all 0.2s',
                    }}
                  >
                    {listening ? '🎙️' : '🎤'}
                  </motion.button>

                  {/* Text input */}
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
                    placeholder={listening ? 'Listening… speak now' : 'Ask me anything…'}
                    style={{
                      flex: 1, background: 'none', border: 'none', outline: 'none',
                      color: 'var(--bz-text)', fontFamily: 'var(--bz-font-body)',
                      fontSize: 14, minWidth: 0,
                    }}
                  />

                  {/* Image upload */}
                  <label style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: 'rgba(95,255,212,0.07)', border: '1px solid var(--bz-border)',
                    color: 'var(--bz-teal)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, flexShrink: 0, transition: 'all 0.2s',
                  }}>
                    📷
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                  </label>

                  {/* Send */}
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.92 }}
                    className="bz-send-btn"
                    style={{
                      width: 36, height: 36, borderRadius: 10, border: 'none',
                      background: 'linear-gradient(135deg, var(--bz-accent), var(--bz-pink))',
                      color: '#fff', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, flexShrink: 0, transition: 'opacity 0.2s, transform 0.2s',
                    }}
                  >
                    ➤
                  </motion.button>
                </div>
              </form>
            </div>

            {/* ── MINIMIZE OVERLAY ── */}
            <AnimatePresence>
              {isMinimized && (
                <motion.div
                  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: 'absolute', inset: 0, zIndex: 10,
                    background: 'rgba(7,7,15,0.97)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 20,
                  }}
                >
                  {/* Mini avatar */}
                  <div style={{ position: 'relative', width: 56, height: 56 }}>
                    <div style={{
                      position: 'absolute', inset: -4, borderRadius: '50%',
                      background: 'conic-gradient(var(--bz-accent), var(--bz-pink), var(--bz-teal), var(--bz-accent))',
                      animation: 'bz-spin 8s linear infinite',
                      mask: 'radial-gradient(farthest-side, transparent calc(100% - 1.5px), #fff 0)',
                      WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 1.5px), #fff 0)',
                    }} />
                    <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1px solid var(--bz-border2)', overflow: 'hidden' }}>
                      <AvatarFace mood="idle" />
                    </div>
                    {/* Notif dot */}
                    <div style={{
                      position: 'absolute', top: 0, right: 0,
                      width: 12, height: 12, borderRadius: '50%',
                      background: 'var(--bz-teal)', border: '2px solid #07070f',
                    }} />
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--bz-font-display)', fontSize: 16, fontWeight: 700, color: 'var(--bz-text)', marginBottom: 4 }}>BazaarAI</div>
                    <div style={{ fontSize: 13, color: 'var(--bz-text3)' }}>Chat minimized</div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={restoreChat} style={{
                      padding: '10px 24px', borderRadius: 12,
                      background: 'linear-gradient(135deg, var(--bz-accent), var(--bz-pink))',
                      border: 'none', color: '#fff',
                      fontFamily: 'var(--bz-font-display)', fontWeight: 600, fontSize: 14,
                      cursor: 'pointer',
                    }}>Resume Chat ↑</button>
                    <button onClick={closeChat} style={{
                      padding: '10px 20px', borderRadius: 12,
                      background: 'var(--bz-s2)', border: '1px solid var(--bz-border)',
                      color: 'var(--bz-text2)', fontFamily: 'var(--bz-font-body)',
                      fontSize: 14, cursor: 'pointer',
                    }}>Close</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;