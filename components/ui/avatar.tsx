import Image from "next/image";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, { px: number; text: string }> = {
  sm: { px: 32, text: "text-xs" },
  md: { px: 64, text: "text-lg" },
  lg: { px: 96, text: "text-2xl" },
};

const dimensionMap: Record<AvatarSize, string> = {
  sm: "h-8 w-8",
  md: "h-16 w-16",
  lg: "h-24 w-24",
};

export function Avatar({ src, alt, size = "md", className = "" }: AvatarProps) {
  const { px, text } = sizeMap[size];
  const dims = dimensionMap[size];
  const initials = alt
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={px}
        height={px}
        className={`${dims} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${dims} rounded-full bg-foreground/10 flex items-center justify-center font-mono font-medium ${text} text-foreground/60 ${className}`}
    >
      {initials}
    </div>
  );
}
