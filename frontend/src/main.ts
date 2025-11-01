import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { AppComponent } from './app/components/app/app.component';



bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
