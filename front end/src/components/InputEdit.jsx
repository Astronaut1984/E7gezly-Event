import { useState } from "react";

export default function Input({
  title,
  error,
  type,
  classNameVar,
  placeholder,
  icon,
  ...props
}) {
  const [isDisabled, setIsDisabled] = useState(true);
  const [originalValue, setOriginalValue] = useState(props.value || props.defaultValue || "");
  const [currentValue, setCurrentValue] = useState(props.value || props.defaultValue || "");

  const handleIconClick = () => {
    if (!isDisabled) {
      // If currently enabled, restore original value and disable
      setCurrentValue(originalValue);
      if (props.onChange) {
        props.onChange({ target: { value: originalValue, name: props.name } });
      }
    }
    setIsDisabled(!isDisabled);
  };

  const handleInputChange = (e) => {
    setCurrentValue(e.target.value);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  if (icon) {
    console.log(icon);
  }
  
  return (
    <div
      className={`${
        !classNameVar && "w-full"
      } relative mb-[23px] ${classNameVar}`}
    >
      <span className="text-[14px] select-none text-card-foreground leading-normal pl-[7px]">
        {title}
      </span>
      <input
        className={`${
          error && "placeholder-destructive"
        } ${
          isDisabled && "cursor-not-allowed opacity-60"
        } peer text-[16px] text-card-foreground leading-[1.2] block w-full h-[45px] bg-transparent px-[7px] border-0 outline-none`}
        type={type}
        placeholder={error ? error.message : placeholder}
        disabled={isDisabled}
        value={currentValue}
        onChange={handleInputChange}
        {...props}
      />
      <span className="absolute block w-full h-full top-0 left-0 pointer-events-none border-b-2 border-[#d9d9d9] peer-focus:border-primary transition-colors duration-300"></span>

      <i 
        className={`text-primary-hover fa-regular fa-pen-to-square absolute right-0 top-[41px] cursor-pointer ${
          isDisabled ? "opacity-100" : "opacity-40"
        }`}
        onClick={handleIconClick}
      ></i>
      {icon && !(type == "password") && (
        <i className={`${icon} absolute right-2`}></i>
      )}
    </div>
  );
}