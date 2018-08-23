import { Component, Event, EventEmitter, Method } from '../../../dist/index';

@Component({
  tag: 'event-cmp'
})
export class EventCmp {

  @Event() myEvent: EventEmitter<boolean>;

  @Event({
    eventName: 'my-event-with-options',
    bubbles: false,
    cancelable: false
  }) myEventWithOptions: EventEmitter<{ mph: number }>;

  @Event() myWindowEvent: EventEmitter<number>;

  @Method()
  methodThatFiresMyWindowEvent(value: number) {
    console.log('methodThatFiresMyWindowEvent', value)
    this.myWindowEvent.emit(value);
  }

  @Method()
  methodThatFiresMyEvent() {
    this.myEvent.emit(true);
  }

  @Method()
  methodThatFiresEventWithOptions() {
    this.myEventWithOptions.emit({ mph: 88 });
  }

}
