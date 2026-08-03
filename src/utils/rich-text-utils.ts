import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p",
  "div",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "ul",
  "ol",
  "li",
  "a",
  "span",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "h4",
  "font",
];

const STYLE_RULES: Record<string, RegExp> = {
  "font-size": /^\d+(?:\.\d+)?(px|em|rem|%)$/i,
  color:
    /^#(?:[0-9a-f]{3}){1,2}$|^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$|^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)$/i,
  "background-color":
    /^#(?:[0-9a-f]{3}){1,2}$|^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$|^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)$/i,
  "text-align": /^(left|right|center|justify)$/i,
};

function sanitizeInlineStyles(doc: Document) {
  doc.body.querySelectorAll("[style]").forEach((el) => {
    const raw = el.getAttribute("style") || "";
    const cleaned: string[] = [];
    raw
      .split(";")
      .map((rule) => rule.trim())
      .filter(Boolean)
      .forEach((rule) => {
        const [prop, ...rest] = rule.split(":");
        if (!prop || rest.length === 0) return;
        const name = prop.trim().toLowerCase();
        const value = rest.join(":").trim().toLowerCase();
        const matcher = STYLE_RULES[name];
        if (!matcher) return;
        if (!matcher.test(value)) return;
        cleaned.push(`${name}:${value}`);
      });

    if (cleaned.length === 0) {
      el.removeAttribute("style");
    } else {
      el.setAttribute("style", cleaned.join("; "));
    }
  });
}

function normalizeFontColors(doc: Document) {
  doc.body.querySelectorAll("font[color]").forEach((el) => {
    const color = el.getAttribute("color");
    if (!color) {
      return;
    }
    const span = doc.createElement("span");
    span.setAttribute("style", `color:${color}`);
    span.innerHTML = el.innerHTML;
    el.replaceWith(span);
  });
}

/**
 * Normalizes block-level elements for PDF rendering.
 * Removes unnecessary vertical padding and ensures consistent spacing.
 */
function normalizeStructure(doc: Document) {
  // Remove trailing empty paragraphs that add dead space at the end of sections
  const blocks = Array.from(doc.body.children);
  for (let i = blocks.length - 1; i >= 0; i--) {
    const el = blocks[i];
    if (el.tagName === "P" && (el.textContent?.trim() === "" || el.innerHTML === "<br>")) {
      el.remove();
    } else {
      break;
    }
  }

  // Ensure empty blocks have a content marker for the editor,
  // but we strip these before actual PDF rendering if they are purely empty.
  doc.body.querySelectorAll("p, div, li, h1, h2, h3, h4").forEach((el) => {
    if (el.innerHTML.trim() === "" && !el.hasChildNodes()) {
      el.appendChild(doc.createElement("br"));
    }
  });
}

function removeEmptyBlocksBeforeLists(doc: Document) {
  doc.body.querySelectorAll("p, div").forEach((el) => {
    const next = el.nextElementSibling;
    if (!next || (next.tagName !== "UL" && next.tagName !== "OL")) return;
    const text = (el.textContent ?? "").replace(/\u00a0/g, "").trim();
    const hasMeaningfulChild = Array.from(el.childNodes).some((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = (node as Element).tagName;
        return tag !== "BR";
      }
      return false;
    });
    if (!text && !hasMeaningfulChild) {
      el.remove();
    }
  });
}

/**
 * Specifically cleans up Word-style messy HTML that often causes large gaps.
 */
export function sanitizeRichTextHtml(html?: string) {
  if (!html) return "";
  
  // Pre-clean: Replace common non-breaking space issues from editors
  const preCleaned = html.replace(/&nbsp;/g, " ");

  const clean = DOMPurify.sanitize(preCleaned, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "title", "target", "rel", "style", "color"],
  });

  const parser = new DOMParser();
  const doc = parser.parseFromString(clean, "text/html");

  normalizeFontColors(doc);
  sanitizeInlineStyles(doc);
  normalizeStructure(doc);
  removeEmptyBlocksBeforeLists(doc);

  return doc.body.innerHTML;
}

export function getRichTextVisibleCharCount(html?: string | null): number {
  if (!html) return 0;

  if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const text = doc.body.textContent ?? "";
    return text.replace(/\u00a0/g, "").length;
  }

  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\u00a0/g, "")
    .length;
}
