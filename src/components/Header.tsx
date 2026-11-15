import { eventName } from "@/lib/event";
import { m } from "@/lib/messages";

type Props = {
  collectedCount: number;
  totalCount: number;
  complete: boolean;
  className?: string;
};

export default function Header({ collectedCount, totalCount, complete, className = "" }: Props) {
  return (
    <header className={`pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center px-4 pt-[max(0.75rem,env(safe-area-inset-top))] md:pl-80 md:pr-4 ${className}`}>
      <div className="pointer-events-auto rounded-2xl bg-white/80 px-5 py-2 text-center shadow-sm backdrop-blur-sm">
        <div className="mb-0.5 flex items-center justify-center gap-2">
          <img src="/site-logo.png" alt="Site Logo" className="h-8 w-8 md:h-11 md:w-11 drop-shadow-sm" />
          <h1 className="whitespace-nowrap text-lg font-extrabold leading-tight tracking-wide text-ink drop-shadow md:text-xl">
            {eventName}
          </h1>
        </div>
        <p className="mt-0.5 text-sm font-semibold leading-tight text-ink drop-shadow">{m.header.subtitle}</p>
      </div>
      <p className="pointer-events-auto mt-1.5 text-sm leading-tight text-ink drop-shadow md:hidden">
        <span className="font-bold">{collectedCount}/{totalCount}{m.header.countUnit}</span>
        {complete && <span className="ml-2 font-bold text-stamp">{m.header.complete}</span>}
      </p>
    </header>
  );
}
