// components/defaultBlockContent.js

// Default width for all blocks
export const DEFAULT_BLOCK_WIDTH = "100%";

export const defaultContent = {
    // --- Text & Content ---
    heading: "This is a Heading",
    paragraph: "This is a sample paragraph. You can edit it from the CMS.",
    list: ["List item 1", "List item 2", "List item 3"],
    quote: "“Your inspiring quote goes here.”",
    divider: null,
  
    // --- Media ---
    image: "https://via.placeholder.com/800x400",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    gallery: [
      "https://via.placeholder.com/200x150",
      "https://via.placeholder.com/200x150",
      "https://via.placeholder.com/200x150",
    ],
  
    // --- Forms ---
    textinput: { placeholder: "Enter text…" },
    emailinput: { placeholder: "Enter your email…" },
    checkbox: { label: "I agree to terms" },
    radio: { options: ["Option 1", "Option 2"], selected: "Option 1" },
    button: { label: "Submit" },
  
    // --- Layout ---
    section: {
      background: "#f9f9f9",
      padding: "40px",
      content: "This is a section block",
    },
    container: {
      maxWidth: "1200px",
      padding: "20px",
      content: "This is a container block",
    },
    grid: {
      columns: 3,
      items: ["Column 1", "Column 2", "Column 3"],
    },
    spacer: { height: "40px" },
    navbar: {
      brand: "My Website",
      links: ["Home", "About", "Services", "Contact"],
    },
    footer: {
      text: "© 2025 My Website — All rights reserved",
      links: ["Privacy Policy", "Terms of Service"],
    },
  
    // --- Marketing ---
    hero: {
      title: "Welcome to My Site",
      subtitle: "Build stunning pages with our CMS",
      button: "Get Started",
    },
    features: [
      { title: "Feature 1", description: "Description for feature 1" },
      { title: "Feature 2", description: "Description for feature 2" },
      { title: "Feature 3", description: "Description for feature 3" },
    ],
    pricing: {
      plans: [
        { name: "Basic", price: "$9/mo", features: ["Feature A", "Feature B"] },
        { name: "Pro", price: "$29/mo", features: ["Feature A", "Feature B", "Feature C"] },
      ],
    },
    testimonial: {
      quote: "This CMS is amazing! It saved me hours of work.",
      author: "Jane Doe, CEO at Example",
    },
    cta: {
      text: "Ready to get started?",
      button: "Sign Up Now",
    },
  
    // --- Feedback & Interactivity ---
    badge: "New",
    progress: { value: 50 },
    rating: { stars: 4 },
    toast: "This is a toast notification!",
    tooltip: "Helpful tooltip text",
  };
  