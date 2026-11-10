// Host yönlendirmesi: www ve http varyantları kanonik https://printzen.app adresine 301 ile gider.
// Diğer tüm istekler statik varlıklara (dist/) devredilir.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'www.printzen.app' || url.protocol === 'http:') {
      return Response.redirect(`https://printzen.app${url.pathname}${url.search}`, 301);
    }
    return env.ASSETS.fetch(request);
  },
};
