import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

const Page = () => {
  return (
    <div className="flex flex-col w-full gap-y-5">
      <div className="flex justify-between items-center bg-destructive/15 p-2 w-full">
        <div className="flex flex-col gap-y-1">
          <span className="dark:text-red-100 text-red-900 font-medium text-sm">
            Archive Document
          </span>
          <span className="dark:text-red-100/70 text-red-900/70 text-xs font-normal">
            This Document is in trash and will be deleted after 30 days. Either
            restore it or remove it permanantly.
          </span>
        </div>
        <div className="flex gap-x-1 items-center">
          <Button size="sm">Restore</Button>
          <Button size="sm" variant="destructive">
            Remove
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center bg-accent-foreground p-2 w-full">
        <div className="flex flex-col gap-y-1">
          <span className="text-background font-medium text-sm">
            Archive Document
          </span>
          <span className="text-background/80 text-xs font-normal">
            This Document is in trash and will be deleted after 30 days. Either
            restore it or remove it permanantly.
          </span>
        </div>
        <div className="flex gap-x-1 items-center">
          <Button
            size="sm"
            variant="outline"
            className="border-background/10 bg-transparent dark:hover:bg-background/10 hover:bg-background/20 hover:text-background text-background/80"
          >
            Restore
          </Button>
          <Button
            size="sm"
            className="bg-background text-foreground hover:bg-background/80 hover:text-foreground"
          >
            Remove
          </Button>
        </div>
      </div>
      <div className="flex w-full gap-x-2 p-2 items-center">
        <span className="text-muted-foreground text-sm">Toggle Theme</span>
        <ModeToggle />
      </div>
    </div>
  );
};

export default Page;
