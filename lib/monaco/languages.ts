import type { LanguageDefinition } from "./types";

import { TypeScriptDefinition } from "./languages/typescript";
import { JavascriptDefinition } from "./languages/javascript";
import { JsonDefinition } from "./languages/json";
import { YamlDefinition } from "./languages/yaml";
import { CppDefinition } from "./languages/cpp";
import { GoDefinition } from "./languages/go";
import { CDefinition } from "./languages/c";
import { JavaDefinition } from "./languages/java";
import { TomlDefinition } from "./languages/toml";
import { IniDefinition } from "./languages/ini";
import { MarkdownDefinition } from "./languages/markdown";
import { PythonDefinition } from "./languages/python";
import { PhpDefinition } from "./languages/php";
import { ShellDefinition } from "./languages/shell";
import { HtmlDefinition } from "./languages/html";
import { XmlDefinition } from "./languages/xml";
import { SqlDefinition } from "./languages/sql";
import { PlaintextDefinition } from "./languages/plaintext";
import { CssDefinition } from "./languages/css";
import { ScssDefinition } from "./languages/scss";
import { LessDefinition } from "./languages/less";
import { RustDefinition } from "./languages/rust";
import { RubyDefinition } from "./languages/ruby";
import { CsharpDefinition } from "./languages/csharp";
import { KotlinDefinition } from "./languages/kotlin";
import { SwiftDefinition } from "./languages/swift";
import { DartDefinition } from "./languages/dart";
import { LuaDefinition } from "./languages/lua";
import { PerlDefinition } from "./languages/perl";
import { RDefinition } from "./languages/r";
import { PowershellDefinition } from "./languages/powershell";
import { DockerfileDefinition } from "./languages/dockerfile";
import { GraphqlDefinition } from "./languages/graphql";

export const languageDefinitions: LanguageDefinition[] = [
  TypeScriptDefinition,
  JavascriptDefinition,
  JsonDefinition,
  YamlDefinition,
  CppDefinition,
  GoDefinition,
  CDefinition,
  JavaDefinition,
  TomlDefinition,
  IniDefinition,
  MarkdownDefinition,
  PythonDefinition,
  PhpDefinition,
  ShellDefinition,
  HtmlDefinition,
  XmlDefinition,
  SqlDefinition,
  PlaintextDefinition,
  CssDefinition,
  ScssDefinition,
  LessDefinition,
  RustDefinition,
  RubyDefinition,
  CsharpDefinition,
  KotlinDefinition,
  SwiftDefinition,
  DartDefinition,
  LuaDefinition,
  PerlDefinition,
  RDefinition,
  PowershellDefinition,
  DockerfileDefinition,
  GraphqlDefinition,
];
