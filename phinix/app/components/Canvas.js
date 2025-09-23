"use client";

import { useState, useEffect, useCallback } from "react";
import { DndContext, useDroppable, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import Sidebar from "./Sidebar";
import CMSBlock from "./CMSBlock";
import SortableBlock from "./SortableBlock";
import InspectorPanel from "./InspectorPanel";

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

function DroppableCanvas({ children, hasInspector, viewport }) {
  const { setNodeRef } = useDroppable({ id: "canvas" });
  
  const getViewportStyles = () => {
    const baseStyles = {
      paddingLeft: "300px",
      paddingRight: hasInspector ? "360px" : "60px",
      paddingTop: "140px", // Adjusted for single enhanced navbar
      minHeight: "100vh",
      position: "relative",
      transition: "all 0.3s ease-in-out",
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
      className={`${viewport !== 'desktop' ? 'border border-gray-600 rounded-lg mx-auto my-4' : ''}`}
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
  const [viewport, setViewport] = useState('desktop');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
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

        // Normal drop behavior
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

  // Export functionality
  const handleExport = useCallback(() => {
    const payload = JSON.stringify({ blocks, globalStyles, pages }, null, 2);
    navigator.clipboard.writeText(payload);
    alert('Project exported to clipboard!');
  }, [blocks, globalStyles, pages]);

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <Sidebar />
      
      {/* Enhanced CMS Navbar */}
      <nav className="fixed top-0 left-64 right-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Left Section - Brand & Page Management */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">Phinix CMS</span>
              </div>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              {/* Page Management */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Page:</label>
                  <select
                    value={currentPageId || ''}
                    onChange={(e) => {
                      const pid = e.target.value;
                      setCurrentPageId(pid);
                      const page = pages.find(p=>p.id===pid);
                      setBlocks(page?.blocks || []);
                      setSelectedBlockId(null);
                    }}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-1.5 min-w-[140px]"
                  >
                    {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                
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
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Page
                </button>
              </div>
            </div>

            {/* Center Section - Main Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={saveProject}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Save
              </button>
              
              <button
                onClick={loadProject}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Load
              </button>

              <button
                onClick={() => setShowTemplateModal(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
                Templates
              </button>

              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
            </div>

            {/* Right Section - View Controls & Actions */}
            <div className="flex items-center space-x-4">
              {/* Responsive View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewport('mobile')}
                  className={`p-2 rounded-md transition-colors ${
                    viewport === 'mobile' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Mobile View"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.666.804 4.329A1 1 0 0113 18H7a1 1 0 01-.707-1.005l.804-4.329L7.22 15H5a2 2 0 01-2-2V5zm5.5 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewport('tablet')}
                  className={`p-2 rounded-md transition-colors ${
                    viewport === 'tablet' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Tablet View"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h10V5H5z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewport('desktop')}
                  className={`p-2 rounded-md transition-colors ${
                    viewport === 'desktop' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Desktop View"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h10V5H5z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="h-6 w-px bg-gray-300"></div>

              {/* Preview & Edit Mode */}
              <button
                onClick={openPreview}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>
              
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors ${
                  previewMode 
                    ? 'text-orange-700 bg-orange-100 border border-orange-300 hover:bg-orange-200 focus:ring-orange-500' 
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-blue-500'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {previewMode ? 'Edit Mode' : 'Design Mode'}
              </button>

              {/* Block Counter */}
              <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {blocks.length} blocks
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Toolbar */}
          <div className="flex items-center justify-between py-2 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Undo
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10h7a8 8 0 018 8v2M13 10l-6 6m6-6l-6-6" />
                </svg>
                Redo
              </button>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Ctrl+Z to undo</span>
              <span>•</span>
              <span>Ctrl+Y to redo</span>
              <span>•</span>
              <span>Ctrl+S to save</span>
            </div>
          </div>
        </div>
      </nav>

      <DroppableCanvas hasInspector={!!selectedBlock && !previewMode} viewport={viewport}>
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
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
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
                          className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
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
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-500"
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
