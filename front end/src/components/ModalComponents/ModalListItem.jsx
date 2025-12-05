import { useState } from "react";

export default function ModalListItem({ title ,isSelected}) {
  const [selected, toggleSelected] = useState(isSelected);
  
  function toggleSelectHandler(){
    toggleSelected((prev) => !prev);
  }
  
  return (
    <li className={`select-none w-full p-3 rounded mb-2 li-hover text-foreground ${selected && 'selected'}`} onClick={() => toggleSelected(prev => !prev)}>
      {title}
    </li>
  );
}
