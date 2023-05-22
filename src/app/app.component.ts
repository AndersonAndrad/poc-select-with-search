import { Component, OnInit } from '@angular/core';

import { Select } from './services/select.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private _items: Select[] = [];

  ngOnInit(): void {
    this.factoryElements();
  }

  factoryElements() {
    for (let i = 0; i < 50; i++) {
      this._items.push({
        id: `${i}`,
        label: `item - ${i}`,
        disabled: false,
      });
    }
  }

  get items() {
    return this._items;
  }
}
