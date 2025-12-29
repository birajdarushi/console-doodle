import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
  showLogStream?: boolean;
}

export const MainLayout = ({ children, showLogStream = true }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background p-6 flex items-start justify-center">
      <div className="terminal-window w-full max-w-7xl">
        {/* Terminal Header */}
        <div className="terminal-header">
          <div className="flex items-center gap-2">
            <div className="traffic-light traffic-light-red" />
            <div className="traffic-light traffic-light-yellow" />
            <div className="traffic-light traffic-light-green" />
          </div>
          <span className="ml-4 terminal-title text-xs">rushiraj@devops:~ status</span>
        </div>

        {/* Main Content Area */}
        <div className="flex min-h-[calc(100vh-120px)]">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1 p-6 border-r border-terminal-border">
            {children}
          </main>

          {/* Log Stream Panel - REMOVED LEGACY STATIC STREAM */}
          {/* {showLogStream && <LogStream />} */}
        </div>
      </div>
    </div>
  );
};
