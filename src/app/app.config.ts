import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, HttpClientModule } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations()
  ],
};

