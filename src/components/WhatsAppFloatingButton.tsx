import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { MessageCircle, Phone, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WhatsAppFloatingButtonProps {
  currentView: string;
}

export default function WhatsAppFloatingButton({ currentView }: WhatsAppFloatingButtonProps) {
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [whatsappMessage, setWhatsappMessage] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const fetchConfig = async () => {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('app_config')
          .select('whatsapp_support_number, whatsapp_support_message')
          .eq('id', 1)
          .maybeSingle();
        
        if (data) {
          setWhatsappNumber(data.whatsapp_support_number || '');
          setWhatsappMessage(data.whatsapp_support_message || '');
          return;
        }
      }
    } catch (err) {
      console.warn('Error fetching support config from Supabase:', err);
    }

    // Fallback to local storage
    try {
      const localConfigStr = localStorage.getItem('healnex_app_config');
      if (localConfigStr) {
        const localConfig = JSON.parse(localConfigStr);
        setWhatsappNumber(localConfig.whatsapp_support_number || '');
        setWhatsappMessage(localConfig.whatsapp_support_message || '');
      }
    } catch (err) {
      console.error('Error parsing local config:', err);
    }
  };

  useEffect(() => {
    fetchConfig();

    // Listen to real-time updates when config is changed in the admin panel
    const handleConfigUpdate = () => {
      fetchConfig();
    };

    window.addEventListener('healnex_config_updated', handleConfigUpdate);
    return () => {
      window.removeEventListener('healnex_config_updated', handleConfigUpdate);
    };
  }, []);

  // Do not render anything if the current view is 'admin' (Admin Panel pages only) or if there is no WhatsApp number configured
  if (currentView === 'admin' || !whatsappNumber) {
    return null;
  }

  // Format link
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const encodedText = encodeURIComponent(whatsappMessage);
  const waLink = `https://wa.me/${cleanNumber}?text=${encodedText}`;

  return (
    <div 
      className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-2"
      id="whatsapp-floating-support-container"
    >
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="bg-slate-900 text-white text-[11px] font-bold py-2 px-3.5 rounded-xl shadow-xl flex items-center gap-2 max-w-xs border border-slate-800 pointer-events-none select-none font-sans"
            id="whatsapp-tooltip"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
            <span>Chat Live with HealNex Support</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer border border-emerald-400/20 relative"
        id="whatsapp-floating-button-link"
        title="Chat on WhatsApp"
      >
        {/* Pulsing glow ring */}
        <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-25"></div>

        <div className="relative flex items-center justify-center">
          {/* Compliant Lucide Icons instead of custom SVG */}
          <MessageCircle className="w-7 h-7 text-white animate-pulse" />
        </div>
      </motion.a>
    </div>
  );
}
