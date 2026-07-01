type Props = {
  size?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
} & React.SVGProps<SVGSVGElement>;

export const LoaderIcon: React.FC<Props> = ({
  size = 24,
  className,
  color,
  strokeWidth = 1.5,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 24 24`}
      width={size}
      height={size}
      color={color ?? "currentColor"}
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      className={className}
      {...props}
    >
      <path d="M21.9961 12C21.9961 17.5228 17.5189 22 11.9961 22C6.47325 22 1.99609 17.5228 1.99609 12C1.99609 6.47715 6.47325 2 11.9961 2"></path>
    </svg>
  );
};
