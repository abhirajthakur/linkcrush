import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2 } from "lucide-react";
import { useState } from "react";

interface UrlFormProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
}

export const UrlForm = ({ onSubmit, isLoading }: UrlFormProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      await onSubmit(url);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="url"
          placeholder="Enter your long URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 bg-white/80 backdrop-blur-sm border-violet-200 focus:border-violet-400 transition-all shadow-sm"
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-violet-600 hover:bg-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl min-w-[120px]"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Shortening
            </div>
          ) : (
            <span className="inline-flex items-center gap-2">
              Shorten <Link2 className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};
