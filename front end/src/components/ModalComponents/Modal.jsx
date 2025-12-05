import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import ModalListItem from "./ModalListItem";

export default function Modal({ children, open, title, onClose }) {
  const dialog = useRef();

  let SelectedItems = []; 

  function handleSelectItem(item){
    SelectedItems.push(item);
  }

  useEffect(() => {
    if (open) {
      dialog.current.showModal();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const handleClose = (isApply) => {
    dialog.current.close();
    document.body.style.overflow = "auto"; // restore scroll
    onClose?.();
  };

  return createPortal(
    <dialog
      ref={dialog}
      onClick={(e) => {
        if (e.target === dialog.current) {
          handleClose();
        }
      }}
      onClose={handleClose}
      className="outline-none focus:outline-none focus-visible:outline-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop:bg-black/50 bg-card p-0 border-none w-80 min-h-min max-h-100 rounded-2xl"
    >
      <div className="w-full h-20 bg-primary flex justify-center items-center text-primary-foreground text-3xl font-bold">
        <h1 className="select-none">{title}</h1>
      </div>
      <div className="w-full min-h-min max-h-60">
        <ul className="w-full h-full p-5 max-h-60 overflow-y-auto">
          <ModalListItem title="Category 1" key={1}/>
          <ModalListItem title="Category 1" key={2}/>
          <ModalListItem title="Category 1" key={3}/>
          <ModalListItem title="Category 1" key={4}/>
        </ul>
      </div>

      <div className="w-full h-20 bg-card flex justify-center items-center text-card text-2xl font-bold border-t border-secondary">
        <button
          onClick={handleClose}
          className="select-none bg-primary-hover px-25 py-2 rounded-2xl text-primary-foreground"
        >
          Apply
        </button>
      </div>
    </dialog>,
    document.getElementById("modal")
  );
}
