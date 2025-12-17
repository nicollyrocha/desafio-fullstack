export const Input = ({
  name,
  type,
  label,
}: {
  name: string;
  type: string;
  label: string;
}) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="font-medium">
        {label && <label htmlFor={name}>{label}</label>}
      </div>
      <input
        name={name}
        type={type}
        className="bg-white outline-1 outline-[#ca8554] rounded-sm focus:outline-2 p-1 text-black"
      />
    </div>
  );
};
