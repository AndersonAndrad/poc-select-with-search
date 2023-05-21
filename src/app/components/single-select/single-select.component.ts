import {
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

  @Input() options: any[] = [];

  @Input() key: string = 'id';

  @Input() label: string = 'label';

  @Input() totalCount: number = 0;

  @Output() onSelect = new EventEmitter<any>();

  @Output() loadMore = new EventEmitter();

  visibleOptions: any[] = [];

  opened: boolean = false;

  searchControl: FormControl = new FormControl();

  private subscription: Subscription = new Subscription();

  private selectId: string = '';

  private keyItemSelected: string = '';

  constructor(private selectService: SelectsService) {
    this.registerSelect();
  }

  ngOnInit(): void {
    this.listenSearch();
    this.registerSelect();
    this.listenChangeStatusOpen();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.selectService.unregiesterSelect(this.selectId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('options' in changes) {
      this.options = changes['options'].currentValue;
      this.visibleOptions = this.options;
    }
  }

  /* Listens */
  private listenSearch() {
    this.subscription.add(
      this.searchControl.valueChanges
        .pipe(debounceTime(750))
        .subscribe((value) => this.search(value))
    );
  }

  private listenChangeStatusOpen() {
    this.subscription.add(
      this.selectService.onChangeStatusOpen.subscribe(
        ({ selectId, opened }) => {
          if (this.selectId === selectId) this.opened = opened;
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

      if (endScroll && emmitToParent) this.loadMore.emit();
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

  selectItem(key: string) {
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
