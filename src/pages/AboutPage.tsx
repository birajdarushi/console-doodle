import { TerminalWindow } from "@/components/layout/TerminalWindow";

export const AboutPage = () => {
  return (
    <div className="max-w-3xl space-y-6 mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-terminal-highlight">About</h1>
        <p className="helper-text mt-1">Operator mindset and approach</p>
      </div>

      <TerminalWindow title="README.md">
        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-terminal-highlight font-medium mb-3">Philosophy</h2>
            <p className="text-foreground">
              I believe in reliability over hype.
              The most impressive infrastructure is the kind you rarely have to think about — quiet, predictable, and resilient.
            </p>
            <p className="text-foreground mt-2">
              My goal is to build systems that are boring in production:
              clear failure modes, strong observability, and behavior you can trust under stress.
            </p>
          </section>

          <section>
            <h2 className="text-terminal-highlight font-medium mb-3">Approach</h2>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">→</span>
                <span><strong className="text-foreground">Automation over repetition.</strong> If I have to do something twice, it becomes automation. Manual fixes don’t scale; systems do.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">→</span>
                <span><strong className="text-foreground">Failure-aware design.</strong> Every system fails. The difference is whether it fails loudly, safely, and with enough context to recover quickly.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">→</span>
                <span><strong className="text-foreground">Observability first.</strong> Logs, metrics, and traces are not add-ons. If you can’t see the system, you don’t control it.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">→</span>
                <span><strong className="text-foreground">Incremental improvement.</strong> Small, safe changes compound. Reliability is built through consistency, not big rewrites.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-terminal-highlight font-medium mb-3">This Site</h2>
            <p className="text-muted-foreground">
              This portfolio runs on the same infrastructure principles I advocate for:
              immutable deployments, automated pipelines, and end-to-end monitoring.
            </p>
            <div className="text-foreground mt-2 font-mono">
              <p>The status you see is real.</p>
              <p>The logs are real.</p>
              <p>The incidents are real.</p>
            </div>
            <p className="text-muted-foreground mt-2">
              It’s built this way intentionally. If I’m going to talk about operational excellence, I should demonstrate it — not describe it.
            </p>
            <p className="text-foreground mt-2 font-medium">
              I believe in eating my own dog food.
            </p>
          </section>

          <section className="pt-4 border-t border-border">
            <p className="text-terminal-text-dim italic">
              “The best infrastructure is invisible infrastructure. It just works.”
            </p>
          </section>
        </div>
      </TerminalWindow>
    </div>
  );
};
