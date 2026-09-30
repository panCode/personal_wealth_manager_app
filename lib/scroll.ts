/**
 * Scroll `target` to the top of its nearest scrollable ancestor, and only that.
 *
 * `element.scrollIntoView()` walks every scroll container up to the window,
 * so inside the phone frame it also drags the desktop window (shorter than
 * the 844px frame) and would drag any overflow-hidden ancestor. This touches
 * one scroller, so the top bar and the frame stay where they are.
 */
export function scrollToWithin(target: HTMLElement | null | undefined, behavior: ScrollBehavior = "smooth") {
  if (!target) return;
  let scroller = target.parentElement;
  while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)) scroller = scroller.parentElement;
  if (!scroller) return;
  scroller.scrollBy({ top: target.getBoundingClientRect().top - scroller.getBoundingClientRect().top, behavior });
}
