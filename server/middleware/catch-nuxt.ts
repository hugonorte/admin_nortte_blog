export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  
  // Intercept exact requests to /_nuxt/
  if (url.pathname === '/_nuxt/' || url.pathname === '/_nuxt') {
    const headers = getRequestHeaders(event);
    console.log('[DEBUG] Intercepted request to /_nuxt/');
    console.log('  Referer:', headers.referer);
    console.log('  User-Agent:', headers['user-agent']);
    console.log('  Accept:', headers.accept);
    
    // Return a 404 gracefully to avoid the unhandled error crashing/logging aggressively in the terminal
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found (Handled by debug middleware)'
    });
  }
});
