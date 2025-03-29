import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useEditorStore } from "../store";

export const StylePanel = () => {
    const { selectedElementIds, elements, updateElementStyles } = useEditorStore();
    
    // Get the first selected element's styles (if any)
    const selectedElement = elements.find(e => e.id === selectedElementIds[0]);
    const styles = selectedElement?.styles || {};

    const handleStyleChange = (key: string, value: string) => {
        if (selectedElementIds.length === 0) return;
        
        updateElementStyles(selectedElementIds, {
            ...styles,
            [key]: value
        });
    };

    return (
        <div className="p-4 border rounded-lg space-y-4">
            <h3 className="font-semibold">Style Panel</h3>
            
            <div className="space-y-2">
                <Label>Font Family</Label>
                <Select 
                    value={styles.fontFamily as string} 
                    onValueChange={(value) => handleStyleChange('fontFamily', value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="arial">Arial</SelectItem>
                        <SelectItem value="times new roman">Times New Roman</SelectItem>
                        <SelectItem value="helvetica">Helvetica</SelectItem>
                        <SelectItem value="courier new">Courier New</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Background Color</Label>
                <Input 
                    type="color" 
                    value={styles.fillStyle as string}
                    onChange={(e) => handleStyleChange('fillStyle', e.target.value)}
                    className="h-10 w-full"
                />
            </div>

            <div className="space-y-2">
                <Label>Text Color</Label>
                <Input 
                    type="color" 
                    value={styles.strokeStyle as string}
                    onChange={(e) => handleStyleChange('strokeStyle', e.target.value)}
                    className="h-10 w-full"
                />
            </div>

            <div className="space-y-2">
                <Label>Arrow Direction</Label>
                <Select 
                    value={styles.arrowDirection || 'right'} 
                    onValueChange={(value) => handleStyleChange('arrowDirection', value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="up">Up</SelectItem>
                        <SelectItem value="down">Down</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}; 