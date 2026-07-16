// Säkerställer viewport-fit=cover så att safe-area-insets fungerar i
// iOS "lägg till på hemskärmen"-läget (standalone).
if (typeof document !== 'undefined') {
  const vp = document.querySelector('meta[name="viewport"]');
  if (vp) {
    vp.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
  }
}
