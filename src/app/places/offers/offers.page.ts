import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Places } from '../place.model';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy{
  offers: Places[];
  private placeSub: Subscription;
  isLoading = false;
  constructor(private placesService:PlacesService, private router:Router, private loadCtrl:LoadingController) { }

  ngOnInit() {
    this.placeSub = this.placesService.places.subscribe(places =>{
      this.offers = places;
    });
    
  }
  ionViewWillEnter(){
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(()=>{
      this.isLoading = false;
    });
  }
  onEdit(offerId: string, slidingItem:IonItemSliding){
    slidingItem.close();
    this.router.navigate(['/','places','tabs','offers','edit',offerId]);
  }
 ngOnDestroy(){
   if(this.placeSub){
     this.placeSub.unsubscribe();
   }
 }
}
