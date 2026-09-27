"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={cn("prose prose-sm max-w-none", className)}
      components={{
        // Headings
        h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2 text-gray-900" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-base font-semibold mt-2 mb-1 text-gray-900" {...props} />,
        // Paragraphs
        p: ({ node, ...props }) => <p className="text-sm leading-relaxed mb-2 text-gray-800" {...props} />,
        // Bold text
        strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
        // Italic text
        em: ({ node, ...props }) => <em className="italic text-gray-700" {...props} />,
        // Links
        a: ({ node, ...props }) => (
          <a
            className="text-blue-600 underline hover:text-blue-800 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        // Unordered lists
        ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mb-2 mr-4" {...props} />,
        // Ordered lists
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 mb-2 mr-4" {...props} />,
        // List items
        li: ({ node, ...props }) => <li className="text-sm text-gray-800 leading-relaxed" {...props} />,
        // Code blocks
        code: ({ node, inline, ...props }: any) =>
          inline ? (
            <code className="bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
          ) : (
            <code
              className="block bg-gray-100 text-gray-900 p-3 rounded-lg text-xs font-mono overflow-x-auto mb-2"
              {...props}
            />
          ),
        // Blockquotes
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-r-4 border-gray-300 pr-4 mr-4 italic text-gray-700 mb-2" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
