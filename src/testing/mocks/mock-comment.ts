import { MockNode } from './mock-node';


export class MockComment extends MockNode {

  constructor(text: string) {
    super();
    this.nodeType = MockNode.COMMENT_NODE;
    this.nodeName = '#comment';
    this.nodeValue = text;
  }

  get textContent() {
    return this.nodeValue;
  }

  set textContent(text) {
    this.nodeValue = text;
  }

}
