import { describe, expect, it } from "vitest";
import * as monaco from "monaco-editor";
import { formatModel } from "~/lib/format/model";

describe("formatModel", () => {
  it("replaces content in one undo step", async () => {
    const model = monaco.editor.createModel('{"a":1}', "json");
    try {
      expect(await formatModel(model, "json", { tabWidth: 2 })).toBe(true);
      expect(model.getValue()).toBe('{\n  "a": 1\n}\n');
      model.undo();
      expect(model.getValue()).toBe('{"a":1}');
    } finally {
      model.dispose();
    }
  });

  it("leaves content and undo history untouched on syntax error", async () => {
    const model = monaco.editor.createModel('{"a":1}', "json");
    try {
      model.pushEditOperations([], [{ range: model.getFullModelRange(), text: '{"a":' }], () => null);
      model.pushStackElement();
      await expect(formatModel(model, "json", { tabWidth: 2 })).rejects.toThrow();
      expect(model.getValue()).toBe('{"a":');
      model.undo();
      expect(model.getValue()).toBe('{"a":1}');
    } finally {
      model.dispose();
    }
  });

  it("does not overwrite a newer edit while formatting", async () => {
    const model = monaco.editor.createModel('{"a":1}', "json");
    try {
      const pending = formatModel(model, "json", { tabWidth: 2 });
      model.setValue('{"b":2}');
      expect(await pending).toBe(false);
      expect(model.getValue()).toBe('{"b":2}');
    } finally {
      model.dispose();
    }
  });

  it("does not rewrite a note that becomes read-only during formatting", async () => {
    const model = monaco.editor.createModel('{"a":1}', "json");
    let editable = true;
    try {
      const pending = formatModel(model, "json", { tabWidth: 2 }, () => editable);
      editable = false;
      expect(await pending).toBe(false);
      expect(model.getValue()).toBe('{"a":1}');
      expect(model.canUndo()).toBe(false);
    } finally {
      model.dispose();
    }
  });
});
