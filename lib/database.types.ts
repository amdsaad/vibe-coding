export type ProfileCategory =
  | "developer"
  | "designer"
  | "photographer"
  | "writer"
  | "marketer"
  | "data_scientist"
  | "product_manager"
  | "other";

export type ThemeName =
  | "minimal"
  | "bold"
  | "elegant"
  | "neon"
  | "paper"
  | "terminal";

export type Profile = {
  id: string;
  user_id: string;
  username: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  category: ProfileCategory;
  theme: ThemeName;
  skills: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type SocialLink = {
  id: string;
  profile_id: string;
  platform: string;
  url: string;
  sort_order: number;
};

export type Project = {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  url: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProfileWithRelations = Profile & {
  social_links: SocialLink[];
  projects: Project[];
};
