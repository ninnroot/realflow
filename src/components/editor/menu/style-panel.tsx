import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useEditorStore } from "../store";
import { Styles } from "../styles";

export const StylePanel = () => {
    const { selectedElementIds, elements, updateElementStyles } = useEditorStore();
    
    // Get the first selected element's styles (if any)
    const selectedElement = elements.find(e => e.id === selectedElementIds[0]);
    const styles = selectedElement?.styles || {} as Styles;

    const handleStyleChange = (key: keyof Styles, value: string | number) => {
        if (selectedElementIds.length === 0) return;
        
        updateElementStyles(selectedElementIds, {
            [key]: value
        });
    };

    return (
        <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
                <Label className="text-sm">Font Size:</Label>
                <Input 
                    type="number" 
                    value={styles.fontSize as number}
                    onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
                    min={8}
                    max={72}
                    className="h-8 w-20"
                />
            </div>

            <div className="flex items-center gap-2">
                <Label className="text-sm">Font:</Label>
                <Select 
                    value={styles.fontFamily as string} 
                    onValueChange={(value) => handleStyleChange('fontFamily', value)}
                >
                    <SelectTrigger className="h-8 w-[140px]">
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

            <div className="flex items-center gap-2">
                <Label className="text-sm">Background:</Label>
                <Input 
                    type="color" 
                    value={styles.fillStyle as string}
                    onChange={(e) => handleStyleChange('fillStyle', e.target.value)}
                    className="h-8 w-10 p-1"
                />
            </div>

            <div className="flex items-center gap-2">
                <Label className="text-sm">Text:</Label>
                <Input 
                    type="color" 
                    value={styles.strokeStyle as string}
                    onChange={(e) => handleStyleChange('strokeStyle', e.target.value)}
                    className="h-8 w-10 p-1"
                />
            </div>
        </div>
    );
}; 