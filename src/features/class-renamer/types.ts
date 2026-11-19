/**
 * Subset of Webflow's clipboard format ("@webflow/XscpData") that the renamer relies on.
 * Unknown fields are kept as-is so the payload round-trips back to the Designer untouched.
 */
export interface WebflowNode {
  _id: string;
  type?: string;
  tag?: string;
  classes?: string[];
  children?: string[];
  /** Text nodes carry `text: true` and are not shown in the tree. */
  text?: boolean;
  [key: string]: unknown;
}

export interface WebflowStyle {
  _id: string;
  name: string;
  /** Non-empty for combo classes (e.g. "&"). */
  comb?: string;
  [key: string]: unknown;
}

export interface XscpData {
  type: "@webflow/XscpData";
  payload: {
    nodes: WebflowNode[];
    styles: WebflowStyle[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface TreeNode {
  id: string;
  type: string | undefined;
  tag: string | undefined;
  classes: string[];
  children: TreeNode[];
}

/** Style id → style. */
export type StyleMap = Record<string, WebflowStyle>;

/** Style id → name currently typed by the user. */
export type NameMap = Record<string, string>;

export type ParseResult = { ok: true; data: XscpData } | { ok: false; error: string };
