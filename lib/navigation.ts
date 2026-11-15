export type NavigationEntry = {
  name: string,
  entries: {
    name: string,
    onClick?: () => void,
    entries?: { name: string, onClick: () => void, checked?: boolean }[],
    disabled?: boolean,
    title?: string,
  }[],
  disabled?: boolean,
}
