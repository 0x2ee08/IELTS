import React from "react";

export const MicroIcon = ({
  height = "4em",
  strokeWidth = "2",
  fill = "none",
  focusable = "false",
  ...props
}) => (
  <svg
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    height={height}
    focusable={focusable}
    {...props}
  >
    <g
      fill={fill}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2m7 9v3" />
    </g>
  </svg>
);
