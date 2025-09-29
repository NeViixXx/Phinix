"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FaEdit, FaClone, FaTrash } from "react-icons/fa";
import { FaGripVertical } from "react-icons/fa6";

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


export default function CMSBlock({ block, onUpdate, onDelete, onDuplicate, onSelect, isSelected, dragHandleProps, previewMode = false }) {
  const [mounted, setMounted] = useState(false);
  const [liveBlock, setLiveBlock] = useState(block);
  const [viewport, setViewport] = useState('lg');
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const blockRef = useRef(null);
  const resizeStartRef = useRef({ x: 0, width: 0 });

  // Only render on client to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLiveBlock(block);
  }, [block]);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setViewport(w < 768 ? 'base' : w < 1024 ? 'md' : 'lg');
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Resize functionality
  const handleResizeStart = useCallback((e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    
    const rect = blockRef.current.getBoundingClientRect();
    resizeStartRef.current = {
      x: e.clientX,
      width: rect.width
    };
  }, []);

  const handleResizeMove = useCallback((e) => {
    if (!isResizing || !resizeDirection) return;
    
    const deltaX = e.clientX - resizeStartRef.current.x;
    const newWidth = resizeStartRef.current.width + (resizeDirection === 'right' ? deltaX : -deltaX);
    
    // Minimum width constraint
    const minWidth = 100;
    const constrainedWidth = Math.max(minWidth, newWidth);
    
    handleChange('width', `${constrainedWidth}px`);
  }, [isResizing, resizeDirection]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizeDirection(null);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  if (!mounted) return null; // Prevent SSR hydration mismatch

  const handleChange = (field, value) => {
    const updatedBlock = { ...liveBlock, [field]: value };
    setLiveBlock(updatedBlock);
    onUpdate && onUpdate(updatedBlock);
  };

  // Compute responsive style overrides
  const responsive = liveBlock.responsive || {};
  const bpStyle = { ...(responsive.base || {}), ...(viewport === 'md' ? responsive.md || {} : {}), ...(viewport === 'lg' ? { ...(responsive.md || {}), ...(responsive.lg || {}) } : {}) };

  return (
    <div className="group relative">
      {/* Modern Block Container */}
      <div
        ref={blockRef}
        className={`relative w-full transition-all duration-300 ease-out transform ${
          previewMode 
            ? "bg-white/5 backdrop-blur-sm rounded-xl border border-gray-700/30" 
            : isSelected 
              ? "ring-2 ring-blue-500/50 ring-offset-2 ring-offset-slate-900 bg-white/10 backdrop-blur-sm rounded-xl border border-blue-500/30 shadow-2xl shadow-blue-500/10 scale-[1.02]" 
              : "bg-white/5 backdrop-blur-sm rounded-xl border border-gray-700/30 hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/5 hover:bg-white/10"
        } ${isResizing ? 'select-none' : ''}`}
        style={{
          margin: bpStyle.margin ?? liveBlock.margin,
          padding: bpStyle.padding ?? liveBlock.padding,
          width: bpStyle.width ?? (liveBlock.width || "100%"),
          height: bpStyle.height ?? liveBlock.height,
          display: bpStyle.display ?? (liveBlock.display || "block"),
          justifyContent: bpStyle.justifyContent ?? liveBlock.justifyContent,
          alignItems: bpStyle.alignItems ?? liveBlock.alignItems,
          gap: bpStyle.gap ?? liveBlock.gap,
          background: previewMode ? liveBlock.background : `linear-gradient(135deg, ${liveBlock.background || 'rgba(255,255,255,0.05)'}, ${liveBlock.background || 'rgba(255,255,255,0.02)'})`,
          border: liveBlock.border,
          borderRadius: liveBlock.borderRadius || '12px',
          boxShadow: previewMode ? liveBlock.boxShadow : `${liveBlock.boxShadow || ''}, 0 8px 32px rgba(0,0,0,0.1)`,
          opacity: liveBlock.opacity,
          overflow: liveBlock.overflow,
          textAlign: bpStyle.textAlign ?? liveBlock.textAlign,
          fontSize: bpStyle.fontSize ?? liveBlock.fontSize,
          fontWeight: liveBlock.fontWeight,
          fontStyle: liveBlock.fontStyle,
          textDecoration: liveBlock.textDecoration,
          letterSpacing: liveBlock.letterSpacing,
          lineHeight: liveBlock.lineHeight,
          color: liveBlock.color,
          backdropFilter: 'blur(12px) saturate(180%)',
          filter: liveBlock.filter,
          transform: liveBlock.transform,
          transition: isResizing ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={previewMode ? undefined : (e) => { e.stopPropagation(); onSelect && onSelect(); }}
      >
        
        {/* Modern Block Controls */}
        {!previewMode && (
          <div className={`absolute -top-3 right-2 flex items-center space-x-1 transition-all duration-200 ${
            isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'
          }`}>
            {/* Drag Handle */}
            <button
              {...dragHandleProps}
              className="w-8 h-8 bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200 cursor-move shadow-lg hover:shadow-xl"
              title="Drag to reorder"
            >
              <FaGripVertical className="w-3 h-3" />
            </button>
            
            {/* Edit Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onSelect && onSelect(); }}
              className="w-8 h-8 bg-blue-600/90 backdrop-blur-sm border border-blue-500/50 rounded-lg flex items-center justify-center text-white hover:bg-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
              title="Edit block"
            >
              <FaEdit className="w-3 h-3" />
            </button>
            
            {/* Duplicate Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate && onDuplicate(); }}
              className="w-8 h-8 bg-green-600/90 backdrop-blur-sm border border-green-500/50 rounded-lg flex items-center justify-center text-white hover:bg-green-500 transition-all duration-200 shadow-lg hover:shadow-xl"
              title="Duplicate block"
            >
              <FaClone className="w-3 h-3" />
            </button>
            
            {/* Delete Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete && onDelete(); }}
              className="w-8 h-8 bg-red-600/90 backdrop-blur-sm border border-red-500/50 rounded-lg flex items-center justify-center text-white hover:bg-red-500 transition-all duration-200 shadow-lg hover:shadow-xl"
              title="Delete block"
            >
              <FaTrash className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Block Type Badge */}
        {!previewMode && (
          <div className={`absolute -top-3 left-2 transition-all duration-200 ${
            isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'
          }`}>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white border border-blue-500/50 backdrop-blur-sm shadow-lg">
              {liveBlock.type.charAt(0).toUpperCase() + liveBlock.type.slice(1)}
            </span>
          </div>
        )}

      {/* Live content */}
      {["heading", "paragraph", "button"].includes(liveBlock.type) && (
        <div className="p-4 bg-gray-700 rounded-xl border border-gray-600 shadow-lg">
          {liveBlock.type === "heading" && <h2 className="text-white font-bold text-xl md:text-2xl">{liveBlock.content}</h2>}
          {liveBlock.type === "paragraph" && <p className="text-gray-300 leading-relaxed">{liveBlock.content}</p>}
          {liveBlock.type === "button" && <button className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition-all duration-200 font-medium">{liveBlock.content}</button>}
        </div>
      )}
      {liveBlock.type === "image" && (
        <div className="p-4 bg-gray-700 rounded-xl border border-gray-600 shadow-lg">
          <img src={liveBlock.content} alt="" className="max-w-full rounded-lg transition-all duration-300 ease-in-out" />
        </div>
      )}
      {liveBlock.type === "video" && (
        <div className="p-4 bg-gray-700 rounded-xl border border-gray-600 shadow-lg">
          <video src={liveBlock.content} controls className="max-w-full rounded-lg transition-all duration-300 ease-in-out" />
        </div>
      )}
      {liveBlock.type === "gallery" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 bg-gray-700 rounded-xl border border-gray-600 shadow-lg transition-all duration-300 ease-in-out">
          {Array.isArray(liveBlock.content) && liveBlock.content.map((img, i) => (
            <img key={i} src={img} alt="" className="w-full h-24 object-cover rounded-lg border border-gray-600 hover:opacity-90 transition-all duration-300 ease-in-out" />
          ))}
        </div>
      )}
      {liveBlock.type === "card" && (
        <div className="w-full overflow-hidden bg-gray-700 rounded-xl border border-gray-600 shadow-lg" style={{ borderRadius: liveBlock.content?.cardRadius, boxShadow: liveBlock.content?.cardShadow }}>
          {liveBlock.content?.image && (
            <img src={liveBlock.content.image} alt="" className="w-full" style={{ height: liveBlock.content?.imageHeight || 'auto', objectFit: liveBlock.content?.imageFit || 'cover', borderTopLeftRadius: liveBlock.content?.imageRadius, borderTopRightRadius: liveBlock.content?.imageRadius }} />
          )}
          <div className="p-6" style={{ textAlign: liveBlock.content?.align || 'left' }}>
            {liveBlock.content?.heading && (
              <h3 className="font-bold mb-3 text-white" style={{ fontSize: liveBlock.content?.headingFontSize }}>{liveBlock.content.heading}</h3>
            )}
            {liveBlock.content?.text && (
              <p className="mb-4 text-gray-300" style={{ fontSize: liveBlock.content?.textFontSize }}>{liveBlock.content.text}</p>
            )}
            {liveBlock.content?.buttonLabel && (
              <a href={liveBlock.content?.buttonHref || "#"} className="inline-block px-5 py-2.5 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition-all duration-200 font-medium">
                {liveBlock.content.buttonLabel}
              </a>
            )}
          </div>
        </div>
      )}
      {liveBlock.type === "hero" && (
        <div className="w-full bg-gray-700 border border-gray-600 rounded-xl overflow-hidden shadow-lg" style={{ height: liveBlock.content?.height }}>
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-16">
            {liveBlock.content?.title && (
              <h1 className="text-4xl font-bold mb-4 text-white" style={{ fontSize: liveBlock.content?.titleSize }}>{liveBlock.content.title}</h1>
            )}
            {liveBlock.content?.subtitle && (
              <p className="mb-8 max-w-2xl mx-auto text-gray-200" style={{ fontSize: liveBlock.content?.subtitleSize }}>{liveBlock.content.subtitle}</p>
            )}
            {liveBlock.content?.buttonText && (
              <a href={liveBlock.content?.buttonHref || "#"} className="inline-block px-8 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition-all duration-200 font-semibold">
                {liveBlock.content.buttonText}
              </a>
            )}
          </div>
        </div>
      )}
      {liveBlock.type === "navbar" && (
        <nav className="w-full bg-gray-700 border-b border-gray-600 shadow-md z-50" style={{ position: liveBlock.content?.sticky ? 'sticky' : 'relative', top: 0 }}>
          <div className="max-w-7xl mx-auto" style={{ paddingLeft: liveBlock.content?.paddingX, paddingRight: liveBlock.content?.paddingX, height: liveBlock.content?.height }}>
            <div className="flex justify-between items-center h-full">
              <div className="flex-shrink-0">
                <span className="font-bold text-white text-xl">{liveBlock.content?.brand || "Brand"}</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-6">
                  {liveBlock.content?.links?.map((link, index) => (
                    <a key={index} href={link.href} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-200 hover:text-white hover:bg-gray-600 transition-all duration-200">
                      {link.text}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}
      {liveBlock.type === "footer" && (
        <footer className="w-full bg-gray-700 border-t border-gray-600 rounded-b-xl shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: liveBlock.content?.paddingY, paddingBottom: liveBlock.content?.paddingY }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
                <ul className="space-y-2">
                  {liveBlock.content?.links?.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-gray-300 hover:text-white transition-all duration-200">
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Follow Us</h3>
                <div className="flex space-x-4">
                  {liveBlock.content?.social?.map((social, index) => (
                    <a key={index} href={social.href} className="text-gray-300 hover:text-white transition-all duration-200">
                      {social.platform}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-gray-300">{liveBlock.content?.copyright || "© 2024 MyBrand"}</p>
              </div>
            </div>
          </div>
        </footer>
      )}
      {liveBlock.type === "section" && (
        <section className="w-full bg-gray-700 border border-gray-600 rounded-xl overflow-hidden shadow-lg p-6 md:p-8" style={{ padding: liveBlock.content?.padding }}>
          <div className="max-w-7xl mx-auto flex flex-col gap-4" style={{ textAlign: liveBlock.content?.align || 'left' }}>
            {liveBlock.content?.title && (
              <h2 className="text-2xl font-bold mb-2 text-white" style={{ fontSize: liveBlock.content?.titleSize }}>{liveBlock.content.title}</h2>
            )}
            {liveBlock.content?.subtitle && (
              <p className="mb-4 text-gray-300" style={{ fontSize: liveBlock.content?.subtitleSize }}>{liveBlock.content.subtitle}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Content placeholder for child elements */}
              <div className="bg-gray-600/30 rounded-lg border border-gray-500 p-4 min-h-[100px] flex items-center justify-center">
                <p className="text-gray-400">Drop content blocks here</p>
              </div>
            </div>
            {liveBlock.content?.content && (
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">{liveBlock.content.content}</p>
            )}
          </div>
        </section>
      )}
      {liveBlock.type === "grid" && (
        <div className="p-4 bg-gray-700 rounded-xl border border-gray-600 shadow-lg">
          <div
            className="w-full"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${(liveBlock.content?.columns && (liveBlock.content.columns[viewport] || liveBlock.content.columns.base)) || 1}, minmax(0, 1fr))`,
              gap: (liveBlock.content?.gap && (liveBlock.content.gap[viewport] || liveBlock.content.gap.base)) || '16px',
            }}
          >
            {(liveBlock.content?.items || []).length > 0 ? (
              (liveBlock.content?.items || []).map((item, idx) => (
                <div key={idx} className="min-w-0">
                  {/* Simple inner renderer for cards; future: recursive blocks */}
                  {item.type === 'card' && (
                    <div className="bg-gray-700 rounded-xl border border-gray-600 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                      {item.content?.image && <img src={item.content.image} alt="" className="w-full h-auto object-cover" />}
                      <div className="p-6">
                        {item.content?.heading && <h3 className="text-xl font-bold mb-3 text-white">{item.content.heading}</h3>}
                        {item.content?.text && <p className="text-base text-gray-300 mb-4">{item.content.text}</p>}
                        {item.content?.buttonLabel && <a href={item.content?.buttonHref || '#'} className="inline-block px-5 py-2.5 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-500 transition-all duration-200">{item.content.buttonLabel}</a>}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <>
                <div className="bg-gray-600/30 rounded-lg border border-gray-500 p-4 min-h-[100px] flex items-center justify-center">
                  <p className="text-gray-400">Grid item 1</p>
                </div>
                <div className="bg-gray-600/30 rounded-lg border border-gray-500 p-4 min-h-[100px] flex items-center justify-center">
                  <p className="text-gray-400">Grid item 2</p>
                </div>
                <div className="bg-gray-600/30 rounded-lg border border-gray-500 p-4 min-h-[100px] flex items-center justify-center">
                  <p className="text-gray-400">Grid item 3</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {liveBlock.type === "testimonial" && (
        <div className="w-full bg-gray-700 border border-gray-600 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col items-center text-center">
            {liveBlock.content?.avatar && <img src={liveBlock.content.avatar} alt="" className="w-20 h-20 rounded-full mb-4 border-2 border-gray-600" />}
            <p className="text-gray-300 mb-4 italic">{liveBlock.content?.quote || "This is a testimonial quote."}</p>
            <p className="font-bold text-white">{liveBlock.content?.name || "John Doe"}</p>
            <p className="text-gray-400 text-sm">{liveBlock.content?.title || "CEO, Company"}</p>
          </div>
        </div>
      )}
      {liveBlock.type === "pricing" && (
        <div className="w-full bg-gray-700 border border-gray-600 rounded-xl overflow-hidden shadow-lg">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2 text-white">{liveBlock.content?.title || "Basic Plan"}</h3>
            <div className="text-3xl font-bold mb-4 text-white">{liveBlock.content?.price || "$19"}<span className="text-sm font-normal text-gray-400">{liveBlock.content?.period || "/month"}</span></div>
            <ul className="mb-6 space-y-2">
              {(liveBlock.content?.features || ["Feature 1", "Feature 2", "Feature 3"]).map((feature, idx) => (
                <li key={idx} className="flex items-center text-gray-300">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-all duration-200">{liveBlock.content?.buttonText || "Get Started"}</button>
          </div>
        </div>
      )}
      {liveBlock.type === "featurelist" && (
        <div className="w-full bg-gray-700 border border-gray-600 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-white">{liveBlock.content?.title || "Features"}</h3>
          <ul className="space-y-3">
            {(liveBlock.content?.features || ["Feature 1", "Feature 2", "Feature 3"]).map((feature, idx) => (
              <li key={idx} className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {liveBlock.type === "productcard" && (
        <div className="w-full bg-gray-700 border border-gray-600 rounded-xl overflow-hidden shadow-lg">
          {liveBlock.content?.image && <img src={liveBlock.content.image} alt="" className="w-full h-48 object-cover" />}
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2 text-white">{liveBlock.content?.name || "Product Name"}</h3>
            <p className="text-gray-300 mb-3">{liveBlock.content?.description || "Product description goes here."}</p>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-white">{liveBlock.content?.price || "$99.99"}</span>
              <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-all duration-200">{liveBlock.content?.buttonText || "Add to Cart"}</button>
            </div>
          </div>
        </div>
      )}
      {liveBlock.type === "teamcard" && (
        <div className="w-full max-w-sm mx-auto text-center bg-gray-700 border border-gray-600 rounded-xl shadow-lg" style={{ borderRadius: liveBlock.content?.cardRadius, boxShadow: liveBlock.content?.cardShadow }}>
          <div className="p-6">
            {liveBlock.content?.image && (
              <img src={liveBlock.content.image} alt="" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-gray-600" />
            )}
            <h3 className="font-semibold mb-1 text-white" style={{ fontSize: liveBlock.content?.nameSize }}>{liveBlock.content?.name}</h3>
            <p className="mb-2 text-gray-300" style={{ fontSize: liveBlock.content?.roleSize }}>{liveBlock.content?.role}</p>
            <p className="mb-4 text-gray-400" style={{ fontSize: liveBlock.content?.bioSize }}>{liveBlock.content?.bio}</p>
            <div className="flex justify-center space-x-4">
              {(liveBlock.content?.social || []).map((social, i) => (
                <a key={i} href={social.href} className="text-gray-300 hover:text-white transition-all duration-200">
                  {social.platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
      {liveBlock.type === "servicecard" && (
        <div className="w-full max-w-sm mx-auto text-center bg-gray-700 border border-gray-600 rounded-xl shadow-lg" style={{ borderRadius: liveBlock.content?.cardRadius, boxShadow: liveBlock.content?.cardShadow }}>
          <div className="p-6">
            <div className="text-4xl mb-4 text-white" style={{ fontSize: liveBlock.content?.iconSize }}>{liveBlock.content?.icon}</div>
            <h3 className="font-semibold mb-2 text-white" style={{ fontSize: liveBlock.content?.titleSize }}>{liveBlock.content?.title}</h3>
            <p className="mb-4 text-gray-300" style={{ fontSize: liveBlock.content?.descriptionSize }}>{liveBlock.content?.description}</p>
            <ul className="text-left mb-4 space-y-1">
              {(liveBlock.content?.features || []).map((feature, i) => (
                <li key={i} className="text-sm text-gray-300">• {feature}</li>
              ))}
            </ul>
            {liveBlock.content?.buttonText && (
              <a href={liveBlock.content?.buttonHref || "#"} className="inline-block px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition-all duration-200 font-medium">
                {liveBlock.content.buttonText}
              </a>
            )}
          </div>
        </div>
      )}
      {liveBlock.type === "testimonialcard" && (
        <div className="w-full max-w-md mx-auto bg-gray-700 border border-gray-600 rounded-xl shadow-lg" style={{ borderRadius: liveBlock.content?.cardRadius, boxShadow: liveBlock.content?.cardShadow }}>
          <div className="p-6">
            <div className="flex items-center mb-4">
              {liveBlock.content?.image && (
                <img src={liveBlock.content.image} alt="" className="w-12 h-12 rounded-full mr-3 object-cover border border-gray-600" />
              )}
              <div>
                <div className="font-semibold text-white" style={{ fontSize: liveBlock.content?.authorSize }}>{liveBlock.content?.author}</div>
                <div className="text-sm text-gray-400" style={{ fontSize: liveBlock.content?.roleSize }}>{liveBlock.content?.role}, {liveBlock.content?.company}</div>
              </div>
            </div>
            <div className="flex mb-3">
              {[...Array(liveBlock.content?.rating || 5)].map((_, i) => (
                <span key={i} className="text-yellow-500">⭐</span>
              ))}
            </div>
            <blockquote className="italic text-gray-300" style={{ fontSize: liveBlock.content?.quoteSize }}>"{liveBlock.content?.quote}"</blockquote>
          </div>
        </div>
      )}
      {liveBlock.type === "featurecard" && (
        <div className="w-full max-w-sm mx-auto text-center bg-gray-700 border border-gray-600 rounded-xl shadow-lg" style={{ borderRadius: liveBlock.content?.cardRadius, boxShadow: liveBlock.content?.cardShadow }}>
          <div className="p-6">
            <div className="text-3xl mb-4 text-white" style={{ fontSize: liveBlock.content?.iconSize }}>{liveBlock.content?.icon}</div>
            <h3 className="font-semibold mb-2 text-white" style={{ fontSize: liveBlock.content?.titleSize }}>{liveBlock.content?.title}</h3>
            <p className="mb-4 text-gray-300" style={{ fontSize: liveBlock.content?.descriptionSize }}>{liveBlock.content?.description}</p>
            {liveBlock.content?.buttonText && (
              <a href={liveBlock.content?.buttonHref || "#"} className="inline-block px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition-all duration-200 font-medium">
                {liveBlock.content.buttonText}
              </a>
            )}
          </div>
        </div>
      )}
      {liveBlock.type === "quote" && (
        <div className="w-full p-6 bg-gray-700 rounded-xl border-l-4 border-gray-500 shadow-lg">
          <blockquote className="text-xl italic mb-2 text-gray-300">"{liveBlock.content?.text}"</blockquote>
          <cite className="text-sm text-gray-400">— {liveBlock.content?.author}</cite>
        </div>
      )}
      {liveBlock.type === "div" && (
        <div 
          className="w-full rounded-xl border border-gray-600 bg-gray-700 p-4 min-h-[100px] relative group shadow-lg"
          style={{ 
            borderRadius: liveBlock.content?.borderRadius,
            padding: liveBlock.content?.padding,
            minHeight: liveBlock.content?.minHeight,
          }}
        >
          {/* Container Header */}
          {!previewMode && (
            <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-t">
              Container Zone
            </div>
          )}
          
          {liveBlock.children && liveBlock.children.length > 0 ? (
            <div className="space-y-2">
              {liveBlock.children.map((childBlock) => (
                <CMSBlock
                  key={childBlock.id}
                  block={childBlock}
                  onUpdate={(updated) => {
                    // Update child block in parent
                    const updatedChildren = liveBlock.children.map(child => 
                      child.id === childBlock.id ? updated : child
                    );
                    onUpdate({ ...liveBlock, children: updatedChildren });
                  }}
                  onDelete={(id) => {
                    const updatedChildren = liveBlock.children.filter(child => child.id !== id);
                    onUpdate({ ...liveBlock, children: updatedChildren });
                  }}
                  onDuplicate={(id) => {
                    const childToDuplicate = liveBlock.children.find(child => child.id === id);
                    if (childToDuplicate) {
                      const duplicated = { ...childToDuplicate, id: generateUUID() };
                      onUpdate({ ...liveBlock, children: [...liveBlock.children, duplicated] });
                    }
                  }}
                  onSelect={onSelect}
                  isSelected={isSelected}
                  dragHandleProps={dragHandleProps}
                  previewMode={previewMode}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-20 border-2 border-dashed border-gray-200 rounded bg-gray-50">
              <p 
                className="text-center text-gray-500"
                style={{ 
                  color: liveBlock.content?.contentColor,
                  fontSize: liveBlock.content?.contentSize,
                }}
              >
                {liveBlock.content?.content}
              </p>
            </div>
          )}
        </div>
      )}
      {liveBlock.type === "twocolumn" && (
        <div 
          className="w-full rounded border-2 border-dashed border-gray-300 p-4 relative group"
          style={{ 
            display: liveBlock.content?.display,
            gridTemplateColumns: liveBlock.content?.gridTemplateColumns,
            gap: liveBlock.content?.gap,
            background: liveBlock.content?.background,
            border: liveBlock.content?.border,
            borderRadius: liveBlock.content?.borderRadius,
            padding: liveBlock.content?.padding,
            minHeight: liveBlock.content?.minHeight,
          }}
        >
          {/* Container Header */}
          {!previewMode && (
            <div className="absolute -top-6 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded-t">
              Two Column Layout
            </div>
          )}
          
          {liveBlock.children && liveBlock.children.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {liveBlock.children.map((childBlock, index) => (
                <div key={childBlock.id} className="min-h-[100px] border border-gray-200 rounded bg-gray-50 p-2">
                  <div className="text-xs text-gray-400 mb-2">Column {index + 1}</div>
                  <CMSBlock
                    block={childBlock}
                    onUpdate={(updated) => {
                      const updatedChildren = liveBlock.children.map(child => 
                        child.id === childBlock.id ? updated : child
                      );
                      onUpdate({ ...liveBlock, children: updatedChildren });
                    }}
                    onDelete={(id) => {
                      const updatedChildren = liveBlock.children.filter(child => child.id !== id);
                      onUpdate({ ...liveBlock, children: updatedChildren });
                    }}
                    onDuplicate={(id) => {
                      const childToDuplicate = liveBlock.children.find(child => child.id === id);
                      if (childToDuplicate) {
                        const duplicated = { ...childToDuplicate, id: generateUUID() };
                        onUpdate({ ...liveBlock, children: [...liveBlock.children, duplicated] });
                      }
                    }}
                    onSelect={onSelect}
                    isSelected={isSelected}
                    dragHandleProps={dragHandleProps}
                    previewMode={previewMode}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded bg-gray-50 min-h-[100px] flex items-center justify-center">
                <p 
                  className="text-center text-gray-500"
                  style={{ 
                    color: liveBlock.content?.contentColor,
                    fontSize: liveBlock.content?.contentSize,
                  }}
                >
                  {liveBlock.content?.leftContent}
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded bg-gray-50 min-h-[100px] flex items-center justify-center">
                <p 
                  className="text-center text-gray-500"
                  style={{ 
                    color: liveBlock.content?.contentColor,
                    fontSize: liveBlock.content?.contentSize,
                  }}
                >
                  {liveBlock.content?.rightContent}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      {liveBlock.type === "threecolumn" && (
        <div 
          className="w-full rounded border-2 border-dashed border-gray-300 p-4 relative group"
          style={{ 
            display: liveBlock.content?.display,
            gridTemplateColumns: liveBlock.content?.gridTemplateColumns,
            gap: liveBlock.content?.gap,
            background: liveBlock.content?.background,
            border: liveBlock.content?.border,
            borderRadius: liveBlock.content?.borderRadius,
            padding: liveBlock.content?.padding,
            minHeight: liveBlock.content?.minHeight,
          }}
        >
          {/* Container Header */}
          {!previewMode && (
            <div className="absolute -top-6 left-0 bg-purple-500 text-white text-xs px-2 py-1 rounded-t">
              Three Column Layout
            </div>
          )}
          
          {liveBlock.children && liveBlock.children.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {liveBlock.children.map((childBlock, index) => (
                <div key={childBlock.id} className="min-h-[100px] border border-gray-200 rounded bg-gray-50 p-2">
                  <div className="text-xs text-gray-400 mb-2">Column {index + 1}</div>
                  <CMSBlock
                    block={childBlock}
                    onUpdate={(updated) => {
                      const updatedChildren = liveBlock.children.map(child => 
                        child.id === childBlock.id ? updated : child
                      );
                      onUpdate({ ...liveBlock, children: updatedChildren });
                    }}
                    onDelete={(id) => {
                      const updatedChildren = liveBlock.children.filter(child => child.id !== id);
                      onUpdate({ ...liveBlock, children: updatedChildren });
                    }}
                    onDuplicate={(id) => {
                      const childToDuplicate = liveBlock.children.find(child => child.id === id);
                      if (childToDuplicate) {
                        const duplicated = { ...childToDuplicate, id: generateUUID() };
                        onUpdate({ ...liveBlock, children: [...liveBlock.children, duplicated] });
                      }
                    }}
                    onSelect={onSelect}
                    isSelected={isSelected}
                    dragHandleProps={dragHandleProps}
                    previewMode={previewMode}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded bg-gray-50 min-h-[100px] flex items-center justify-center">
                <p 
                  className="text-center text-gray-500"
                  style={{ 
                    color: liveBlock.content?.contentColor,
                    fontSize: liveBlock.content?.contentSize,
                  }}
                >
                  {liveBlock.content?.leftContent}
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded bg-gray-50 min-h-[100px] flex items-center justify-center">
                <p 
                  className="text-center text-gray-500"
                  style={{ 
                    color: liveBlock.content?.contentColor,
                    fontSize: liveBlock.content?.contentSize,
                  }}
                >
                  {liveBlock.content?.centerContent}
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded bg-gray-50 min-h-[100px] flex items-center justify-center">
                <p 
                  className="text-center text-gray-500"
                  style={{ 
                    color: liveBlock.content?.contentColor,
                    fontSize: liveBlock.content?.contentSize,
                  }}
                >
                  {liveBlock.content?.rightContent}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      {liveBlock.type === "spacer" && (
        <div 
          className="w-full rounded border-2 border-dashed border-gray-300 flex items-center justify-center"
          style={{ 
            height: liveBlock.content?.height,
            background: liveBlock.content?.background,
            border: liveBlock.content?.border,
            borderRadius: liveBlock.content?.borderRadius,
          }}
        >
          <span 
            className="text-gray-400 text-xs"
            style={{ 
              color: liveBlock.content?.contentColor,
              fontSize: liveBlock.content?.contentSize,
            }}
          >
            {liveBlock.content?.content}
          </span>
        </div>
      )}
      {liveBlock.type === "mainnavbar" && (
        <nav 
          className="w-full bg-gray-700 shadow-lg border-b border-gray-600"
          style={{ 
            position: liveBlock.content?.sticky ? 'sticky' : 'relative',
            top: 0,
            backgroundColor: liveBlock.content?.backgroundColor,
            height: liveBlock.content?.height,
          }}
        >
          <div className="max-w-7xl mx-auto" style={{ paddingLeft: liveBlock.content?.paddingX, paddingRight: liveBlock.content?.paddingX }}>
            <div className="flex justify-between items-center h-full">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  P
                </div>
                <span className="ml-2 text-xl font-bold" style={{ color: liveBlock.content?.textColor }}>
                  {liveBlock.content?.brand || "Brand"}
                </span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {liveBlock.content?.links?.map((link, index) => (
                    <a 
                      key={index} 
                      href={link.href} 
                      className="px-3 py-2 rounded-md text-sm font-medium transition"
                      style={{ color: liveBlock.content?.textColor }}
                      onMouseEnter={(e) => e.currentTarget.style.color = liveBlock.content?.linkHover}
                      onMouseLeave={(e) => e.currentTarget.style.color = liveBlock.content?.textColor}
                    >
                      {link.text}
                    </a>
                  ))}
                </div>
              </div>
              <div className="hidden md:block">
                <button
                  className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: liveBlock.content?.linkHover }}
                >
                  {liveBlock.content?.ctaText || "Get Started"}
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

        {/* Resize Handles - Only show in edit mode and when selected */}
        {!previewMode && isSelected && (
          <>
            {/* Left resize handle */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 cursor-ew-resize opacity-0 hover:opacity-100 transition-all duration-200 rounded-full"
              onMouseDown={(e) => handleResizeStart(e, 'left')}
            />
            {/* Right resize handle */}
            <div
              className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 cursor-ew-resize opacity-0 hover:opacity-100 transition-all duration-200 rounded-full"
              onMouseDown={(e) => handleResizeStart(e, 'right')}
            />
          </>
        )}
      </div>
    </div>
  );
}
