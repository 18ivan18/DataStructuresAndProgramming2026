import { defineMdastPlugin } from 'satteri';
import katex from 'katex';

// Renders $…$ and $$…$$ at build time, so pages ship HTML and no maths JavaScript.
const render = (tex: string, displayMode: boolean) => ({
  raw: katex.renderToString(tex, { displayMode, throwOnError: false, output: 'html' }),
  mdxExpressions: false,
});

export const katexPlugin = defineMdastPlugin({
  name: 'katex',
  math(node, ctx) {
    ctx.replaceNode(node, render(node.value, true));
  },
  inlineMath(node, ctx) {
    ctx.replaceNode(node, render(node.value, false));
  },
});
