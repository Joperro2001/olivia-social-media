
import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, Trash2, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getChatStoragePrefs, saveChatStoragePrefs, purgeOldLocalMessages } from "@/utils/storagePrefsUtils";

interface ChatSecuritySettingsProps {
  onClose?: () => void;
}

const ChatSecuritySettings: React.FC<ChatSecuritySettingsProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [useLocalStorage, setUseLocalStorage] = useState(true);
  const [autoDelete, setAutoDelete] = useState(true);
  const [retentionDays, setRetentionDays] = useState(7);
  
  // Load current preferences
  useEffect(() => {
    if (user) {
      const prefs = getChatStoragePrefs(user.id);
      setUseLocalStorage(prefs.useLocalStorage);
      setAutoDelete(prefs.autoDeleteAfterSync);
      setRetentionDays(prefs.localStorageTimeout / (24 * 60 * 60 * 1000)); // Convert ms to days
    }
  }, [user]);
  
  const handleSaveSettings = () => {
    if (!user) return;
    
    saveChatStoragePrefs(user.id, {
      useLocalStorage,
      autoDeleteAfterSync: autoDelete,
      localStorageTimeout: retentionDays * 24 * 60 * 60 * 1000 // Days to ms
    });
    
    toast({
      title: "Settings saved",
      description: "Your chat security preferences have been updated",
    });
    
    if (onClose) onClose();
  };
  
  const handlePurgeNow = () => {
    if (!user) return;
    
    purgeOldLocalMessages(user.id);
    
    toast({
      title: "Local messages cleaned",
      description: "Old locally stored messages have been removed",
    });
  };
  
  return (
    <div className="p-4 space-y-6 bg-white rounded-lg shadow">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="font-medium text-lg">Chat Security Settings</h3>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="use-local-storage" className="font-medium">Enable Local Message Backup</Label>
            <p className="text-sm text-gray-500">Store messages on your device for offline access</p>
          </div>
          <Switch
            id="use-local-storage"
            checked={useLocalStorage}
            onCheckedChange={setUseLocalStorage}
          />
        </div>
        
        {useLocalStorage && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-delete" className="font-medium">Auto-Delete Old Messages</Label>
                <p className="text-sm text-gray-500">Remove local messages after they're synchronized</p>
              </div>
              <Switch
                id="auto-delete"
                checked={autoDelete}
                onCheckedChange={setAutoDelete}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retention-days" className="font-medium">Local Message Retention</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="retention-days"
                  type="number"
                  min={1}
                  max={30}
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(parseInt(e.target.value) || 7)}
                  className="w-20"
                />
                <p className="text-sm text-gray-500">days</p>
              </div>
              <p className="text-xs text-gray-500">
                Local messages older than this will be automatically deleted
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePurgeNow}
              className="w-full flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clean Local Storage Now</span>
            </Button>
          </>
        )}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          variant="outline" 
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSaveSettings}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Save Settings</span>
        </Button>
      </div>
    </div>
  );
};

export default ChatSecuritySettings;
