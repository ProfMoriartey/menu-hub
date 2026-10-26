// src/lib/category-section.ts

// Every category is a section on the public menu; its element id is built
// from the slug so item pages can link back to the right place. Kept outside
// the client components so server components can build these links too.
export const categorySectionId = (slug: string) => `category-${slug}`;
