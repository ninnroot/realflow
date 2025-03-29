import { Button } from "@/components/ui/button";
import { useEditorStore } from "../store";
import { BoxElement } from "../elements/box";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Menu = () => {
    const { addElement, deleteSelectedElements, selectedElementIds, arrowStyle, setArrowStyle } = useEditorStore();
    
    return (
        <div className="flex gap-2 items-center">
            <Button onClick={() => {
                addElement();
                console.log('add box');
            }}>Add Box</Button>
            
            <Button 
                onClick={deleteSelectedElements}
                disabled={selectedElementIds.length === 0}
                variant="destructive"
            >
                Delete Selected ({selectedElementIds.length})
            </Button>

            <div className="flex items-center gap-2">
                <span className="text-sm">Arrow Style:</span>
                <Select value={arrowStyle} onValueChange={(value: "direct" | "right-angle" | "curve") => setArrowStyle(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select arrow style" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="direct">Direct</SelectItem>
                        <SelectItem value="right-angle">Right Angle</SelectItem>
                        <SelectItem value="curve">Curve</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export default Menu;
