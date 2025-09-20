"use client";

import { useState, useEffect } from "react";
import { Card, Button, TextInput, Select, Textarea, ToggleSwitch } from "flowbite-react";
import { HexColorPicker } from "react-colorful";


export default function InspectorPanel({ block, onUpdate, onClose }) {
  const [liveBlock, setLiveBlock] = useState(block);
  const [openSections, setOpenSections] = useState({
    content: true,
    textStyles: true,
    layout: true,
    effects: false,
    responsive: true,
  });

  useEffect(() => setLiveBlock(block), [block]);

  const handleChange = (field, value) => {
    const updated = { ...liveBlock, [field]: value };
    setLiveBlock(updated);
    onUpdate && onUpdate(updated);
  };

  const toggleSection = (section) => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

  const resetStyles = () => {
    const reset = { ...liveBlock, margin: "", padding: "", width: "100%", height: "", display: "block", justifyContent: "", alignItems: "", background: "", border: "", boxShadow: "", borderRadius: "", opacity: "", gap: "", overflow: "", textAlign: "", fontSize: "", fontWeight: "", fontStyle: "", textDecoration: "", letterSpacing: "", lineHeight: "", color: "" };
    setLiveBlock(reset);
    onUpdate && onUpdate(reset);
  };

  const updateNestedContent = (key, value) => {
    const currentContent = typeof liveBlock.content === "object" && liveBlock.content !== null ? liveBlock.content : {};
    const updated = { ...liveBlock, content: { ...currentContent, [key]: value } };
    setLiveBlock(updated);
    onUpdate && onUpdate(updated);
  };

  const numberOrEmpty = (value) => (value === undefined || value === null ? "" : value);
  
  const darkInputClass = "darkInputClass border-gray-500 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500";
  const darkSelectClass = " border-gray-500 text-white";
  

  return (
    <div className="fixed right-0 top-0 w-80 h-screen bg-gray-800 border-l border-gray-700 p-0 overflow-y-auto shadow-xl z-50">
      <div className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Inspector</h2>
          <p className="text-xs text-gray-400">{block.type?.toUpperCase()} settings</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="px-2 py-1 text-xs rounded border border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-white transition">Close</button>
        )}
      </div>
      <div className="p-4 space-y-3">

      {/* Content */}
      <Card className="mb-2 bg-gray-700 border-gray-600">
        <Button onClick={() => toggleSection("content")} size="sm" className="w-full flex justify-between bg-gray-600 hover:bg-gray-500 border-gray-500 text-white">{`Content ${openSections.content ? "▲" : "▼"}`}</Button>
        {openSections.content && (
          <div className="mt-2 space-y-2">
            {(block.type === "heading" || block.type === "paragraph") && (
              <Textarea rows={3} value={liveBlock.content} onChange={e => handleChange("content", e.target.value)} placeholder="Text content" className="bg-gray-600 border-gray-500 text-white placeholder-gray-400" />
            )}
            {block.type === "button" && (
              <div className="space-y-2">
                <TextInput value={liveBlock.content} onChange={e => handleChange("content", e.target.value)} placeholder="Button label" className="bg-gray-600 border-gray-500 text-white placeholder-gray-400" />
                <TextInput value={liveBlock.href || ""} onChange={e => handleChange("href", e.target.value)} placeholder="Button link (href)" className="bg-gray-600 border-gray-500 text-white placeholder-gray-400" />
              </div>
            )}
            {block.type === "image" && <TextInput value={liveBlock.content} onChange={e => handleChange("content", e.target.value)} placeholder="Image URL" className="bg-gray-600 border-gray-500 text-white placeholder-gray-400" />}
            {block.type === "video" && <TextInput value={liveBlock.content} onChange={e => handleChange("content", e.target.value)} placeholder="Video URL" className="bg-gray-600 border-gray-500 text-white placeholder-gray-400" />}
            {block.type === "card" && (
              <div className="space-y-2">
                <TextInput value={liveBlock.content?.heading || ""} onChange={e => updateNestedContent("heading", e.target.value)} placeholder="Card heading" className={darkInputClass} />
                <Textarea rows={3} value={liveBlock.content?.text || ""} onChange={e => updateNestedContent("text", e.target.value)} placeholder="Card text" className={darkInputClass} />
                <TextInput value={liveBlock.content?.image || ""} onChange={e => updateNestedContent("image", e.target.value)} placeholder="Image URL" className={darkInputClass} />
                <div className="grid grid-cols-2 gap-2">
                  <TextInput value={liveBlock.content?.imageHeight || ""} onChange={e => updateNestedContent("imageHeight", e.target.value)} placeholder="Image height (e.g., 220px)" className={darkInputClass} />
                  <Select value={liveBlock.content?.imageFit || 'cover'} onChange={e => updateNestedContent('imageFit', e.target.value)} className={darkSelectClass}>
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="fill">Fill</option>
                    <option value="none">None</option>
                  </Select>
                </div>
                <TextInput value={liveBlock.content?.imageRadius || ""} onChange={e => updateNestedContent("imageRadius", e.target.value)} placeholder="Image radius (e.g., 8px)" className={darkInputClass} />
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Card Background</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.cardBg || "#ffffff"} 
                      onChange={color => updateNestedContent("cardBg", color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.cardBg || "#ffffff"} 
                      onChange={e => updateNestedContent("cardBg", e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <TextInput value={liveBlock.content?.cardRadius || ""} onChange={e => updateNestedContent("cardRadius", e.target.value)} placeholder="Card radius" className={darkInputClass} />
                <TextInput value={liveBlock.content?.cardShadow || ""} onChange={e => updateNestedContent("cardShadow", e.target.value)} placeholder="Card shadow" className={darkInputClass} />
                <Select value={liveBlock.content?.align || 'left'} onChange={e => updateNestedContent('align', e.target.value)} className={darkSelectClass}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </Select>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Heading Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.headingColor || "#111827"} 
                      onChange={color => updateNestedContent("headingColor", color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.headingColor || "#111827"} 
                      onChange={e => updateNestedContent("headingColor", e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <TextInput value={liveBlock.content?.headingFontSize || ""} onChange={e => updateNestedContent("headingFontSize", e.target.value)} placeholder="Heading size" className={darkInputClass} />
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Text Color</label>
                  <div className="flex items-center gap-2">
                    
                    <HexColorPicker
                      color={liveBlock.content?.textColor || "#4B5563"} 
                      onChange={color => updateNestedContent("textColor", color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.textColor || "#4B5563"} 
                      onChange={e => updateNestedContent("textColor", e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <TextInput value={liveBlock.content?.textFontSize || ""} onChange={e => updateNestedContent("textFontSize", e.target.value)} placeholder="Text size" className={darkInputClass} />
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Button Background</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.buttonBg || "#2563eb"} 
                      onChange={color => updateNestedContent("buttonBg", color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.buttonBg || "#2563eb"} 
                      onChange={e => updateNestedContent("buttonBg", e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Button Text Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.buttonColor || "#ffffff"} 
                      onChange={color => updateNestedContent("buttonColor", color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.buttonColor || "#ffffff"} 
                      onChange={e => updateNestedContent("buttonColor", e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <TextInput value={liveBlock.content?.buttonLabel || ""} onChange={e => updateNestedContent("buttonLabel", e.target.value)} placeholder="Button label" className={darkInputClass} />
                  <TextInput value={liveBlock.content?.buttonHref || ""} onChange={e => updateNestedContent("buttonHref", e.target.value)} placeholder="Button link" className={darkInputClass} />
                </div>
              </div>
            )}
            {block.type === "hero" && (
              <div className="space-y-2">
                <TextInput value={liveBlock.content?.title || ""} onChange={e => updateNestedContent("title", e.target.value)} placeholder="Hero title" className={darkInputClass} />
                <Textarea rows={2} value={liveBlock.content?.subtitle || ""} onChange={e => updateNestedContent("subtitle", e.target.value)} placeholder="Hero subtitle" className={darkInputClass} />
                <TextInput value={liveBlock.content?.backgroundImage || ""} onChange={e => updateNestedContent("backgroundImage", e.target.value)} placeholder="Background image URL" className={darkInputClass} />
                <div className="grid grid-cols-2 gap-2">
                  <TextInput value={liveBlock.content?.buttonText || ""} onChange={e => updateNestedContent("buttonText", e.target.value)} placeholder="Button text" className={darkInputClass} />
                  <TextInput value={liveBlock.content?.buttonHref || ""} onChange={e => updateNestedContent("buttonHref", e.target.value)} placeholder="Button link" className={darkInputClass} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <TextInput value={liveBlock.content?.minHeight || ''} onChange={e => updateNestedContent('minHeight', e.target.value)} placeholder="Min height (e.g., 420px)" className={darkInputClass} />
                  <Select value={liveBlock.content?.align || 'center'} onChange={e => updateNestedContent('align', e.target.value)} className={darkSelectClass}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </Select>
                </div>
                <TextInput value={liveBlock.content?.overlayColor || 'rgba(0,0,0,0.5)'} onChange={e => updateNestedContent('overlayColor', e.target.value)} placeholder="Overlay color (rgba)" className={darkInputClass} />
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Title Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.titleColor || '#ffffff'} 
                      onChange={color => updateNestedContent('titleColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.titleColor || '#ffffff'} 
                      onChange={e => updateNestedContent('titleColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <TextInput value={liveBlock.content?.titleSize || ''} onChange={e => updateNestedContent('titleSize', e.target.value)} placeholder="Title size" className={darkInputClass} />
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Subtitle Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.subtitleColor || '#e5e7eb'} 
                      onChange={color => updateNestedContent('subtitleColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.subtitleColor || '#e5e7eb'} 
                      onChange={e => updateNestedContent('subtitleColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <TextInput value={liveBlock.content?.subtitleSize || ''} onChange={e => updateNestedContent('subtitleSize', e.target.value)} placeholder="Subtitle size" className={darkInputClass} />
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Button Background</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.buttonBg || '#2563eb'} 
                      onChange={color => updateNestedContent('buttonBg', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.buttonBg || '#2563eb'} 
                      onChange={e => updateNestedContent('buttonBg', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Button Text Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.buttonColor || '#ffffff'} 
                      onChange={color => updateNestedContent('buttonColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.buttonColor || '#ffffff'} 
                      onChange={e => updateNestedContent('buttonColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
              </div>
            )}
            {block.type === "navbar" && (
              <div className="space-y-2">
                <TextInput value={liveBlock.content?.brand || ""} onChange={e => updateNestedContent("brand", e.target.value)} placeholder="Brand name" className={darkInputClass} />
                <div className="text-sm text-gray-400">Navigation links (JSON format)</div>
                <Textarea rows={4} value={JSON.stringify(liveBlock.content?.links || [], null, 2)} onChange={e => {
                  try {
                    const links = JSON.parse(e.target.value);
                    updateNestedContent("links", links);
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }} placeholder='[{"text": "Home", "href": "#"}]' className={darkInputClass} />
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Background Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.bg || '#ffffff'} 
                      onChange={color => updateNestedContent('bg', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.bg || '#ffffff'} 
                      onChange={e => updateNestedContent('bg', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Text Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.textColor || '#111827'} 
                      onChange={color => updateNestedContent('textColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.textColor || '#111827'} 
                      onChange={e => updateNestedContent('textColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Link Hover Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.linkHover || '#2563eb'} 
                      onChange={color => updateNestedContent('linkHover', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.linkHover || '#2563eb'} 
                      onChange={e => updateNestedContent('linkHover', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <TextInput value={liveBlock.content?.height || '64px'} onChange={e => updateNestedContent('height', e.target.value)} placeholder="Height" className={darkInputClass} />
                  <TextInput value={liveBlock.content?.paddingX || '16px'} onChange={e => updateNestedContent('paddingX', e.target.value)} placeholder="Padding X" className={darkInputClass} />
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={!!liveBlock.content?.sticky} onChange={e => updateNestedContent('sticky', e.target.checked)} /> Sticky</label>
                </div>
              </div>
            )}
            {block.type === "footer" && (
              <div className="space-y-2">
                <TextInput value={liveBlock.content?.copyright || ""} onChange={e => updateNestedContent("copyright", e.target.value)} placeholder="Copyright text" className={darkInputClass} />
                <div className="text-sm text-gray-400">Footer links (JSON format)</div>
                <Textarea rows={3} value={JSON.stringify(liveBlock.content?.links || [], null, 2)} onChange={e => {
                  try {
                    const links = JSON.parse(e.target.value);
                    updateNestedContent("links", links);
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }} placeholder='[{"text": "Privacy", "href": "#"}]' className={darkInputClass} />
                <div className="text-sm text-gray-400">Social links (JSON format)</div>
                <Textarea rows={3} value={JSON.stringify(liveBlock.content?.social || [], null, 2)} onChange={e => {
                  try {
                    const social = JSON.parse(e.target.value);
                    updateNestedContent("social", social);
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }} placeholder='[{"platform": "Twitter", "href": "#"}]' className={darkInputClass} />
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Background Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.bg || '#111827'} 
                      onChange={color => updateNestedContent('bg', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.bg || '#111827'} 
                      onChange={e => updateNestedContent('bg', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Text Color</label>
                  
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.textColor || '#e5e7eb'} 
                      onChange={color => updateNestedContent('textColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.textColor || '#e5e7eb'} 
                      onChange={e => updateNestedContent('textColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Link Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.linkColor || '#9ca3af'} 
                      onChange={color => updateNestedContent('linkColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.linkColor || '#9ca3af'} 
                      onChange={e => updateNestedContent('linkColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Link Hover Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.linkHover || '#ffffff'} 
                      onChange={color => updateNestedContent('linkHover', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.linkHover || '#ffffff'} 
                      onChange={e => updateNestedContent('linkHover', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <TextInput value={liveBlock.content?.paddingY || '48px'} onChange={e => updateNestedContent('paddingY', e.target.value)} placeholder="Vertical padding" className={darkInputClass} />
              </div>
            )}
            {block.type === "section" && (
              <div className="space-y-2">
                <TextInput value={liveBlock.content?.title || ""} onChange={e => updateNestedContent("title", e.target.value)} placeholder="Section title" className={darkInputClass} />
                <Textarea rows={3} value={liveBlock.content?.content || ""} onChange={e => updateNestedContent("content", e.target.value)} placeholder="Section content" className={darkInputClass} />
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Background Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.background || "#f8f9fa"} 
                      onChange={color => updateNestedContent("background", color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.background || "#f8f9fa"} 
                      onChange={e => updateNestedContent("background", e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
              </div>
            )}
            {block.type === "grid" && (
              <div className="space-y-2">
                <div className="text-xs text-gray-300">Columns per breakpoint</div>
                {['base','md','lg'].map(bp => (
                  <TextInput key={bp} type="number" min={1} max={6} value={liveBlock.content?.columns?.[bp] ?? ''} onChange={e => updateNestedContent('columns', { ...(liveBlock.content?.columns||{}), [bp]: Number(e.target.value) })} placeholder={`${bp} columns`} className={darkInputClass} />
                ))}
                <div className="text-xs text-gray-300">Gap per breakpoint</div>
                {['base','md','lg'].map(bp => (
                  <TextInput key={bp} value={liveBlock.content?.gap?.[bp] ?? ''} onChange={e => updateNestedContent('gap', { ...(liveBlock.content?.gap||{}), [bp]: e.target.value })} placeholder={`${bp} gap (e.g., 16px)`} className={darkInputClass} />
                ))}
              </div>
            )}
            {block.type === "testimonial" && (
              <div className="space-y-2">
                <Textarea rows={3} value={liveBlock.content?.quote || ''} onChange={e => updateNestedContent('quote', e.target.value)} placeholder="Quote" className={darkInputClass} />
                <TextInput value={liveBlock.content?.author || ''} onChange={e => updateNestedContent('author', e.target.value)} placeholder="Author" className={darkInputClass} />
                <TextInput value={liveBlock.content?.role || ''} onChange={e => updateNestedContent('role', e.target.value)} placeholder="Role" className={darkInputClass} />
                <TextInput value={liveBlock.content?.avatar || ''} onChange={e => updateNestedContent('avatar', e.target.value)} placeholder="Avatar URL" className={darkInputClass} />
              </div>
            )}
            {block.type === "pricing" && (
              <div className="space-y-2">
                <div className="text-xs text-gray-300">Plans (JSON)</div>
                <Textarea rows={6} value={JSON.stringify(liveBlock.content?.plans || [], null, 2)} onChange={e => {
                  try { updateNestedContent('plans', JSON.parse(e.target.value)); } catch {}
                }} className={darkInputClass} />
              </div>
            )}
            {block.type === "featurelist" && (
              <div className="space-y-2">
                <TextInput value={liveBlock.content?.title || ''} onChange={e => updateNestedContent('title', e.target.value)} placeholder="Title" className={darkInputClass} />
                <div className="text-xs text-gray-300">Features (JSON)</div>
                <Textarea rows={6} value={JSON.stringify(liveBlock.content?.features || [], null, 2)} onChange={e => {
                  try { updateNestedContent('features', JSON.parse(e.target.value)); } catch {}
                }} className={darkInputClass} />
              </div>
            )}
            {block.type === "productcard" && (
              <div className="space-y-2">
                <TextInput value={liveBlock.content?.title || ''} onChange={e => updateNestedContent('title', e.target.value)} placeholder="Product title" className={darkInputClass} />
                <TextInput value={liveBlock.content?.price || ''} onChange={e => updateNestedContent('price', e.target.value)} placeholder="Price" className={darkInputClass} />
                <TextInput value={liveBlock.content?.image || ''} onChange={e => updateNestedContent('image', e.target.value)} placeholder="Image URL" className={darkInputClass} />
                <Textarea rows={3} value={liveBlock.content?.description || ''} onChange={e => updateNestedContent('description', e.target.value)} placeholder="Description" className={darkInputClass} />
                <div className="grid grid-cols-2 gap-2">
                  <TextInput value={liveBlock.content?.buttonText || ''} onChange={e => updateNestedContent('buttonText', e.target.value)} placeholder="Button text" className={darkInputClass} />
                  <TextInput value={liveBlock.content?.buttonHref || ''} onChange={e => updateNestedContent('buttonHref', e.target.value)} placeholder="Button link" className={darkInputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Card Background</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.cardBg || '#ffffff'} 
                      onChange={color => updateNestedContent('cardBg', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.cardBg || '#ffffff'} 
                      onChange={e => updateNestedContent('cardBg', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <TextInput value={liveBlock.content?.cardRadius || ''} onChange={e => updateNestedContent('cardRadius', e.target.value)} placeholder="Card radius" className={darkInputClass} />
                  <TextInput value={liveBlock.content?.cardShadow || ''} onChange={e => updateNestedContent('cardShadow', e.target.value)} placeholder="Card shadow" className={darkInputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Title Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.titleColor || '#111827'} 
                      onChange={color => updateNestedContent('titleColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.titleColor || '#111827'} 
                      onChange={e => updateNestedContent('titleColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Price Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.priceColor || '#059669'} 
                      onChange={color => updateNestedContent('priceColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.priceColor || '#059669'} 
                      onChange={e => updateNestedContent('priceColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Description Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.descriptionColor || '#6B7280'} 
                      onChange={color => updateNestedContent('descriptionColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.descriptionColor || '#6B7280'} 
                      onChange={e => updateNestedContent('descriptionColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Button Background</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.buttonBg || '#3B82F6'} 
                      onChange={color => updateNestedContent('buttonBg', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.buttonBg || '#3B82F6'} 
                      onChange={e => updateNestedContent('buttonBg', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Button Text Color</label>
                  
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.buttonColor || '#ffffff'} 
                      onChange={color => updateNestedContent('buttonColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.buttonColor || '#ffffff'} 
                      onChange={e => updateNestedContent('buttonColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
              </div>
            )}
            {block.type === "teamcard" && (
              <div className="space-y-2">
                <TextInput value={liveBlock.content?.name || ''} onChange={e => updateNestedContent('name', e.target.value)} placeholder="Name" className={darkInputClass} />
                <TextInput value={liveBlock.content?.role || ''} onChange={e => updateNestedContent('role', e.target.value)} placeholder="Role" className={darkInputClass} />
                <TextInput value={liveBlock.content?.image || ''} onChange={e => updateNestedContent('image', e.target.value)} placeholder="Image URL" className={darkInputClass} />
                <Textarea rows={2} value={liveBlock.content?.bio || ''} onChange={e => updateNestedContent('bio', e.target.value)} placeholder="Bio" className={darkInputClass} />
                <div className="text-xs text-gray-300">Social links (JSON)</div>
                <Textarea rows={3} value={JSON.stringify(liveBlock.content?.social || [], null, 2)} onChange={e => {
                  try { updateNestedContent('social', JSON.parse(e.target.value)); } catch {}
                }} placeholder='[{"platform": "LinkedIn", "href": "#"}]' className={darkInputClass} />
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Card Background</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.cardBg || '#ffffff'} 
                      onChange={color => updateNestedContent('cardBg', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.cardBg || '#ffffff'} 
                      onChange={e => updateNestedContent('cardBg', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <TextInput value={liveBlock.content?.cardRadius || ''} onChange={e => updateNestedContent('cardRadius', e.target.value)} placeholder="Card radius" className={darkInputClass} />
                  <TextInput value={liveBlock.content?.cardShadow || ''} onChange={e => updateNestedContent('cardShadow', e.target.value)} placeholder="Card shadow" className={darkInputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Name Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.nameColor || '#111827'} 
                      onChange={color => updateNestedContent('nameColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.nameColor || '#111827'} 
                      onChange={e => updateNestedContent('nameColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Role Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.roleColor || '#6B7280'} 
                      onChange={color => updateNestedContent('roleColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.roleColor || '#6B7280'} 
                      onChange={e => updateNestedContent('roleColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Bio Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.bioColor || '#4B5563'} 
                      onChange={color => updateNestedContent('bioColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.bioColor || '#4B5563'} 
                      onChange={e => updateNestedContent('bioColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Social Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.socialColor || '#6B7280'} 
                      onChange={color => updateNestedContent('socialColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.socialColor || '#6B7280'} 
                      onChange={e => updateNestedContent('socialColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Social Hover Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.socialHover || '#3B82F6'} 
                      onChange={color => updateNestedContent('socialHover', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.socialHover || '#3B82F6'} 
                      onChange={e => updateNestedContent('socialHover', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
              </div>
            )}
            {block.type === "servicecard" && (
              <div className="space-y-2">
                <TextInput value={liveBlock.content?.title || ''} onChange={e => updateNestedContent('title', e.target.value)} placeholder="Service title" className={darkInputClass} />
                <Textarea rows={3} value={liveBlock.content?.description || ''} onChange={e => updateNestedContent('description', e.target.value)} placeholder="Description" className={darkInputClass} />
                <TextInput value={liveBlock.content?.icon || ''} onChange={e => updateNestedContent('icon', e.target.value)} placeholder="Icon (emoji)" className={darkInputClass} />
                <div className="text-xs text-gray-300">Features (JSON)</div>
                <Textarea rows={3} value={JSON.stringify(liveBlock.content?.features || [], null, 2)} onChange={e => {
                  try { updateNestedContent('features', JSON.parse(e.target.value)); } catch {}
                }} placeholder='["Feature 1", "Feature 2"]' className={darkInputClass} />
                <div className="grid grid-cols-2 gap-2">
                  <TextInput value={liveBlock.content?.buttonText || ''} onChange={e => updateNestedContent('buttonText', e.target.value)} placeholder="Button text" className={darkInputClass} />
                  <TextInput value={liveBlock.content?.buttonHref || ''} onChange={e => updateNestedContent('buttonHref', e.target.value)} placeholder="Button link" className={darkInputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Card Background</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.cardBg || '#ffffff'} 
                      onChange={color => updateNestedContent('cardBg', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.cardBg || '#ffffff'} 
                      onChange={e => updateNestedContent('cardBg', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <TextInput value={liveBlock.content?.cardRadius || ''} onChange={e => updateNestedContent('cardRadius', e.target.value)} placeholder="Card radius" className={darkInputClass} />
                  <TextInput value={liveBlock.content?.cardShadow || ''} onChange={e => updateNestedContent('cardShadow', e.target.value)} placeholder="Card shadow" className={darkInputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Title Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.titleColor || '#111827'} 
                      onChange={color => updateNestedContent('titleColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.titleColor || '#111827'} 
                      onChange={e => updateNestedContent('titleColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Description Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.descriptionColor || '#6B7280'} 
                      onChange={color => updateNestedContent('descriptionColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.descriptionColor || '#6B7280'} 
                      onChange={e => updateNestedContent('descriptionColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Button Background</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.buttonBg || '#3B82F6'} 
                      onChange={color => updateNestedContent('buttonBg', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.buttonBg || '#3B82F6'} 
                      onChange={e => updateNestedContent('buttonBg', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Button Text Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.buttonColor || '#ffffff'} 
                      onChange={color => updateNestedContent('buttonColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.buttonColor || '#ffffff'} 
                      onChange={e => updateNestedContent('buttonColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
              </div>
            )}
            {block.type === "testimonialcard" && (
              <div className="space-y-2">
                <Textarea rows={3} value={liveBlock.content?.quote || ''} onChange={e => updateNestedContent('quote', e.target.value)} placeholder="Quote" className={darkInputClass} />
                <TextInput value={liveBlock.content?.author || ''} onChange={e => updateNestedContent('author', e.target.value)} placeholder="Author name" className={darkInputClass} />
                <TextInput value={liveBlock.content?.role || ''} onChange={e => updateNestedContent('role', e.target.value)} placeholder="Role" className={darkInputClass} />
                <TextInput value={liveBlock.content?.company || ''} onChange={e => updateNestedContent('company', e.target.value)} placeholder="Company" className={darkInputClass} />
                <TextInput value={liveBlock.content?.image || ''} onChange={e => updateNestedContent('image', e.target.value)} placeholder="Avatar URL" className={darkInputClass} />
                <TextInput type="number" min="1" max="5" value={liveBlock.content?.rating || 5} onChange={e => updateNestedContent('rating', parseInt(e.target.value))} placeholder="Rating (1-5)" className={darkInputClass} />
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Card Background</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.cardBg || '#ffffff'} 
                      onChange={color => updateNestedContent('cardBg', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.cardBg || '#ffffff'} 
                      onChange={e => updateNestedContent('cardBg', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <TextInput value={liveBlock.content?.cardRadius || ''} onChange={e => updateNestedContent('cardRadius', e.target.value)} placeholder="Card radius" className={darkInputClass} />
                  <TextInput value={liveBlock.content?.cardShadow || ''} onChange={e => updateNestedContent('cardShadow', e.target.value)} placeholder="Card shadow" className={darkInputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Quote Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.quoteColor || '#111827'} 
                      onChange={color => updateNestedContent('quoteColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.quoteColor || '#111827'} 
                      onChange={e => updateNestedContent('quoteColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Author Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.authorColor || '#111827'} 
                      onChange={color => updateNestedContent('authorColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.authorColor || '#111827'} 
                      onChange={e => updateNestedContent('authorColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Role Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.roleColor || '#6B7280'} 
                      onChange={color => updateNestedContent('roleColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.roleColor || '#6B7280'} 
                      onChange={e => updateNestedContent('roleColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Rating Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.ratingColor || '#F59E0B'} 
                      onChange={color => updateNestedContent('ratingColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.ratingColor || '#F59E0B'} 
                      onChange={e => updateNestedContent('ratingColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
              </div>
            )}
            {block.type === "featurecard" && (
              <div className="space-y-2">
                <TextInput value={liveBlock.content?.title || ''} onChange={e => updateNestedContent('title', e.target.value)} placeholder="Feature title" className={darkInputClass} />
                <Textarea rows={2} value={liveBlock.content?.description || ''} onChange={e => updateNestedContent('description', e.target.value)} placeholder="Description" className={darkInputClass} />
                <TextInput value={liveBlock.content?.icon || ''} onChange={e => updateNestedContent('icon', e.target.value)} placeholder="Icon (emoji)" className={darkInputClass} />
                <div className="grid grid-cols-2 gap-2">
                  <TextInput value={liveBlock.content?.buttonText || ''} onChange={e => updateNestedContent('buttonText', e.target.value)} placeholder="Button text" className={darkInputClass} />
                  <TextInput value={liveBlock.content?.buttonHref || ''} onChange={e => updateNestedContent('buttonHref', e.target.value)} placeholder="Button link" className={darkInputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Card Background</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.cardBg || '#ffffff'} 
                      onChange={color => updateNestedContent('cardBg', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.cardBg || '#ffffff'} 
                      onChange={e => updateNestedContent('cardBg', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <TextInput value={liveBlock.content?.cardRadius || ''} onChange={e => updateNestedContent('cardRadius', e.target.value)} placeholder="Card radius" className={darkInputClass} />
                  <TextInput value={liveBlock.content?.cardShadow || ''} onChange={e => updateNestedContent('cardShadow', e.target.value)} placeholder="Card shadow" className={darkInputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Title Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.titleColor || '#111827'} 
                      onChange={color => updateNestedContent('titleColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.titleColor || '#111827'} 
                      onChange={e => updateNestedContent('titleColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Description Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.descriptionColor || '#6B7280'} 
                      onChange={color => updateNestedContent('descriptionColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.descriptionColor || '#6B7280'} 
                      onChange={e => updateNestedContent('descriptionColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Button Background</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.buttonBg || '#3B82F6'} 
                      onChange={color => updateNestedContent('buttonBg', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.buttonBg || '#3B82F6'} 
                      onChange={e => updateNestedContent('buttonBg', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Button Text Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.buttonColor || '#ffffff'} 
                      onChange={color => updateNestedContent('buttonColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.buttonColor || '#ffffff'} 
                      onChange={e => updateNestedContent('buttonColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
              </div>
            )}
            {block.type === "quote" && (
              <div className="space-y-2">
                <Textarea rows={3} value={liveBlock.content?.text || ''} onChange={e => updateNestedContent('text', e.target.value)} placeholder="Quote text" className={darkInputClass} />
                <TextInput value={liveBlock.content?.author || ''} onChange={e => updateNestedContent('author', e.target.value)} placeholder="Author" className={darkInputClass} />
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Background Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.background || '#F9FAFB'} 
                      onChange={color => updateNestedContent('background', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.background || '#F9FAFB'} 
                      onChange={e => updateNestedContent('background', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Text Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.textColor || '#111827'} 
                      onChange={color => updateNestedContent('textColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.textColor || '#111827'} 
                      onChange={e => updateNestedContent('textColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Author Color</label>
                  <div className="flex items-center gap-2">
                    <HexColorPicker 
                      color={liveBlock.content?.authorColor || '#6B7280'} 
                      onChange={color => updateNestedContent('authorColor', color)}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <TextInput 
                      value={liveBlock.content?.authorColor || '#6B7280'} 
                      onChange={e => updateNestedContent('authorColor', e.target.value)} 
                      className={`${darkInputClass} w-20`} 
                    />
                  </div>
                </div>
                <TextInput value={liveBlock.content?.borderLeft || ''} onChange={e => updateNestedContent('borderLeft', e.target.value)} placeholder="Left border (e.g., 4px solid #3B82F6)" className={darkInputClass} />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Text Styles */}
      <Card className="mb-2  border-gray-600">
        <Button onClick={() => toggleSection("textStyles")} size="sm" className="w-full flex justify-between hover:bg-gray-500 border-gray-500 text-white">{`Text Styles ${openSections.textStyles ? "▲" : "▼"}`}</Button>
        {openSections.textStyles && (
          <div className="mt-2 flex flex-wrap gap-2">
            <div className="w-100">
              <label className="text-sm text-gray-300">Text Color</label>
              
              <div className="flex flex-col gap-2">
                <HexColorPicker 
                  color={liveBlock.color || "#000000"} 
                  onChange={color => handleChange("color", color)}
                  style={{ width: '100%', height: '120px' }}
                />
                <TextInput 
                  value={liveBlock.color || "#000000"} 
                  onChange={e => handleChange("color", e.target.value)} 
                  className={`${darkInputClass} w-50`} 
                />
              </div>
            </div>
            <TextInput placeholder="Font size (e.g., 16px)" value={liveBlock.fontSize || ""} onChange={e => handleChange("fontSize", e.target.value)} className={darkInputClass} />
            <Select value={liveBlock.textAlign || "left"} onChange={e => handleChange("textAlign", e.target.value)} className={darkSelectClass}>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </Select>
            <Select value={liveBlock.fontWeight || ""} onChange={e => handleChange("fontWeight", e.target.value)} className={darkSelectClass}>
              <option value="">Normal</option>
              <option value="300">Light</option>
              <option value="400">Regular</option>
              <option value="500">Medium</option>
              <option value="600">Semibold</option>
              <option value="700">Bold</option>
              <option value="800">Extra Bold</option>
            </Select>
            <Select value={liveBlock.fontStyle || ""} onChange={e => handleChange("fontStyle", e.target.value)} className={darkSelectClass}>
              <option value="">Normal</option>
              <option value="italic">Italic</option>
              <option value="oblique">Oblique</option>
            </Select>
            <Select value={liveBlock.textDecoration || ""} onChange={e => handleChange("textDecoration", e.target.value)} className={darkSelectClass}>
              <option value="">No decoration</option>
              <option value="underline">Underline</option>
              <option value="line-through">Line-through</option>
              <option value="overline">Overline</option>
            </Select>
            <TextInput placeholder="Letter spacing (e.g., 0.5px)" value={liveBlock.letterSpacing || ""} onChange={e => handleChange("letterSpacing", e.target.value)} className={darkInputClass} />
            <TextInput placeholder="Line height (e.g., 1.5)" value={liveBlock.lineHeight || ""} onChange={e => handleChange("lineHeight", e.target.value)} className={darkInputClass} />
          </div>
        )}
      </Card>

      {/* Layout & Appearance */}
      <Card className="mb-2 bg-gray-700 border-gray-600">
        <Button onClick={() => toggleSection("layout")} size="sm" className="w-full flex justify-between bg-gray-600 hover:bg-gray-500 border-gray-500 text-white">{`Layout & Appearance ${openSections.layout ? "▲" : "▼"}`}</Button>
        {openSections.layout && (
          <div className="mt-2 flex flex-wrap gap-2">
            <TextInput placeholder="Margin" value={liveBlock.margin || ""} onChange={e => handleChange("margin", e.target.value)} className={darkInputClass} />
            <TextInput placeholder="Padding" value={liveBlock.padding || ""} onChange={e => handleChange("padding", e.target.value)} className={darkInputClass} />
            <TextInput placeholder="Width" value={liveBlock.width || "100%"} onChange={e => handleChange("width", e.target.value)} className={darkInputClass} />
            <TextInput placeholder="Height" value={liveBlock.height || ""} onChange={e => handleChange("height", e.target.value)} className={darkInputClass} />
            <Select value={liveBlock.display || "block"} onChange={e => handleChange("display", e.target.value)} className={darkSelectClass}>
              <option value="block">Block</option>
              <option value="flex">Flex</option>
              <option value="inline-block">Inline-block</option>
              <option value="grid">Grid</option>
            </Select>
            {liveBlock.display === "flex" && <>
              <Select value={liveBlock.justifyContent || ""} onChange={e => handleChange("justifyContent", e.target.value)} className={darkSelectClass}>
                <option value="">Default</option>
                <option value="flex-start">Flex Start</option>
                <option value="center">Center</option>
                <option value="flex-end">Flex End</option>
                <option value="space-between">Space Between</option>
                <option value="space-around">Space Around</option>
              </Select>
              <Select value={liveBlock.alignItems || ""} onChange={e => handleChange("alignItems", e.target.value)} className={darkSelectClass}>
                <option value="">Default</option>
                <option value="flex-start">Flex Start</option>
                <option value="center">Center</option>
                <option value="flex-end">Flex End</option>
                <option value="stretch">Stretch</option>
              </Select>
              <TextInput placeholder="Gap (e.g., 8px)" value={liveBlock.gap || ""} onChange={e => handleChange("gap", e.target.value)} className={darkInputClass} />
            </>}
            <div className="space-y-2">
              <label className="text-sm text-gray-300 pb-2">Background Color</label>
              <div className="flex flex-col gap-2">
                <HexColorPicker 
                  color={liveBlock.background || "#ffffff"} 
                  onChange={color => handleChange("background", color)}
                  style={{ width: '100%', height: '100px' }}
                />
                <TextInput 
                  value={liveBlock.background || "#ffffff"} 
                  onChange={e => handleChange("background", e.target.value)} 
                  className={`${darkInputClass} w-50`} 
                />
              </div>
            </div>
            <TextInput placeholder="Border (e.g., 1px solid #e5e7eb)" value={liveBlock.border || ""} onChange={e => handleChange("border", e.target.value)} className={darkInputClass} />
            <TextInput placeholder="Border radius (e.g., 8px)" value={liveBlock.borderRadius || ""} onChange={e => handleChange("borderRadius", e.target.value)} className={darkInputClass} />
            <TextInput placeholder="Box shadow (e.g., 0 1px 3px rgba(0,0,0,.1))" value={liveBlock.boxShadow || ""} onChange={e => handleChange("boxShadow", e.target.value)} className={darkInputClass} />
            <TextInput placeholder="Opacity (0-1)" value={numberOrEmpty(liveBlock.opacity)} onChange={e => handleChange("opacity", e.target.value)} className={darkInputClass} />
            <Select value={liveBlock.overflow || ""} onChange={e => handleChange("overflow", e.target.value)} className={darkSelectClass}>
              <option value="">Overflow auto</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
              <option value="scroll">Scroll</option>
              <option value="auto">Auto</option>
            </Select>
            <div className="flex justify-end w-full mt-2">
              <Button color="gray" size="sm" onClick={resetStyles} className="bg-gray-600 hover:bg-gray-500 text-white border-gray-500">Reset Styles</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Responsive */}
      <Card className="mb-2 bg-gray-700 border-gray-600">
        <Button onClick={() => toggleSection("responsive")} size="sm" className="w-full flex justify-between bg-gray-600 hover:bg-gray-500 border-gray-500 text-white">{`Responsive ${openSections.responsive ? "▲" : "▼"}`}</Button>
        {openSections.responsive && (
          <div className="mt-2 space-y-3">
            <div className="text-xs text-gray-300">Override styles per breakpoint. Leave empty to inherit.</div>
            {['base','md','lg'].map(bp => (
              <div key={bp} className="space-y-2 p-2 rounded bg-gray-600">
                <div className="text-xs uppercase tracking-wide text-gray-200">{bp}</div>
                <div className="flex flex-wrap gap-2">
                  <TextInput placeholder="Width" value={liveBlock?.responsive?.[bp]?.width || ""} onChange={e => handleChange('responsive', { ...(liveBlock.responsive||{}), [bp]: { ...(liveBlock?.responsive?.[bp]||{}), width: e.target.value } })} className={darkInputClass} />
                  <TextInput placeholder="Font size" value={liveBlock?.responsive?.[bp]?.fontSize || ""} onChange={e => handleChange('responsive', { ...(liveBlock.responsive||{}), [bp]: { ...(liveBlock?.responsive?.[bp]||{}), fontSize: e.target.value } })} className={darkInputClass} />
                  <TextInput placeholder="Gap" value={liveBlock?.responsive?.[bp]?.gap || ""} onChange={e => handleChange('responsive', { ...(liveBlock.responsive||{}), [bp]: { ...(liveBlock?.responsive?.[bp]||{}), gap: e.target.value } })} className={darkInputClass} />
                  <TextInput placeholder="Padding" value={liveBlock?.responsive?.[bp]?.padding || ""} onChange={e => handleChange('responsive', { ...(liveBlock.responsive||{}), [bp]: { ...(liveBlock?.responsive?.[bp]||{}), padding: e.target.value } })} className={darkInputClass} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Effects */}
      <Card className="mb-2 bg-gray-700 border-gray-600">
        <Button onClick={() => toggleSection("effects")} size="sm" className="w-full flex justify-between bg-gray-600 hover:bg-gray-500 border-gray-500 text-white">{`Effects ${openSections.effects ? "▲" : "▼"}`}</Button>
        {openSections.effects && (
          <div className="mt-2 flex flex-wrap gap-2">
            <TextInput placeholder="Backdrop blur (e.g., blur(4px))" value={liveBlock.backdropFilter || ""} onChange={e => handleChange("backdropFilter", e.target.value)} className={darkInputClass} />
            <TextInput placeholder="Filter (e.g., grayscale(0.1))" value={liveBlock.filter || ""} onChange={e => handleChange("filter", e.target.value)} className={darkInputClass} />
            <TextInput placeholder="Transform (e.g., translateY(4px))" value={liveBlock.transform || ""} onChange={e => handleChange("transform", e.target.value)} className={darkInputClass} />
            <TextInput placeholder="Transition (e.g., all .3s ease)" value={liveBlock.transition || "all 0.3s ease-in-out"} onChange={e => handleChange("transition", e.target.value)} className={darkInputClass} />
          </div>
        )}
      </Card>

      </div>
    </div>
  );
}
