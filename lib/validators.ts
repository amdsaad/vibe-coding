import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username must be at most 50 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must be at most 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional().or(z.literal("")),
  category: z.enum([
    "developer",
    "designer",
    "photographer",
    "writer",
    "marketer",
    "data_scientist",
    "product_manager",
    "other",
  ]),
  theme: z.enum(["minimal", "bold", "elegant", "neon", "paper", "terminal"]),
  skills: z
    .array(z.string().max(30, "Each skill must be at most 30 characters"))
    .max(20, "Maximum 20 skills allowed")
    .default([]),
  published: z.boolean().default(true),
  avatar_url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const projectSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),
  description: z.string().max(500, "Description must be at most 500 characters").optional().or(z.literal("")),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  sort_order: z.coerce.number().int().default(0),
});

export const socialLinkSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  url: z.string().url("Invalid URL"),
  sort_order: z.coerce.number().int().default(0),
});
