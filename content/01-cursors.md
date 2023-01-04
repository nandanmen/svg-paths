# Cursors and Lines

SVG paths revolve around the concept of a **cursor**. Path commands move the cursor around, drawing a path behind it as it moves around the canvas.

Cursors always start at the origin `(0, 0)`, the top left point of the canvas.

The `M` command lets you move the cursor without drawing a path:

```
M 50 50
```
