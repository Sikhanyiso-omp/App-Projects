import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "ExamCoach SA", short_name: "ExamCoach", description: "Focused university test preparation with lessons, practice and readiness.", start_url: "/dashboard", display: "standalone", background_color: "#f7f4ed", theme_color: "#14213d", icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }] };
}
