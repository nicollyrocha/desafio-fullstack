export const Button = ({
  children,
  variant,
  type,
  onClick,
  className,
  disabled,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "text" | "icon" | "danger";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  const classNameVariant =
    variant === "secondary"
      ? "bg-gray-500 text-white px-4 py-2 rounded-sm transition-colors"
      : variant === "text"
      ? "bg-transparent text-[#ca8554] py-2 rounded-sm transition-colors w-fit"
      : variant === "icon"
      ? "bg-transparent text-[#ca8554] p-1 rounded-sm transition-colors"
      : variant === "danger"
      ? "bg-red-600 text-white px-4 py-2 rounded-sm transition-colors w-fit"
      : "bg-[#ca8554] text-white px-4 py-2 rounded-sm transition-colors w-fit";

  const hoverClasses =
    variant === "secondary"
      ? "hover:bg-gray-600"
      : variant === "text"
      ? "hover:underline"
      : variant === "icon"
      ? "hover:bg-[#f0e6e3]"
      : variant === "danger"
      ? "hover:bg-red-700"
      : "hover:bg-[#b06e3f]";

  return (
    <button
      className={`${classNameVariant} ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : `cursor-pointer ${hoverClasses}`
      } ${className ?? ""}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
