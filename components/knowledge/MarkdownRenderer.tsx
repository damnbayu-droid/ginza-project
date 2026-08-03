'use client';

import ReactMarkdown from "react-markdown";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-a:text-blue-400">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
