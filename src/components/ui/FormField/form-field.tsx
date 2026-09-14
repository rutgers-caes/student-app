import { Select, TextField } from '@radix-ui/themes';

type TextInputType = 'email' | 'password' | 'text' | 'date';
type TextInputAutoComplete = 'email' | 'new-password' | 'current-password' | 'off';

export function FormField({
  autoComplete,
  label,
  layout = 'block',
  name,
  onChange,
  placeholder,
  required = false,
  requiredLabel = false,
  type = 'text',
  value,
}: {
  autoComplete?: TextInputAutoComplete;
  label: string;
  layout?: 'block' | 'row';
  name?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  requiredLabel?: boolean;
  type?: TextInputType;
  value: string;
}) {
  const labelClassName = layout === 'row'
    ? 'grid grid-cols-[150px_minmax(0,1fr)] items-center gap-4 max-sm:grid-cols-1 max-sm:gap-2'
    : 'block';
  const fieldLabelClassName = layout === 'row'
    ? 'text-right text-[17px] font-medium text-slate-700 max-sm:text-left'
    : 'mb-2 block text-sm font-semibold text-slate-700';

  return (
    <label className={labelClassName}>
      <FieldLabel className={fieldLabelClassName} label={label} required={required || requiredLabel} />
      <TextField.Root
        autoComplete={autoComplete}
        name={name}
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function FormSelect({
  label,
  onChange,
  options,
  required = false,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  value: string;
}) {
  const selectedValue = value.trim();
  const selectOptions = selectedValue && !options.includes(selectedValue)
    ? [selectedValue, ...options]
    : options;

  return (
    <label className="block">
      <FieldLabel className="mb-2 block text-sm font-semibold text-slate-700" label={label} required={required} />
      <Select.Root key={selectedValue || 'empty'} value={selectedValue} onValueChange={onChange}>
        <Select.Trigger className="w-full" aria-label={label} placeholder={`Select ${label.toLowerCase()}`} />
        <Select.Content>
          {selectOptions.map((option) => (
            <Select.Item value={option} key={option}>
              {option}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </label>
  );
}

export function FormActionRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 grid grid-cols-[150px_minmax(0,1fr)] gap-4 max-sm:grid-cols-1 max-sm:gap-2">
      <span aria-hidden="true" />
      {children}
    </div>
  );
}

function FieldLabel({ className, label, required }: { className: string; label: string; required: boolean }) {
  return (
    <span className={className}>
      {label}
      {required && <span className="text-red-600"> *</span>}
    </span>
  );
}
