import { Button } from "@/components/ui/button";
import { useEditorStore } from "../store";
import { BoxElement } from "../elements/box";

export const Menu = () => {
    const {addElement, context} = useEditorStore()
  return (
    <div>
      <Button onClick={() => {
        addElement()
        console.log('add box')
      }}>Add Box</Button>
    </div>
  );
};

export default Menu;
