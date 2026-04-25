export type VideoSource = "youtube" | "facebook" | "none";

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  position: number;
  published: boolean;
};

export type Unit = {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  position: number;
};

export type Lesson = {
  id: string;
  unit_id: string;
  slug: string;
  title: string;
  description: string | null;
  video_source: VideoSource;
  video_url: string | null;
  notes_html: string | null;
  position: number;
  published: boolean;
};
