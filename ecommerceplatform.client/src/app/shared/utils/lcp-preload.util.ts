export function preloadLcpImage(url: string): void {
  if (!url || typeof document === 'undefined') {
    return;
  }

  const existingLink = document.head.querySelector(`link[rel="preload"][as="image"][href="${url}"]`);

  if (existingLink) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  link.setAttribute('fetchpriority', 'high');
  document.head.appendChild(link);
}

export function preconnectOrigin(origin: string): void {
  if (!origin || typeof document === 'undefined') {
    return;
  }

  const existingLink = document.head.querySelector(`link[rel="preconnect"][href="${origin}"]`);

  if (existingLink) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = origin;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}
