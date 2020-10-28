import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthResponseData, AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;
  constructor(private authService: AuthService, private router: Router, private loadingCtrl: LoadingController, private alertCtrl: AlertController) { }

  ngOnInit() {
  }
  authenticate(email: string, password: string) {
  
    this.isLoading = true;
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Logging in..'
    }).then(loadingEl => {
      loadingEl.present();
      let AuthObs: Observable<AuthResponseData>;
      if(this.isLogin){
         AuthObs = this.authService.login(email,password)
      } else{
        AuthObs = this.authService.signup(email, password)
      }
      AuthObs.subscribe(resData => {
        console.log(resData);
        this.isLoading = false;
        loadingEl.dismiss();
        console.log("hii")
        this.router.navigateByUrl('/places/tabs/discover');
      }, errRes => {
        loadingEl.dismiss();
        const code = errRes.error.error.message;
        let message = 'Could not sign up, please try again later.'
        if (code === 'EMAIL_EXISTS') {
          message = 'This email already exists'
        } else if( code === 'EMAIL_NOT_FOUND'){
          message = 'This email culd not be found';
        } else if(code === 'INVALID_PASSWORD'){
          message = 'The password is incorrect';
        }
        this.showAlert(message);
      });
    });


  }
  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    } else {
      const email = form.value.email;
      const password = form.value.password;
      this.authenticate(email, password);
    }
  }
  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }
  showAlert(message) {
    this.alertCtrl.create({ header: 'Authentication failed', message: message, buttons: ['okay'] }).then(aletEl => {
      aletEl.present();
    });
  }
}
