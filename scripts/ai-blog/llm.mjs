// Thin wrapper over the Anthropic SDK for the blog pipeline.
//
// One function, `ask`, covers every call the pipeline makes: free text, JSON
// that must match a schema, with or without web tools, with or without images.
// Everything above this file (research, drafting, the council, image QA) talks
// to an `llm` object with this one method, so tests inject a fake without
// touching the network.
import Anthropic from '@anthropic-ai/sdk';

/** The pipeline's default model. Override per run with AI_BLOG_MODEL. */
export const MODEL = process.env.AI_BLOG_MODEL || 'claude-opus-5-5';

/** Server-side tools. Web fetch is limited to Spenza's own sites: it is for checking product claims. */
export const WEB_SEARCH = { type: 'web_search_20260209', name: 'web_search', max_uses: 10 };
export const WEB_FETCH_SPENZA = {
  type: 'web_fetch_20260209',
  name: 'web_fetch',
  max_uses: 8,
  allowed_domains: ['spenza.com', 'www.spenza.com', 'docs.spenza.com'],
};

export class RefusalError extends Error {}
export class TruncatedError extends Error {}

export function createLlm({ apiKey = process.env.ANTHROPIC_API_KEY, client } = {}) {
  const sdk = client ?? new Anthropic({ apiKey });
  const usage = { input: 0, output: 0, calls: 0 };

  /**
   * @param {object} o
   * @param {string} o.system
   * @param {string} o.user
   * @param {object} [o.schema]    JSON Schema: the reply is parsed and returned as an object
   * @param {object[]} [o.tools]   server tools (web search / fetch)
   * @param {{mediaType:string, base64:string}[]} [o.images]
   * @param {'low'|'medium'|'high'|'xhigh'|'max'} [o.effort]
   */
  async function ask({ system, user, schema, tools, images = [], effort = 'high', maxTokens = 16000, model = MODEL, label = 'ask' }) {
    const messages = [{
      role: 'user',
      content: [
        ...images.map(i => ({ type: 'image', source: { type: 'base64', media_type: i.mediaType, data: i.base64 } })),
        { type: 'text', text: user },
      ],
    }];
    let text = '';
    // Server tools can pause a long turn; resume by echoing the assistant turn back.
    for (let turn = 0; turn < 8; turn++) {
      const res = await sdk.beta.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        messages,
        // A policy decline is re-run by the API on a fallback model inside the same call.
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort, ...(schema ? { format: { type: 'json_schema', schema } } : {}) },
        ...(tools?.length ? { tools } : {}),
      });
      usage.calls += 1;
      usage.input += res.usage?.input_tokens ?? 0;
      usage.output += res.usage?.output_tokens ?? 0;

      if (res.stop_reason === 'refusal') {
        throw new RefusalError(`${label}: the model declined (${res.stop_details?.category ?? 'no category'}). Rephrase the brief and try again.`);
      }
      if (res.stop_reason === 'max_tokens') throw new TruncatedError(`${label}: the reply hit the ${maxTokens}-token limit.`);

      text = res.content.filter(b => b.type === 'text').map(b => b.text).join('');
      if (res.stop_reason === 'pause_turn') {
        messages.push({ role: 'assistant', content: res.content });
        continue;
      }
      break;
    }
    if (!schema) return text;
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`${label}: the reply was not valid JSON (${text.slice(0, 120)}…)`);
    }
  }

  return { ask, usage };
}
