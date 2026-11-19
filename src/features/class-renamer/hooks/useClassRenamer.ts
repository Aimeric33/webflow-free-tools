import { useMemo, useState, type ClipboardEvent } from "react";

import {
  applyNames,
  buildTree,
  copyToWebflow,
  findInvalid,
  initialNames,
  parseWebflowClipboard,
  toStyleMap,
} from "../lib/webflow";
import type { NameMap, XscpData } from "../types";

export function useClassRenamer() {
  const [data, setData] = useState<XscpData | null>(null);
  const [names, setNames] = useState<NameMap>({});
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const tree = useMemo(() => (data ? buildTree(data.payload.nodes) : []), [data]);
  const styles = useMemo(() => toStyleMap(data), [data]);
  const invalid = useMemo(() => findInvalid(names, styles), [names, styles]);

  const handlePaste = (e: ClipboardEvent<HTMLElement>) => {
    e.preventDefault();
    const raw =
      e.clipboardData.getData("application/json") || e.clipboardData.getData("text/plain");
    const result = parseWebflowClipboard(raw);

    if (!result.ok) {
      setError(result.error);
      setData(null);
      return;
    }
    setError("");
    setCopied(false);
    setData(result.data);
    setNames(initialNames(result.data));
  };

  const rename = (id: string, value: string) => {
    setCopied(false);
    setNames((prev) => ({ ...prev, [id]: value }));
  };

  const copy = () => {
    if (!data || invalid.size > 0) return;
    setCopied(copyToWebflow(applyNames(data, names)));
  };

  return { data, tree, styles, names, invalid, error, copied, handlePaste, rename, copy };
}
