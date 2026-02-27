export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight ${className}`}>
      11-
      <span className="inline-block rotate-[18deg] origin-center transition-transform hover:rotate-[90deg] duration-500">
        8
      </span>
      <span className="text-primary ml-1">AI</span>
    </span>
  );
}
