import { Component, inject } from '@angular/core';
import { HttpService } from '../../../shared/services/http/http.service';
import { SharedService } from '../../../shared/services/shared.service';
import { NgClass } from '@angular/common';
import { SectionHeadersComponent } from "../../../shared/components/section-headers/section-headers.component";
import { MyEventLandingPageComponent } from "./my-event-landing-page/my-event-landing-page.component";
import { MyEventTabsComponent } from "./my-event-tabs/my-event-tabs.component";

@Component({
  selector: 'vl-my-events',
  imports: [NgClass, SectionHeadersComponent, MyEventLandingPageComponent, MyEventTabsComponent],
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.scss'
})
export class MyEventsComponent {
  httpService = inject(HttpService)
  sharedService = inject(SharedService)
  myEventsData = []
  discoveryCategories = [
    {
      title: 'Sports',
      icon: 'sports_basketball',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0crVZB7wJGwgUV-DZTEuAdeQK47I6ppIbkX_Fjvb68BDAzyI02NSvhhNZNqcpV8o8yuozhKKRpVeE065Wofy7rQr9hpQs1qrtIdhAEO3EMy-R17atoCSSEjTBCfsKKY1bv0gii9m6BVbk2uFGp3e7ZMyU_sU6sYD-ixBgPHreWYjC4zLXSWIcyUKs5ueLsECujQgnZsPzLclnvKchFjwi8wiUVGzofCHYGew-GhOPibhO9yS2ZK5sZbNyykHCQ0T0G0Rt39cfHc0s',
      hoverColor: 'primary' // Maps to our SCSS modifier
    },
    {
      title: 'Travel',
      icon: 'flight',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAwld73X0wqaMwp2Msjgji-d611boMVsjiaOTp107ls-_kpxD114sqDV4nh0tUlBft_UzBybLOJ-500UhIhLWqgo9fom6qQLtRtagw_o0hhWoP4l3I1CoQ9x8I40XcM8z_pvuwv_fGtdOiKU1RnPE4Eya95WX5YKxamF3QSFBaAkFvknr4Ud4Nt3lOBXUiIyMvGL3PrGJhiV6U3NByuoE156dR6tGrnOmbf7y1__FO-oAy4Vmn9vTRiZGAWEaocjwNHjgmSdavYSRS',
      hoverColor: 'secondary'
    },
    {
      title: 'House Party',
      icon: 'home',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9ayK8vQp1MY1hqwHXU6nAM7Od3qyHCN5Ju2Bz7i8-mjsjzhGpFGjTeLa5rWwvt5GTXpKb9F_MC7nczqo6vvK43Y-22ntP1mRCnvGMAygvWNjNHk0-_VYlT2i45pnd1N5sX_zjo8aPU8jn36aVpW5qwcgHqFuuO_6xfVOxHUvD1TqAZhI43SzYXZAZw8zovn9HtDydDvWNl5G19cZR52QfamYPopqUuI7Sa_nqJg55QAmGyH9y7J8ctzOyij5-wIOKH2D4D83U8uuG',
      hoverColor: 'tertiary'
    },
    {
      title: 'Shopping',
      icon: 'shopping_bag',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTGk2hlznD7EDYHnoUpgFadgNCHMEb8yoM-HMXUDbRtqpPinLkCLxCVUZcOCexdBX9TBsi9C_Q2ba_pAMHcmrV1Axx9tcOYQgML0ElHB0ytDhQIobwqeIYTzk8Nu-qsNIF3VLyOKolM8_JxmMBMf55kWMWWNGoR1aQPktlkTyfYEs_aGJY7bLVbbchIWPbjPntWEEzjAR_yuwjJY7aHDgj0xXEGs3W7jj3z8W5u80IUDHHVFsNfism5556eyOps0bj19PnSMACACmp',
      hoverColor: 'primary-container'
    }
  ];


  ngOnInit() {
    const userDetails = JSON.parse(this.sharedService.getFromLocalStorage('userDetails'));
    if (userDetails && userDetails.id) {
      this.httpService.makeHttpCall(this.sharedService.baseUrl + '/getAllEventsByUser', { userId: userDetails.id }, 'POST', (res: any) => {
        this.myEventsData = res.data;
      })
    }
  }
}
