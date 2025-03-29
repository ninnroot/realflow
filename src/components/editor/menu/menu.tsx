import { Button } from "@/components/ui/button";
import { useEditorStore } from "../store";
import { BoxElement } from "../elements/box";

export const Menu = () => {
    const { addElement, deleteSelectedElements, selectedElementIds } = useEditorStore();
    
    return (
        <div className="flex gap-2">
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
        </div>
    );
};

export default Menu;
