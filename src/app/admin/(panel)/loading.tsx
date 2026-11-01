import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="grid min-h-[50vh] place-items-center text-muted-foreground">
      <Loader2 className="size-6 animate-spin" aria-label="A carregar" />
    </div>
  );
}
