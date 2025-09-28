// app/admin/page.js

"use client"; // because drag-and-drop needs client-side interactivity

import { useState } from "react";
import Canvas from "../components/Canvas";

// Mock dashboard widgets
const initialWidgets = [
  { id: "1", title: "Site Stats", content: "Visits: 1200 / Comments: 85" },
  { id: "2", title: "Recent Posts", content: "Post 1, Post 2, Post 3..." },
  { id: "3", title: "Quick Draft", content: "Start writing a new post..." },
  { id: "4", title: "Users", content: "Total: 32 users" },
];

export default function AdminDashboard() {
  const [widgets, setWidgets] = useState(initialWidgets);

  function handleDragEnd(result) {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    setWidgets(items);
  }

  return (
   <>
   <div className="antialiased bg-gray-50 dark:bg-gray-900 ">
   
 <Canvas />
</div>

   </>
  );
}
