interface IProps {
  options?: {
    value: string;
    label: string;
  }[];
  value?: string;
  onChange?: (v: string) => void;
  onClick?: (v: string) => void;
}
const TextSelect: React.FC<IProps> = (props) => {
  const { value, onChange, onClick, options = [] } = props;
  return (
    <div className="space-x-2 space-y-2">
      {options.map((option) => {
        const { value, label } = option;
        return (
          <div
            key={value}
            className="btn"
            onClick={() => {
              if (onClick) {
                onClick(value);
              }
              if (onChange) {
                onChange(value);
              }
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
};

export default TextSelect;
