"use client";

import { useState } from "react";

export default function MainNavbar({ globalStyles, onUpdateGlobalStyles }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav 
      className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50"
      style={{
        fontFamily: globalStyles.fontFamily,
        backgroundColor: globalStyles.backgroundColor,
        color: globalStyles.textColor,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
  );
}
