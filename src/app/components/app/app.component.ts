import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {LoginService} from "../../services/login.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'nwp-domaci-3-frontend';

  displayLogin: string = "block";
  displayLogout: string = "none";

  constructor(private router: Router, private loginService: LoginService) {

  }


}
