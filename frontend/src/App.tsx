import { RedirectHandler } from "@/components/RedirectHandler";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Route, Routes } from "react-router";
import Index from "./pages/Index";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/:shortCode" element={<RedirectHandler />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
