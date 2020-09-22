// Angular
import { Component, Input } from '@angular/core';

@Component({
  selector: 'kt-widget4-todo',
  templateUrl: './widget_todo.component.html'
})
export class Widget4TodoComponent {
  @Input() cssClasses = '';
}
