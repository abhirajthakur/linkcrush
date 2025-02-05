import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ShortenedUrlDisplay } from "./ShortendUrlDisplay";
import { UrlForm } from "./UrlForm";

export const UrlShortenerForm = () => {
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (url: string) => {
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
      // const newShortUrl = `${REDIRECT_BASE_URL}/${data.short_code}`;
      const newShortUrl = `${window.location.origin}/${data.short_code}`;
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

  return (
    <div className="w-full max-w-md space-y-8 animate-fade-in">
      <UrlForm onSubmit={handleSubmit} isLoading={isLoading} />
      {shortUrl && <ShortenedUrlDisplay shortUrl={shortUrl} />}
    </div>
  );
};
