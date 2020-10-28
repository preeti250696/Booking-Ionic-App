import { FnParam } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  form:FormGroup;
  constructor(private placeService:PlacesService, private router: Router, private loadingCtrl:LoadingController) { }

  ngOnInit() {
    this.form = new FormGroup({
     title : new FormControl(null,{
       updateOn:'blur',
       validators:[Validators.required]
     }),
     description : new FormControl(null,{
      updateOn:'blur',
      validators:[Validators.required, Validators.maxLength(180)]
     }),
     price :  new FormControl(null,{
       updateOn:'blur',
       validators:[Validators.required, Validators.min(1)]
     }),
     datefrom : new FormControl(null,{
       updateOn:'blur',
       validators:[Validators.required]
     }),
     dateto : new FormControl(null,{
       updateOn:'blur',
       validators:[Validators.required]
     })
    });
  }
  onCreateOffer(){
    this.loadingCtrl.create({
      message:'Creating new offer'
    }).then(loadingEl =>{
       loadingEl.present();
       this.placeService.addPlace(this.form.value.title, this.form.value.description,+this.form.value.price,new Date(this.form.value.datefrom),new Date(this.form.value.dateto)).subscribe(()=>{
      loadingEl.dismiss();
        this.form.reset();
        this.router.navigateByUrl('/places/tabs/offers');
      });
    });
    
    
  }
}
