import type { LanguageDefinition } from "../types";

// Docker Compose files are YAML. The dedicated language exists so they get a
// "Docker Compose" dropdown entry and a distinct mime type; highlighting is
// borrowed from monaco's built-in YAML tokenizer in setup.ts (monaco has no
// dockercompose tokenizer of its own).
export const DockerComposeDefinition: LanguageDefinition = {
  id: "dockercompose",
  extensions: [
    "docker-compose.yml",
    "docker-compose.yaml",
    "compose.yml",
    "compose.yaml",
  ],
  aliases: ["Docker Compose", "docker-compose", "compose"],
  mimeTypes: ["text/x-docker-compose"],
  detectionPatterns: [
    { pattern: /^services:\s*$/, weight: 5 },
    { pattern: /^\s+(image|build|container_name|depends_on):/, weight: 3 },
    {
      pattern:
        /^\s+(ports|volumes|environment|networks|command|restart|healthcheck):/,
      weight: 1,
    },
    { pattern: /^(version|networks|volumes|configs|secrets):/, weight: 1 },
  ],
};
