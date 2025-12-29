import { ReactNode } from "react";

interface TerminalWindowProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export const TerminalWindow = ({ title, children, className = "" }: TerminalWindowProps) => {
  return (
    <div className={`terminal-window ${className}`}>
      <div className="terminal-header">
        <div className="flex items-center gap-2">
          <div className="traffic-light traffic-light-red" />
          <div className="traffic-light traffic-light-yellow" />
          <div className="traffic-light traffic-light-green" />
        </div>
        {title && (
          <span className="ml-4 text-xs text-terminal-text-dim">{title}</span>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};
