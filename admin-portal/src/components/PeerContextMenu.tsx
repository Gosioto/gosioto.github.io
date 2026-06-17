import { ContextMenu } from '../ui';
import type { ContextMenuItem } from '../ui';

type Props = {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
};

export default function PeerContextMenu({ x, y, items, onClose }: Props) {
  if (items.length === 0) return null;
  return <ContextMenu open x={x} y={y} items={items} onClose={onClose} />;
}
