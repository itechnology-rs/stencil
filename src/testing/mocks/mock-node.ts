
export class MockNode {

  appendChild(childNode: MockNode) {
    childNode.remove();
    childNode.parentNode = this;
    this.childNodes.push(childNode);
    return childNode;
  }

  childNodes: MockNode[] = [];

  get firstChild() {
    return this.childNodes[0];
  }

  insertBefore(childNode: MockNode, refNode: MockNode) {
    childNode.remove();
    childNode.parentNode = this;

    if (!refNode) {
      this.childNodes.push(childNode);

    } else {
      const index = this.parentNode.childNodes.indexOf(this);
      if (index > -1) {
        this.childNodes.splice(index, 0, childNode);
      } else {
        this.childNodes.push(childNode);
      }
    }

    return childNode;
  }

  get lastChild() {
    return this.childNodes[this.childNodes.length - 1];
  }

  get nextSibling() {
    const parentNode = this.parentNode;
    if (parentNode) {
      const index = parentNode.childNodes.indexOf(this) + 1;
      return parentNode.childNodes[index] || null;
    }
    return null;
  }

  nodeName: string;

  nodeType: number;

  nodeValue = '';

  get parentElement() {
    return this.parentNode;
  }

  parentNode: MockNode = null;

  get previousSibling() {
    const parentNode = this.parentNode;
    if (parentNode) {
      const index = parentNode.childNodes.indexOf(this) - 1;
      return parentNode.childNodes[index] || null;
    }
    return null;
  }

  removeChild(childNode: MockNode) {
    const index = this.parentNode.childNodes.indexOf(this);
    if (index > -1) {
      this.childNodes.splice(index, 1);
    }
    return childNode;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  replaceChild(newChild: MockNode, oldChild: MockNode) {
    if (oldChild.parentNode === this) {
      this.insertBefore(newChild, oldChild);
      oldChild.remove();
      return newChild;
    }
    return null;
  }

  static ELEMENT_NODE = 1;
  static TEXT_NODE = 3;
  static PROCESSING_INSTRUCTION_NODE = 7;
  static COMMENT_NODE = 8;
  static DOCUMENT_NODE = 9;
  static DOCUMENT_TYPE_NODE = 10;
  static DOCUMENT_FRAGMENT_NODE = 11;

}
