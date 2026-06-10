import { Component } from '@angular/core';
import { LandingPageComponent } from "./landing-page/landing-page.component";
import { FindYourVibeComponent } from "./find-your-vibe/find-your-vibe.component";
import { ReadyToVibeComponent } from "./ready-to-vibe/ready-to-vibe.component";
import { JoinCommunityComponent } from "./join-community/join-community.component";
import { HowViblooopWorksComponent } from "./how-viblooop-works/how-viblooop-works.component";
import { WhyChooseUsComponent } from './why-choose-us/why-choose-us.component';
import { OurFeaturesComponent } from "./our-features/our-features.component";

@Component({
  selector: 'vl-home',
  imports: [LandingPageComponent, WhyChooseUsComponent, FindYourVibeComponent, ReadyToVibeComponent, JoinCommunityComponent, HowViblooopWorksComponent, OurFeaturesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
