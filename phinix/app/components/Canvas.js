"use client";

import { useState, useEffect, useCallback } from "react";
import { DndContext, useDroppable, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import Sidebar from "./Sidebar";
import CMSBlock from "./CMSBlock";
import SortableBlock from "./SortableBlock";
import InspectorPanel from "./InspectorPanel"; // create separate InspectorPanel component

// Safe UUID generator for environments without crypto.randomUUID
function generateUUID() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
      const toHex = (n) => n.toString(16).padStart(2, '0');
      const hex = Array.from(bytes, toHex).join('');
      return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}`;
    }
  } catch (_) {}
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

function DroppableCanvas({ children, hasInspector }) {
  const { setNodeRef } = useDroppable({ id: "canvas" });
  return (
    <div
      ref={setNodeRef}
      style={{
        paddingLeft: "300px",
        paddingRight: hasInspector ? "360px" : "60px",
        paddingTop: "140px", // Increased for toolbar
        minHeight: "100vh",
        position: "relative",
        transition: "padding-right 0.3s ease-in-out",
      }}
    >
      {children}
    </div>
  );
}

export default function Canvas() {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  // Site pages: [{id, name, blocks}]
  const [pages, setPages] = useState([{ id: generateUUID(), name: "Home", blocks: [] }]);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);

  // Initialize current page on mount
  useEffect(() => {
    if (!currentPageId && pages.length > 0) {
      setCurrentPageId(pages[0].id);
      setBlocks(pages[0].blocks || []);
    }
  }, [currentPageId, pages]);

  // History management
  const saveToHistory = useCallback((newPages) => {
    const snapshot = JSON.parse(JSON.stringify(newPages));
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(snapshot);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const prevPages = history[historyIndex - 1];
      setPages(prevPages);
      const page = prevPages.find(p => p.id === currentPageId) || prevPages[0];
      setBlocks(page?.blocks || []);
      setSelectedBlockId(null);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextPages = history[historyIndex + 1];
      setPages(nextPages);
      const page = nextPages.find(p => p.id === currentPageId) || nextPages[0];
      setBlocks(page?.blocks || []);
    }
  }, [history, historyIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 's':
            e.preventDefault();
            saveProject();
            break;
          case 'p':
            e.preventDefault();
            setPreviewMode(!previewMode);
            break;
        }
      }
      if (e.key === 'Delete' && selectedBlockId) {
        deleteBlock(selectedBlockId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedBlockId, previewMode]);

  // Save/Load functionality
  const saveProject = useCallback(() => {
    const project = {
      pages,
      currentPageId,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem('phinix-cms-project', JSON.stringify(project));
    alert('Project saved successfully!');
  }, [pages, currentPageId]);

  const loadProject = useCallback(() => {
    const saved = localStorage.getItem('phinix-cms-project');
    if (saved) {
      try {
        const project = JSON.parse(saved);
        const loadedPages = project.pages && Array.isArray(project.pages) ? project.pages : [{ id: generateUUID(), name: "Home", blocks: project.blocks || [] }];
        setPages(loadedPages);
        const pid = project.currentPageId && loadedPages.find(p=>p.id===project.currentPageId) ? project.currentPageId : loadedPages[0]?.id;
        setCurrentPageId(pid || null);
        setBlocks((loadedPages.find(p=>p.id===pid) || loadedPages[0] || {blocks: []}).blocks || []);
        setSelectedBlockId(null);
        setHistory([JSON.parse(JSON.stringify(loadedPages))]);
        setHistoryIndex(0);
        alert('Project loaded successfully!');
      } catch (error) {
        alert('Error loading project');
      }
    }
  }, []);

  // Whenever blocks change, persist them into current page and snapshot history
  useEffect(() => {
    if (!currentPageId) return;
    setPages(prev => {
      const newPages = prev.map(p => p.id === currentPageId ? { ...p, blocks } : p);
      saveToHistory(newPages);
      return newPages;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active) return;

    // Dragged from Sidebar?
    const fromSidebar = active.data?.current?.fromSidebar;
    if (fromSidebar) {
      const type = active.id.replace("sidebar-", "");
      const newBlock = {
        id: generateUUID(),
        type,
        content: getDefaultContent(type),
      };

      setBlocks((prev) => {
        const newBlocks = !over || over.id === "canvas" 
          ? [...prev, newBlock]
          : (() => {
              const idx = prev.findIndex((b) => b.id === over.id);
              return idx === -1 ? [...prev, newBlock] : [...prev.slice(0, idx + 1), newBlock, ...prev.slice(idx + 1)];
            })();
        return newBlocks;
      });
      return;
    }

    // Reorder existing blocks
    if (active.id && over?.id && active.id !== over.id) {
      setBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id);
        const newIndex = prev.findIndex((b) => b.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const newBlocks = arrayMove(prev, oldIndex, newIndex);
        return newBlocks;
      });
    }
  };

  const updateBlock = (id, updatedBlock) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? updatedBlock : b)));
  };

  const deleteBlock = (id) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const duplicateBlock = (id) => {
    const block = blocks.find((b) => b.id === id);
    if (!block) return;
    setBlocks((prev) => [...prev, { ...block, id: generateUUID() }]);
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <Sidebar />
      
      {/* Toolbar */}
      <div className="fixed top-0 left-64 right-0 z-30 bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded"
          >
            ↶ Undo
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded"
          >
            ↷ Redo
          </button>
          <div className="w-px h-6 bg-gray-600 mx-2"></div>
          <button
            onClick={saveProject}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            💾 Save
          </button>
          <button
            onClick={loadProject}
            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
          >
            📁 Load
          </button>
          <button
            onClick={() => {
              const payload = JSON.stringify({ blocks }, null, 2);
              navigator.clipboard.writeText(payload);
              alert('Copied JSON to clipboard');
            }}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            ⧉ Copy JSON
          </button>
          <div className="w-px h-6 bg-gray-600 mx-2"></div>
          {/* Page Switcher */}
          <select
            value={currentPageId || ''}
            onChange={(e) => {
              const pid = e.target.value;
              setCurrentPageId(pid);
              const page = pages.find(p=>p.id===pid);
              setBlocks(page?.blocks || []);
              setSelectedBlockId(null);
            }}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-2 py-1"
          >
            {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button
            onClick={() => {
              const name = prompt('Page name', `Page ${pages.length+1}`);
              if (!name) return;
              const newPage = { id: generateUUID(), name, blocks: [] };
              const newPages = [...pages, newPage];
              setPages(newPages);
              setCurrentPageId(newPage.id);
              setBlocks([]);
              saveToHistory(newPages);
            }}
            className="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            ＋ Add Page
          </button>
          <button
            onClick={() => {
              const page = pages.find(p=>p.id===currentPageId);
              if (!page) return;
              const name = prompt('Rename page', page.name);
              if (!name) return;
              const newPages = pages.map(p => p.id===currentPageId ? { ...p, name } : p);
              setPages(newPages);
              saveToHistory(newPages);
            }}
            className="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            ✎ Rename
          </button>
          <button
            onClick={() => {
              if (pages.length <= 1) return alert('At least one page is required');
              if (!confirm('Delete this page?')) return;
              const idx = pages.findIndex(p=>p.id===currentPageId);
              const newPages = pages.filter(p=>p.id!==currentPageId);
              const fallback = newPages[Math.max(0, idx-1)] || newPages[0];
              setPages(newPages);
              setCurrentPageId(fallback.id);
              setBlocks(fallback.blocks || []);
              setSelectedBlockId(null);
              saveToHistory(newPages);
            }}
            className="px-2 py-1 text-sm bg-red-700 hover:bg-red-600 text-white rounded"
          >
            🗑️ Delete
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3 py-1 text-sm rounded ${previewMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
          >
            {previewMode ? '✏️ Edit' : '👁️ Preview'}
          </button>
          <span className="text-xs text-gray-400">
            {blocks.length} blocks
          </span>
        </div>
      </div>

      <DroppableCanvas hasInspector={!!selectedBlock && !previewMode}>
        {blocks.length === 0 && <p className="text-gray-500 text-center py-8">Drop blocks here to start building</p>}

        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <SortableBlock key={block.id} id={block.id}>
              {({ listeners, attributes }) => (
                <CMSBlock
                  block={block}
                  onUpdate={(updated) => updateBlock(block.id, updated)}
                  onDelete={() => deleteBlock(block.id)}
                  onDuplicate={() => duplicateBlock(block.id)}
                  onSelect={() => setSelectedBlockId(block.id)}
                  isSelected={selectedBlockId === block.id}
                  dragHandleProps={previewMode ? null : { ...listeners, ...attributes }}
                  previewMode={previewMode}
                />
              )}
            </SortableBlock>
          ))}
        </SortableContext>
      </DroppableCanvas>

      {selectedBlock && (
        <InspectorPanel
          block={selectedBlock}
          onUpdate={(updated) => updateBlock(selectedBlock.id, updated)}
          onClose={() => setSelectedBlockId(null)}
        />
      )}
    </DndContext>
  );
}

function getDefaultContent(type) {
  switch (type) {
    case "heading": return "Heading Text";
    case "paragraph": return "Paragraph text...";
    case "image": return "https://via.placeholder.com/300";
    case "video": return "https://www.w3schools.com/html/mov_bbb.mp4";
    case "button": return "Click me";
    case "gallery": return ["https://via.placeholder.com/100", "https://via.placeholder.com/100"];
    case "card": return {
      heading: "Card title",
      image: "https://via.placeholder.com/640x360",
      text: "This is a card description. You can customize it in the Inspector.",
      buttonLabel: "Learn more",
      buttonHref: "#",
      // Container styles
      cardBg: "#ffffff",
      cardRadius: "8px",
      cardShadow: "0 2px 8px rgba(0,0,0,.08)",
      align: "left",
      // Heading styles
      headingColor: "#111827",
      headingFontSize: "20px",
      // Text styles
      textColor: "#4B5563",
      textFontSize: "14px",
      // Button styles
      buttonBg: "#2563eb",
      buttonColor: "#ffffff",
      // Image styles
      imageHeight: "auto",
      imageFit: "cover",
      imageRadius: "0px",
    };
    case "hero": return {
      title: "Welcome to Our Website",
      subtitle: "Create amazing experiences with our powerful CMS",
      buttonText: "Get Started",
      backgroundImage: "https://via.placeholder.com/1200x600",
      buttonHref: "#",
      // styles
      overlayColor: "rgba(0,0,0,0.5)",
      align: "center",
      minHeight: "420px",
      titleColor: "#ffffff",
      titleSize: "48px",
      subtitleColor: "#e5e7eb",
      subtitleSize: "20px",
      buttonBg: "#2563eb",
      buttonColor: "#ffffff",
    };
    case "navbar": return {
      brand: "MyBrand",
      links: [
        { text: "Home", href: "#" },
        { text: "About", href: "#" },
        { text: "Services", href: "#" },
        { text: "Contact", href: "#" }
      ],
      // styles
      bg: "#ffffff",
      textColor: "#111827",
      linkHover: "#2563eb",
      sticky: false,
      height: "64px",
      paddingX: "16px",
    };
    case "footer": return {
      copyright: "© 2024 MyBrand. All rights reserved.",
      links: [
        { text: "Privacy Policy", href: "#" },
        { text: "Terms of Service", href: "#" },
        { text: "Contact", href: "#" }
      ],
      social: [
        { platform: "Twitter", href: "#" },
        { platform: "Facebook", href: "#" },
        { platform: "LinkedIn", href: "#" }
      ],
      // styles
      bg: "#111827",
      textColor: "#e5e7eb",
      linkColor: "#9ca3af",
      linkHover: "#ffffff",
      paddingY: "48px",
    };
    case "section": return {
      title: "Section Title",
      content: "This is a section with customizable content and styling options.",
      background: "#f8f9fa"
    };
    case "grid": return {
      columns: { base: 1, md: 2, lg: 3 },
      gap: { base: "16px", md: "24px", lg: "32px" },
      items: [
        { type: "card", content: { heading: "Item 1", text: "Description", image: "https://via.placeholder.com/600x400", buttonLabel: "Read more", buttonHref: "#" } },
        { type: "card", content: { heading: "Item 2", text: "Description", image: "https://via.placeholder.com/600x400", buttonLabel: "Read more", buttonHref: "#" } },
        { type: "card", content: { heading: "Item 3", text: "Description", image: "https://via.placeholder.com/600x400", buttonLabel: "Read more", buttonHref: "#" } },
      ]
    };
    case "testimonial": return {
      quote: "This product changed our business.",
      author: "Jane Doe",
      role: "CEO, Example Co.",
      avatar: "https://via.placeholder.com/96"
    };
    case "pricing": return {
      plans: [
        { name: "Basic", price: "$9/mo", features: ["1 Project", "Email Support"], cta: "Choose Basic" },
        { name: "Pro", price: "$29/mo", features: ["10 Projects", "Priority Support"], cta: "Choose Pro" },
        { name: "Enterprise", price: "Contact", features: ["Unlimited", "Dedicated Manager"], cta: "Contact Sales" },
      ]
    };
    case "featurelist": return {
      title: "Features",
      features: [
        { title: "Fast", description: "Lightning-fast performance" },
        { title: "Secure", description: "Enterprise-grade security" },
        { title: "Customizable", description: "Tailor to your needs" },
      ]
    };
    default: return "";
  }
}
