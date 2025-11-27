import { useState } from "react";

const ARROW_UP_PATH = "M4.5 15.75l7.5-7.5 7.5 7.5";
const ARROW_DOWN_PATH = "M19.5 8.25l-7.5 7.5-7.5-7.5";
export default function SelectType({
  title,
  options,
  classNameVar,
  onSelect,
  ...props
}) {
  const [inputValue, setInputValue] = useState("");
  const [showList, setShowList] = useState(false);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleOptionClick = (option) => {
    setInputValue(option);
    setShowList(false);
  };
  const arrowPath = showList ? ARROW_UP_PATH : ARROW_DOWN_PATH;

  return (
    <div className={`w-full relative mb-[23px] ${classNameVar}`}>
      <span className="text-[14px] text-[#666666] leading-[1.5] pl-[7px]">
        {title}
      </span>
      <input
        className="peer text-[16px] text-[#333333] leading-[1.2] block w-full h-[45px] bg-transparent pl-[7px] pr-[30px] border-0 outline-none"
        placeholder="Select Type"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowList(true);
        }}
        onFocus={() => setShowList(true)}
        onBlur={() => {
          setTimeout(() => setShowList(false), 200);
        }}
        {...props}
      />
      <div className="absolute right-[7px] bottom-[12px] pointer-events-none w-4 h-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#333333"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={arrowPath} />
        </svg>
      </div>
      <span className="absolute block w-full h-full top-0 left-0 pointer-events-none border-b-2 border-[#d9d9d9] peer-focus:border-blue-600 transition-colors duration-300"></span>

      {/* Dropdown List */}
      {showList && (
        <ul className="absolute w-full bg-white shadow-lg z-20 mt-1 max-h-40 overflow-auto border border-gray-200 rounded-md">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                onMouseDown={() => handleOptionClick(option)}
              >
                {option}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500">No options found</li>
          )}
        </ul>
      )}
    </div>
  );
}
