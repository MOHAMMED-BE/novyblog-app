import { z } from 'zod';

// Keep a tight alias for clarity
type ZodAny = z.ZodTypeAny;

/** Narrow helper: coerce any Zod-ish value to ZodTypeAny for TS while we still runtime-verify with instanceof. */
function asZodAny<T = unknown>(x: T): ZodAny {
  return x as unknown as ZodAny;
}

function hasUnwrap(x: unknown): x is { unwrap: () => ZodAny } {
  return !!x && typeof (x as any).unwrap === 'function';
}

/**
 * Unwrap common wrapper types using public APIs where possible.
 * - Optional/Nullable/Default/Prefault/NonOptional/Readonly/Catch/Success/Array: `.unwrap()`
 * - Pipe/Codec: descend into `.in` (input side) – cast needed for TS
 * - Transform: treat as leaf (no safe public access to inner)
 */
function unwrapV4(type: ZodAny): ZodAny {
  // Peel wrappers that expose `.unwrap()`
  while (hasUnwrap(type)) {
    type = (type as any).unwrap();
  }

  // For Pipe/Codec, follow the *input* side
  if (type instanceof z.ZodPipe) {
    // TS types the .in as core.$ZodType; cast it for traversal
    const inputSide = asZodAny((type as z.ZodPipe).in);
    return unwrapV4(inputSide);
  }
  // ZodCodec exists in v4; access its `in` similarly
  if ((z as any).ZodCodec && type instanceof (z as any).ZodCodec) {
    const inputSide = asZodAny((type as any).in);
    return unwrapV4(inputSide);
  }

  // ZodTransform: treat as leaf
  if (type instanceof z.ZodTransform) {
    return type;
  }

  return type;
}

/**
 * Recursively collect *leaf* paths.
 * - Object: descend into keys
 * - Array: include the array path, plus a sample index path (e.g. "items.0") for primitive arrays; for object elements, descend into index 0
 * - Tuple: include each fixed index path (access items with ts-expect-error fallback)
 * - Union/DiscriminatedUnion/Intersection: include the base path (treat as leaf; options are not reliably public)
 * - Record: dynamic keys → include base path
 * - Primitives/Enum/etc.: leaf
 */
function collectPaths(schema: ZodAny, base: string[] = [], out: string[] = []): string[] {
  const ty = unwrapV4(schema);

  // Object
  if (ty instanceof z.ZodObject) {
    const shape = ty.shape;
    for (const key of Object.keys(shape)) {
      collectPaths(asZodAny(shape[key]), [...base, key], out);
    }
    return out;
  }

  // Array
  if (ty instanceof z.ZodArray) {
    const path = base.join('.');
    if (path) out.push(path);

    // element is typed as core.$ZodType; cast for traversal
    const elem = unwrapV4(asZodAny(ty.element));
    if (elem instanceof z.ZodObject) {
      collectPaths(elem, [...base, '0'], out);
    } else {
      out.push([...base, '0'].join('.'));
    }
    return out;
  }

  // Tuple (use private items *only* for enumeration; safe at runtime)
  if (ty instanceof z.ZodTuple) {
    const path = base.join('.');
    if (path) out.push(path);
    const items: ZodAny[] = (ty as any)._def?.items ?? [];
    for (let i = 0; i < items.length; i++) {
      collectPaths(asZodAny(items[i]), [...base, String(i)], out);
    }
    return out;
  }

  // Union / DiscriminatedUnion / Intersection → treat as leaf path
  if (
    ty instanceof z.ZodUnion ||
    ty instanceof z.ZodDiscriminatedUnion ||
    ty instanceof z.ZodIntersection
  ) {
    const path = base.join('.');
    if (path) out.push(path);
    return out;
  }

  // Record: dynamic keys → include base only
  if (ty instanceof z.ZodRecord) {
    const path = base.join('.');
    if (path) out.push(path);
    return out;
  }

  // Primitives & friends
  if (
    ty instanceof z.ZodString ||
    ty instanceof z.ZodNumber ||
    ty instanceof z.ZodBoolean ||
    ty instanceof z.ZodDate ||
    ty instanceof z.ZodEnum ||
    ty instanceof z.ZodLiteral ||
    ty instanceof z.ZodUnknown ||
    ty instanceof z.ZodAny ||
    ty instanceof z.ZodBigInt ||
    ty instanceof z.ZodSymbol ||
    ((z as any).ZodFile && ty instanceof (z as any).ZodFile) ||
    ((z as any).ZodJSONSchema && ty instanceof (z as any).ZodJSONSchema) ||
    ty instanceof z.ZodTransform // treat transform as leaf
  ) {
    const path = base.join('.');
    if (path) out.push(path);
    return out;
  }

  // Fallback: include current path so we don't miss exotic types
  const path = base.join('.');
  if (path) out.push(path);
  return out;
}

/**
 * Build a backend→UI path map from a Zod v4 schema.
 * - Adds `"full.path" -> "full.path"`
 * - Adds `"lastSegment" -> "full.path"` if not already present
 * - Optional `overrides` to force/alias entries
 * - Optional `includeArrayIndexSamples` to include/remove `.0` paths
 */
export function buildPathMapFromZod(
  schema: ZodAny,
  opts?: {
    overrides?: Record<string, string>;
    includeArrayIndexSamples?: boolean;
  }
): Record<string, string> {
  const { overrides, includeArrayIndexSamples = true } = opts ?? {};
  const all = collectPaths(schema);
  const uniq = Array.from(new Set(all.filter(Boolean)));

  const map: Record<string, string> = {};

  for (const full of uniq) {
    if (!includeArrayIndexSamples && /\.0(\.|$)/.test(full)) continue;

    // full path -> itself
    map[full] = full;

    // last segment -> full (first one wins unless overridden)
    const last = full.split('.').pop()!;
    if (last && !(last in map)) {
      map[last] = full;
    }
  }

  if (overrides) {
    for (const k of Object.keys(overrides)) {
      map[k] = overrides[k];
    }
  }

  return map;
}
