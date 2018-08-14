import * as d from '../../declarations';


export function createDom(lazyRequire: d.LazyRequire) {
  let dom: any = null;

  const createDom: d.CreateDom = {

    parse(opts: d.OutputTargetHydrate) {
      if (dom) {
        dom.window.close();
      }

      const jsdom = lazyRequire.require('jsdom');
      const jsdomOptions: any = {
        url: opts.url,
        referrer: opts.referrer,
        userAgent: opts.userAgent
      };

      if (opts.console) {
        jsdomOptions.virtualConsole = new jsdom.VirtualConsole();
        jsdomOptions.virtualConsole.sendTo(opts.console);
      }

      dom = new jsdom.JSDOM(opts.html, jsdomOptions);

      polyfillJsDom(dom.window);

      return dom.window;
    },

    serialize() {
      return dom.serialize();
    },

    destroy() {
      dom && dom.window && dom.window.close();
      dom = null;
    }

  };

  return createDom;
}


function polyfillJsDom(win: any) {

  if (!win.Element.prototype.closest) {
    win.Element.prototype.closest = function (selector: string) {
      let el = this;
      while (el) {
          if (el.matches(selector)) {
              return el;
          }
          el = el.parentElement;
      }
    };
  }

}
