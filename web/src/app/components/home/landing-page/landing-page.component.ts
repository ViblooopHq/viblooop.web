import { Component, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { ISourceOptions } from "@tsparticles/engine";

@Component({
  selector: 'vl-landing-page',
  standalone: true,
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  id = "tsparticles";

  // Professional, subtle particle configuration
  particlesOptions: ISourceOptions = {
    fullScreen: { enable: false }, // Only in the hero section
    fpsLimit: 120,
    particles: {
      color: {
        value: "#bd9dff", // Primary purple tint
      },
      links: {
        color: "#bd9dff",
        distance: 150,
        enable: true,
        opacity: 0.15,
        width: 2,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "out",
        },
        random: true,
        speed: 0.8,
        straight: false,
      },
      number: {
        density: {
          enable: true,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
  };

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const { tsParticles } = await import("@tsparticles/engine");
        const { loadSlim } = await import("@tsparticles/slim");
        await loadSlim(tsParticles);
        await tsParticles.load({ id: this.id, options: this.particlesOptions });
      } catch (err) {
        console.error("Failed to load particles", err);
      }
    }
  }
}
