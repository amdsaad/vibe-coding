export type ProfileCategory =
  | "creative"
  | "developer"
  | "designer"
  | "photographer"
  | "writer"
  | "musician"
  | "filmmaker"
  | "other";

export type ThemeName =
  | "minimal"
  | "bold"
  | "elegant"
  | "playful"
  | "dark";

export type Profile = {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  category: ProfileCategory;
  theme: ThemeName;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type SocialLink = {
  id: string;
  profile_id: string;
  platform: string;
  url: string;
  sort_order: number;
  created_at: string;
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
