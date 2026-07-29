import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'vl-my-event-tabs',
  imports: [NgClass],
  templateUrl: './my-event-tabs.component.html',
  styleUrl: './my-event-tabs.component.scss',
})
export class MyEventTabsComponent {
  activeTab: 'created' | 'requested' | 'joined' = 'created';
  events = [
    {
      _id: '1',
      title: 'Cyber Pulse Night',
      date: 'Oct 24, 2026',
      time: '10:00 PM',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBU6MacEbUH6Dpnt5XrO3sZ4k_IHet3M23ohRw9VNKCFgBzmPRa8OXtcpkxHFG5TLsGEh1uZovr2O4Z2EOyE2aCuUbyXm8EUmCrNfdoDZX0XiD8321-OkQMC03c9b4fhzcNaAwQxeSdV9zKr8eoSDPNtLCwJtsrMhBun1i43KQDkhB-ex4THt8aWEhCRfh01Oo3gIqREIa4Gtpw6topauQ82u_r2hWbTtJEar1XFz09Fj49edZkCXpxtL4T5zaHgbcgpwwIvVzexnkD',
      badgeText: 'Host',
      badgeColor: 'primary'
    },
    {
      _id: '2',
      title: 'Azure Villa Social',
      date: 'Oct 29, 2026',
      time: '06:00 PM',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqQFk7yywukl-cbQACkUBIraD-q2ANWuOP5m-a00p18mHT4PRheNoXcM5RFxtgsRJeJAEEHhorapMCXUXdrjRfXrnF2mbx5wYTzopNarUNHM4rojBrIo-_GdW_iJ4XLSe90ZR7OsgCmEkPuMCgXMe3-tkfUFqltstQQh0dRxFliIhf0hcG5yf_o4ptaC6tcEYb8-K2-DW-LOvfSx7-cQaYQqUFLs915c1rYIh2YGV3Vo1obG9cGz5gEITui46Gx5yMJ7aKuo-k62j4',
      badgeText: 'Confirmed',
      badgeColor: 'secondary'
    },
    {
      _id: '3',
      title: 'Viblooop Meetup',
      date: 'Nov 02, 2026',
      time: '08:00 PM',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzO3V9Ojwij7VKromSInMdJn80sYt5MDIlgCiab5MPfbMw-Gyehce9UqnOotl1Gm3bUQ2aVo1z-lcOMZkw5Zqq7cvdL00rYbDL-vpqHlFeXRwoVGu_iSTPeChTzL-hQCr1DMegl_AfoHymaGj7m-6Wr_zCGr20YsEZEcuVJMBzc1dGSmVL1ZOWLqsokb96bkwIYcOMxshCYfqy5-FO9CpcuajvLF2RDlRTvX76BZK547gtGm0aWdLPVR-ke0GhfhVDS3YlFTMMG4KJ',
      badgeText: 'Live',
      badgeColor: 'tertiary'
    }
  ];

  setActiveTab(tab: 'created' | 'requested' | 'joined') {
    this.activeTab = tab;
  }

}
