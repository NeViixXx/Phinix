"use client";

import { useState, useEffect } from "react";
import { Card, Button, TextInput, Select, Textarea, ToggleSwitch } from "flowbite-react";
import { HexColorPicker } from "react-colorful";
import { FiX, FiChevronUp, FiChevronDown, FiSettings, FiLayout, FiType, FiEye, FiSmartphone } from "react-icons/fi";

// Component for section headers
const SectionHeader = ({ title, isOpen, onToggle, icon: Icon }) => (
  <Button 
    onClick={onToggle} 
    size="sm" 
    className="w-full flex justify-between items-center bg-gray-600 hover:bg-gray-500 border-gray-500 text-white mb-2"
  >
    <span className="flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4" />}
      {title}
    </span>
    {isOpen ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
  </Button>
);

// Component for form field with label
const FormField = ({ label, children }) => (
  <div className="space-y-1 mb-3">
    {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
    {children}
  </div>
);

// Component for color picker with input field
const ColorPickerField = ({ label, color, onChange, className = "" }) => (
  <FormField label={label}>
    <div className="flex items-center gap-2">
      <HexColorPicker 
        color={color} 
        onChange={onChange}
        style={{ width: '100%', height: '80px' }}
      />
      <TextInput 
        value={color} 
        onChange={e => onChange(e.target.value)} 
        className={`bg-gray-600 border-gray-500 text-white w-20 ${className}`} 
      />
    </div>
  </FormField>
);

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
  
  const darkInputClass = "bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500";
  const darkSelectClass = "bg-gray-600 border-gray-500 text-white";
  

  return (
    <div className="fixed right-0 top-0 w-80 h-screen bg-gray-800 border-l border-gray-700 p-0 overflow-y-auto shadow-xl z-50">
      {/* Modernized Header */}
      <div className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Inspector</h2>
          <p className="text-xs text-gray-400">{block.type?.toUpperCase()} settings</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white transition"
            aria-label="Close inspector"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Content Section */}
        <div>
          <SectionHeader 
            title="Content" 
            isOpen={openSections.content} 
            onToggle={() => toggleSection("content")} 
            icon={FiSettings}
          />
          {openSections.content && (
            <Card className="bg-gray-700 border-gray-600 p-3">
              {/* Content fields will be implemented in the next step */}
              {(block.type === "heading" || block.type === "paragraph") && (
                <FormField>
                  <Textarea 
                    rows={3} 
                    value={liveBlock.content} 
                    onChange={e => handleChange("content", e.target.value)} 
                    placeholder="Text content" 
                    className={darkInputClass} 
                  />
                </FormField>
              )}
              {block.type === "button" && (
                <div className="space-y-2">
                  <FormField label="Button Text">
                    <TextInput 
                      value={liveBlock.content} 
                      onChange={e => handleChange("content", e.target.value)} 
                      placeholder="Button label" 
                      className={darkInputClass} 
                    />
                  </FormField>
                  <FormField label="Button Link">
                    <TextInput 
                      value={liveBlock.href || ""} 
                      onChange={e => handleChange("href", e.target.value)} 
                      placeholder="Button link (href)" 
                      className={darkInputClass} 
                    />
                  </FormField>
                </div>
              )}
              {block.type === "image" && (
                <FormField label="Image URL">
                  <TextInput 
                    value={liveBlock.content} 
                    onChange={e => handleChange("content", e.target.value)} 
                    placeholder="Image URL" 
                    className={darkInputClass} 
                  />
                </FormField>
              )}
              {block.type === "video" && (
                <FormField label="Video URL">
                  <TextInput 
                    value={liveBlock.content} 
                    onChange={e => handleChange("content", e.target.value)} 
                    placeholder="Video URL" 
                    className={darkInputClass} 
                  />
                </FormField>
              )}
              {/* Other block types will be implemented in the next step */}
            </Card>
          )}
        </div>

        {/* Text Styles Section */}
        <div>
          <SectionHeader 
            title="Text Styles" 
            isOpen={openSections.textStyles} 
            onToggle={() => toggleSection("textStyles")} 
            icon={FiType}
          />
          {openSections.textStyles && (
            <Card className="bg-gray-700 border-gray-600 p-3">
              <div className="space-y-3">
                <FormField label="Text Align">
                  <Select 
                    value={liveBlock.textAlign || ""} 
                    onChange={e => handleChange("textAlign", e.target.value)} 
                    className={darkSelectClass}
                  >
                    <option value="">Default</option>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="justify">Justify</option>
                  </Select>
                </FormField>
                <div className="grid grid-cols-2 gap-2">
                  <FormField label="Font Size">
                    <TextInput 
                      value={liveBlock.fontSize || ""} 
                      onChange={e => handleChange("fontSize", e.target.value)} 
                      placeholder="Font size" 
                      className={darkInputClass} 
                    />
                  </FormField>
                  <FormField label="Line Height">
                    <TextInput 
                      value={liveBlock.lineHeight || ""} 
                      onChange={e => handleChange("lineHeight", e.target.value)} 
                      placeholder="Line height" 
                      className={darkInputClass} 
                    />
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FormField label="Font Weight">
                    <Select 
                      value={liveBlock.fontWeight || ""} 
                      onChange={e => handleChange("fontWeight", e.target.value)} 
                      className={darkSelectClass}
                    >
                      <option value="">Default</option>
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="100">100</option>
                      <option value="200">200</option>
                      <option value="300">300</option>
                      <option value="400">400</option>
                      <option value="500">500</option>
                      <option value="600">600</option>
                      <option value="700">700</option>
                      <option value="800">800</option>
                      <option value="900">900</option>
                    </Select>
                  </FormField>
                  <FormField label="Font Style">
                    <Select 
                      value={liveBlock.fontStyle || ""} 
                      onChange={e => handleChange("fontStyle", e.target.value)} 
                      className={darkSelectClass}
                    >
                      <option value="">Default</option>
                      <option value="normal">Normal</option>
                      <option value="italic">Italic</option>
                    </Select>
                  </FormField>
                </div>
                <FormField label="Text Decoration">
                  <Select 
                    value={liveBlock.textDecoration || ""} 
                    onChange={e => handleChange("textDecoration", e.target.value)} 
                    className={darkSelectClass}
                  >
                    <option value="">Default</option>
                    <option value="none">None</option>
                    <option value="underline">Underline</option>
                    <option value="line-through">Line Through</option>
                    <option value="overline">Overline</option>
                  </Select>
                </FormField>
                <div className="grid grid-cols-2 gap-2">
                  <FormField label="Letter Spacing">
                    <TextInput 
                      value={liveBlock.letterSpacing || ""} 
                      onChange={e => handleChange("letterSpacing", e.target.value)} 
                      placeholder="Letter spacing" 
                      className={darkInputClass} 
                    />
                  </FormField>
                  <FormField label="Text Color">
                    <TextInput 
                      value={liveBlock.color || ""} 
                      onChange={e => handleChange("color", e.target.value)} 
                      placeholder="Text color" 
                      className={darkInputClass} 
                    />
                  </FormField>
                </div>
                <ColorPickerField 
                  label="Text Color" 
                  color={liveBlock.color || "#000000"} 
                  onChange={color => handleChange("color", color)} 
                />
              </div>
            </Card>
            )}
          </div>

          {/* Layout Section */}
          <div>
            <SectionHeader 
              title="Layout" 
              isOpen={openSections.layout} 
              onToggle={() => toggleSection("layout")} 
              icon={FiLayout}
            />
            {openSections.layout && (
              <Card className="bg-gray-700 border-gray-600 p-3">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <FormField label="Width">
                      <TextInput 
                        value={liveBlock.width || ""} 
                        onChange={e => handleChange("width", e.target.value)} 
                        placeholder="Width (e.g., 100%)" 
                        className={darkInputClass} 
                      />
                    </FormField>
                    <FormField label="Height">
                      <TextInput 
                        value={liveBlock.height || ""} 
                        onChange={e => handleChange("height", e.target.value)} 
                        placeholder="Height" 
                        className={darkInputClass} 
                      />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField label="Margin">
                      <TextInput 
                        value={liveBlock.margin || ""} 
                        onChange={e => handleChange("margin", e.target.value)} 
                        placeholder="Margin" 
                        className={darkInputClass} 
                      />
                    </FormField>
                    <FormField label="Padding">
                      <TextInput 
                        value={liveBlock.padding || ""} 
                        onChange={e => handleChange("padding", e.target.value)} 
                        placeholder="Padding" 
                        className={darkInputClass} 
                      />
                    </FormField>
                  </div>
                  <FormField label="Display">
                    <Select 
                      value={liveBlock.display || "block"} 
                      onChange={e => handleChange("display", e.target.value)} 
                      className={darkSelectClass}
                    >
                      <option value="block">Block</option>
                      <option value="flex">Flex</option>
                      <option value="grid">Grid</option>
                      <option value="inline">Inline</option>
                      <option value="inline-block">Inline Block</option>
                      <option value="none">None</option>
                    </Select>
                  </FormField>
                  {liveBlock.display === "flex" && (
                    <>
                      <FormField label="Justify Content">
                        <Select 
                          value={liveBlock.justifyContent || ""} 
                          onChange={e => handleChange("justifyContent", e.target.value)} 
                          className={darkSelectClass}
                        >
                          <option value="">Default</option>
                          <option value="flex-start">Start</option>
                          <option value="center">Center</option>
                          <option value="flex-end">End</option>
                          <option value="space-between">Space Between</option>
                          <option value="space-around">Space Around</option>
                          <option value="space-evenly">Space Evenly</option>
                        </Select>
                      </FormField>
                      <FormField label="Align Items">
                        <Select 
                          value={liveBlock.alignItems || ""} 
                          onChange={e => handleChange("alignItems", e.target.value)} 
                          className={darkSelectClass}
                        >
                          <option value="">Default</option>
                          <option value="flex-start">Start</option>
                          <option value="center">Center</option>
                          <option value="flex-end">End</option>
                          <option value="stretch">Stretch</option>
                          <option value="baseline">Baseline</option>
                        </Select>
                      </FormField>
                      <FormField label="Gap">
                        <TextInput 
                          value={liveBlock.gap || ""} 
                          onChange={e => handleChange("gap", e.target.value)} 
                          placeholder="Gap" 
                          className={darkInputClass} 
                        />
                      </FormField>
                    </>
                  )}
                  <FormField label="Overflow">
                    <Select 
                      value={liveBlock.overflow || ""} 
                      onChange={e => handleChange("overflow", e.target.value)} 
                      className={darkSelectClass}
                    >
                      <option value="">Default</option>
                      <option value="visible">Visible</option>
                      <option value="hidden">Hidden</option>
                      <option value="scroll">Scroll</option>
                      <option value="auto">Auto</option>
                    </Select>
                  </FormField>
                </div>
              </Card>
            )}
        </div>

          {/* Effects Section */}
          <div>
            <SectionHeader 
              title="Effects" 
              isOpen={openSections.effects} 
              onToggle={() => toggleSection("effects")} 
              icon={FiEye}
            />
            {openSections.effects && (
              <Card className="bg-gray-700 border-gray-600 p-3">
                <div className="space-y-3">
                  <ColorPickerField 
                    label="Background Color" 
                    color={liveBlock.background || "#ffffff"} 
                    onChange={color => handleChange("background", color)} 
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <FormField label="Border">
                      <TextInput 
                        value={liveBlock.border || ""} 
                        onChange={e => handleChange("border", e.target.value)} 
                        placeholder="Border" 
                        className={darkInputClass} 
                      />
                    </FormField>
                    <FormField label="Border Radius">
                      <TextInput 
                        value={liveBlock.borderRadius || ""} 
                        onChange={e => handleChange("borderRadius", e.target.value)} 
                        placeholder="Border radius" 
                        className={darkInputClass} 
                      />
                    </FormField>
                  </div>
                  <FormField label="Box Shadow">
                    <TextInput 
                      value={liveBlock.boxShadow || ""} 
                      onChange={e => handleChange("boxShadow", e.target.value)} 
                      placeholder="Box shadow" 
                      className={darkInputClass} 
                    />
                  </FormField>
                  <FormField label="Opacity">
                    <TextInput 
                      type="number" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={liveBlock.opacity || ""} 
                      onChange={e => handleChange("opacity", e.target.value)} 
                      placeholder="Opacity (0-1)" 
                      className={darkInputClass} 
                    />
                  </FormField>
                </div>
              </Card>
            )}
          </div>

          {/* Responsive Section */}
          <div>
            <SectionHeader 
              title="Responsive" 
              isOpen={openSections.responsive} 
              onToggle={() => toggleSection("responsive")} 
              icon={FiSmartphone}
            />
            {openSections.responsive && (
              <Card className="bg-gray-700 border-gray-600 p-3">
                <div className="space-y-3">
                  <FormField>
                    <div className="flex items-center gap-2">
                      <ToggleSwitch 
                        checked={!!liveBlock.hideMobile} 
                        onChange={e => handleChange("hideMobile", e)} 
                        label="Hide on mobile devices"
                      />
                    </div>
                  </FormField>
                  <FormField>
                    <div className="flex items-center gap-2">
                      <ToggleSwitch 
                        checked={!!liveBlock.hideTablet} 
                        onChange={e => handleChange("hideTablet", e)} 
                        label="Hide on tablet devices"
                      />
                    </div>
                  </FormField>
                  <FormField>
                    <div className="flex items-center gap-2">
                      <ToggleSwitch 
                        checked={!!liveBlock.hideDesktop} 
                        onChange={e => handleChange("hideDesktop", e)} 
                        label="Hide on desktop devices"
                      />
                    </div>
                  </FormField>
                </div>
              </Card>
            )}
          </div>

          {/* Reset Button */}
          <Button 
            onClick={resetStyles} 
            size="sm" 
            className="w-full mt-4 bg-red-600 hover:bg-red-700 border-red-700"
          >
            Reset Styles
          </Button>
        </div>
      </div>
    
  );
}
