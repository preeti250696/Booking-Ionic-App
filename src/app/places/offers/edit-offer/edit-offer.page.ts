import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Places } from '../../place.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  form: FormGroup;
  loadedOffer: Places;
  private placeSub: Subscription;
  placeId:string;
  isLoading = false;
  constructor(private placeService:PlacesService, private route: ActivatedRoute, private navCtrl:NavController,private loadingCtrl:LoadingController, private router:Router, private alertCtrl:AlertController) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap =>{
      if(!paramMap.has('placeId')){
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      } 
      this.placeId = paramMap.get('placeId');
      this.isLoading = true;
      this.placeSub =  this.placeService.getPlace(paramMap.get('placeId')).subscribe(place =>{
        this.loadedOffer = place;
        this.form = new FormGroup({
          title: new FormControl(this.loadedOffer.title,{
            updateOn:'blur',
            validators:[Validators.required]
          }),
          description: new FormControl(this.loadedOffer.description, {
            updateOn:'blur',
            validators:[Validators.required, Validators.maxLength(180)]
          })
        })
        this.isLoading = false;
      }, error =>{
          this.alertCtrl.create({
            header:'An error occured',
            message:'Offer could not be fetched',
            buttons:[
              {
                text:'Okay',
                handler: ()=>{
                  this.router.navigateByUrl('/places/tabs/offers');
                }
              }
            ]
          }).then(alertEl =>{
            alertEl.present();
          })
      });
      
    });
    
  }
  onUpdateOffer(){
    if(!this.form.valid){
      return;
    }
    this.loadingCtrl.create({
      message:'Edit offer'
    }).then(loadingEl =>{
      loadingEl.present();
      this.placeService.updatePlace(this.loadedOffer.id, this.form.value.title,this.form.value.description).subscribe(()=>{
    this.loadingCtrl.dismiss();
    this.form.reset();
    this.router.navigateByUrl('/places/tabs/offers');
      });
    })
   
  }
  ngOnDestroy(){
    if(this.placeSub){
      this.placeSub.unsubscribe();
    }
  }
}
