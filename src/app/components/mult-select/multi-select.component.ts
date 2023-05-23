import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Subscription, debounceTime } from 'rxjs';

import { FormControl } from '@angular/forms';
import { SelectsService } from 'src/app/services/select.service';
import { MultiSelectorUtil } from 'src/app/utils/multiselect-util';

@Component({
  selector: 'multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectComponent
  extends MultiSelectorUtil<any>
  implements OnDestroy, OnChanges
{
  @ViewChild('selector') set selectorElement(element: ElementRef) {
    if (element) this.closeWhenOutsideClick(element);
  }

  @ViewChild('scrollOptions') set scrollOptionsElement(element: ElementRef) {
    if (element) this.listenScrollOptions(element);
  }

  @ViewChild('options') set optionsElement(element: ElementRef) {
    if (element) this.listenPositionComponent(element);
  }

  @Input() control: FormControl = new FormControl();

  /** Options sented by parent */
  @Input() options: any[] = [];

  /* Key identification option */
  @Input() id: string = 'id';

  /* label option */
  @Input() label: string = 'label';

  /* remaining amount options  */
  @Input() totalCount: number = 0;

  /* Check to enable show input to component */
  @Input() enableSearch: boolean = true;

  /* options previus selected */
  @Input() previusSelected: any[] = [];

  /* when select any element */
  @Output() onSelect = new EventEmitter<any[]>();

  /* emit to parent load more options when has remaining amount */
  @Output() loadMore = new EventEmitter();

  /* emit to parent to search my value */
  @Output() searchParent = new EventEmitter<string>();

  opened: boolean = true;

  searchControl: FormControl = new FormControl();

  private subscription: Subscription = new Subscription();

  private selectId: string = '';

  private cacheOptions: any[] = [];

  constructor(
    private selectService: SelectsService,
    private cdr: ChangeDetectorRef
  ) {
    super('');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.selectService.unregiesterSelect(this.selectId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('options' in changes) {
      this.options = changes['options'].currentValue;
      this.listSelectable = this.options;
      this.cacheOptions = this.options;
    }
  }

  /* Listens */
  private listenSearch() {
    this.subscription.add(
      this.searchControl.valueChanges
        .pipe(debounceTime(750))
        .subscribe((value) => {
          this.search(value);
          this.searchParent.emit(value);
          this.cdr.markForCheck();
        })
    );
  }

  private listenChangeStatusOpen() {
    this.subscription.add(
      this.selectService.onChangeStatusOpen.subscribe(
        ({ selectId, opened }) => {
          if (this.selectId === selectId) {
            this.opened = opened;
            this.cdr.markForCheck();
          }
        }
      )
    );
  }

  private listenScrollOptions(element: ElementRef) {
    const container = element.nativeElement as HTMLElement;

    container.addEventListener('scroll', () => {
      const endScroll =
        container.offsetHeight + container.scrollTop >= container.scrollHeight;

      const emmitToParent: boolean = this.totalCount
        ? this.totalCount > 0 && this.options.length < this.totalCount
        : false;

      if (endScroll && emmitToParent) {
        this.loadMore.emit();
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * @TODO: Implements when select is bottom open coponent to upside
   */
  private listenPositionComponent(element: ElementRef) {}

  /* Utils */
  private search(label: string) {
    if (!label.length) {
      this.listSelectable = this.cacheOptions;
      return;
    }

    const regex = new RegExp(label, 'i');

    this.listSelectable = this.cacheOptions.filter((option) => {
      return regex.test(option[this.id]) || regex.test(option[this.label]);
    });
  }

  private closeWhenOutsideClick(element: ElementRef) {
    const container = element.nativeElement as HTMLElement;
    /* close when click outside element */
    window.addEventListener('click', (event: Event) => {
      if (!container.contains(event.target as Node) && this.opened) {
        event.stopPropagation();

        this.selectService.closeSelect(this.selectId);

        this.resetComponent();

        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Prepare component to when reopen
   * when reopen show all options
   */
  private resetComponent() {
    this.searchControl.setValue('');
    this.listSelectable = this.options;
  }

  /**
   * Register in select service to have control element
   */
  private registerSelect() {
    if (this.selectId.length) return;

    this.selectId = this.selectService.registerSelect();
  }

  override toggleSingle(id: string): void {
    super.toggleSingle(id);

    if (this.checkIsDisabled(id)) return;

    if (this.control) this.control.setValue(this.listSelected);

    this.onSelect.emit(this.listSelected);
  }

  override toogleAll(): void {
    super.toogleAll();

    this.onSelect.emit(this.listSelected);

    if (this.control) this.control.setValue(this.listSelected);
  }

  protected override load(): void {
    if (!this.options.length) return;

    this.setObjectKey(this.id);

    this.cacheOptions = this.options;
    this.listSelectable = this.options;
    this.listSelected = this.previusSelected;

    /* Register listeners */
    if (this.enableSearch) this.listenSearch();
    this.registerSelect();
    this.listenChangeStatusOpen();
    this.cdr.markForCheck();
  }

  /**
   * Check if option has property to disable
   */
  checkIsDisabled(key: string): boolean {
    const option = this.options.find((option) => option[this.id] === key);

    if (!option) return false;

    if ('disabled' in option) return option['disabled'];

    return false;
  }

  /**
   * Message to show when has or no option selected
   */
  textPresentation(): string {
    let textPresentation: string = 'Escolher';

    if (this.listSelected.length)
      textPresentation = `${this.listSelected.length} Escolhidos`;

    return textPresentation;
  }

  openSelect(event: Event) {
    event.stopImmediatePropagation();

    this.registerSelect();

    if (this.opened) {
      this.selectService.closeSelect(this.selectId);
      this.resetComponent();
      return;
    }

    this.selectService.changeStatusOpen(this.selectId);
  }

  /**
   * Icon to show when opened or closed select
   */
  iconExpand() {
    return this.opened ? 'expand_less' : 'expand_more';
  }
}
