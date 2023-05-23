import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { MultiSelectComponent } from './components/mult-select/multi-select.component';
import { NgModule } from '@angular/core';
import { SingleSelectComponent } from './components/single-select/single-select.component';

@NgModule({
  declarations: [AppComponent, SingleSelectComponent, MultiSelectComponent],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
