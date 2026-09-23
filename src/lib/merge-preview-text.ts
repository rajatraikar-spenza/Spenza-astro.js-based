import { parseFragment, type DefaultTreeAdapterMap } from 'parse5';
import type { AcfBlocks } from './acf-blocks';

type Node = DefaultTreeAdapterMap['node'];

/** Reading text only: review notes and source indexes are not article prose. */
export function mergeReadingText(html: string): string {
  function text(node: Node): string {
    if (node.nodeName === '#text' && 'value' in node) return node.value;
    if ('tagName' in node) {
      if (['style', 'script'].includes(node.tagName)) return '';
      if (node.attrs.some(a => a.name === 'data-editorial-only' || a.name === 'data-source-index')) return '';
    }
    return 'childNodes' in node ? node.childNodes.map(text).join(' ') : '';
  }
  return text(parseFragment(html)).replace(/\s+/g, ' ').trim();
}

export function mergeReadingWords(html: string, blocks?: AcfBlocks): number {
  const tldr = blocks ? [blocks.tldrHeading, blocks.tldrDescription,
    ...[...(blocks.twoCol ?? []), ...(blocks.oneCol ?? [])].flatMap(c => [c.title, c.text])]
    .filter(Boolean).join(' ') : '';
  return [mergeReadingText(html), tldr].join(' ').trim().split(/\s+/).filter(Boolean).length;
}
