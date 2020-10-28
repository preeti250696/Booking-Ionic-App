import { Component, OnDestroy, OnInit } from '@angular/core';
import { Places } from '../place.model';
import { PlacesService } from '../places.service';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  relevantPlaces: Places[];
  loadedPlaces: Places[];
  listLoadedPlaces: Places[];
  private placeSub: Subscription;
  isLoading = false;
  constructor(private placesService: PlacesService, private authService:AuthService) { }

  ngOnInit() {
    this.placeSub = this.placesService.places.subscribe(places =>{
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.listLoadedPlaces = this.loadedPlaces.slice(1);
    });
  
  }
  ionViewWillEnter(){
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(()=>{
      this.isLoading = false;
    });
  }
  onFilterPlaces(event: CustomEvent<SegmentChangeEventDetail>){
    this.authService.userId.pipe(take(1)).subscribe( userId =>{
      if(event.detail.value === 'all'){
        this.relevantPlaces = this.loadedPlaces;
        this.listLoadedPlaces = this.relevantPlaces.slice(1);
      } else{
         this.relevantPlaces = this.loadedPlaces.filter(place =>
           place.userId !== userId
         );
         console.log(this.relevantPlaces);
         this.listLoadedPlaces = this.relevantPlaces.slice(1);
      }
    });
  
  }
  ngOnDestroy(){
    if(this.placeSub){
      this.placeSub.unsubscribe();
    }
  }
}
