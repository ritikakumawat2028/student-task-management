import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { LocalAuthService } from './services/local-auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styles: []
})
export class AppComponent implements OnInit {
  constructor(
    private authService: LocalAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const currentRoute = this.router.url;
        if (currentRoute === '/' || currentRoute === '/login' || currentRoute === '/register') {
          this.router.navigate([`/${user.role}`]);
        }
      }
    });
  }
}
