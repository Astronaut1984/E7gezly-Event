import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import ModalListItem from "./ModalListItem";

export default function Modal({ appliedItems, open, title, onClose, items }) {
  const dialog = useRef();
  const [tempSelectedItems, tempSetSelectedItems] = useState(appliedItems || []);

  useEffect(() => {
    if (open) {
      tempSetSelectedItems(appliedItems || []);
      dialog.current.showModal();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open, appliedItems]);

  const handleClose = (isApply = false) => {
    if (isApply) {
      onClose(tempSelectedItems);
    } else {
      onClose(appliedItems);
    }
    dialog.current.close();
    document.body.style.overflow = "auto";
  };

  return createPortal(
    <dialog
      ref={dialog}
      onClick={(e) => {
        if (e.target === dialog.current) {
          handleClose();
        }
      }}
      className="outline-none focus:outline-none focus-visible:outline-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop:bg-black/50 bg-card p-0 border-none w-80 min-h-min max-h-100 rounded-2xl"
    >
      <div className="w-full h-20 bg-primary flex justify-center items-center text-primary-foreground text-3xl font-bold">
        <h1 className="select-none">{title}</h1>
      </div>
      <div className="w-full min-h-min max-h-60">
        <ul className="w-full h-full p-5 max-h-60 overflow-y-auto">
          {items && items.length > 0 ? (
            items.map((item) => (
              <ModalListItem
                title={item.name}
                key={item.id}
                selected={tempSelectedItems.includes(item.id)}
                toggleSelect={() =>
                  tempSetSelectedItems((prev) =>
                    prev.includes(item.id)
                      ? prev.filter((i) => i !== item.id)
                      : [...prev, item.id]
                  )
                }
              />
            ))
          ) : (
            <li className="text-center py-4 text-muted-foreground">
              No items available
            </li>
          )}
        </ul>
      </div>

      <div className="w-full h-20 bg-card flex justify-center items-center text-card text-2xl font-bold border-t border-secondary">
        <button
          onClick={() => handleClose(true)}
          className="select-none bg-primary-hover px-25 py-2 rounded-2xl text-primary-foreground"
        >
          Apply
        </button>
      </div>
    </dialog>,
    document.getElementById("modal")
  );
}