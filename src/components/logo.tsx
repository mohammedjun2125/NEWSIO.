import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="p-2 bg-primary rounded-lg group-hover:bg-accent transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 text-primary-foreground"
        >
          <path d="M4 4l4-4 4 4" transform="translate(6 5)"/>
          <path d="M4 4h8" transform="translate(6 5)"/>
          <path d="M12 14l-4 4-4-4" transform="translate(6 5)"/>
          <path d="M4 18h8" transform="translate(6 5)"/>
          <path d="M4 4v14" transform="translate(6 5)"/>
        </svg>
      </div>
      <h1 className="text-2xl font-bold tracking-tighter text-foreground group-hover:text-primary transition-colors font-headline">
        NEWSIO
      </h1>
    </Link>
  );
}
