import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { AppModule } from './app/app.module';
// import { Test1Component } from './test1/.test1.component' THIS CAUSES AN ERROR

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));


