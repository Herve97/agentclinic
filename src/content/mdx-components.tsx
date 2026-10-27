import type { MDXComponents } from "mdx/types";

// Phase 6, decision D11. Compiled MDX inherits nothing, so without a map a
// chart's narrative renders as one undifferentiated wall of text — which fails
// the "a stranger reading one chart gets the premise" bar for reasons that have
// nothing to do with design.
//
// These are the same utilities the case note at /cases/[id] already uses. No
// new colour, no new font, no spacing scale, no component class. Phase 10 still
// owns the design system.
export const mdxComponents: MDXComponents = {
  h2: (props) => <h2 className="mt-8 text-xl font-semibold" {...props} />,
  h3: (props) => <h3 className="mt-6 text-base font-semibold" {...props} />,
  p: (props) => <p className="mt-2" {...props} />,
  ul: (props) => <ul className="mt-2 list-disc pl-6" {...props} />,
  ol: (props) => <ol className="mt-2 list-decimal pl-6" {...props} />,
  li: (props) => <li className="mt-1" {...props} />,
  blockquote: (props) => (
    <blockquote className="mt-2 border-l pl-4" {...props} />
  ),
  table: (props) => (
    <table className="mt-4 w-full text-left text-sm" {...props} />
  ),
  th: (props) => <th className="border-b py-1 pr-4 font-semibold" {...props} />,
  td: (props) => <td className="border-b py-1 pr-4 align-top" {...props} />,
};
