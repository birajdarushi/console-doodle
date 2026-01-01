import React, { useState, useEffect, useLayoutEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Terminal, Activity, AlertTriangle, FileText, User, Sun, Moon, Github, Linkedin, Mail, Copy, Check } from 'lucide-react';
import { LogStreamSidebar } from './LogStreamSidebar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { api } from '@/services/api';

interface TerminalShellProps {
    children: React.ReactNode;
}

const TerminalShell = ({ children }: TerminalShellProps) => {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [copied, setCopied] = useState(false);

    const email = "rushirajbirajdar@gmail.com";
    const handleCopy = async (e: React.MouseEvent) => {
        // Prevent clicking the button from triggering the mailto link if nested (it won't be if structured right)
        e.preventDefault();
        await navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useLayoutEffect(() => {
        // Logic: 
        // 1. LocalStorage
        // 2. Time (6am - 6pm = light, else dark)
        const stored = localStorage.getItem('theme');
        if (stored === 'light' || stored === 'dark') {
            setTheme(stored);
            document.documentElement.classList.toggle('dark', stored === 'dark');
            document.documentElement.classList.toggle('light', stored === 'light');
        } else {
            const hour = new Date().getHours();
            const isDay = hour >= 6 && hour < 18;
            const defaultTheme = isDay ? 'light' : 'dark';
            setTheme(defaultTheme);
            document.documentElement.classList.toggle('dark', defaultTheme === 'dark');
            document.documentElement.classList.toggle('light', defaultTheme === 'light');
        }
    }, []);

    const toggleTheme = () => {
        setIsTransitioning(true);
        document.body.classList.add('transitioning-theme');

        // 1. Color Change Leads (Immediate)
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        document.documentElement.classList.toggle('light', newTheme === 'light');

        // 2. Bubbles & Haze follow (Rendered by isTransitioning=true)

        // 3. Cleanup after animation completes
        setTimeout(() => {
            setIsTransitioning(false);
            document.body.classList.remove('transitioning-theme');
        }, 600);
    };

    return (
        <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
            {/* Chromatic Center Diffusion Overlay */}
            {/* Dust Swarm Transition Overlay */}
            {isTransitioning && (
                <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden bg-background/5 animate-in fade-in duration-300 backdrop-blur-[8px]">
                    {/* Generate ~120 Dust Particles */}
                    {Array.from({ length: 120 }).map((_, i) => {
                        const size = Math.random() * 6 + 2; // 2px - 8px
                        const left = Math.random() * 100;
                        const top = Math.random() * 100;
                        const delay = Math.random() * 400; // Staggered start

                        return (
                            <div
                                key={i}
                                className="absolute rounded-full bg-foreground/15 animate-dust-float blur-[1px]"
                                style={{
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    left: `${left}%`,
                                    top: `${top}%`,
                                    animationDelay: `${delay}ms`
                                }}
                            />
                        );
                    })}
                </div>
            )}

            <div className="w-full max-w-[95rem] h-[85vh] terminal-window flex flex-col relative z-10">

                {/* Terminal Header (macOS style) */}
                <div className="terminal-header shrink-0 flex justify-between items-center pr-4">
                    <div className="flex gap-2">
                        <div className="traffic-light traffic-light-red" />
                        <div className="traffic-light traffic-light-yellow" />
                        <div className="traffic-light traffic-light-green" />
                    </div>

                    <div className="flex items-center gap-2 opacity-80 terminal-title text-sm absolute left-1/2 -translate-x-1/2">
                        <Terminal size={14} />
                        <span>rushiraj@devops-console:~</span>
                    </div>

                    <div className="flex items-center gap-3 mr-2">
                        {/* Socials */}
                        <a href="https://github.com/birajdarushi" target="_blank" rel="noopener noreferrer" className="text-foreground/80 hover:text-foreground transition-colors" title="GitHub">
                            <Github size={15} />
                        </a>
                        <a href="https://www.linkedin.com/in/rushirajbirajdar/" target="_blank" rel="noopener noreferrer" className="text-[#0077b5] hover:text-[#0077b5]/80 transition-colors" title="LinkedIn">
                            <Linkedin size={15} />
                        </a>
                        <HoverCard openDelay={200}>
                            <HoverCardTrigger asChild>
                                <a href={`mailto:${email}`} className="text-[#EA4335] hover:text-[#EA4335]/80 transition-colors" title="Email">
                                    <Mail size={15} />
                                </a>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-auto p-3 bg-card border-border">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-mono text-foreground">{email}</span>
                                    <button
                                        onClick={handleCopy}
                                        className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                                        title="Copy to clipboard"
                                    >
                                        {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                        <a href="https://x.com/RushirajBrajdar" target="_blank" rel="noopener noreferrer" className="text-foreground/80 hover:text-foreground transition-colors" title="X (Twitter)">
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[14px] w-[14px] fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                        </a>
                        <a href="https://discord.com/users/.rushiraj" target="_blank" className="text-[#5865F2] hover:text-[#5865F2]/80 transition-colors" title="Discord">
                            <svg viewBox="0 0 24 24" className="h-[15px] w-[15px] fill-current" aria-hidden="true"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z"></path></svg>
                        </a>
                        <div className="h-4 w-[1px] bg-border mx-1" /> {/* Divider */}
                        <button
                            onClick={toggleTheme}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-white/10"
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Sidebar */}
                    <aside className="w-64 bg-sidebar-background border-r border-sidebar-border hidden md:flex flex-col">
                        <div className="p-4 space-y-1">
                            <div className="section-title px-3">System</div>

                            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}>
                                <Activity size={16} />
                                <span>Status</span>
                            </NavLink>

                            <NavLink to="/deployments" className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}>
                                <Terminal size={16} />
                                <span>Deployments</span>
                            </NavLink>

                            <NavLink to="/incidents" className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}>
                                <AlertTriangle size={16} />
                                <span>Incidents</span>
                            </NavLink>

                            <NavLink to="/logs" className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}>
                                <FileText size={16} />
                                <span>Logs</span>
                            </NavLink>

                            <NavLink to="/about" className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}>
                                <User size={16} />
                                <span>About</span>
                            </NavLink>
                        </div>

                        <div className="mt-auto p-4 border-t border-sidebar-border">
                            <div className="mt-auto p-4 border-t border-sidebar-border">
                                <button
                                    onClick={async () => {
                                        try {
                                            const status = await api.getStatus();
                                            const url = status.resumeUrl;

                                            if (url) {
                                                await api.logAction('Resume Download', { source: 'Sidebar', url });
                                                window.open(url, '_blank');
                                            } else {
                                                alert('Resume URL not configured yet.');
                                            }
                                        } catch (error) {
                                            console.error('Failed to download resume:', error);
                                            alert('Failed to download resume. Please try again.');
                                        }
                                    }}
                                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors w-full px-3 py-2"
                                >
                                    <span className="border-b border-primary/50 pb-0.5">↓ Download Resume.pdf</span>
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Page Content */}
                    <main className="flex-1 overflow-auto bg-terminal-bg relative no-scrollbar p-6">
                        {children}
                    </main>

                    {/* Right Sidebar: Log Stream */}
                    <LogStreamSidebar />

                </div>
            </div>
        </div>
    );
};

export default TerminalShell;
