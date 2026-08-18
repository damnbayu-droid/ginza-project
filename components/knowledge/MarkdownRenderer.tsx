'use client';

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <article className="prose-container w-full max-w-full overflow-x-hidden break-words text-gray-200 font-sans leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-10 mb-6 pb-3 border-b border-[#252838] tracking-tight leading-snug flex items-center gap-2 break-words max-w-full" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl md:text-2xl font-bold text-white mt-10 mb-4 pt-4 border-l-4 border-blue-500 pl-3.5 tracking-tight leading-snug break-words max-w-full" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg md:text-xl font-semibold text-blue-300 mt-8 mb-3 tracking-tight break-words max-w-full" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-base font-semibold text-gray-200 mt-6 mb-2 break-words max-w-full" {...props} />
          ),
          p: ({ node, children, ...props }) => {
            return (
              <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-6 space-y-2 whitespace-pre-line break-words max-w-full" {...props}>
                {children}
              </p>
            );
          },
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-outside ml-6 space-y-2.5 my-6 text-sm md:text-base text-gray-300 marker:text-blue-400 break-words max-w-full" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-outside ml-6 space-y-2.5 my-6 text-sm md:text-base text-gray-300 marker:text-blue-400 font-medium break-words max-w-full" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed pl-1 break-words max-w-full" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="my-8 p-4 md:p-5 rounded-2xl bg-blue-500/10 border-l-4 border-blue-500 text-sm md:text-base text-blue-100 italic shadow-sm break-words max-w-full overflow-hidden" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-10 border-0 h-[1px] bg-gradient-to-r from-transparent via-[#2d3146] to-transparent" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="my-8 w-full max-w-full overflow-x-auto rounded-2xl border border-[#272a3c] bg-[#12141f] shadow-xl">
              <table className="w-full text-left text-xs md:text-sm border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-[#191c2b] text-blue-400 font-bold uppercase tracking-wider border-b border-[#272a3c]" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-[#1e2130]" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-[#181b28] transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3.5 font-bold text-xs md:text-sm text-blue-300 break-words" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-3 text-xs md:text-sm text-gray-300 leading-relaxed font-normal break-words" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-blue-400 hover:text-blue-300 underline underline-offset-4 font-medium transition-colors break-all" {...props} />
          ),
          img: ({ src, alt, ...props }) => {
            const imgSrc = typeof src === "string" ? src : "";
            if (!imgSrc || !imgSrc.trim()) return null;
            return (
              <img
                src={imgSrc}
                alt={alt || ""}
                {...props}
                className="rounded-xl border border-[#262838] max-h-[500px] w-auto mx-auto my-4"
              />
            );
          },
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-white break-words" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-gray-200 break-words" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="my-6 p-4 rounded-2xl bg-[#0f111a] border border-[#25283b] max-w-full overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs text-emerald-300 leading-relaxed shadow-lg" {...props} />
          ),
          code: ({ node, className, children, ...props }: any) => {
            const isBlock = className && className.startsWith('language-');
            if (isBlock) {
              return (
                <code className={`${className} break-all max-w-full`} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="px-1.5 py-0.5 rounded-md bg-[#1a1d2c] border border-[#292c42] font-mono text-xs text-amber-300 break-all max-w-full inline-block align-middle" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
