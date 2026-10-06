export type NavigationEntry = {
  name: string,
  entries: {
    name: string,
    onClick?: () => void,
    entries?: { name: string, onClick: () => void }[],
    disabled?: boolean,
    title?: string,
  }[],
  disabled?: boolean,
}
