interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const sizeMap = {
  xs: "h-5 w-5 text-[10px]",
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-2xl",
  "2xl": "h-28 w-28 text-3xl",
};

const imgSizeMap = {
  xs: 20,
  sm: 28,
  md: 36,
  lg: 48,
  xl: 80,
  "2xl": 112,
};

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={imgSizeMap[size]}
        height={imgSizeMap[size]}
        className={`${sizeMap[size]} rounded-full object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} flex items-center justify-center rounded-full bg-velvet-700 font-medium text-velvet-200 ${className}`}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
