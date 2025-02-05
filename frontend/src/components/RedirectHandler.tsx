import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const RedirectHandler = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!shortCode) return;

    const fetchUrl = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/shorten/${shortCode}`);
        if (!response.ok) throw new Error();

        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        navigate("/");
      } catch {
        toast({
          title: "Error",
          description: "Failed to redirect to original URL",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    fetchUrl();
  }, [shortCode, navigate, toast]);

  return null;
};
