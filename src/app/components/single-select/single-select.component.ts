import {
  AfterViewInit,
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
export class SingleSelectComponent
  implements OnInit, OnDestroy, AfterViewInit, OnChanges
{
  @ViewChild('selector') set selectorElement(element: ElementRef) {
    if (element) this.closeWhenOutsideClick(element);
  }

  @ViewChild('options') set optionsElement(element: ElementRef) {
    if (element) this.listenScrollOptions(element);
  }

  @Input() control: FormControl = new FormControl();

  @Input() options: any[] = [];

  @Input() key: string = 'id';

  @Input() label: string = 'label';

  @Input() totalCount: number = 0;

  @Output() onSelect = new EventEmitter<any>();

  @Output() loadMore = new EventEmitter();

  visibleOptions: any[] = [];

  opened: boolean = true;

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

  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
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
          console.log({ opened });
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
        ? this.totalCount > 0 && this.totalCount <= this.options.length
        : false;

      if (endScroll && emmitToParent) this.loadMore.emit();
    });
  }

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
      }
    });
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

    this.opened = !this.opened;

    /* When select item close select component */
    // this.selectService.closeSelect(this.selectId);
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
    this.opened = !this.opened;
    // this.selectService.changeStatusOpen(this.selectId);
  }

  iconExpand() {
    return this.opened ? 'expand_less' : 'expand_more';
  }

  // ngAfterViewInit() {
  //   this.helperCloseWhenOutsideClick();
  // }
}