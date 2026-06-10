import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { SectionHeadersComponent } from "../../../shared/components/section-headers/section-headers.component";

@Component({
  selector: 'vl-join-community',
  imports: [NgClass, SectionHeadersComponent],
  templateUrl: './join-community.component.html',
  styleUrl: './join-community.component.scss'
})
export class JoinCommunityComponent {
  trustedCardData = [
    {
      materialIcon: 'verified_user',
      title: 'Verified Users Only',
      description: 'Connect with genuine people in a secure environment.',
    },
    {
      materialIcon: 'shield_with_heart',
      title: 'Safety First Approach',
      description: 'Our guidelines and tools help you interact safely.',
    },
    {
      materialIcon: 'groups',
      title: 'Interest-Based Matching',
      description: 'Find companions who share your passions and vibe.',
    },
    {
      materialIcon: 'local_fire_department',
      title: '20,000+ Vibes Created',
      description: 'Join a growing community of active Vibloopers.',
    }
  ];
}
