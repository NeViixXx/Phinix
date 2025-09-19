// SidebarBlock.js
"use client";
import { useDraggable } from "@dnd-kit/core";

export default function SidebarBlock({ id, label }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-type={id}
      className="p-2 rounded cursor-move hover:bg-gray-700"
    >
      {label}
    </div>
  );
}
