import { useState } from "react";

export default function SelectOnly({
  title,
  options,
  classNameVar,
  onSelect,
  error,
  placeholder,
  value,
}) {
  const [selected, setSelected] = useState(value || "");
  const [open, setOpen] = useState(false);

  const handleSelect = (option) => {
    setSelected(option);
    setOpen(false);
    if (onSelect) onSelect(option);
  };

  return (
    <div className={`w-full relative mb-[23px] ${classNameVar}`}>
      <span className="text-[14px] text-secondary-foreground leading-normal pl-[7px]">
        {title}
      </span>
      <div
        className={`peer text-[16px] text-secondary-foreground bg-transparent w-full h-[45px] px-[7px] border border-card rounded-md flex items-center justify-between cursor-pointer ${
          error ? "border-destructive" : "border-secondary"
        }`}
        onClick={() => setOpen(!open)}
      >
        <span>{value || selected || placeholder || "Select"}</span>
        <span className="ml-2">&#9662;</span>
      </div>

      {open && (
        <ul className="absolute w-full bg-popover text-popover-foreground shadow-lg z-20 mt-1 max-h-40 overflow-auto border border-card rounded-md">
          {options.map((option) => (
            <li
              key={option}
              className="px-4 py-2 hover:bg-card cursor-pointer"
              onMouseDown={() => handleSelect(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
