import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "cabaz";

  return {
    base: mode === "production" ? `/${repositoryName}/` : "/"
  };
});

