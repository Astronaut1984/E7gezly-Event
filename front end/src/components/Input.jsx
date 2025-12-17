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
  const [showPassword, togglePassword] = useState(false);

  function toggleShowPassword() {
    togglePassword((state) => !state);
  }

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
          error ? "border-destructive border-b-2" : "border-b-2 border-[#d9d9d9] peer-focus:border-primary"
        } peer text-[16px] text-card-foreground leading-[1.2] block w-full h-[45px] bg-transparent px-[7px] outline-none transition-colors duration-300`}
        type={showPassword ? "text" : type}
        placeholder={placeholder}
        {...props}
      />
      {error && <p className="text-destructive text-sm mt-1">{error.message}</p>}
      {type == "password" && (
        <i
          onClick={toggleShowPassword}
          className={`text-primary-hover fa-solid fa-eye${
            showPassword ? "-slash" : ""
          } absolute right-0 top-[41px] cursor-pointer`}
        ></i>
      )}
      {icon && !(type == "password") && (
        <i className={`${icon} absolute right-2 `}></i>
      )}
    </div>
  );
}
