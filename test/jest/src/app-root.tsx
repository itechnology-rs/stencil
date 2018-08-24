import { Component, State } from '../../../dist/index';

@Component({
  tag: 'app-root'
})
export class AppRoot {

  @State() first: string;
  @State() lastName: string;

  componentWillLoad() {
    //
  }

  render() {
    <prop-cmp first={this.first} lastName={this.lastName}></prop-cmp>
  }

}
