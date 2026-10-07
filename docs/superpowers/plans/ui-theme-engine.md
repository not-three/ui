# UI theme engine design

## Goal

Support Default, Monokai, White, and operator-supplied Custom styling without a wrong-theme application paint.

## State and resolution

A theme registry defines semantic RGB channels, color scheme, and Monaco theme for each choice. A persisted user choice takes precedence over the operator default. Unknown values and Custom without available CSS resolve to Default. A readonly reactive active theme reflects each application of a resolved theme.

## Rendering

Tailwind black, white, panel, and accent colors read semantic CSS variables. A head bootstrap reads a valid persisted built-in choice before the app paints. For an unset or Custom choice, the application remains hidden while the client resolves operator config; it becomes visible after the chosen theme is applied. Custom removes inline channel values so a later ordinary root rule can override stylesheet defaults.

Monaco registers themes for both built-ins and switches existing editors when the active theme changes. The sandbox receives the active light or dark scheme. Canvas progress indicators redraw from computed semantic colors. Surface colors keep Default's existing shades.

## Verification

Unit tests cover resolver fallbacks, DOM application, and generated Tailwind colors. Browser tests cover persisted first paint, operator default first paint, runtime switching, Monaco, the White markdown preview, and malformed persisted settings. The full lint, unit, build, and browser gates run before completion.
