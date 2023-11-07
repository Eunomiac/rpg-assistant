import React from "react";

const U = {};

/**
 * Utility function to get the value of a nested key in an object literal.
 * @param {Object} obj - The object literal.
 * @param {string} target - The string path to the nested key.
 * @returns {*} - The value at the nested key.
 */
U.getNestedValue = (obj, target) => {
  const keys = target.split(".");
  let value = obj;

  for (let key of keys) {
    if (value[key] === undefined) {
      return undefined;
    }
    value = value[key];
  }

  return value;
};


U.renderLabeledInput = (label, target, {className, placeholder, tooltip, dataSource, onChangeHandler} = {}) => {
  const value = U.getNestedValue(dataSource, target);
  className = `input-field ${className ?? ""}`.trim();
  placeholder = (placeholder ?? "").trim();
  tooltip = (tooltip ?? "").trim();
  if (label) {
    label = <span className="label-text flex-tiny-header">{label}</span>;
  }
  return (
    <label className="input-label flex-vertical no-gap">
      {label}
      <input
        type="text"
        name={target}
        value={value}
        onChange={onChangeHandler}
        className={className}
        placeholder={placeholder}
      />
      {tooltip}
    </label>
  );
};

U.renderLabeledTextarea = (label, target, {className, placeholder, tooltip, dataSource, onChangeHandler} = {}) => {
  const value = U.getNestedValue(dataSource, target);
  className = `input-field ${className ?? ""}`.trim();
  placeholder = (placeholder ?? "").trim();
  tooltip = (tooltip ?? "").trim();
  if (label) {
    label = <span className="label-text flex-tiny-header">{label}</span>;
  }
  return (
    <label className="input-label flex-vertical no-gap">
      {label}
      <textarea
        name={target}
        value={value}
        onChange={onChangeHandler}
        className={className}
        placeholder={placeholder}
      />
      {tooltip}
    </label>
  );
};


export default U;