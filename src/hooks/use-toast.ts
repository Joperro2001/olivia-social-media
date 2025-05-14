
// We need to re-export what the shadcn/ui toast component is expecting
import { useToast as useToastInternal, toast as toastInternal } from "@/components/ui/use-toast";

export const useToast = useToastInternal;
export const toast = toastInternal;
