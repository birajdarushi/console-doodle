import { useState, useEffect, useRef } from 'react';
import { TerminalWindow } from './layout/TerminalWindow';
import { Send } from 'lucide-react';

export const ContactTerminal = () => {
    const [history, setHistory] = useState<string[]>([
        "visitor@devops-console:~$ mail -s \"Project Inquiry\" rushiraj@devops-console"
    ]);
    const [input, setInput] = useState('');
    const [step, setStep] = useState<'subject' | 'body' | 'sending' | 'sent'>('body');
    const [subject, setSubject] = useState('Project Inquiry'); // Default for the visual, or we can make it fully interactive later
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    // Focus keeper
    useEffect(() => {
        inputRef.current?.focus();
    }, [step, history]);

    const handleCommand = (cmd: string) => {
        // For now, we assume the user starts in the 'body' state based on the initial history
        // But if we wanted full shell, we'd parse 'mail -s ...'
    };

    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const val = input;
            setInput('');
            setHistory(prev => [...prev, `> ${val}`]);

            if (step === 'body') {
                if (val.trim() === '.') {
                    setStep('sending');
                    setHistory(prev => [...prev, "Sending..."]);

                    // Simulate Network Delay
                    setTimeout(() => {
                        setHistory(prev => [
                            ...prev,
                            "[OK] 250 Message accepted for delivery",
                            "visitor@devops-console:~$"
                        ]);
                        setStep('sent');
                    }, 1500);
                }
            }
        }
    };

    // Restart interaction
    const reset = () => {
        setHistory(["visitor@devops-console:~$ mail -s \"Project Inquiry\" rushiraj@devops-console"]);
        setStep('body');
        setInput('');
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    return (
        <TerminalWindow title="bash">
            <div
                className="font-mono text-sm space-y-1 min-h-[200px] cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                {history.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap break-all text-foreground/90">
                        {line}
                    </div>
                ))}

                {step === 'body' && (
                    <div className="flex items-center text-foreground/90">
                        <span className="mr-2">&gt;</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="bg-transparent border-none outline-none flex-1 text-foreground placeholder-muted-foreground/50"
                            placeholder="Type message... (enter '.' on new line to send)"
                            autoComplete="off"
                        />
                    </div>
                )}

                {step === 'sent' && (
                    <div className="mt-4">
                        <button
                            onClick={reset}
                            className="text-primary hover:underline text-xs"
                        >
                            [ Start New Message ]
                        </button>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </TerminalWindow>
    );
};
