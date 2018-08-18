import * as d from '../declarations';
import { BuildContext } from '../compiler/build/build-ctx';
import { Cache } from '../compiler/cache';
import { createDomApi } from '../renderer/dom-api';
import { createPlatformServer } from '../server/platform-server';
import { createQueueServer } from '../server/queue-server';
import { createRendererPatch } from '../renderer/vdom/patch';
import { initComponentInstance } from '../core/init-component-instance';
import { initHostElement } from '../core/init-host-element';
import { InMemoryFileSystem } from '../util/in-memory-fs';
import { MockComment } from './mocks/mock-comment';
import { MockElement } from './mocks/mock-element';
import { MockDocument } from './mocks/mock-document';
import { MockTextNode } from './mocks/mock-text-node';
import { MockWindow } from './mocks/mock-window';
import { TestingConfig } from './testing-config';
import { TestingFs } from './testing-fs';
import { TestingLogger } from './testing-logger';
import { TestingSystem } from './testing-sys';
import { validateConfig } from '../compiler/config/validate-config';


export function mockWindow() {
  const win = new MockWindow();
  return (win as any) as Window;
}

export function mockDocument() {
  const doc = new MockDocument();
  return (doc as any) as Document;
}

export function mockElement<K extends keyof HTMLElementTagNameMap>(tagName?: K) {
  const elm = new MockElement(tagName || 'div');
  return (elm as any) as K;
}

export function mockElementNS(namespaceURI: string, name: string) {
  const elm = new MockElement(name);
  elm.namespaceURI = namespaceURI;
  return (elm as any) as HTMLElement;
}

export function mockSvgElement() {
  const elm = new MockElement('svg');
  elm.namespaceURI = 'http://www.w3.org/2000/svg';
  return (elm as any) as SVGElement;
}

export function mockTextNode(text: string) {
  const textNode = new MockTextNode(text);
  return (textNode as any) as Text;
}

export function mockComment(text: string) {
  const commentNode = new MockComment(text);
  return (commentNode as any) as Comment;
}


export function mockPlatform(win?: any, domApi?: d.DomApi, cmpRegistry?: d.ComponentRegistry) {
  const hydrateResults: d.HydrateResults = {
    diagnostics: []
  };
  const App: d.AppGlobal = {};
  const config = mockConfig();
  const outputTarget = config.outputTargets[0] as d.OutputTargetWww;

  win = win || config.sys.createDom().parse({type: 'www', html: ''});
  domApi = domApi || createDomApi(App, win, win.document);
  cmpRegistry = cmpRegistry || {};

  const plt = createPlatformServer(
    config,
    outputTarget,
    win,
    win.document,
    App,
    cmpRegistry,
    hydrateResults.diagnostics,
    false,
    null
  );
  if (domApi) {
    plt.domApi = domApi;
  } else {
    domApi = plt.domApi;
  }
  plt.isClient = true;

  const $mockedQueue = plt.queue = mockQueue();

  (plt as MockedPlatform).$flushQueue = () => {
    return new Promise(resolve => {
      $mockedQueue.flush(resolve);
    });
  };

  const renderer = createRendererPatch(plt, domApi);

  plt.render = function(hostElm, oldVNode, newVNode, useNativeShadowDom, encapsulation) {
    return renderer(hostElm, oldVNode, newVNode, useNativeShadowDom, encapsulation);
  };

  return plt as MockedPlatform;
}


export interface MockedPlatform extends d.PlatformApi {
  $flushQueue?: () => Promise<any>;
}


export function mockConfig(opts = { enableLogger: false }): d.Config {
  const config = new TestingConfig();
  (config.logger as TestingLogger).enable = opts.enableLogger;
  return validateConfig(config);
}


export function mockCompilerCtx() {
  const compilerCtx: d.CompilerCtx = {
    activeBuildId: 0,
    fs: new InMemoryFileSystem(mockFs(), { path: require('path') } as any),
    collections: [],
    appFiles: {},
    cache: mockCache()
  };

  return compilerCtx;
}


export function mockBuildCtx(config?: d.Config, compilerCtx?: d.CompilerCtx) {
  if (!config) {
    config = mockConfig();
  }
  if (!compilerCtx) {
    compilerCtx = mockCompilerCtx();
  }
  const buildCtx = new BuildContext(config, compilerCtx);

  return buildCtx as d.BuildCtx;
}


export function mockStencilSystem(): d.StencilSystem {
  return new TestingSystem();
}


export function mockPath() {
  const sys = mockStencilSystem();

  const path: d.Path = {
    isAbsolute: sys.path.isAbsolute,
    resolve: sys.path.resolve,
    dirname: sys.path.dirname,
    basename: sys.path.basename,
    extname: sys.path.extname,
    join: sys.path.join,
    parse: sys.path.parse,
    relative: sys.path.relative,
    sep: sys.path.sep
  };

  return path;
}


export function mockFs() {
  return new TestingFs();
}


export function mockLogger() {
  return new TestingLogger();
}


export function mockCache() {
  const fs = new InMemoryFileSystem(mockFs(), { path: require('path') } as any);
  const config = mockConfig();
  config.enableCache = true;

  const cache = new Cache(config, fs);
  cache.initCacheDir();
  return cache;
}


export function mockDomApi(win?: any, doc?: any) {
  const App: d.AppGlobal = {};
  win = win || mockWindow();
  doc = doc || win.document;
  return createDomApi(App, win, doc);
}


export function mockRenderer(plt?: MockedPlatform, domApi?: d.DomApi): d.RendererApi {
  plt = plt || mockPlatform();
  return createRendererPatch(<d.PlatformApi>plt, domApi || mockDomApi());
}


export function mockQueue() {
  return createQueueServer();
}


export function mockHtml(_html: string): HTMLHtmlElement {
  throw new Error('todo! hey, do the thing here');
}


export function mockComponentInstance(plt: d.PlatformApi, domApi: d.DomApi, cmpMeta: d.ComponentMeta = {}): d.ComponentInstance {
  mockDefine(plt, cmpMeta);

  const elm = domApi.$createElement('ion-cmp') as d.HostElement;

  const hostSnapshot: d.HostSnapshot = {
    $attributes: {}
  };

  return initComponentInstance(plt, elm, hostSnapshot);
}


export function mockDefine(plt: MockedPlatform, cmpMeta: d.ComponentMeta) {
  if (!cmpMeta.tagNameMeta) {
    cmpMeta.tagNameMeta = 'ion-cmp';
  }
  if (!cmpMeta.componentConstructor) {
    cmpMeta.componentConstructor = class {} as any;

  }
  if (!cmpMeta.membersMeta) {
    cmpMeta.membersMeta = {};
  }

  (plt as d.PlatformApi).defineComponent(cmpMeta);

  return cmpMeta;
}

export function mockEvent(domApi: d.DomApi, name: string, detail: any = {}): CustomEvent {
  const evt = (domApi.$doc.documentElement.parentNode as Document).createEvent('CustomEvent');
  evt.initCustomEvent(name, false, false, detail);
  return evt;
}

export function mockDispatchEvent(domApi: d.DomApi, el: HTMLElement, name: string, detail: any = {}): boolean {
  const ev = mockEvent(domApi, name, detail);
  return el.dispatchEvent(ev);
}

export async function mockConnect(_plt: MockedPlatform, _html: string) {
  throw new Error('we still need this?');
  // const jsdom = require('jsdom');
  // const rootNode = jsdom.JSDOM.fragment(html);

  // connectComponents(plt, rootNode);

  // await plt.$flushQueue();

  // return rootNode;
}


function connectComponents(plt: MockedPlatform, node: d.HostElement) {
  if (!node) return;

  if (node.tagName) {
    if (!plt.hasConnectedMap.has(node)) {
      const cmpMeta = (plt as d.PlatformApi).getComponentMeta(node);
      if (cmpMeta) {
        initHostElement((plt as d.PlatformApi), cmpMeta, node, 'hydrated');
        (node as d.HostElement).connectedCallback();
      }
    }
  }

  if (node.childNodes) {
    for (let i = 0; i < node.childNodes.length; i++) {
      connectComponents(plt, node.childNodes[i] as d.HostElement);
    }
  }
}


export async function waitForLoad(plt: MockedPlatform, rootNode: any, tag: string) {
  const elm: d.HostElement = rootNode.tagName === tag.toLowerCase() ? rootNode : rootNode.querySelector(tag);

    // flush to read attribute mode on host elment
  await plt.$flushQueue();

  connectComponents(plt, elm);

  return elm;
}


export function compareHtml(input: string) {
  return input.replace(/(\s*)/g, '')
              .replace(/<!---->/g, '')
              .toLowerCase()
              .trim();
}


export function removeWhitespaceFromNodes(node: Node): any {
  if (node.nodeType === 1) {
    for (var i = node.childNodes.length - 1; i >= 0; i--) {
      if (node.childNodes[i].nodeType === 3) {
        if (node.childNodes[i].nodeValue.trim() === '') {
          node.removeChild(node.childNodes[i]);
        } else {
          node.childNodes[i].nodeValue = node.childNodes[i].nodeValue.trim();
        }
      } else {
        removeWhitespaceFromNodes(node.childNodes[i]);
      }
    }
  }
  return node;
}
