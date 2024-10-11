import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { AppModule } from './app/app.module';
// import { HomeComponent } from './home/.home.component' THIS CAUSES AN ERROR

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));


