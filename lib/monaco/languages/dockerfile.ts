import type { LanguageDefinition } from "../types";

export const DockerfileDefinition: LanguageDefinition = {
  id: "dockerfile",
  extensions: [".dockerfile"],
  aliases: ["Dockerfile", "docker"],
  mimeTypes: ["text/x-dockerfile"],
  detectionPatterns: [
    { pattern: /^FROM\s+[\w./:@-]+/, weight: 4 },
    { pattern: /^(RUN|CMD|ENTRYPOINT|COPY|ADD|WORKDIR|EXPOSE|ENV|ARG|LABEL|USER|VOLUME)\s+/, weight: 3 },
    { pattern: /^HEALTHCHECK\b/, weight: 4 },
  ],
};
