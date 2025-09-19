// components/Sidebar.js
"use client";

import { useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

export function SidebarBlock({ id, label, icon }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: { fromSidebar: true },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="p-2 rounded cursor-move hover:bg-gray-700 flex items-center gap-2 text-sm text-white"
      data-type={id}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

export default function Sidebar() {
  const [mounted, setMounted] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  // ✅ More realistic CMS block categories
  const groupedBlocks = {
    "Text & Content": [
      { id: "heading", label: "Heading", icon: "🔠" },
      { id: "paragraph", label: "Paragraph", icon: "✏️" },
      { id: "list", label: "List", icon: "📋" },
      { id: "quote", label: "Quote", icon: "❝" },
      { id: "divider", label: "Divider", icon: "➖" },
    ],
    Media: [
      { id: "image", label: "Image", icon: "🖼️" },
      { id: "video", label: "Video", icon: "📹" },
      { id: "gallery", label: "Gallery", icon: "🖼️" },
    ],
    Forms: [
      { id: "textinput", label: "Text Input", icon: "🔤" },
      { id: "emailinput", label: "Email Input", icon: "📧" },
      { id: "checkbox", label: "Checkbox", icon: "☑️" },
      { id: "radio", label: "Radio", icon: "🔘" },
      { id: "button", label: "Button", icon: "➡️" },
    ],
    Layout: [
      { id: "section", label: "Section", icon: "📄" },
      { id: "container", label: "Container", icon: "📦" },
      { id: "grid", label: "Grid", icon: "#️⃣" },
      { id: "spacer", label: "Spacer", icon: "⬜" },
      { id: "navbar", label: "Navbar", icon: "🧭" },
      { id: "footer", label: "Footer", icon: "🦶" },
    ],
    Marketing: [
      { id: "hero", label: "Hero Banner", icon: "🎯" },
      { id: "features", label: "Feature List", icon: "✅" },
      { id: "pricing", label: "Pricing Table", icon: "💲" },
      { id: "testimonial", label: "Testimonial", icon: "💬" },
      { id: "cta", label: "Call to Action", icon: "📢" },
    ],
    "Feedback & Interactivity": [
      { id: "badge", label: "Badge", icon: "🏷️" },
      { id: "progress", label: "Progress Bar", icon: "⏳" },
      { id: "rating", label: "Rating", icon: "⭐" },
      { id: "toast", label: "Toast", icon: "🔔" },
      { id: "tooltip", label: "Tooltip", icon: "💬" },
    ],
  };

  return (
    <aside className="fixed top-0 left-0 z-40 w-60 h-screen p-3 bg-gray-800 overflow-y-auto">
      <div className="flex items-center justify-center h-14 mb-4  border-gray-700">
      
      </div>

      {Object.entries(groupedBlocks).map(([group, blocks]) => {
        const isOpen = openGroups[group] ?? true; // open by default
        return (
          <div key={group} className="mb-3">
            <button
              onClick={() => toggleGroup(group)}
              className="flex items-center justify-between w-full text-xs font-semibold uppercase text-gray-400 hover:text-white transition"
            >
              <span>{group}</span>
              {isOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
            </button>
            {isOpen && (
              <div className="mt-2 flex flex-col gap-2 pl-2">
                {blocks.map((block) => (
                  <SidebarBlock
                    key={block.id}
                    id={block.id}
                    label={block.label}
                    icon={block.icon}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}
