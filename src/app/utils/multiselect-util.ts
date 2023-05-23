import { Component, Inject } from '@angular/core';

@Component({ template: '<b>' })
export abstract class MultiSelectorUtil<T> {
  private listSelectableMap = new Map<string, T>();
  private listSelectedMap = new Map<string, T>();

  constructor(@Inject('key') private key: string) {}

  ngOnInit() {
    this.load();
  }

  // HTML handlers ==============================================================
  public toogleAll() {
    if (this.fullChecked) {
      this.listSelectable.map((item) => {
        const id = (item as any)[this.key];
        this.listSelectedMap.delete(id);
      });

      return;
    }

    this.listSelectable.map((item) => {
      const id = (item as any)[this.key];
      this.listSelectedMap.set(id, item);
    });
  }

  public toggleSingle(id: string) {
    const item = this.listSelectableMap.get(id);

    if (!item) {
      throw new Error('Item not found!');
    }

    if (this.getChecked(id)) {
      this.listSelectedMap.delete(id);
      return;
    }

    this.listSelectedMap.set(id, item);
  }

  // ============================================================================

  public getChecked(id: string) {
    const item = this.listSelectedMap.get(id);
    return item ? true : false;
  }

  public get fullChecked() {
    if (!this.listSelectable || this.listSelectable.length <= 0) {
      return false;
    }

    return this.listSelectable.every((item) =>
      this.getChecked((item as any)[this.key])
    );
  }

  public get someChecked() {
    if (!this.listSelected) {
      return false;
    }

    return this.listSelected.length > 0;
  }

  public get listSelectable(): T[] {
    return Array.from(this.listSelectableMap.values());
  }

  public get listSelected(): T[] {
    return Array.from(this.listSelectedMap.values());
  }

  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
  public set listSelectable(value: T[]) {
    this.listSelectableMap.clear();
    (value ?? []).map((item) => {
      const key = (item as any)[this.key];
      this.listSelectableMap.set(key, item);
    });
  }

  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
  public set listSelected(value: T[]) {
    this.listSelectedMap.clear();
    (value ?? []).map((item) => {
      const key = (item as any)[this.key];
      this.listSelectedMap.set(key, item);
    });
  }

  /** Carregar a listagem de items paginados */
  protected load() {
    return;
  }

  /** Muda a chave de indexação dos objetos listados */
  protected setObjectKey(newKey: string) {
    this.key = newKey;
  }
}
