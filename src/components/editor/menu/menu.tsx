import { Button } from "@/components/ui/button";
import { useEditorStore } from "../store";
import { BoxElement } from "../elements/box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash } from "lucide-react";
import { StylePanel } from "./style-panel";

export const Menu = () => {
  const {
    addElement,
    deleteSelectedElements,
    selectedElementIds,
    arrowStyle,
    setArrowStyle,
    selectedArrowId,
    deletedSelectedArrows,
  } = useEditorStore();

  return (
    <div className="flex items-center gap-4 p-2 border-b">
      <div className="flex items-center gap-2">
        <Button
          onClick={() => {
            addElement();
            console.log("add box");
          }}
          size="sm"
        >
          Add Box
        </Button>

        <Button
          onClick={() => {
            deleteSelectedElements();
            deletedSelectedArrows();
          }}
          disabled={selectedElementIds.length === 0 && !selectedArrowId}
          variant="destructive"
          size="sm"
        >
          <Trash className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm">Arrow Style:</span>
          <Select
            value={arrowStyle}
            onValueChange={(value: "direct" | "right-angle" | "curve") =>
              setArrowStyle(value)
            }
          >
            <SelectTrigger className="h-8 w-[140px]">
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

      <div className="h-4 w-px bg-gray-200" />

      <StylePanel />
    </div>
  );
};

export default Menu;
