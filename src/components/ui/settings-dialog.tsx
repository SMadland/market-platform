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
import { Settings, Shield, Sun, Moon, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";

export const SettingsDialog = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

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
        <div className="grid gap-4 py-4">
          <div>
            <h3 className="text-sm font-medium mb-3">Utseende</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="w-full"
              >
                <Sun className="w-4 h-4 mr-2" />
                Lys
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="w-full"
              >
                <Moon className="w-4 h-4 mr-2" />
                Mørk
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
                className="w-full"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Auto
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Personvern</h3>
            <div className="grid gap-2">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};