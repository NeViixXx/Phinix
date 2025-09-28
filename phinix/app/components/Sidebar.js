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
      className="p-3 rounded-lg cursor-move hover:bg-gray-700 active:bg-gray-600 flex items-center gap-3 text-sm text-gray-200 hover:text-white transition-all duration-200 border border-transparent hover:border-gray-600 shadow-sm"
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

  // ✅ Curated CMS block categories with focus on cards and essential elements
  const groupedBlocks = {
    "Text & Content": [
      { id: "heading", label: "Heading", icon: "🔠" },
      { id: "paragraph", label: "Paragraph", icon: "✏️" },
      { id: "quote", label: "Quote", icon: "❝" },
    ],
    "Cards & Layout": [
      { id: "card", label: "Card", icon: "🃏" },
      { id: "productcard", label: "Product Card", icon: "🛍️" },
      { id: "teamcard", label: "Team Card", icon: "👥" },
      { id: "servicecard", label: "Service Card", icon: "⚙️" },
      { id: "testimonialcard", label: "Testimonial Card", icon: "💬" },
      { id: "featurecard", label: "Feature Card", icon: "✨" },
      { id: "grid", label: "Grid Layout", icon: "#️⃣" },
      { id: "section", label: "Section", icon: "📄" },
    ],
    "Containers": [
      { id: "div", label: "Div Container", icon: "📦" },
      { id: "twocolumn", label: "2-Column Layout", icon: "📊" },
      { id: "threecolumn", label: "3-Column Layout", icon: "📋" },
      { id: "spacer", label: "Spacer", icon: "⬜" },
    ],
    "Media & Interactive": [
      { id: "image", label: "Image", icon: "🖼️" },
      { id: "video", label: "Video", icon: "📹" },
      { id: "gallery", label: "Gallery", icon: "🖼️" },
      { id: "button", label: "Button", icon: "➡️" },
    ],
    "Navigation & Structure": [
      { id: "mainnavbar", label: "Main Navbar", icon: "🧭" },
      { id: "navbar", label: "Custom Navbar", icon: "🧭" },
      { id: "footer", label: "Footer", icon: "🦶" },
      { id: "hero", label: "Hero Banner", icon: "🎯" },
    ],
    "Marketing & Business": [
      { id: "pricing", label: "Pricing Table", icon: "💲" },
      { id: "testimonial", label: "Testimonial", icon: "💬" },
      { id: "featurelist", label: "Feature List", icon: "✅" },
    ],
  };

  return (
    <aside className="fixed top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] p-4 bg-gray-900 border-r border-gray-700 overflow-y-auto shadow-xl">
      <div className="flex items-center justify-center mb-6 pb-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">🧩</span>
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">Components</h2>
            <p className="text-gray-400 text-xs">Drag to canvas</p>
          </div>
        </div>
      </div>

      {Object.entries(groupedBlocks).map(([group, blocks]) => {
        const isOpen = openGroups[group] ?? true; // open by default
        return (
          <div key={group} className="mb-3">
            <button
              onClick={() => toggleGroup(group)}
              className="flex items-center justify-between w-full text-xs font-semibold uppercase text-gray-400 hover:text-white transition-colors duration-200 py-2 px-1 rounded hover:bg-gray-800"
            >
              <span>{group}</span>
              {isOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
            </button>
            {isOpen && (
              <div className="mt-3 flex flex-col gap-2 pl-1">
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
