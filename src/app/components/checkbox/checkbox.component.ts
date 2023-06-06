import { Component, Input } from '@angular/core';

@Component({
  selector: 'checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
})
export class CheckboxComponent {
  @Input() checked: boolean = false;

  test() {
    this.checked = !this.checked;
  }
}
