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
      ? "bg-gray-500 text-white px-4 py-2 rounded-sm hover:bg-gray-600 transition-colors cursor-pointer"
      : variant === "text"
      ? "bg-transparent text-[#ca8554] py-2 rounded-sm hover:underline transition-colors cursor-pointer w-fit"
      : variant === "icon"
      ? "bg-transparent text-[#ca8554] p-1 rounded-sm hover:bg-[#f0e6e3] transition-colors cursor-pointer"
      : variant === "danger"
      ? "bg-red-600 text-white px-4 py-2 rounded-sm hover:bg-red-700 transition-colors cursor-pointer w-fit"
      : "bg-[#ca8554] text-white px-4 py-2 rounded-sm hover:bg-[#b06e3f] transition-colors cursor-pointer w-fit";

  return (
    <button
      className={`${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${classNameVariant} ${className ?? ""}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
