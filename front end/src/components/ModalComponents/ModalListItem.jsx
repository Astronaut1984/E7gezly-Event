import { useState,useEffect } from "react";

export default function ModalListItem({ toggleSelect,title ,selected}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
    setMounted(false);
    }, []);

    return (
    <li
      onClick={toggleSelect}
      className={`select-none w-full p-3 rounded mb-2 li-hover text-foreground 
        ${selected ? "selected" : ""} 
        ${mounted ? "transition-colors duration-300" : ""}`}
    >
      {title}
    </li>

  );
}
