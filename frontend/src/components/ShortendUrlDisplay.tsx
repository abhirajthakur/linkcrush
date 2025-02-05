import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShortenedUrlDisplayProps {
  shortUrl: string;
}

export const ShortenedUrlDisplay = ({ shortUrl }: ShortenedUrlDisplayProps) => {
  const { toast } = useToast();
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    toast({
      title: "Copied!",
      description: "URL copied to clipboard",
    });
  };

  const handleRedirect = () => {
    window.open(shortUrl, "_blank");
  };

  return (
    <div className="p-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg space-y-4 animate-fade-in border border-violet-100">
      <div className="flex items-center justify-between">
        <p className="font-medium text-sm text-gray-700">Your shortened URL:</p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="hover:bg-violet-50"
          >
            <Copy className="h-4 w-4 text-violet-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedirect}
            className="hover:bg-violet-50"
          >
            <ExternalLink className="h-4 w-4 text-violet-600" />
          </Button>
        </div>
      </div>
      <button
        onClick={handleRedirect}
        className="text-violet-600 hover:text-violet-700 transition-colors break-all block font-medium text-left w-full"
      >
        {shortUrl}
      </button>
    </div>
  );
};
