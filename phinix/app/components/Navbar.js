"use client";

export default function Navbar({
  pages,
  currentPageId,
  history,
  historyIndex,
  blocks,
  globalStyles,
  viewport,
  previewMode,
  onPageChange,
  onSave,
  onLoad,
  onUndo,
  onRedo,
  onExport,
  onPreview,
  onPreviewModeToggle,
  onViewportChange,
  onShowTemplateModal,
  onShowPageModal,
  onShowDeletePageModal
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 shadow-2xl" style={{ fontFamily: globalStyles.fontFamily }}>
      <div className="w-full px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Section - Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base">P</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-bold text-white">Phinix CMS</div>
                <div className="text-xs text-gray-400 -mt-0.5">Website Builder</div>
              </div>
            </div>
          </div>

          {/* Center Section - Main Controls */}
          <div className="flex items-center space-x-6">
            
            {/* Page Management */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-800/80 rounded-lg px-3 py-2 border border-gray-700/50">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <select
                  value={currentPageId || ''}
                  onChange={(e) => onPageChange(e.target.value)}
                  className="bg-transparent border-none text-white text-sm focus:ring-0 focus:outline-none min-w-[120px] font-medium"
                >
                  {pages.map(p => <option key={p.id} value={p.id} className="bg-gray-800 text-white">{p.name}</option>)}
                </select>
                <div className="text-xs text-gray-400 px-2 border-l border-gray-600">
                  {pages.length}
                </div>
              </div>
              
              <button
                onClick={onShowPageModal}
                className="flex items-center justify-center w-8 h-8 text-blue-400 hover:text-blue-300 bg-gray-800/80 hover:bg-gray-700 border border-gray-700/50 hover:border-blue-500/50 rounded-lg transition-all duration-200"
                title="Create New Page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              
              {pages.length > 1 && (
                <button
                  onClick={onShowDeletePageModal}
                  className="flex items-center justify-center w-8 h-8 text-red-400 hover:text-red-300 bg-gray-800/80 hover:bg-red-900/20 border border-gray-700/50 hover:border-red-500/50 rounded-lg transition-all duration-200"
                  title="Remove Current Page"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

            <div className="h-6 w-px bg-gray-600"></div>

            {/* History Controls */}
            <div className="flex items-center space-x-1 bg-gray-800/80 rounded-lg p-1 border border-gray-700/50">
              <button
                onClick={onUndo}
                disabled={historyIndex <= 0}
                className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ${
                  historyIndex <= 0 
                    ? 'text-gray-600 cursor-not-allowed' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                title={`Undo (${historyIndex} available)`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              <button
                onClick={onRedo}
                disabled={historyIndex >= history.length - 1}
                className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ${
                  historyIndex >= history.length - 1
                    ? 'text-gray-600 cursor-not-allowed' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                title={`Redo (${history.length - historyIndex - 1} available)`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>

            <div className="h-6 w-px bg-gray-600"></div>

            {/* Viewport Controls */}
            <div className="flex items-center space-x-1 bg-gray-800/80 rounded-lg p-1 border border-gray-700/50">
              <button
                onClick={() => onViewportChange('mobile')}
                className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ${
                  viewport === 'mobile' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
                title="Mobile View"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.666.804 4.329A1 1 0 0113 18H7a1 1 0 01-.707-1.005l.804-4.329L7.22 15H5a2 2 0 01-2-2V5zm5.5 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => onViewportChange('tablet')}
                className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ${
                  viewport === 'tablet' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
                title="Tablet View"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h10V5H5z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => onViewportChange('desktop')}
                className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ${
                  viewport === 'desktop' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
                title="Desktop View"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h10V5H5z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="h-6 w-px bg-gray-600"></div>

            {/* Action Buttons Group */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onSave}
                className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200 shadow-sm"
                title="Save Project"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Save
              </button>

              <div className="flex items-center space-x-1 bg-gray-800/80 rounded-lg p-1 border border-gray-700/50">
                <button
                  onClick={onLoad}
                  className="flex items-center justify-center px-2 py-1.5 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-all duration-200"
                  title="Load Project"
                >
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Load
                </button>
                <button
                  onClick={onShowTemplateModal}
                  className="flex items-center justify-center px-2 py-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 hover:bg-gray-700 rounded-md transition-all duration-200"
                  title="Templates"
                >
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                  Styles
                </button>
                <button
                  onClick={onExport}
                  className="flex items-center justify-center px-2 py-1.5 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-all duration-200"
                  title="Export"
                >
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Right Section - Preview & Stats */}
          <div className="flex items-center space-x-4">
            {/* Preview Control - Single Button */}
            <button
              onClick={onPreviewModeToggle}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm ${
                previewMode 
                  ? 'text-white bg-orange-600 hover:bg-orange-700 border border-orange-500' 
                  : 'text-gray-300 bg-gray-800/80 hover:bg-gray-700 hover:text-white border border-gray-700/50'
              }`}
              title={previewMode ? 'Exit Preview Mode' : 'Enter Preview Mode'}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {previewMode ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                )}
              </svg>
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>

            {/* Stats Display */}
            <div className="flex items-center space-x-4 px-3 py-2 bg-gray-800/80 border border-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="font-medium text-white">{blocks.length}</span>
                <span className="text-gray-400">{blocks.length === 1 ? 'block' : 'blocks'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}