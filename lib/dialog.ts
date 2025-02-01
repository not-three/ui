export enum DialogType {
  YesNo,
  Ok,
  TextInput,
  TextOutput,
  Time,
}

export class DialogBase {
  public tag: string = "";
}

export class YesNoDialog extends DialogBase {
  public readonly type = DialogType.YesNo;
  constructor(
    public readonly title: string,
    public readonly text: string,
    public readonly onYes: () => void,
    public readonly onNo: () => void = () => {},
  ) { super(); }
}

export class OkDialog extends DialogBase {
  public readonly type = DialogType.Ok;
  constructor(
    public readonly title: string,
    public readonly text: string = "",
    public readonly onOk: () => void = () => {},
  ) { super(); }
}

export class TextInputDialog extends DialogBase {
  public readonly type = DialogType.TextInput;
  constructor(
    public readonly title: string,
    public readonly text: string,
    public readonly hint: string,
    public readonly value: string,
    public readonly onOk: (value: string) => void,
    public readonly onCancel: () => void = () => {},
  ) { super(); }
}

export class TextOutputDialog extends DialogBase {
  public readonly type = DialogType.TextOutput;
  constructor(
    public readonly title: string,
    public readonly text: string,
    public readonly value: string,
    public readonly onOk: () => void = () => {},
  ) { super(); }
}

export class TimeDialog extends DialogBase {
  public readonly type = DialogType.Time;
  constructor(
    public readonly title: string,
    public readonly text: string,
    public readonly time: number,
    public readonly max: number,
    public readonly onOk: (time: number) => void,
    public readonly onCancel: () => void = () => {},
  ) { super(); }
}

export type Dialog = YesNoDialog | OkDialog | TextInputDialog | TextOutputDialog | TimeDialog;
