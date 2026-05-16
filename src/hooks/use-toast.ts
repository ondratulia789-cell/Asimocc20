import { toast as sonnerToast } from "sonner";

type ToastOpts = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

export const toast = ({ title, description, variant, duration }: ToastOpts) => {
  const message = title ?? "";
  const opts = { description, duration };
  if (variant === "destructive") return sonnerToast.error(message, opts);
  return sonnerToast(message, opts);
};

export const useToast = () => ({ toast });
