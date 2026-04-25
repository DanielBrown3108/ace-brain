import type { VideoSource } from "@/lib/types";

type Props = {
  source: VideoSource;
  url: string | null;
  title?: string;
};

function youTubeIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.endsWith("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] ?? null;
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export function VideoEmbed({ source, url, title }: Props) {
  if (source === "none" || !url) {
    return (
      <div className="aspect-video w-full rounded-lg bg-neutral-900 grid place-items-center text-neutral-400 text-sm">
        No video for this lesson yet.
      </div>
    );
  }

  if (source === "youtube") {
    const id = youTubeIdFromUrl(url);
    if (!id) {
      return (
        <div className="aspect-video w-full rounded-lg bg-neutral-900 grid place-items-center text-red-400 text-sm">
          Invalid YouTube URL.
        </div>
      );
    }
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title ?? "Lesson video"}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // Facebook: official plugin embed via iframe.
  const fbSrc = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
    url
  )}&show_text=false&width=560`;
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
      <iframe
        className="h-full w-full"
        src={fbSrc}
        title={title ?? "Lesson video"}
        loading="lazy"
        scrolling="no"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
