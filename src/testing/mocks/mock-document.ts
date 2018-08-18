import { MockComment } from './mock-comment';
import { MockElement } from './mock-element';
import { MockNode } from './mock-node';
import { MockTextNode } from './mock-text-node';


export class MockDocument extends MockElement {

  constructor() {
    super('document');
    this.nodeName = '#document';
    this.nodeType = MockNode.DOCUMENT_TYPE_NODE;

    this.documentElement = new MockElement('html');
    this.appendChild(this.documentElement);

    this.head = new MockElement('head');
    this.documentElement.appendChild(this.head);

    this.body = new MockElement('body');
    this.documentElement.appendChild(this.body);
  }

  createComment(text: string) {
    return new MockComment(text);
  }

  createElement(tagName: string) {
    return new MockElement(tagName);
  }

  createElementNS(namespaceURI: string, tagName: string) {
    const elmNs = new MockElement(tagName);
    elmNs.namespaceURI = namespaceURI;
    return elmNs;
  }

  createTextNode(text: string) {
    return new MockTextNode(text);
  }

  createDocument() {
    return new MockDocument();
  }

  body: MockElement = null;

  documentElement: MockElement = null;

  head: MockElement = null;

}
