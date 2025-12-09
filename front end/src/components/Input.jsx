import { useState } from "react";

export default function Input({
  title,
  error,
  type,
  classNameVar,
  placeholder,
  ...props
}) {
  const [showPassword, togglePassword] = useState(false);

  function toggleShowPassword() {
    togglePassword((state) => !state);
  }
  return (
    <div className={`w-full relative mb-[23px] ${classNameVar}`}>
      <span className="text-[14px] text-card-foreground leading-normal pl-[7px]">
        {title}
      </span>
      <input
        className={`${
          error && "placeholder-destructive"
        } peer text-[16px] text-card-foreground leading-[1.2] block w-full h-[45px] bg-transparent px-[7px]  border-0 outline-none`}
        type={showPassword ? "text" : type}
        placeholder={error ? error.message : placeholder}
        {...props}
      />
      <span className="absolute block w-full h-full top-0 left-0 pointer-events-none border-b-2 border-[#d9d9d9] peer-focus:border-primary transition-colors duration-300"></span>
      {type == "password" && (
        <i
          onClick={toggleShowPassword}
          className={`text-primary-hover fa-solid fa-eye${
            showPassword ? "-slash" : ""
          } absolute right-0 top-[41px] cursor-pointer`}
        ></i>
      )}
    </div>
  );
}
