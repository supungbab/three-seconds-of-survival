/**
 * Get the position of a touch/mouse event relative to a container element,
 * returned as percentages (0–100) of the container's width and height.
 */
export function getRelativePos(
  container: HTMLElement,
  e: TouchEvent | MouseEvent,
): { x: number; y: number } | null {
  const rect = container.getBoundingClientRect()
  const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX
  const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY
  return {
    x: ((clientX - rect.left) / rect.width) * 100,
    y: ((clientY - rect.top) / rect.height) * 100,
  }
}
