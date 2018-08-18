import { MockNode } from './mock-node';


export class MockTextNode extends MockNode {

  constructor(text: string) {
    super();
    this.nodeType = MockNode.TEXT_NODE;
    this.nodeName = '#text';
    this.nodeValue = text;
  }

  get textContent() {
    return this.nodeValue;
  }

  set textContent(text) {
    this.nodeValue = text;
  }

}
