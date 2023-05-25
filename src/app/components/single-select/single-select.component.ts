import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Subscription, debounceTime } from 'rxjs';

import { FormControl } from '@angular/forms';
import { SelectsService } from 'src/app/services/select.service';

@Component({
  selector: 'single-select',
  templateUrl: './single-select.component.html',
  styleUrls: ['./single-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SingleSelectComponent implements OnInit, OnDestroy, OnChanges {
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
  @Input() key: string = 'id';

  /* label option */
  @Input() label: string = 'label';

  /* remaining amount options  */
  @Input() totalCount: number = 0;

  /* Check to enable show input to component */
  @Input() enableSearch: boolean = true;

  /* when select any element */
  @Output() onSelect = new EventEmitter<any>();

  /* emit to parent load more options when has remaining amount */
  @Output() loadMore = new EventEmitter();

  /* emit to parent to search my value */
  @Output() searchParent = new EventEmitter<string>();

  visibleOptions: any[] = [];

  opened: boolean = false;

  searchControl: FormControl = new FormControl();

  private subscription: Subscription = new Subscription();

  private selectId: string = '';

  private keyItemSelected: string = '';

  private lastStringSearch: string = '';

  private cacheOptions: any[] = [];

  constructor(
    private selectService: SelectsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.enableSearch) this.listenSearch();
    this.registerSelect();
    this.listenChangeStatusOpen();
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.selectService.unregiesterSelect(this.selectId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('options' in changes) {
      this.options = changes['options'].currentValue;
      this.cacheOptions = this.options;
      this.visibleOptions = this.options;
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
          this.lastStringSearch = value;
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
        ? this.totalCount > 0 && this.cacheOptions.length < this.totalCount
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
      this.visibleOptions = this.options;
      return;
    }

    const regex = new RegExp(label, 'i');

    this.visibleOptions = this.options.filter((option) => {
      return regex.test(option[this.key]) || regex.test(option[this.label]);
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
    this.visibleOptions = this.options;
  }

  /**
   * Register in select service to have control element
   */
  private registerSelect() {
    if (this.selectId.length) return;

    this.selectId = this.selectService.registerSelect();
  }

  checkIsDisabled(key: string): boolean {
    const option = this.options.find((option) => option[this.key] === key);

    if (!option) return false;

    if ('disabled' in option) return option['disabled'];

    return false;
  }

  selectItem(key: string) {
    if (this.checkIsDisabled(key)) return;

    if (this.control) this.control.setValue(key);

    this.onSelect.emit(key);

    this.keyItemSelected = key;

    /* When select item close select component */
    this.selectService.closeSelect(this.selectId);

    this.resetComponent();
  }

  textPresentation(): string {
    let textPresentation: string = 'Escolher';

    const item = this.options.find(
      (option) => option[this.key] === this.keyItemSelected
    );

    if (item) textPresentation = item[this.label];

    return textPresentation;
  }

  /**
   * Return text to show when not found any item by name
   */
  textNotFound(): string {
    return `Nenhum resultado encontrado para ${this.lastStringSearch}`;
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

  iconExpand() {
    return this.opened ? 'expand_less' : 'expand_more';
  }
}
