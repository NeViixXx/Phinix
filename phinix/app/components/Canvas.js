"use client";

import { useState, useEffect, useCallback } from "react";
import { DndContext, useDroppable, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import Sidebar from "./Sidebar";
import CMSBlock from "./CMSBlock";
import SortableBlock from "./SortableBlock";
import InspectorPanel from "./InspectorPanel";
import Navbar from "./Navbar";


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

function DroppableCanvas({ children, hasInspector, viewport, dragIndicator }) {
  const { setNodeRef } = useDroppable({ id: "canvas" });
  
  const getViewportStyles = () => {
    const baseStyles = {
      paddingLeft: "272px", // Match sidebar width (w-64 + padding)
      paddingRight: hasInspector ? "360px" : "60px",
      paddingTop: "80px", // Adjusted for full-width navbar
      minHeight: "100vh",
      position: "relative",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
    };

    switch (viewport) {
      case 'mobile':
        return {
          ...baseStyles,
          maxWidth: "375px",
          margin: "0 auto",
          paddingLeft: "20px",
          paddingRight: "20px",
        };
      case 'tablet':
        return {
          ...baseStyles,
          maxWidth: "768px",
          margin: "0 auto",
          paddingLeft: "40px",
          paddingRight: "40px",
        };
      case 'desktop':
      default:
        return baseStyles;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={getViewportStyles()}
      className={`relative ${viewport !== 'desktop' ? 'border border-gray-600 rounded-xl mx-auto my-4 shadow-2xl' : ''}`}
      data-canvas="true"
    >
      {/* Drag Indicator */}
      {dragIndicator && (
        <div 
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg z-50 transition-all duration-200 ease-out"
          style={{ top: dragIndicator.y }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm opacity-60"></div>
        </div>
      )}
      
      {/* Canvas Content */}
      <div className="relative z-10">
        {children}
      </div>
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
  const [viewport, setViewport] = useState('desktop');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPageModal, setShowPageModal] = useState(false);
  const [showDeletePageModal, setShowDeletePageModal] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [dragIndicator, setDragIndicator] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);
  const [globalStyles, setGlobalStyles] = useState({
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#3B82F6',
    secondaryColor: '#6B7280',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    headingColor: '#111827',
    linkColor: '#3B82F6',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  });

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
      globalStyles,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem('phinix-cms-project', JSON.stringify(project));
    alert('Project saved successfully!');
  }, [pages, currentPageId, globalStyles]);

  // Preview functionality
  const openPreview = useCallback(() => {
    const currentPage = pages.find(p => p.id === currentPageId);
    if (!currentPage) return;

    const previewData = {
      blocks: currentPage.blocks,
      globalStyles,
      viewport,
      title: currentPage.name
    };

    const previewWindow = window.open('', '_blank', 'width=1200,height=800');
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${currentPage.name} - Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body {
            font-family: ${globalStyles.fontFamily};
            background-color: ${globalStyles.backgroundColor};
            color: ${globalStyles.textColor};
            margin: 0;
            padding: 20px;
          }
          .preview-container {
            max-width: ${viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '100%'};
            margin: 0 auto;
            ${viewport !== 'desktop' ? 'border: 1px solid #e5e7eb; border-radius: 8px;' : ''}
          }
          h1, h2, h3, h4, h5, h6 { color: ${globalStyles.headingColor}; }
          a { color: ${globalStyles.linkColor}; }
          .btn { 
            background-color: ${globalStyles.primaryColor}; 
            border-radius: ${globalStyles.borderRadius};
            box-shadow: ${globalStyles.boxShadow};
          }
        </style>
      </head>
      <body>
        <div class="preview-container">
          <div id="preview-content"></div>
        </div>
        <script>
          const data = ${JSON.stringify(previewData)};
          // Render blocks here - this would need the actual rendering logic
          document.getElementById('preview-content').innerHTML = '<p>Preview content would be rendered here</p>';
        </script>
      </body>
      </html>
    `);
    previewWindow.document.close();
  }, [pages, currentPageId, globalStyles, viewport]);

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
        
        // Load global styles if they exist
        if (project.globalStyles) {
          setGlobalStyles(project.globalStyles);
        }
        
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

  const handleDragStart = useCallback((event) => {
    setDragPreview({
      id: event.active.id,
      type: event.active.data?.current?.fromSidebar ? 'new' : 'existing'
    });
  }, []);

  const handleDragOver = useCallback((event) => {
    const { active, over } = event;
    if (!active || !over) {
      setDragIndicator(null);
      return;
    }

    const activeElement = document.querySelector(`[data-id="${active.id}"]`);
    const overElement = document.querySelector(`[data-id="${over.id}"]`);
    
    if (overElement && over.id !== 'canvas') {
      const rect = overElement.getBoundingClientRect();
      const canvasRect = document.querySelector('[data-canvas="true"]')?.getBoundingClientRect();
      
      if (canvasRect) {
        const relativeY = event.delta?.y || 0;
        const insertAbove = relativeY < 0;
        
        setDragIndicator({
          y: insertAbove ? rect.top - canvasRect.top - 2 : rect.bottom - canvasRect.top + 2,
          blockId: over.id,
          position: insertAbove ? 'above' : 'below'
        });
      }
    } else {
      setDragIndicator(null);
    }
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setDragIndicator(null);
    setDragPreview(null);
    
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
        // Check if dropping into a container div
        if (over && over.id !== "canvas") {
          const targetBlock = prev.find(b => b.id === over.id);
          if (targetBlock && ['div', 'twocolumn', 'threecolumn'].includes(targetBlock.type)) {
            // Add to container's children
            const updatedBlocks = prev.map(block => {
              if (block.id === over.id) {
                return {
                  ...block,
                  children: [...(block.children || []), newBlock]
                };
              }
              return block;
            });
            return updatedBlocks;
          }
        }

        // Smart positioning based on drag indicator
        if (dragIndicator && over?.id !== "canvas") {
          const targetIndex = prev.findIndex(b => b.id === dragIndicator.blockId);
          if (targetIndex !== -1) {
            const insertIndex = dragIndicator.position === 'above' ? targetIndex : targetIndex + 1;
            const newBlocks = [...prev];
            newBlocks.splice(insertIndex, 0, newBlock);
            return newBlocks;
          }
        }

        // Default: add to end
        return [...prev, newBlock];
      });
      return;
    }

    // Reorder existing blocks with smart positioning
    if (active.id && over?.id && active.id !== over.id) {
      setBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id);
        if (oldIndex === -1) return prev;
        
        if (dragIndicator && over.id !== "canvas") {
          const targetIndex = prev.findIndex(b => b.id === dragIndicator.blockId);
          if (targetIndex !== -1) {
            const newBlocks = [...prev];
            const [movedBlock] = newBlocks.splice(oldIndex, 1);
            
            let insertIndex = dragIndicator.position === 'above' ? targetIndex : targetIndex + 1;
            if (oldIndex < targetIndex && dragIndicator.position === 'below') {
              insertIndex -= 1;
            } else if (oldIndex > targetIndex && dragIndicator.position === 'above') {
              // insertIndex stays the same
            }
            
            newBlocks.splice(insertIndex, 0, movedBlock);
            return newBlocks;
          }
        }
        
        // Fallback to simple reorder
        const newIndex = prev.findIndex((b) => b.id === over.id);
        if (newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, [dragIndicator]);

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

  // Export functionality
  const handleExport = useCallback(() => {
    const payload = JSON.stringify({ blocks, globalStyles, pages }, null, 2);
    navigator.clipboard.writeText(payload);
    alert('Project exported to clipboard!');
  }, [blocks, globalStyles, pages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <DndContext 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Sidebar />
        
        <Navbar
          pages={pages}
          currentPageId={currentPageId}
          history={history}
          historyIndex={historyIndex}
          blocks={blocks}
          globalStyles={globalStyles}
          viewport={viewport}
          previewMode={previewMode}
          onPageChange={(pageId) => {
            setCurrentPageId(pageId);
            const page = pages.find(p => p.id === pageId);
            setBlocks(page?.blocks || []);
            setSelectedBlockId(null);
          }}
          onSave={saveProject}
          onLoad={loadProject}
          onUndo={undo}
          onRedo={redo}
          onExport={handleExport}
          onPreview={openPreview}
          onPreviewModeToggle={() => setPreviewMode(!previewMode)}
          onViewportChange={setViewport}
          onShowTemplateModal={() => setShowTemplateModal(true)}
          onShowPageModal={() => setShowPageModal(true)}
          onShowDeletePageModal={() => setShowDeletePageModal(true)}
        />

      <DroppableCanvas hasInspector={!!selectedBlock && !previewMode} viewport={viewport} dragIndicator={dragIndicator}>
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

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="relative bg-gray-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Style Templates</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customize your website's global appearance</p>
                </div>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-8">
                {/* Quick Templates Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Templates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        name: "Modern Blue",
                        description: "Clean and professional",
                        colors: { primary: '#3B82F6', secondary: '#6B7280', background: '#ffffff', text: '#111827' },
                        font: 'Inter, sans-serif',
                        radius: '8px',
                        shadow: '0 1px 3px rgba(0,0,0,0.1)'
                      },
                      {
                        name: "Green Fresh",
                        description: "Nature-inspired design",
                        colors: { primary: '#10B981', secondary: '#6B7280', background: '#F9FAFB', text: '#111827' },
                        font: 'Poppins, sans-serif',
                        radius: '12px',
                        shadow: '0 4px 6px rgba(0,0,0,0.1)'
                      },
                      {
                        name: "Dark Purple",
                        description: "Elegant and bold",
                        colors: { primary: '#8B5CF6', secondary: '#6B7280', background: '#1F2937', text: '#F9FAFB' },
                        font: 'Montserrat, sans-serif',
                        radius: '6px',
                        shadow: '0 10px 15px rgba(0,0,0,0.3)'
                      },
                      {
                        name: "Minimal Orange",
                        description: "Simple and clean",
                        colors: { primary: '#F59E0B', secondary: '#6B7280', background: '#FFFFFF', text: '#111827' },
                        font: 'Roboto, sans-serif',
                        radius: '0px',
                        shadow: 'none'
                      }
                    ].map((template, index) => (
                      <button
                        key={index}
                        onClick={() => setGlobalStyles({
                          fontFamily: template.font,
                          primaryColor: template.colors.primary,
                          secondaryColor: template.colors.secondary,
                          backgroundColor: template.colors.background,
                          textColor: template.colors.text,
                          headingColor: template.colors.text,
                          linkColor: template.colors.primary,
                          borderRadius: template.radius,
                          boxShadow: template.shadow,
                        })}
                        className="group relative p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-200 hover:shadow-lg text-left"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: template.colors.primary }}>
                            <span className="text-white font-bold text-sm">A</span>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900 dark:text-white">{template.name}</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: template.colors.primary }}></div>
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: template.colors.secondary }}></div>
                          <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: template.colors.background }}></div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customization Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Customize Your Style</h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Font Family */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Font Family
                        </label>
                        <select
                          value={globalStyles.fontFamily}
                          onChange={(e) => setGlobalStyles({ ...globalStyles, fontFamily: e.target.value })}
                          className="w-full px-3 py-2.5 text-sm text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="Inter, sans-serif">Inter</option>
                          <option value="Roboto, sans-serif">Roboto</option>
                          <option value="Open Sans, sans-serif">Open Sans</option>
                          <option value="Lato, sans-serif">Lato</option>
                          <option value="Poppins, sans-serif">Poppins</option>
                          <option value="Montserrat, sans-serif">Montserrat</option>
                          <option value="Nunito, sans-serif">Nunito</option>
                          <option value="Source Sans Pro, sans-serif">Source Sans Pro</option>
                        </select>
                      </div>

                      {/* Border Radius */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Border Radius: {globalStyles.borderRadius}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="24"
                          value={parseInt(globalStyles.borderRadius)}
                          onChange={(e) => setGlobalStyles({ ...globalStyles, borderRadius: `${e.target.value}px` })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>0px</span>
                          <span>24px</span>
                        </div>
                      </div>

                      {/* Box Shadow */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Box Shadow
                        </label>
                        <select
                          value={globalStyles.boxShadow}
                          onChange={(e) => setGlobalStyles({ ...globalStyles, boxShadow: e.target.value })}
                          className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                        >
                          <option value="none">None</option>
                          <option value="0 1px 3px rgba(0,0,0,0.1)">Small</option>
                          <option value="0 4px 6px rgba(0,0,0,0.1)">Medium</option>
                          <option value="0 10px 15px rgba(0,0,0,0.1)">Large</option>
                          <option value="0 20px 25px rgba(0,0,0,0.1)">Extra Large</option>
                        </select>
                      </div>
                    </div>

                    {/* Right Column - Colors */}
                    <div className="space-y-6">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Color Palette</h5>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { key: 'primaryColor', label: 'Primary', color: globalStyles.primaryColor },
                          { key: 'secondaryColor', label: 'Secondary', color: globalStyles.secondaryColor },
                          { key: 'backgroundColor', label: 'Background', color: globalStyles.backgroundColor },
                          { key: 'textColor', label: 'Text', color: globalStyles.textColor },
                          { key: 'headingColor', label: 'Headings', color: globalStyles.headingColor },
                          { key: 'linkColor', label: 'Links', color: globalStyles.linkColor }
                        ].map((colorOption) => (
                          <div key={colorOption.key} className="space-y-2">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                              {colorOption.label}
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={colorOption.color}
                                onChange={(e) => setGlobalStyles({ ...globalStyles, [colorOption.key]: e.target.value })}
                                className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                              />
                              <input
                                type="text"
                                value={colorOption.color}
                                onChange={(e) => setGlobalStyles({ ...globalStyles, [colorOption.key]: e.target.value })}
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-gray-500 rounded-lg hover:bg-gray-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-6 py-2 text-sm font-medium text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                style={{ 
                  backgroundColor: globalStyles.primaryColor,
                  borderRadius: globalStyles.borderRadius,
                }}
              >
                Apply Styles
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* New Page Creation Modal */}
      {showPageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full ring-1 ring-gray-600">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-500/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Create New Page</h3>
                  <p className="text-sm text-gray-400">Add a new page to your website</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPageModal(false);
                  setNewPageName('');
                }}
                className="text-gray-400 hover:text-gray-200 transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="pageName" className="block text-sm font-medium text-gray-300 mb-2">
                  Page Name
                </label>
                <input
                  type="text"
                  id="pageName"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  className="w-full px-3 py-3 text-sm text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-600 transition-colors"
                  placeholder="Enter page name (e.g., About, Services, Contact)"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newPageName.trim()) {
                      const newPage = { id: generateUUID(), name: newPageName.trim(), blocks: [] };
                      const newPages = [...pages, newPage];
                      setPages(newPages);
                      setCurrentPageId(newPage.id);
                      setBlocks([]);
                      setSelectedBlockId(null);
                      saveToHistory(newPages);
                      setShowPageModal(false);
                      setNewPageName('');
                    }
                  }}
                />
              </div>
              
              <div className="text-xs text-gray-400 mb-4">
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Tips: Use descriptive names like "About Us", "Our Services", etc.</span>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700 bg-gray-800/50">
              <button
                onClick={() => {
                  setShowPageModal(false);
                  setNewPageName('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 hover:text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newPageName.trim()) return;
                  const newPage = { id: generateUUID(), name: newPageName.trim(), blocks: [] };
                  const newPages = [...pages, newPage];
                  setPages(newPages);
                  setCurrentPageId(newPage.id);
                  setBlocks([]);
                  setSelectedBlockId(null);
                  saveToHistory(newPages);
                  setShowPageModal(false);
                  setNewPageName('');
                }}
                disabled={!newPageName.trim()}
                className="px-6 py-2 text-sm font-medium text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: newPageName.trim() ? globalStyles.primaryColor : '#9CA3AF',
                  borderRadius: globalStyles.borderRadius,
                }}
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Page Confirmation Modal */}
      {showDeletePageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full ring-1 ring-red-500/20">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-red-500/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Remove Page</h3>
                  <p className="text-sm text-gray-400">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeletePageModal(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-300 mb-3">
                  Are you sure you want to remove the page <strong className="text-white">"{pages.find(p => p.id === currentPageId)?.name}"</strong>?
                </p>
                <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-300">Warning</p>
                      <p className="text-sm text-red-400 mt-1">
                        All blocks and content on this page will be permanently deleted.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700 bg-gray-800/50">
              <button
                onClick={() => setShowDeletePageModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 hover:text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pages.length <= 1) return;
                  
                  const updatedPages = pages.filter(p => p.id !== currentPageId);
                  const newCurrentPage = updatedPages[0];
                  
                  setPages(updatedPages);
                  setCurrentPageId(newCurrentPage.id);
                  setBlocks(newCurrentPage.blocks || []);
                  setSelectedBlockId(null);
                  saveToHistory(updatedPages);
                  setShowDeletePageModal(false);
                }}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 border border-transparent rounded-lg hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors shadow-lg"
              >
                Remove Page
              </button>
            </div>
          </div>
        </div>
      )}
      </DndContext>
    </div>
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
    case "productcard": return {
      title: "Product Name",
      price: "$99.99",
      image: "https://via.placeholder.com/300x200",
      description: "Amazing product description that highlights key features and benefits.",
      buttonText: "Add to Cart",
      buttonHref: "#",
      // Card styling
      cardBg: "#ffffff",
      cardRadius: "12px",
      cardShadow: "0 4px 12px rgba(0,0,0,0.1)",
      // Content styling
      titleColor: "#111827",
      titleSize: "20px",
      priceColor: "#059669",
      priceSize: "24px",
      descriptionColor: "#6B7280",
      descriptionSize: "14px",
      // Button styling
      buttonBg: "#3B82F6",
      buttonColor: "#ffffff",
      buttonRadius: "8px",
    };
    case "teamcard": return {
      name: "John Doe",
      role: "CEO & Founder",
      image: "https://via.placeholder.com/200x200",
      bio: "Experienced leader with 10+ years in the industry.",
      social: [
        { platform: "LinkedIn", href: "#" },
        { platform: "Twitter", href: "#" },
      ],
      // Card styling
      cardBg: "#ffffff",
      cardRadius: "12px",
      cardShadow: "0 4px 12px rgba(0,0,0,0.1)",
      // Content styling
      nameColor: "#111827",
      nameSize: "18px",
      roleColor: "#6B7280",
      roleSize: "14px",
      bioColor: "#4B5563",
      bioSize: "14px",
      // Social styling
      socialColor: "#6B7280",
      socialHover: "#3B82F6",
    };
    case "servicecard": return {
      title: "Service Name",
      description: "Comprehensive service description that explains what we offer and how it benefits customers.",
      icon: "⚙️",
      features: ["Feature 1", "Feature 2", "Feature 3"],
      buttonText: "Learn More",
      buttonHref: "#",
      // Card styling
      cardBg: "#ffffff",
      cardRadius: "12px",
      cardShadow: "0 4px 12px rgba(0,0,0,0.1)",
      // Content styling
      titleColor: "#111827",
      titleSize: "20px",
      descriptionColor: "#6B7280",
      descriptionSize: "14px",
      iconSize: "48px",
      // Button styling
      buttonBg: "#3B82F6",
      buttonColor: "#ffffff",
      buttonRadius: "8px",
    };
    case "testimonialcard": return {
      quote: "This service exceeded our expectations and delivered outstanding results.",
      author: "Jane Smith",
      role: "Marketing Director",
      company: "Acme Corp",
      image: "https://via.placeholder.com/80x80",
      rating: 5,
      // Card styling
      cardBg: "#ffffff",
      cardRadius: "12px",
      cardShadow: "0 4px 12px rgba(0,0,0,0.1)",
      // Content styling
      quoteColor: "#111827",
      quoteSize: "16px",
      authorColor: "#111827",
      authorSize: "16px",
      roleColor: "#6B7280",
      roleSize: "14px",
      // Rating styling
      ratingColor: "#F59E0B",
    };
    case "featurecard": return {
      title: "Feature Title",
      description: "Brief description of this amazing feature and its benefits.",
      icon: "✨",
      buttonText: "Learn More",
      buttonHref: "#",
      // Card styling
      cardBg: "#ffffff",
      cardRadius: "12px",
      cardShadow: "0 4px 12px rgba(0,0,0,0.1)",
      // Content styling
      titleColor: "#111827",
      titleSize: "18px",
      descriptionColor: "#6B7280",
      descriptionSize: "14px",
      iconSize: "40px",
      // Button styling
      buttonBg: "#3B82F6",
      buttonColor: "#ffffff",
      buttonRadius: "8px",
    };
    case "quote": return {
      text: "This is an inspiring quote that motivates and engages your audience.",
      author: "Famous Person",
      // Styling
      textColor: "#111827",
      textSize: "20px",
      authorColor: "#6B7280",
      authorSize: "16px",
      background: "#F9FAFB",
      borderLeft: "4px solid #3B82F6",
    };
    case "div": return {
      // Container styling
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "16px",
      minHeight: "100px",
      // Content
      content: "Drop elements here to group them together",
      contentColor: "#6B7280",
      contentSize: "14px",
    };
    case "twocolumn": return {
      // Layout styling
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "16px",
      minHeight: "100px",
      // Content
      leftContent: "Left column content",
      rightContent: "Right column content",
      contentColor: "#6B7280",
      contentSize: "14px",
    };
    case "threecolumn": return {
      // Layout styling
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "16px",
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "16px",
      minHeight: "100px",
      // Content
      leftContent: "Left column",
      centerContent: "Center column",
      rightContent: "Right column",
      contentColor: "#6B7280",
      contentSize: "14px",
    };
    case "spacer": return {
      // Spacer styling
      height: "40px",
      background: "transparent",
      border: "2px dashed #d1d5db",
      borderRadius: "4px",
      // Content
      content: "Spacer",
      contentColor: "#9ca3af",
      contentSize: "12px",
    };
    case "mainnavbar": return {
      // Main navbar content
      brand: "Phinix",
      links: [
        { text: "Home", href: "#" },
        { text: "About", href: "#" },
        { text: "Services", href: "#" },
        { text: "Contact", href: "#" }
      ],
      ctaText: "Get Started",
      ctaHref: "#",
      // Styling
      backgroundColor: "#ffffff",
      textColor: "#111827",
      linkHover: "#3B82F6",
      sticky: true,
      height: "64px",
      paddingX: "16px",
    };
    default: return "";
  }
}