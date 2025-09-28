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
        <div className="p-1">
          {liveBlock.type === "heading" && <h2>{liveBlock.content}</h2>}
          {liveBlock.type === "paragraph" && <p>{liveBlock.content}</p>}
          {liveBlock.type === "button" && <button className="px-4 py-2 rounded text-white">{liveBlock.content}</button>}
        </div>
      )}
      {liveBlock.type === "image" && <img src={liveBlock.content} alt="" className="max-w-full rounded transition-all duration-300 ease-in-out" />}
      {liveBlock.type === "video" && <video src={liveBlock.content} controls className="max-w-full rounded transition-all duration-300 ease-in-out" />}
      {liveBlock.type === "gallery" && (
        <div className="flex gap-2 flex-wrap transition-all duration-300 ease-in-out">
          {Array.isArray(liveBlock.content) && liveBlock.content.map((img, i) => (
            <img key={i} src={img} alt="" className="w-24 h-24 object-cover rounded border transition-all duration-300 ease-in-out" />
          ))}
        </div>
      )}
      {liveBlock.type === "card" && (
        <div className="w-full overflow-hidden" style={{ background: liveBlock.content?.cardBg, borderRadius: liveBlock.content?.cardRadius, boxShadow: liveBlock.content?.cardShadow }}>
          {liveBlock.content?.image && (
            <img src={liveBlock.content.image} alt="" className="w-full" style={{ height: liveBlock.content?.imageHeight || 'auto', objectFit: liveBlock.content?.imageFit || 'cover', borderTopLeftRadius: liveBlock.content?.imageRadius, borderTopRightRadius: liveBlock.content?.imageRadius }} />
          )}
          <div className="p-4" style={{ textAlign: liveBlock.content?.align || 'left' }}>
            {liveBlock.content?.heading && (
              <h3 className="font-semibold mb-2" style={{ color: liveBlock.content?.headingColor, fontSize: liveBlock.content?.headingFontSize }}>{liveBlock.content.heading}</h3>
            )}
            {liveBlock.content?.text && (
              <p className="mb-3" style={{ color: liveBlock.content?.textColor, fontSize: liveBlock.content?.textFontSize }}>{liveBlock.content.text}</p>
            )}
            {liveBlock.content?.buttonLabel && (
              <a href={liveBlock.content?.buttonHref || "#"} className="inline-block px-4 py-2 rounded transition" style={{ background: liveBlock.content?.buttonBg, color: liveBlock.content?.buttonColor }}>
                {liveBlock.content.buttonLabel}
              </a>
            )}
          </div>
        </div>
      )}
      {liveBlock.type === "hero" && (
        <div className="w-full relative flex items-center justify-center" style={{ backgroundImage: `url(${liveBlock.content?.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: liveBlock.content?.minHeight }}>
          <div className="absolute inset-0" style={{ background: liveBlock.content?.overlayColor || 'rgba(0,0,0,0.5)' }}></div>
          <div className="relative z-10 p-8" style={{ textAlign: liveBlock.content?.align || 'center' }}>
            {liveBlock.content?.title && (
              <h1 className="font-bold mb-4" style={{ color: liveBlock.content?.titleColor, fontSize: liveBlock.content?.titleSize }}>{liveBlock.content.title}</h1>
            )}
            {liveBlock.content?.subtitle && (
              <p className="mb-8 max-w-2xl mx-auto" style={{ color: liveBlock.content?.subtitleColor, fontSize: liveBlock.content?.subtitleSize }}>{liveBlock.content.subtitle}</p>
            )}
            {liveBlock.content?.buttonText && (
              <a href={liveBlock.content?.buttonHref || "#"} className="inline-block px-8 py-3 rounded-lg transition font-semibold" style={{ background: liveBlock.content?.buttonBg, color: liveBlock.content?.buttonColor }}>
                {liveBlock.content.buttonText}
              </a>
            )}
          </div>
        </div>
      )}
      {liveBlock.type === "navbar" && (
        <nav className="w-full" style={{ position: liveBlock.content?.sticky ? 'sticky' : 'relative', top: 0, background: liveBlock.content?.bg }}>
          <div className="max-w-7xl mx-auto" style={{ paddingLeft: liveBlock.content?.paddingX, paddingRight: liveBlock.content?.paddingX, height: liveBlock.content?.height }}>
            <div className="flex justify-between items-center h-full">
              <div className="flex-shrink-0">
                <span className="font-bold" style={{ color: liveBlock.content?.textColor, fontSize: '20px' }}>{liveBlock.content?.brand || "Brand"}</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {liveBlock.content?.links?.map((link, index) => (
                    <a key={index} href={link.href} className="px-3 py-2 rounded-md text-sm font-medium transition" style={{ color: liveBlock.content?.textColor }} onMouseEnter={(e)=> e.currentTarget.style.color = liveBlock.content?.linkHover} onMouseLeave={(e)=> e.currentTarget.style.color = liveBlock.content?.textColor}>
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
        <footer className="w-full" style={{ background: liveBlock.content?.bg, color: liveBlock.content?.textColor }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: liveBlock.content?.paddingY, paddingBottom: liveBlock.content?.paddingY }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: liveBlock.content?.textColor }}>Quick Links</h3>
                <ul className="space-y-2">
                  {liveBlock.content?.links?.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="transition" style={{ color: liveBlock.content?.linkColor }} onMouseEnter={(e)=> e.currentTarget.style.color = liveBlock.content?.linkHover} onMouseLeave={(e)=> e.currentTarget.style.color = liveBlock.content?.linkColor}>
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: liveBlock.content?.textColor }}>Follow Us</h3>
                <div className="flex space-x-4">
                  {liveBlock.content?.social?.map((social, index) => (
                    <a key={index} href={social.href} className="transition" style={{ color: liveBlock.content?.linkColor }} onMouseEnter={(e)=> e.currentTarget.style.color = liveBlock.content?.linkHover} onMouseLeave={(e)=> e.currentTarget.style.color = liveBlock.content?.linkColor}>
                      {social.platform}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ color: liveBlock.content?.textColor }}>{liveBlock.content?.copyright || "© 2024 MyBrand"}</p>
              </div>
            </div>
          </div>
        </footer>
      )}
      {liveBlock.type === "section" && (
        <section className="w-full py-16" style={{ backgroundColor: liveBlock.content?.background || "#f8f9fa" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {liveBlock.content?.title && (
              <h2 className="text-3xl font-bold text-center mb-8">{liveBlock.content.title}</h2>
            )}
            {liveBlock.content?.content && (
              <p className="text-lg text-center text-gray-600 max-w-3xl mx-auto">{liveBlock.content.content}</p>
            )}
          </div>
        </section>
      )}
      {liveBlock.type === "grid" && (
        <div
          className="w-full"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${(liveBlock.content?.columns && (liveBlock.content.columns[viewport] || liveBlock.content.columns.base)) || 1}, minmax(0, 1fr))`,
            gap: (liveBlock.content?.gap && (liveBlock.content.gap[viewport] || liveBlock.content.gap.base)) || '16px',
          }}
        >
          {(liveBlock.content?.items || []).map((item, idx) => (
            <div key={idx} className="min-w-0">
              {/* Simple inner renderer for cards; future: recursive blocks */}
              {item.type === 'card' && (
                <div className="bg-white rounded shadow overflow-hidden">
                  {item.content?.image && <img src={item.content.image} alt="" className="w-full h-auto object-cover" />}
                  <div className="p-4">
                    {item.content?.heading && <h3 className="text-xl font-semibold mb-2">{item.content.heading}</h3>}
                    {item.content?.text && <p className="text-sm opacity-90 mb-3">{item.content.text}</p>}
                    {item.content?.buttonLabel && <a href={item.content?.buttonHref || '#'} className="inline-block px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">{item.content.buttonLabel}</a>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {liveBlock.type === "testimonial" && (
        <div className="bg-white rounded shadow p-6 md:p-10">
          <div className="flex items-center gap-4 mb-4">
            {liveBlock.content?.avatar && <img src={liveBlock.content.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />}
            <div>
              <div className="font-semibold">{liveBlock.content?.author}</div>
              <div className="text-sm text-gray-500">{liveBlock.content?.role}</div>
            </div>
          </div>
          <blockquote className="text-xl italic">“{liveBlock.content?.quote}”</blockquote>
        </div>
      )}
      {liveBlock.type === "pricing" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-1">
          {(liveBlock.content?.plans || []).map((plan, idx) => (
            <div key={idx} className="bg-gray-800 rounded shadow p-6">
              <div className="text-lg font-semibold mb-2">{plan.name}</div>
              <div className="text-3xl font-bold mb-4">{plan.price}</div>
              <ul className="space-y-1 mb-4 text-sm text-gray-600">
                {(plan.features || []).map((f, i) => <li key={i}>• {f}</li>)}
              </ul>
              <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">{plan.cta || 'Choose'}</button>
            </div>
          ))}
        </div>
      )}
      {liveBlock.type === "featurelist" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
          {(liveBlock.content?.features || []).map((f, i) => (
            <div key={i} className="bg-white rounded shadow p-6">
              <div className="text-lg font-semibold mb-1">{f.title}</div>
              <div className="text-sm text-gray-600">{f.description}</div>
            </div>
          ))}
        </div>
      )}
      {liveBlock.type === "productcard" && (
        <div className="w-full max-w-sm mx-auto" style={{ background: liveBlock.content?.cardBg, borderRadius: liveBlock.content?.cardRadius, boxShadow: liveBlock.content?.cardShadow }}>
          {liveBlock.content?.image && (
            <img src={liveBlock.content.image} alt="" className="w-full rounded-t-lg" style={{ height: '200px', objectFit: 'cover' }} />
          )}
          <div className="p-6">
            <h3 className="font-semibold mb-2" style={{ color: liveBlock.content?.titleColor, fontSize: liveBlock.content?.titleSize }}>{liveBlock.content?.title}</h3>
            <div className="text-2xl font-bold mb-2" style={{ color: liveBlock.content?.priceColor, fontSize: liveBlock.content?.priceSize }}>{liveBlock.content?.price}</div>
            <p className="mb-4" style={{ color: liveBlock.content?.descriptionColor, fontSize: liveBlock.content?.descriptionSize }}>{liveBlock.content?.description}</p>
            {liveBlock.content?.buttonText && (
              <a href={liveBlock.content?.buttonHref || "#"} className="inline-block px-4 py-2 rounded transition font-medium" style={{ background: liveBlock.content?.buttonBg, color: liveBlock.content?.buttonColor, borderRadius: liveBlock.content?.buttonRadius }}>
                {liveBlock.content.buttonText}
              </a>
            )}
          </div>
        </div>
      )}
      {liveBlock.type === "teamcard" && (
        <div className="w-full max-w-sm mx-auto text-center" style={{ background: liveBlock.content?.cardBg, borderRadius: liveBlock.content?.cardRadius, boxShadow: liveBlock.content?.cardShadow }}>
          <div className="p-6">
            {liveBlock.content?.image && (
              <img src={liveBlock.content.image} alt="" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
            )}
            <h3 className="font-semibold mb-1" style={{ color: liveBlock.content?.nameColor, fontSize: liveBlock.content?.nameSize }}>{liveBlock.content?.name}</h3>
            <p className="mb-2" style={{ color: liveBlock.content?.roleColor, fontSize: liveBlock.content?.roleSize }}>{liveBlock.content?.role}</p>
            <p className="mb-4" style={{ color: liveBlock.content?.bioColor, fontSize: liveBlock.content?.bioSize }}>{liveBlock.content?.bio}</p>
            <div className="flex justify-center space-x-4">
              {(liveBlock.content?.social || []).map((social, i) => (
                <a key={i} href={social.href} className="transition" style={{ color: liveBlock.content?.socialColor }} onMouseEnter={(e) => e.currentTarget.style.color = liveBlock.content?.socialHover} onMouseLeave={(e) => e.currentTarget.style.color = liveBlock.content?.socialColor}>
                  {social.platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
      {liveBlock.type === "servicecard" && (
        <div className="w-full max-w-sm mx-auto text-center" style={{ background: liveBlock.content?.cardBg, borderRadius: liveBlock.content?.cardRadius, boxShadow: liveBlock.content?.cardShadow }}>
          <div className="p-6">
            <div className="text-4xl mb-4" style={{ fontSize: liveBlock.content?.iconSize }}>{liveBlock.content?.icon}</div>
            <h3 className="font-semibold mb-2" style={{ color: liveBlock.content?.titleColor, fontSize: liveBlock.content?.titleSize }}>{liveBlock.content?.title}</h3>
            <p className="mb-4" style={{ color: liveBlock.content?.descriptionColor, fontSize: liveBlock.content?.descriptionSize }}>{liveBlock.content?.description}</p>
            <ul className="text-left mb-4 space-y-1">
              {(liveBlock.content?.features || []).map((feature, i) => (
                <li key={i} className="text-sm" style={{ color: liveBlock.content?.descriptionColor }}>• {feature}</li>
              ))}
            </ul>
            {liveBlock.content?.buttonText && (
              <a href={liveBlock.content?.buttonHref || "#"} className="inline-block px-4 py-2 rounded transition font-medium" style={{ background: liveBlock.content?.buttonBg, color: liveBlock.content?.buttonColor, borderRadius: liveBlock.content?.buttonRadius }}>
                {liveBlock.content.buttonText}
              </a>
            )}
          </div>
        </div>
      )}
      {liveBlock.type === "testimonialcard" && (
        <div className="w-full max-w-md mx-auto" style={{ background: liveBlock.content?.cardBg, borderRadius: liveBlock.content?.cardRadius, boxShadow: liveBlock.content?.cardShadow }}>
          <div className="p-6">
            <div className="flex items-center mb-4">
              {liveBlock.content?.image && (
                <img src={liveBlock.content.image} alt="" className="w-12 h-12 rounded-full mr-3 object-cover" />
              )}
              <div>
                <div className="font-semibold" style={{ color: liveBlock.content?.authorColor, fontSize: liveBlock.content?.authorSize }}>{liveBlock.content?.author}</div>
                <div className="text-sm" style={{ color: liveBlock.content?.roleColor, fontSize: liveBlock.content?.roleSize }}>{liveBlock.content?.role}, {liveBlock.content?.company}</div>
              </div>
            </div>
            <div className="flex mb-3">
              {[...Array(liveBlock.content?.rating || 5)].map((_, i) => (
                <span key={i} style={{ color: liveBlock.content?.ratingColor }}>⭐</span>
              ))}
            </div>
            <blockquote className="italic" style={{ color: liveBlock.content?.quoteColor, fontSize: liveBlock.content?.quoteSize }}>"{liveBlock.content?.quote}"</blockquote>
          </div>
        </div>
      )}
      {liveBlock.type === "featurecard" && (
        <div className="w-full max-w-sm mx-auto text-center" style={{ background: liveBlock.content?.cardBg, borderRadius: liveBlock.content?.cardRadius, boxShadow: liveBlock.content?.cardShadow }}>
          <div className="p-6">
            <div className="text-3xl mb-4" style={{ fontSize: liveBlock.content?.iconSize }}>{liveBlock.content?.icon}</div>
            <h3 className="font-semibold mb-2" style={{ color: liveBlock.content?.titleColor, fontSize: liveBlock.content?.titleSize }}>{liveBlock.content?.title}</h3>
            <p className="mb-4" style={{ color: liveBlock.content?.descriptionColor, fontSize: liveBlock.content?.descriptionSize }}>{liveBlock.content?.description}</p>
            {liveBlock.content?.buttonText && (
              <a href={liveBlock.content?.buttonHref || "#"} className="inline-block px-4 py-2 rounded transition font-medium" style={{ background: liveBlock.content?.buttonBg, color: liveBlock.content?.buttonColor, borderRadius: liveBlock.content?.buttonRadius }}>
                {liveBlock.content.buttonText}
              </a>
            )}
          </div>
        </div>
      )}
      {liveBlock.type === "quote" && (
        <div className="w-full p-6 rounded" style={{ background: liveBlock.content?.background, borderLeft: liveBlock.content?.borderLeft }}>
          <blockquote className="text-xl italic mb-2" style={{ color: liveBlock.content?.textColor, fontSize: liveBlock.content?.textSize }}>"{liveBlock.content?.text}"</blockquote>
          <cite className="text-sm" style={{ color: liveBlock.content?.authorColor, fontSize: liveBlock.content?.authorSize }}>— {liveBlock.content?.author}</cite>
        </div>
      )}
      {liveBlock.type === "div" && (
        <div 
          className="w-full rounded border-2 border-dashed border-gray-300 p-4 min-h-[100px] relative group"
          style={{ 
            background: liveBlock.content?.background,
            border: liveBlock.content?.border,
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
          className="w-full bg-white shadow-lg border-b border-gray-200"
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
                      className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100"
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
