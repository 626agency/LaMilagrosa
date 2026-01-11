'use client';

import { useState } from 'react';
import { MessageSquare, Send, X, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChat({ data }: { data: { inventario: any[], gastos: any[] } }) {
    const [isOpen, setIsOpen] = useState(false);
    const [lastTopic, setLastTopic] = useState<string | null>(null);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '¡Hola! Soy el asistente de La Milagrosa. ¿En qué puedo ayudarte hoy con el inventario o los gastos?' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');

        // Advanced AI Logic with Context
        setTimeout(() => {
            let response = "";
            const lowerInput = input.toLowerCase();
            let currentTopic = lastTopic;

            // Helper to clean total strings (handles $1.000.000,00 and $1,000,000.00)
            const cleanNumber = (val: string | undefined) => {
                if (!val) return 0;
                // Remove currency symbols and spaces
                let clean = val.replace(/[^0-9,.]/g, '');

                const partsComma = clean.split(',');
                const partsDot = clean.split('.');

                // Logic: In Spanish 1.250,50 / In English 1,250.50
                // If there's both , and . - identified by order
                if (clean.includes(',') && clean.includes('.')) {
                    if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
                        // Spanish: 1.250,50 -> replace . with nothing, then , with .
                        return parseFloat(clean.replace(/\./g, '').replace(',', '.')) || 0;
                    } else {
                        // English: 1,250.50 -> replace , with nothing
                        return parseFloat(clean.replace(/,/g, '')) || 0;
                    }
                }

                // If only one separator exists
                if (clean.includes(',')) {
                    // If more than 2 digits after comma, it's likely a thousands separator: 1,250
                    // If exactly 2 digits, could be decimal or thousands. We'll check if it's the ONLY comma.
                    const afterSeparator = clean.split(',').pop() || '';
                    if (afterSeparator.length === 3) return parseFloat(clean.replace(/,/g, '')) || 0;
                    return parseFloat(clean.replace(',', '.')) || 0;
                }

                if (clean.includes('.')) {
                    const afterSeparator = clean.split('.').pop() || '';
                    if (afterSeparator.length === 3) return parseFloat(clean.replace(/\./g, '')) || 0;
                    return parseFloat(clean) || 0;
                }

                return parseFloat(clean) || 0;
            };

            // Enhanced keyword detection
            const hasGasto = lowerInput.includes('gasto') || lowerInput.includes('costo') || lowerInput.includes('invertido') || lowerInput.includes('compr') || lowerInput.includes('pag') || lowerInput.includes('dinero') || lowerInput.includes('plata') || lowerInput.includes('gastado') || lowerInput.includes('costó') || lowerInput.includes('pago');
            const hasGestation = lowerInput.includes('embarazada') || lowerInput.includes('gestación') || lowerInput.includes('preñada');
            const isVagueFollowUp = (lowerInput.startsWith('y ') || lowerInput.includes('cuanto') || lowerInput.includes('que mas') || lowerInput.includes('que más') || lowerInput.length < 20) && !hasGasto && !lowerInput.includes('vaca') && !lowerInput.includes('toro') && !lowerInput.includes('caballo') && !lowerInput.includes('mula') && !hasGestation;

            // Date context
            const now = new Date();
            const currentMonth = now.getMonth() + 1; // 1-12
            const currentYear = now.getFullYear();

            // Function to parse spreadsheet dates "D/M/YYYY"
            const parseSheetDate = (dateStr: string) => {
                const [d, m, y] = dateStr.split('/').map(n => parseInt(n));
                return { d, m, y };
            };

            // NEW: Check for species in Inventario dynamically
            const matchingSpecies = data.inventario.find(i =>
                lowerInput.includes(i.Especie.toLowerCase().slice(0, -1)) || // match singular
                lowerInput.includes(i.Especie.toLowerCase()) // match plural/exact
            );

            // NEW: Check for specific products in Gastos (e.g., "cantinas", "heno")
            const mentionedProduct = data.gastos.find(g => lowerInput.includes(g.Producto.toLowerCase()));

            if (mentionedProduct && (lowerInput.includes('cuant') || lowerInput.includes('mucho'))) {
                const productGastos = data.gastos.filter(g => lowerInput.includes(g.Producto.toLowerCase()));
                const totalQty = productGastos.reduce((acc, curr) => {
                    const qty = parseInt(curr.Cantidad.replace(/[^0-9]/g, "")) || 0;
                    return acc + qty;
                }, 0);
                const totalCost = productGastos.reduce((acc, curr) => acc + cleanNumber(curr.Total), 0);

                response = `Se han comprado un total de ${totalQty} unidades de ${mentionedProduct.Producto}, con una inversión total de $${totalCost.toLocaleString()}.`;
                currentTopic = 'gastos';
            } else if (matchingSpecies) {
                currentTopic = 'inventario';
                const total = matchingSpecies['Cantidad total'];
                const preg = matchingSpecies['Cantidad embarazadas'];
                response = `En el inventario de ${matchingSpecies.Especie.toLowerCase()} tenemos ${total} en total. `;
                if (preg !== '0') {
                    response += `Hay ${preg} registradas como embarazadas.`;
                }
            } else if (hasGestation) {
                const total = data.inventario.reduce((acc, curr) => acc + cleanNumber(curr['Cantidad embarazadas']), 0);
                response = `En total hay ${total} animales en gestación en toda la finca.`;
            } else if (hasGasto || (isVagueFollowUp && currentTopic === 'gastos')) {
                currentTopic = 'gastos';

                let filteredGastos = data.gastos;
                let messagePrefix = "El total de gastos registrados es";

                // Extract years from input (e.g. "2025", "2026")
                const yearMatches = lowerInput.match(/20\d{2}/g);

                const months = {
                    enero: 1, febrer: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
                    julio: 7, agosto: 8, septiemb: 9, octubr: 10, noviemb: 11, diciemb: 12
                };

                let targetMonth = currentMonth;
                let targetYear = currentYear;
                let isFiltered = false;

                // Detect exact month name
                Object.entries(months).forEach(([name, num]) => {
                    if (lowerInput.includes(name)) {
                        targetMonth = num;
                        isFiltered = true;
                    }
                });

                if (lowerInput.includes('mes') && !isFiltered) {
                    isFiltered = true;
                } else if (yearMatches && yearMatches.length > 0) {
                    targetYear = parseInt(yearMatches[0]);
                    isFiltered = true;
                } else if (lowerInput.includes('año')) {
                    isFiltered = true;
                    targetMonth = -1; // Flag for full year
                }

                if (isFiltered) {
                    filteredGastos = data.gastos.filter(g => {
                        const d = parseSheetDate(g['Fecha compra']);
                        if (targetMonth === -1) return d.y === targetYear;
                        return d.m === targetMonth && d.y === targetYear;
                    });

                    const monthText = targetMonth === -1 ? `todo el ${targetYear}` :
                        Object.keys(months).find(name => months[name as keyof typeof months] === targetMonth) || "este mes";
                    messagePrefix = `Para ${monthText}, los gastos suman`;
                }

                const total = filteredGastos.reduce((acc, curr) => acc + cleanNumber(curr.Total), 0);

                if (total === 0 && filteredGastos.length === 0) {
                    response = "No encontré gastos registrados para los criterios solicitados.";
                } else {
                    response = `${messagePrefix} $${total.toLocaleString()}.`;
                }
            } else if (isVagueFollowUp && currentTopic) {
                if (currentTopic === 'vacas') response = "Además de las vacas, ¿te gustaría saber sobre los toros o los gastos?";
                else if (currentTopic === 'gastos') response = "¿Quieres saber el gasto anual o el de algún producto específico?";
                else response = `Sobre ese tema (${currentTopic}), ¿qué detalle específico necesitas?`;
            } else {
                response = "Entiendo. Puedo darte detalles de productos específicos comprados, gastos totales o inventario de animales. ¿Qué prefieres?";
            }

            setLastTopic(currentTopic);
            setMessages([...newMessages, { role: 'assistant', content: response }]);
        }, 800);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="chat-toggle-btn"
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}
            >
                <MessageSquare size={30} />
            </button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="chat-window"
                        style={{
                            position: 'fixed',
                            bottom: '5.5rem',
                            right: '2rem',
                            width: '380px',
                            height: '500px',
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 1000,
                            overflow: 'hidden',
                            border: '1px solid var(--color-border)'
                        }}
                    >
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            @media (max-width: 768px) {
                                .chat-window {
                                    bottom: 0 !important;
                                    right: 0 !important;
                                    width: 100% !important;
                                    height: 100% !important;
                                    border-radius: 0 !important;
                                }
                                .chat-toggle-btn {
                                    bottom: 1rem !important;
                                    right: 1rem !important;
                                }
                            }
                        `}} />
                        {/* Header */}
                        <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <Bot size={24} />
                                <span style={{ fontWeight: 'bold' }}>Agente La Milagrosa</span>
                            </div>
                            <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.map((m, idx) => (
                                <div key={idx} style={{
                                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                    backgroundColor: m.role === 'user' ? 'var(--color-secondary)' : '#F3F4F6',
                                    color: m.role === 'user' ? 'white' : 'var(--color-text-main)',
                                    padding: '0.8rem 1rem',
                                    borderRadius: '12px',
                                    maxWidth: '80%',
                                    fontSize: '0.9rem'
                                }}>
                                    {m.content}
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Pregunta algo..."
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '30px',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button
                                onClick={handleSend}
                                style={{
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
