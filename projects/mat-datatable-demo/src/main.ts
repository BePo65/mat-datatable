import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NgxRerenderModule } from 'ngx-rerender';

import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      MatButtonModule,
      MatChipsModule,
      MatFormFieldModule,
      MatIconModule,
      MatSelectModule,
      MatSlideToggleModule,
      NgxRerenderModule
    ),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi())
  ]
})
  .catch(err => console.error(err));

// TODO 'withInterceptorsFromDi' see following comment
/**
 * Includes class-based interceptors configured using a multi-provider in the current injector into
 * the configured `HttpClient` instance.
 *
 * Prefer `withInterceptors` and functional interceptors instead, as support for DI-provided
 * interceptors may be phased out in a later release.
 */
