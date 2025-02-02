import React from 'react';

export interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  label,
  error,
  required = false,
  disabled = false,
  name,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const inputId = name || Math.random().toString(36).substr(2, 9);

  return (
    <div className="input-field-container" data-testid="input-field-container">
      {label && (
        <label 
          htmlFor={inputId}
          className="input-label"
          data-testid="input-label"
        >
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        name={name}
        className={`input-field ${error ? 'input-error' : ''}`}
        data-testid="input-field"
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error && (
        <div 
          className="error-message" 
          data-testid="error-message"
          id={`${inputId}-error`}
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default InputField;
