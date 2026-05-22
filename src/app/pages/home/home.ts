import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header';
import { HeroComponent } from '../../components/hero/hero';
import { FeaturesComponent } from '../../components/features/features';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, HeroComponent, FeaturesComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <app-hero></app-hero>
    <app-features></app-features>
    <app-footer></app-footer>
  `
})
export class HomeComponent {}
