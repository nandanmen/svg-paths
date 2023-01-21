One of the things I want to change about this project is the way the data is organized. Right now there are three different components:

- The Editor which encapsulates everything CodeMirror
- The PathEditor which adds functionality related to paths specifically
- The App which renders both the PathEditor and the path visualizer (which has its own state)

Currently things are a bit awkward. The App is working with a string representation of the path, and the PathEditor is working with a codemirror-parsed version (I think).

Ideally each line is associated with its path segment:

```tsx
const commands = [
  {
    lineNumber: 0,
    command: "M",
    x: 10
    y: 80,
    absolute: {
      command: 'M',
      x: 10,
      y: 80,
      x0: 0,
      y0: 0
    }
  },
];
```

The 'active command' is then whatever command the cursor is currently over.
