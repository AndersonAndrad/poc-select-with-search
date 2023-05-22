import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FactoryService } from './factory.service';

@Injectable({
  providedIn: 'root',
})
export class SelectsService {
  /* Key: Identificador do select | opened: valor se esta aberto ou fechado */
  private selectMap = new Map<string, { selectId: string; opened: boolean }>();

  private onChangeStatusOpenSub = new Subject<{
    selectId: string;
    opened: boolean;
  }>();

  constructor(private factoryService: FactoryService) {}

  /**
   * Registra o select na lista de observables
   * @return {string} selectId
   */
  registerSelect(): string {
    const selectId = this.factoryService.base64();

    const exists = this.selectMap.has(selectId);

    if (exists) return selectId;

    this.selectMap.set(selectId, { selectId, opened: false });

    return selectId;
  }

  unregiesterSelect(selectId: string) {
    this.selectMap.delete(selectId);
  }

  changeStatusOpen(selectId: string) {
    const select = this.selectMap.get(selectId);

    if (!select) return;

    this.closeAllSelects();

    select.opened = !select.opened;

    this.onChangeStatusOpenSub.next({ selectId, opened: select.opened });
  }

  closeSelect(selectId: string) {
    const select = this.selectMap.get(selectId);

    if (!select) return;

    select.opened = false;

    this.onChangeStatusOpenSub.next({ selectId, opened: select.opened });
  }

  private closeAllSelects() {
    const selects = Array.from(this.selectMap.values());

    selects.map((select) => {
      if (!select.opened) return;

      this.closeSelect(select.selectId);
    });
  }

  get onChangeStatusOpen() {
    return this.onChangeStatusOpenSub.asObservable();
  }
}

export interface Select {
  id: string;
  label: string;
  disabled?: boolean;
}
