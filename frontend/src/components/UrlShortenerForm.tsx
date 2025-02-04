import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, ExternalLink, Link2 } from "lucide-react";
import { useState } from "react";

export const UrlShortenerForm = () => {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const REDIRECT_BASE_URL = import.meta.env.VITE_REDIRECT_BASE_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url }),
      });

      if (!response.ok) {
        throw new Error("Failed to shorten URL");
      }

      const data = await response.json();
      const newShortUrl = `${REDIRECT_BASE_URL}/${data.short_code}`;
      setShortUrl(newShortUrl);
      toast({
        title: "Success!",
        description: "Your URL has been shortened",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to redirect to original URL",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    toast({
      title: "Copied!",
      description: "URL copied to clipboard",
    });
  };

  const handleRedirect = async () => {
    const shortCode = shortUrl.split("/").pop();
    if (shortCode) {
      try {
        const response = await fetch(`${BACKEND_URL}/shorten/${shortCode}`);
        if (!response.ok) {
          throw new Error("Failed to fetch original URL");
        }
        const data = await response.json();
        window.open(data.url, "_blank");
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to redirect to original URL",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 animate-fade-in">
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

      {shortUrl && (
        <div className="p-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg space-y-4 animate-fade-in border border-violet-100">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm text-gray-700">
              Your shortened URL:
            </p>
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
      )}
    </div>
  );
};
