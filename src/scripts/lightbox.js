/**
 * Video lightbox.
 *
 * The iframe does not exist until the user opens the dialog — no YouTube
 * script, no third-party connection, nothing autoplaying on page load.
 *
 * Teardown is wired to EVERY dismissal path rather than to the `close`
 * event alone. Some engines don't dispatch `close` reliably (verified in
 * testing), and a missed teardown means the video keeps playing audio
 * behind a dialog the user believes they shut. `teardown` is idempotent.
 */
export function initLightbox(root) {
  const dialog = root.querySelector("dialog");
  const openBtn = root.querySelector("[data-open]");
  const closeBtn = root.querySelector("[data-close]");
  const frame = root.querySelector("[data-frame]");
  const videoId = root.dataset.video;
  if (!dialog || !openBtn || !frame || !videoId) return;

  function teardown() {
    frame.replaceChildren();
  }

  function open() {
    const iframe = document.createElement("iframe");
    // autoplay is scoped to the explicit user action that opened this.
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    iframe.title = root.dataset.title || "Project demo";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    frame.replaceChildren(iframe);
    dialog.showModal();
  }

  function dismiss() {
    teardown();
    if (dialog.open) dialog.close();
  }

  openBtn.addEventListener("click", open);
  closeBtn?.addEventListener("click", dismiss);

  // Click the backdrop (outside the panel) to dismiss.
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dismiss();
  });

  // Esc fires `cancel`; `close` is the backstop where it is dispatched.
  dialog.addEventListener("cancel", teardown);
  dialog.addEventListener("close", teardown);
}
