import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import placeholderPic from "@/assets/placeholder.png";

export default function ImagePicker({ onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  const handleClear = () => {
    setPreview(null);
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 w-full">
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleSelect}
        className="w-100 hover:cursor-pointer"
      />

      <button type="button" className="destructive-on-hover rounded-full p-2 hover:cursor-pointer" onClick={handleClear}>
        <Trash2 className="text-destructive-foreground"/>
      </button>
      <div className="w-full flex justify-end">
        <img
          src={preview || placeholderPic}
          className="w-71 h-40 object-cover rounded border-2 border-border"
        />
      </div>
    </div>
  );
}
