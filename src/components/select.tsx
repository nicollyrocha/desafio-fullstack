export const Select = ({
  label,
  name,
  options,
  value,
  onChange,
  className,
}: {
  label?: string;
  name: string;
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={name} className="block font-medium">
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        className={`text-black border-[#ca8554] block w-full p-1.5 bg-white border border-default-medium text-sm rounded-sm focus:outline-2 focus:outline-[#ca8554]" ${
          className ?? ""
        }`}
        value={value}
        onChange={onChange}
      >
        <option value="">Selecione uma opção</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
