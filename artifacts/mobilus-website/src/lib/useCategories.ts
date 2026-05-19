import { useState, useEffect } from "react";
import { api, type ApiCategory } from "@/lib/api";

const CACHE_TTL_MS = 60_000;

let cached: ApiCategory[] | null = null;
let cachedAt = 0;
let inFlight: Promise<ApiCategory[]> | null = null;

function isCacheValid() {
  return cached !== null && Date.now() - cachedAt < CACHE_TTL_MS;
}

function fetchCategories(): Promise<ApiCategory[]> {
  if (isCacheValid()) return Promise.resolve(cached!);
  if (inFlight) return inFlight;
  inFlight = api.categories
    .list()
    .then((cats) => {
      cached = cats;
      cachedAt = Date.now();
      inFlight = null;
      return cats;
    })
    .catch(() => {
      inFlight = null;
      return cached ?? [];
    });
  return inFlight;
}

export function useCategories() {
  const [categories, setCategories] = useState<ApiCategory[]>(isCacheValid() ? cached! : []);
  const [loading, setLoading] = useState(!isCacheValid());

  useEffect(() => {
    if (isCacheValid()) return;
    fetchCategories().then((cats) => {
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  return { categories, loading };
}

export function findSection(
  categories: ApiCategory[],
  sectionSlug: string
): ApiCategory | null {
  return categories.find((c) => c.parentId === null && c.slug === sectionSlug) ?? null;
}

export function buildCategoryRouteMap(
  categories: ApiCategory[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const top of categories) {
    if (top.parentId !== null) continue;
    const route = top.slug;
    map.set(top.name, route);
    for (const child of top.children ?? []) {
      map.set(child.name, route);
    }
  }
  return map;
}
