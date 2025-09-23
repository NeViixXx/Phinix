"use client";

import { useState } from "react";

export default function MainNavbar({ globalStyles, onUpdateGlobalStyles, onTemplateClick, onExportClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  return (
    <>
      <nav 
        className="w-full bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50"
        style={{
          fontFamily: globalStyles.fontFamily,
          backgroundColor: globalStyles.backgroundColor,
          color: globalStyles.textColor,
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: globalStyles.primaryColor }}
              >
                P
              </div>
              <span className="ml-2 text-xl font-bold" style={{ color: globalStyles.headingColor }}>
                Phinix
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a
                  href="#"
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100"
                  style={{ color: globalStyles.textColor }}
                >
                  Home
                </a>
                <a
                  href="#"
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100"
                  style={{ color: globalStyles.textColor }}
                >
                  About
                </a>
                <a
                  href="#"
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100"
                  style={{ color: globalStyles.textColor }}
                >
                  Services
                </a>
                <a
                  href="#"
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100"
                  style={{ color: globalStyles.textColor }}
                >
                  Contact
                </a>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center space-x-4">
              {/* Template Button */}
              <button
                onClick={() => setShowTemplateModal(true)}
                className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors flex items-center gap-2"
                style={{ 
                  backgroundColor: globalStyles.primaryColor,
                  borderRadius: globalStyles.borderRadius,
                  boxShadow: globalStyles.boxShadow,
                }}
              >
                <span>🎨</span>
                Templates
              </button>

              {/* Export Button */}
              <button
                onClick={onExportClick}
                className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors flex items-center gap-2"
                style={{ 
                  backgroundColor: '#10B981',
                  borderRadius: globalStyles.borderRadius,
                  boxShadow: globalStyles.boxShadow,
                }}
              >
                <span>📤</span>
                Export
              </button>

              {/* CTA Button */}
              <div className="hidden md:block">
                <button
                  className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors"
                  style={{ 
                    backgroundColor: globalStyles.primaryColor,
                    borderRadius: globalStyles.borderRadius,
                    boxShadow: globalStyles.boxShadow,
                  }}
                >
                  Get Started
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {!isOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
              <a
                href="#"
                className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                style={{ color: globalStyles.textColor }}
              >
                Home
              </a>
              <a
                href="#"
                className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                style={{ color: globalStyles.textColor }}
              >
                About
              </a>
              <a
                href="#"
                className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                style={{ color: globalStyles.textColor }}
              >
                Services
              </a>
              <a
                href="#"
                className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                style={{ color: globalStyles.textColor }}
              >
                Contact
              </a>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white transition-colors"
                style={{ 
                  backgroundColor: globalStyles.primaryColor,
                  borderRadius: globalStyles.borderRadius,
                }}
              >
                🎨 Templates
              </button>
              <button
                onClick={onExportClick}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white transition-colors"
                style={{ 
                  backgroundColor: '#10B981',
                  borderRadius: globalStyles.borderRadius,
                }}
              >
                📤 Export
              </button>
              <button
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white transition-colors"
                style={{ 
                  backgroundColor: globalStyles.primaryColor,
                  borderRadius: globalStyles.borderRadius,
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Enhanced Template Modal with Flowbite Design */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
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
                        onClick={() => onUpdateGlobalStyles({
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
                        className="group relative p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg text-left"
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
                          onChange={(e) => onUpdateGlobalStyles({ ...globalStyles, fontFamily: e.target.value })}
                          className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                          onChange={(e) => onUpdateGlobalStyles({ ...globalStyles, borderRadius: `${e.target.value}px` })}
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
                          onChange={(e) => onUpdateGlobalStyles({ ...globalStyles, boxShadow: e.target.value })}
                          className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                                onChange={(e) => onUpdateGlobalStyles({ ...globalStyles, [colorOption.key]: e.target.value })}
                                className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                              />
                              <input
                                type="text"
                                value={colorOption.color}
                                onChange={(e) => onUpdateGlobalStyles({ ...globalStyles, [colorOption.key]: e.target.value })}
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-6 py-2 text-sm font-medium text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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
    </>
  );
}
