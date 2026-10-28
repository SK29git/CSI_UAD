import React, { useState, useEffect, useRef } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { getFullMobileNumber, isFullMobileNumber } from '../utils/phoneUtils';
import { 
  FaCommentAlt, 
  FaPaperPlane, 
  FaTimes, 
  FaMinus, 
  FaExpandAlt, 
  FaSyncAlt, 
  FaPhoneAlt, 
  FaTag, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaSpinner, 
  FaCopy, 
  FaCheck,
  FaGripLines
} from 'react-icons/fa';

export default function FloatingSmsWidget() {
  const { 
    customer, 
    currentMobile, 
    isSmsWidgetOpen, 
    isSmsWidgetMinimized, 
    closeSmsWidget, 
    toggleMinimizeSmsWidget,
    sendSms,
    showToast 
  } = useCustomer();

  // Helper to generate guaranteed unique reference
  const generateUniqueRef = () => {
    const timestampPart = Date.now().toString().slice(-6);
    const randomPart = Math.floor(100 + Math.random() * 900);
    return `GEN-${timestampPart}${randomPart}`;
  };

  const [recipient, setRecipient] = useState('');
  const [reference, setReference] = useState(generateUniqueRef);
  const [senderId, setSenderId] = useState('AGMC');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Dragging state (defaults to beside the Customer Profile)
  const [position, setPosition] = useState(() => {
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
    return {
      x: isDesktop ? 320 : Math.max(16, (typeof window !== 'undefined' ? window.innerWidth - 380 : 20)),
      y: 85
    };
  });

  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const customerName = customer?.fullName || 
    `${customer?.firstName || ''} ${customer?.surname || ''}`.trim() || 
    'Customer';

  // Pre-fill recipient when customer or modal state changes
  useEffect(() => {
    if (isSmsWidgetOpen) {
      const resolved = getFullMobileNumber(customer, currentMobile) || 
        (isFullMobileNumber(customer?.mobile) ? customer.mobile.replace(/\D/g, '') : 
        (isFullMobileNumber(customer?.mobileRaw) ? customer.mobileRaw.replace(/\D/g, '') : ''));
      
      setRecipient(resolved || customer?.mobile || '');
      setReference(generateUniqueRef());
      setErrorMsg(null);
      setLastReceipt(null);

      // Default position beside Customer Profile on open
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
      setPosition({
        x: isDesktop ? 315 : Math.max(16, (window.innerWidth - 370) / 2),
        y: 85
      });
    }
  }, [isSmsWidgetOpen, customer, currentMobile]);

  // Handle Dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const maxX = Math.max(0, window.innerWidth - 370);
    const maxY = Math.max(0, window.innerHeight - 300);
    const newX = Math.min(Math.max(10, e.clientX - dragOffsetRef.current.x), maxX);
    const newY = Math.min(Math.max(10, e.clientY - dragOffsetRef.current.y), maxY);
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Cleanup drag listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!isSmsWidgetOpen) return null;

  // Templates
  const templates = [
    {
      id: 'pickup',
      label: '🚗 Vehicle Ready',
      text: `Dear ${customerName}, your vehicle is ready for pickup at AGMC. Thank you.`
    },
    {
      id: 'booking',
      label: '📅 Booking Confirmed',
      text: `Dear ${customerName}, your service appointment with AGMC has been confirmed. Thank you.`
    },
    {
      id: 'progress',
      label: '⏳ In Progress',
      text: `Dear ${customerName}, your vehicle service is currently in progress at AGMC workshop.`
    },
    {
      id: 'case',
      label: '📋 Case Received',
      text: `Dear ${customerName}, your request (${reference}) has been received and is being processed by AGMC.`
    }
  ];

  const handleApplyTemplate = (tplText) => {
    setMessage(tplText);
    setErrorMsg(null);
  };

  const handleCopy = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!recipient.trim()) {
      setErrorMsg('Recipient phone number is required.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Message body cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await sendSms({
        senderId,
        recipient,
        message,
        reference
      });

      if (res && res.ok) {
        setLastReceipt(res.data);
        if (showToast) {
          showToast({
            type: 'success',
            title: 'SMS Sent Successfully!',
            message: `SMS delivered to ${res.recipient || recipient}. Request ID: ${res.data?.requestId || 'N/A'}`,
            duration: 6
          });
        }
      } else {
        setErrorMsg(res?.error || 'Failed to dispatch SMS through gateway.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred while sending SMS.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Minimized View (Floating Beside Sidebar Pill)
  if (isSmsWidgetMinimized) {
    return (
      <div 
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        className="fixed z-40 animate-fadeIn"
      >
        <div className="flex items-center gap-1.5 p-1 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-slate-200/90 text-slate-800">
          <button
            type="button"
            onClick={toggleMinimizeSmsWidget}
            className="flex items-center gap-2 pl-3 pr-2 py-1.5 hover:text-blue-600 transition-colors cursor-pointer text-xs font-bold"
            title="Expand SMS Dispatcher"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <FaCommentAlt className="text-blue-600 text-xs" />
            <span className="truncate max-w-[170px] text-slate-800">SMS: {customerName}</span>
            <FaExpandAlt className="text-[10px] text-slate-400 ml-1" />
          </button>
          <button
            type="button"
            onClick={closeSmsWidget}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Close"
          >
            <FaTimes className="text-[10px]" />
          </button>
        </div>
      </div>
    );
  }

  // Expanded View (Light & Modern Window beside Sidebar)
  const charCount = message.length;
  const segments = charCount === 0 ? 1 : Math.ceil(charCount / 160);
  const hasSmsConsent = customer?.consents?.sms === true;

  return (
    <div 
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-40 w-[365px] max-w-[calc(100vw-2rem)] bg-white/98 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/90 overflow-hidden flex flex-col animate-fadeIn text-xs font-sans transition-shadow hover:shadow-2xl"
    >
      {/* Light & Modern Header (Draggable) */}
      <div 
        onMouseDown={handleMouseDown}
        className="bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-4 py-3 flex items-center justify-between select-none border-b border-slate-100 cursor-move"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
            <FaCommentAlt className="text-xs" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-slate-800 truncate">SMS Dispatcher</span>
              <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.2 rounded-full">
                AGMC
              </span>
            </div>
            <span className="text-[10px] text-slate-400 truncate block">
              To: {customerName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="text-slate-300 mr-1" title="Drag to reposition">
            <FaGripLines className="text-[10px]" />
          </div>
          <button
            type="button"
            onClick={toggleMinimizeSmsWidget}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Minimize Window"
          >
            <FaMinus className="text-[10px]" />
          </button>
          <button
            type="button"
            onClick={closeSmsWidget}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close Window"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
      </div>

      {/* Light Consent Status Bar */}
      <div className="px-4 py-1.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 text-[11px]">
        <div>
          {hasSmsConsent ? (
            <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70 text-[10px]">
              <FaCheckCircle className="text-[9px]" /> SMS Consent: Opted In
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/70 text-[10px]">
              <FaExclamationTriangle className="text-[9px]" /> Transactional / Essential Only
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          agmcutil gateway
        </span>
      </div>

      {/* Main Form Body */}
      <div className="p-3.5 space-y-3 max-h-[440px] overflow-y-auto">
        {/* Recipient & Reference Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Recipient Input */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-2 hover:border-slate-300 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
              <FaPhoneAlt className="text-slate-400 text-[8px]" /> Recipient
            </label>
            <input
              type="tel"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. 0501234567"
              className="w-full bg-transparent font-mono font-bold text-slate-800 text-xs focus:outline-none"
            />
          </div>

          {/* Reference Input */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-2 hover:border-slate-300 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <FaTag className="text-slate-400 text-[8px]" /> Reference
              </label>
              <button
                type="button"
                onClick={() => setReference(generateUniqueRef())}
                className="text-[9px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 cursor-pointer"
                title="Generate fresh unique reference"
              >
                <FaSyncAlt className="text-[7px]" />
                <span>New</span>
              </button>
            </div>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="GEN-xxxxxx"
              className="w-full bg-transparent font-mono font-semibold text-slate-700 text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Message Templates */}
        <div>
          <span className="text-[9px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
            Quick Templates
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tpl.text)}
                className="text-[10px] px-2 py-1.5 bg-slate-50/80 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200/80 rounded-lg font-medium text-slate-700 text-left transition-all cursor-pointer shadow-2xs truncate active:scale-[0.98]"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Box */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-600">Message Text</span>
            <span className={`text-[10px] font-mono ${charCount > 160 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
              {charCount}/160 • {segments} SMS
            </span>
          </div>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your SMS message to customer..."
            className="w-full p-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all shadow-2xs resize-none"
          />
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-center gap-1.5">
            <FaExclamationTriangle className="text-rose-500 shrink-0" />
            <span className="truncate">{errorMsg}</span>
          </div>
        )}

        {/* Success Receipt Card */}
        {lastReceipt && (
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 shadow-2xs animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 flex items-center gap-1 text-[11px]">
                <FaCheckCircle className="text-emerald-600" /> Submitted Successfully
              </span>
              <span className="font-mono text-[9px] font-bold uppercase bg-emerald-600 text-white px-2 py-0.2 rounded-full">
                {lastReceipt.status || 'SUBMITTED'}
              </span>
            </div>

            <div className="text-[10px] text-emerald-950 font-mono space-y-0.5">
              <div className="flex justify-between items-center">
                <span className="text-emerald-700">Request ID:</span>
                <span className="flex items-center gap-1 font-bold">
                  <span className="truncate max-w-[130px]">{lastReceipt.requestId}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(lastReceipt.requestId)}
                    className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
                    title="Copy Request ID"
                  >
                    {copiedId ? <FaCheck className="text-[8px]" /> : <FaCopy className="text-[8px]" />}
                  </button>
                </span>
              </div>
              {lastReceipt.shootId && (
                <div className="flex justify-between">
                  <span className="text-emerald-700">Shoot ID:</span>
                  <span>{lastReceipt.shootId}</span>
                </div>
              )}
              {lastReceipt.reference && (
                <div className="flex justify-between">
                  <span className="text-emerald-700">Reference:</span>
                  <span>{lastReceipt.reference}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setLastReceipt(null);
                setMessage('');
                setReference(generateUniqueRef());
              }}
              className="w-full mt-1 py-1 text-center text-[10px] text-emerald-800 font-bold hover:underline cursor-pointer"
            >
              + Send Another SMS
            </button>
          </div>
        )}
      </div>

      {/* Light & Modern Footer */}
      <div className="px-4 py-2.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => {
            setMessage('');
            setErrorMsg(null);
          }}
          disabled={!message || isSubmitting}
          className="text-[11px] text-slate-400 hover:text-slate-700 font-medium disabled:opacity-30 cursor-pointer"
        >
          Clear
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={closeSmsWidget}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isSubmitting || !recipient.trim() || !message.trim()}
            className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin text-xs" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <FaPaperPlane className="text-[10px]" />
                <span>Send SMS</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
