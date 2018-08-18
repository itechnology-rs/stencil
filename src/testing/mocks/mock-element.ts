import { MockNode } from './mock-node';


export class MockElement extends MockNode {

  constructor(nodeName: string) {
    super();
    this.nodeType = MockNode.ELEMENT_NODE;
    this.nodeName = nodeName.toUpperCase();
  }

  private _listeners: InternalEventListener[] = [];

  addEventListener(type: string, handler: InternalEventHandler) {
    type = type.toLowerCase();
    let listener = this._listeners.find(l => l.type === type);
    if (listener) {
      listener.handers.push(handler);
    } else {
      listener = {
        type: type,
        handers: [handler]
      };
    }
  }

  attributes: MockAttribute[] = [];

  get children() {
    return this.childNodes.filter(n => n.nodeType === MockNode.ELEMENT_NODE);
  }

  get className() {
    return this.getAttribute('class');
  }

  get classList() {
    return {
      add: (className: string) => {
        const clsNames = this.className.split(' ');
        if (!clsNames.includes(className)) {
          clsNames.push(className);
          this.className = clsNames.join(' ');
        }
      },
      remove: (className: string) => {
        const clsNames = this.className.split(' ');
        const index = clsNames.indexOf(className);
        if (index > -1) {
          clsNames.splice(index, 1);
          this.className = clsNames.join(' ');
        }
      },
      contains: (className: string) => {
        const clsNames = this.className.split(' ');
        return clsNames.includes(className);
      }
    };
  }

  set className(value: string) {
    this.setAttribute('class', value);
  }

  dispatchEvent() {/**/}

  get firstElementChild() {
    return this.children[0] || null;
  }

  namespaceURI: string;

  getAttribute(name: string) {
    return this.getAttributeNS(null, name);
  }

  getAttributeNS(namespaceURI: string, name: string) {
    const attr = this.attributes.find(a => a.namespaceURI === namespaceURI && name === name);
    if (attr) {
      return attr.value;
    }
    return null;
  }

  get lastElementChild() {
    const children = this.children;
    return children[children.length - 1] || null;
  }

  get nextElementSibling() {
    const parentNode = this.parentNode as MockElement;
    if (parentNode && parentNode.nodeType === MockNode.ELEMENT_NODE) {
      const children = parentNode.children;
      const index = children.indexOf(this) + 1;
      return parentNode.childNodes[index] || null;
    }
    return null;
  }

  get previousElementSibling() {
    const parentNode = this.parentNode as MockElement;
    if (parentNode && parentNode.nodeType === MockNode.ELEMENT_NODE) {
      const children = parentNode.children;
      const index = children.indexOf(this) - 1;
      return parentNode.childNodes[index] || null;
    }
    return null;
  }

  removeAttribute(name: string) {
    this.removeAttributeNS(null, name);
  }

  removeAttributeNS(namespaceURI: string, name: string) {
    const attr = this.attributes.find(a => a.namespaceURI === namespaceURI && name === name);
    if (attr) {
      const index = this.attributes.indexOf(attr);
      this.attributes.splice(index, 1);
    }
  }

  removeEventListener(type: string, handler: InternalEventHandler) {
    type = type.toLowerCase();
    const listener = this._listeners.find(l => l.type === type);
    if (listener) {
      const index = listener.handers.indexOf(handler);
      if (index > -1) {
        listener.handers.splice(index, 1);
      }
    }
  }

  setAttribute(name: string, value: any) {
    this.setAttributeNS(null, name, value);
  }

  setAttributeNS(namespaceURI: string, name: string, value: any) {
    let attr = this.attributes.find(a => a.namespaceURI === namespaceURI && name === name);
    if (attr) {
      attr.value = String(value);
    } else {
      attr = new MockAttribute();
      attr.namespaceURI = namespaceURI;
      attr.name = name;
      attr.value = String(value);
      this.attributes.push(attr);
    }
  }

  private _style: MockStyle;
  get style() {
    if (!this._style) {
      this._style = {};
    }
    return this._style;
  }
  set style(value: MockStyle) {
    this._style = value;
  }

  get tagName() {
    return this.nodeName;
  }

  set tagName(value: string) {
    this.nodeName = value.toUpperCase();
  }
}


interface MockStyle {
  [prop: string]: string;
}


class MockAttribute {
  name: string;
  namespaceURI: string;
  value: string;
}


interface InternalEventListener {
  type: string;
  handers: InternalEventHandler[];
}

type InternalEventHandler = (e?: any) => void;
