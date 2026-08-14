import { defineCollection, z } from 'astro:content';
import { wpPosts } from './loaders/wp-posts.mjs';

/**
 * Blog posts and case studies, loaded from WordPress via WPGraphQL.
 *
 * This replaces a `glob()` collection over `src/content/blog/**.md`. That
 * markdown was an early import that nothing rendered — the site served the
 * mirrored Elementor partials instead — so nothing consumed the old collection.
 *
 * The schema is deliberately the same shape it would have if the posts were
 * local MDX. Swapping the loader is then the only change needed to move to a
 * git-based CMS later, which is the point of building on the Content Layer.
 */
const posts = defineCollection({
  loader: wpPosts(),
  schema: z.object({
    /** WordPress' post id, for the `post-<id>` classes Elementor's loop emits. */
    databaseId: z.number(),
    slug: z.string(),
    title: z.string(),

    /**
     * The single category WordPress uses in the permalink. Load-bearing: it
     * drives `/{category}/{slug}/`, so it is required rather than optional.
     */
    category: z.string(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),

    /** Set by the `case-study` tag; selects the layout, not the URL. */
    isCaseStudy: z.boolean().default(false),

    excerpt: z.string().default(''),
    publishedDate: z.coerce.date(),
    updatedDate: z.coerce.date(),

    author: z
      .object({
        name: z.string(),
        slug: z.string(),
        bio: z.string().optional(),
        avatar: z.string().optional(),
      })
      .optional(),

    featuredImage: z
      .object({
        url: z.string(),
        alt: z.string().default(''),
        width: z.number().optional(),
        height: z.number().optional(),
        /** Attachment id, for WordPress' `wp-image-<id>` class. */
        id: z.number().optional(),
        /** WordPress' `srcset` candidate list, already repointed at this site. */
        srcSet: z.string().optional(),
      })
      .optional(),

    seo: z.object({
      title: z.string(),
      description: z.string().default(''),
      ogImage: z.string().optional(),
      /**
       * Yoast's complete `<head>`, including the Article / BreadcrumbList /
       * Person / FAQPage schema graph. Injected verbatim rather than rebuilt —
       * reproducing that graph by hand is how migrations lose rich results.
       */
      fullHead: z.string().default(''),
    }),

    /** Gutenberg block HTML. Some posts embed their own <style>/<script>. */
    content: z.string().default(''),

    /**
     * Per-post content that lives in the Elementor single-post template rather
     * than the post body — a summary line, a "key points" card block, and a
     * "How Spenza helps" block, rendered there by a shortcode.
     *
     * Empty until the field that shortcode reads is registered with
     * `show_in_graphql`; see the loader. The layout already has slots for these,
     * so exposing the field is the only remaining step.
     */
    templateBlocks: z
      .object({
        tldrHeading: z.string().default(''),
        tldrDescription: z.string().default(''),
        twoCol: z.array(z.object({
          icon: z.string().default(''),
          title: z.string().default(''),
          text: z.string().default(''),
        })).default([]),
        oneCol: z.array(z.object({
          icon: z.string().default(''),
          title: z.string().default(''),
          text: z.string().default(''),
        })).default([]),
      })
      .default({ tldrHeading: '', tldrDescription: '', twoCol: [], oneCol: [] }),
  }),
});

export const collections = { posts };
