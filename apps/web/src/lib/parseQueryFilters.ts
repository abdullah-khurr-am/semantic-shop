import type { FilterState } from "@/components/FilterBar";

/**
 * Pull structured SQL filters out of a natural-language query so the UI
 * and hybrid search stay aligned (price / category / size).
 */
export function parseQueryFilters(query: string): Omit<FilterState, "inStockOnly"> {
  const text = query.toLowerCase();

  return {
    minPrice: extractMinPrice(text),
    maxPrice: extractMaxPrice(text),
    category: extractCategory(text),
    sizes: extractSizes(text),
  };
}

function extractMaxPrice(text: string): string {
  const patterns = [
    /(?:under|below|less(?:er)? than|cheaper than|max(?:imum)?|up to|at most)\s*\$?\s*(\d+(?:\.\d+)?)/i,
    /\$\s*(\d+(?:\.\d+)?)\s*(?:or less|max|maximum)/i,
    /(?:under|below|less(?:er)? than)\s+(\d+(?:\.\d+)?)\s*(?:dollars?|usd|bucks)/i,
    /(\d+(?:\.\d+)?)\s*(?:dollars?|usd)\s*(?:or less|max)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return normalizeMoney(match[1]);
  }
  return "";
}

function extractMinPrice(text: string): string {
  const patterns = [
    /(?:over|above|more than|greater than|at least|min(?:imum)?)\s*\$?\s*(\d+(?:\.\d+)?)/i,
    /\$\s*(\d+(?:\.\d+)?)\s*(?:or more|min|minimum|\+)/i,
    /(?:over|above|more than|greater than)\s+(\d+(?:\.\d+)?)\s*(?:dollars?|usd|bucks)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return normalizeMoney(match[1]);
  }
  return "";
}

function normalizeMoney(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return "";
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function extractCategory(text: string): string {
  const rules: Array<{ category: string; pattern: RegExp }> = [
    {
      category: "jackets",
      pattern:
        /\b(jackets?|coats?|anoraks?|windbreakers?|parkas?|trench(?:es)?|softshells?|rain\s*shells?|blazers?|puffers?|outerwear)\b/,
    },
    {
      category: "shoes",
      pattern:
        /\b(shoes?|sneakers?|runners?|boots?|sandals?|slides?|oxfords?|espadrilles?|hikers?|footwear)\b/,
    },
    {
      category: "bottoms",
      pattern:
        /\b(pants?|trousers?|jeans?|shorts?|leggings?|chinos?|overpants?)\b/,
    },
    {
      category: "tops",
      pattern:
        /\b(shirts?|t-shirts?|teeshirts?|\btees?\b|polos?|hoodies?|sweaters?|tanks?|camisoles?|baselayers?|\btops?\b)\b/,
    },
    {
      category: "bags",
      pattern:
        /\b(bags?|backpacks?|daypacks?|totes?|duffels?|slings?|weekenders?)\b/,
    },
    {
      category: "accessories",
      pattern:
        /\b(accessories|hats?|caps?|beanies?|scarves?|scarfs?|gloves?|socks?|belts?|wallets?|umbrellas?|sunglasses|bottles?|ponchos?)\b/,
    },
  ];

  for (const rule of rules) {
    if (rule.pattern.test(text)) return rule.category;
  }
  return "";
}

const APPAREL_SIZES = new Set(["XS", "S", "M", "L", "XL", "OS"]);

function extractSizes(text: string): string[] {
  const sizes = new Set<string>();

  // Explicit "size 9" / "size M" always counts.
  const labeled = text.matchAll(/\bsize\s*(xs|s|m|l|xl|os|\d{1,2})\b/gi);
  for (const match of labeled) {
    sizes.add(match[1].toUpperCase());
  }

  // Always surface small/medium/large in the filter UI, including for footwear.
  if (/\b(extra[\s-]?small|x-?small|xs)\b/.test(text)) sizes.add("XS");
  if (/\b(extra[\s-]?large|x-?large|xl)\b/.test(text)) sizes.add("XL");
  if (/\b(medium[\s-]?sized?|medium|med)\b/.test(text)) sizes.add("M");
  if (/\bsmall\b/.test(text) && !/\bextra[\s-]?small\b/.test(text)) sizes.add("S");
  if (/\blarge\b/.test(text) && !/\bextra[\s-]?large\b/.test(text)) sizes.add("L");
  if (/\b(one[\s-]?size|onesize)\b/.test(text)) sizes.add("OS");

  return Array.from(sizes);
}

/** Footwear catalogs use numeric sizes; letter sizes stay in the UI but skip SQL overlap. */
export function sizesForSearchApi(
  sizes: string[],
  category: string,
): string[] | undefined {
  if (!sizes.length) return undefined;
  if (category === "shoes" && sizes.every((size) => APPAREL_SIZES.has(size))) {
    return undefined;
  }
  return sizes;
}

export function filtersFromQuery(
  query: string,
  inStockOnly = true,
): FilterState {
  return {
    ...parseQueryFilters(query),
    inStockOnly,
  };
}
