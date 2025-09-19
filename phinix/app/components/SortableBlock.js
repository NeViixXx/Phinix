// components/SortableBlock.js
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableBlock({ id, children }) {
  const { attributes, setNodeRef, transform, transition, listeners } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // children is expected to be a function: children({ listeners, attributes })
  return (
    <div ref={setNodeRef} style={style}>
      {typeof children === "function" ? children({ listeners, attributes }) : children}
    </div>
  );
}
