import { Globe, Users, Lock } from "lucide-react";

export default function PrivacySwitch({ value, onChange, error }) {
  const options = [
    { value: "A", label: "Everyone", icon: Globe },
    { value: "F", label: "Connections", icon: Users },
    { value: "P", label: "Private", icon: Lock },
  ];

  const handleSelect = (optionValue) => {
    if (onChange) {
      onChange({ target: { name: "privacyChoice", value: optionValue } });
    }
  };

  const selectedIndex = options.findIndex(opt => opt.value === (value || "F"));

  return (
    <div className="flex flex-col w-full">
      <label className="text-[14px] font-medium text-sidebar-foreground mb-2">
        Privacy Settings
      </label>
      
      <div className="relative bg-sidebar-accent rounded-lg p-1 flex gap-1 h-[50px]">
        {/* Sliding background indicator */}
        <div
          className="absolute top-1 bottom-1 bg-primary rounded-md transition-all duration-300 ease-in-out"
          style={{
            left: `calc(${selectedIndex * 33.333}% + 0.25rem)`,
            width: `calc(33.333% - 0.5rem)`,
          }}
        />

        {/* Option buttons */}
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = (value || "F") === option.value;
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(option.value);
              }}
              className={`relative flex-1 flex items-center justify-center gap-2 rounded-md transition-all duration-300 ${
                isSelected
                  ? "text-primary-foreground"
                  : "text-sidebar-foreground hover:text-sidebar-foreground/80"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${
                isSelected ? "scale-110" : "scale-100"
              }`} />
              <span className="text-sm font-semibold whitespace-nowrap">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Error message */}
      {error?.isError && (
        <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error.message}</p>
      )}
      
      {/* Helper text */}
      <p className="text-xs text-sidebar-foreground/60 mt-2">
        Controls who can view your friends and followers list
      </p>
    </div>
  );
}