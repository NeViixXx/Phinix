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
    ? { 
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
        opacity: 0.9
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="group p-3 rounded-xl cursor-move bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-gray-700 hover:to-gray-600 active:from-blue-600/20 active:to-purple-600/20 flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-all duration-300 border border-gray-600/30 hover:border-blue-500/30 shadow-lg hover:shadow-xl backdrop-blur-sm transform hover:scale-105 active:scale-95"
      data-type={id}
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-lg group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
        <span>{icon}</span>
      </div>
      <span className="font-medium">{label}</span>
      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [mounted, setMounted] = useState(false);
  const [openGroups, setOpenGroups] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter blocks based on search query
  const filteredGroupedBlocks = searchQuery.trim() === "" 
    ? groupedBlocks 
    : Object.entries(groupedBlocks).reduce((acc, [groupName, blocks]) => {
        const filteredBlocks = blocks.filter(block => 
          block.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          block.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filteredBlocks.length > 0) {
          acc[groupName] = filteredBlocks;
        }
        return acc;
      }, {});

  return (
    <aside className="fixed top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-900 via-slate-900 to-gray-900 border-r border-gray-700/50 overflow-y-auto shadow-2xl backdrop-blur-sm">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-center mb-6 pb-4 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">🧩</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Components</h2>
              <p className="text-blue-400 text-xs font-medium">Drag & Drop to Build</p>
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div className="mb-6">
          <div className="relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components..."
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:bg-gray-800/70 focus:bg-gray-800"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-white transition-colors duration-200"
                title="Clear search"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-xs text-gray-400 text-center">
              {Object.values(filteredGroupedBlocks).flat().length} result{Object.values(filteredGroupedBlocks).flat().length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-6">
        {Object.keys(filteredGroupedBlocks).length === 0 && searchQuery ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">No components found</p>
            <p className="text-gray-500 text-xs mt-1">Try a different search term</p>
          </div>
        ) : (
          Object.entries(filteredGroupedBlocks).map(([group, blocks]) => {
            const isOpen = openGroups[group] ?? true; // open by default
            return (
              <div key={group} className="mb-6">
                <button
                  onClick={() => toggleGroup(group)}
                  className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-blue-400 transition-all duration-300 py-3 px-3 rounded-lg hover:bg-gray-800/50 group"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      isOpen ? 'bg-blue-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="group-hover:text-white transition-colors duration-300">{group}</span>
                    <span className="text-xs text-gray-500 ml-1">({blocks.length})</span>
                  </div>
                  <div className={`transform transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : 'rotate-0'
                  }`}>
                    <FaChevronDown size={12} className="text-blue-400" />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="mt-3 space-y-2 pl-2">
                    {blocks.map((block, index) => (
                      <div 
                        key={block.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <SidebarBlock
                          id={block.id}
                          label={block.label}
                          icon={block.icon}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
