export const Input = ({
  name,
  type,
  label,
  value,
  onChange,
  className,
}: {
  name: string;
  type: string;
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="font-medium">
        {label && <label htmlFor={name}>{label}</label>}
      </div>
      <input
        value={value}
        onChange={onChange}
        name={name}
        type={type}
        className={`text-black border-[#ca8554] block w-full p-1 bg-white border border-default-medium text-sm rounded-sm focus:outline-2 focus:outline-[#ca8554] ${
          className ?? ""
        }`}
      />
    </div>
  );
};
