import {
  Bold,
  Box,
  ChevronDown,
  ChevronsUpDown,
  CircleDot,
  Clapperboard,
  ClipboardList,
  CodeXml,
  Columns3,
  Database,
  Expand,
  FileText,
  Folders,
  GalleryHorizontal,
  Heading,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  ImageIcon,
  Italic,
  LayoutGrid,
  Link,
  List,
  ListOrdered,
  type LucideIcon,
  MapIcon,
  Menu,
  Minus,
  MousePointerClick,
  Pilcrow,
  Quote,
  RectangleEllipsis,
  RectangleHorizontal,
  Rows3,
  Square,
  SquareCheck,
  SquareDashed,
  SquareMousePointer,
  Superscript,
  Subscript,
  Tag,
  TextCursorInput,
  Type,
  Video,
} from "lucide-react";

import type { TreeNode } from "../types";

export type NodeTypeInfo = { label: string; Icon: LucideIcon };

const HEADING_ICONS: Record<string, LucideIcon> = {
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  h5: Heading5,
  h6: Heading6,
};

/** Exact Webflow element types, as found in the clipboard payload. */
const TYPES: Record<string, NodeTypeInfo> = {
  // Structure
  Section: { label: "Section", Icon: RectangleHorizontal },
  Block: { label: "Div Block", Icon: Square },
  BlockContainer: { label: "Container", Icon: Box },
  Container: { label: "Container", Icon: Box },
  Grid: { label: "Grid", Icon: LayoutGrid },
  Row: { label: "Row", Icon: Rows3 },
  Column: { label: "Column", Icon: Columns3 },

  // Typography
  Paragraph: { label: "Paragraph", Icon: Pilcrow },
  Span: { label: "Span", Icon: Type },
  Strong: { label: "Bold", Icon: Bold },
  Emphasis: { label: "Italic", Icon: Italic },
  Superscript: { label: "Superscript", Icon: Superscript },
  Subscript: { label: "Subscript", Icon: Subscript },
  Blockquote: { label: "Quote", Icon: Quote },
  RichText: { label: "Rich Text", Icon: FileText },
  List: { label: "List", Icon: List },
  ListItem: { label: "List Item", Icon: Minus },

  // Links and buttons
  Link: { label: "Link", Icon: Link },
  LinkBlock: { label: "Link Block", Icon: SquareMousePointer },
  Button: { label: "Button", Icon: MousePointerClick },

  // Media
  Image: { label: "Image", Icon: ImageIcon },
  Video: { label: "Video", Icon: Video },
  YouTubeVideo: { label: "YouTube", Icon: Video },
  BackgroundVideoWrapper: { label: "BG Video", Icon: Clapperboard },
  HtmlEmbed: { label: "Embed", Icon: CodeXml },
  CodeBlock: { label: "Code", Icon: CodeXml },
  MapWidget: { label: "Map", Icon: MapIcon },

  // Forms
  FormWrapper: { label: "Form", Icon: ClipboardList },
  FormForm: { label: "Form", Icon: ClipboardList },
  FormTextInput: { label: "Input", Icon: TextCursorInput },
  FormTextarea: { label: "Textarea", Icon: TextCursorInput },
  FormSelect: { label: "Select", Icon: ChevronsUpDown },
  FormButton: { label: "Submit", Icon: RectangleEllipsis },
  FormBlockLabel: { label: "Label", Icon: Tag },
  FormInlineLabel: { label: "Label", Icon: Tag },
  FormCheckboxInput: { label: "Checkbox", Icon: SquareCheck },
  FormRadioInput: { label: "Radio", Icon: CircleDot },

  // Components (wrappers get the component name, children keep a humanized type)
  NavbarWrapper: { label: "Navbar", Icon: Menu },
  NavbarMenu: { label: "Nav Menu", Icon: Menu },
  NavbarLink: { label: "Nav Link", Icon: Link },
  DropdownWrapper: { label: "Dropdown", Icon: ChevronDown },
  TabsWrapper: { label: "Tabs", Icon: Folders },
  SliderWrapper: { label: "Slider", Icon: GalleryHorizontal },
  SliderSlide: { label: "Slide", Icon: GalleryHorizontal },
  LightboxWrapper: { label: "Lightbox", Icon: Expand },
  DynamoWrapper: { label: "Collection", Icon: Database },
  DynamoList: { label: "Coll. List", Icon: Database },
  DynamoItem: { label: "Coll. Item", Icon: Database },
  DynamoEmpty: { label: "Empty State", Icon: Database },
};

/** Families of components (Navbar, Slider…) share one icon. Checked in order. */
const PREFIXES: [prefix: string, Icon: LucideIcon][] = [
  ["Form", ClipboardList],
  ["Navbar", Menu],
  ["Dropdown", ChevronDown],
  ["Tabs", Folders],
  ["Slider", GalleryHorizontal],
  ["Lightbox", Expand],
  ["Dynamo", Database],
];

/** "FormCheckboxWrapper" → "Form Checkbox Wrapper" */
function humanize(type: string) {
  return type.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export function describeNode(node: Pick<TreeNode, "type" | "tag">): NodeTypeInfo {
  const { type, tag } = node;

  if (type === "Heading") {
    const level = tag?.toLowerCase();
    const HeadingIcon = level ? HEADING_ICONS[level] : undefined;
    return HeadingIcon
      ? { label: `Heading ${level?.slice(1)}`, Icon: HeadingIcon }
      : { label: "Heading", Icon: Heading };
  }

  if (type === "List" && tag?.toLowerCase() === "ol") {
    return { label: "List", Icon: ListOrdered };
  }

  if (!type) return { label: "Unknown", Icon: SquareDashed };

  const known = TYPES[type];
  if (known) return known;

  const family = PREFIXES.find(([prefix]) => type.startsWith(prefix));
  return { label: humanize(type), Icon: family?.[1] ?? SquareDashed };
}
