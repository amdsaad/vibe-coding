export const CATEGORIES = [
  { value: "developer", label: "Developer" },
  { value: "designer", label: "Designer" },
  { value: "photographer", label: "Photographer" },
  { value: "writer", label: "Writer" },
  { value: "marketer", label: "Marketer" },
  { value: "data_scientist", label: "Data Scientist" },
  { value: "product_manager", label: "Product Manager" },
  { value: "other", label: "Other" },
] as const;

export const THEMES = [
  { value: "minimal", label: "Minimal", description: "Clean and understated" },
  { value: "bold", label: "Bold", description: "High contrast and striking" },
  { value: "elegant", label: "Elegant", description: "Refined and sophisticated" },
  { value: "neon", label: "Neon", description: "Vibrant and electric" },
  { value: "paper", label: "Paper", description: "Warm and textured" },
  { value: "terminal", label: "Terminal", description: "Developer aesthetic" },
] as const;

export const SOCIAL_PLATFORMS = [
  { value: "github", label: "GitHub" },
  { value: "twitter", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "dribbble", label: "Dribbble" },
  { value: "behance", label: "Behance" },
  { value: "youtube", label: "YouTube" },
  { value: "website", label: "Website" },
] as const;
