import type { LanguageDefinition } from "../types";

export const VueDefinition: LanguageDefinition = {
  id: "vue",
  extensions: [".vue"],
  aliases: ["Vue", "vue"],
  mimeTypes: ["text/x-vue"],
  detectionPatterns: [
    { pattern: /^\s*<template>/m, weight: 3 },
    { pattern: /^\s*<script(\s+setup)?(\s+lang="ts")?\s*>/m, weight: 2 },
    { pattern: /^\s*<style(\s+scoped)?\s*>/m, weight: 2 },
    { pattern: /\bdefineProps\s*\(|\bdefineEmits\s*\(/, weight: 3 },
  ],
};
