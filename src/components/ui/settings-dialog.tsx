import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SettingsDialog = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Innstillinger
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Innstillinger</DialogTitle>
          <DialogDescription>
            Administrer dine personvern- og kontoinnstillinger
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => handleNavigate('/privacy')}
          >
            <Shield className="w-4 h-4 mr-2" />
            Personvernerklæring
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => handleNavigate('/gdpr')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Personverninnstillinger
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};