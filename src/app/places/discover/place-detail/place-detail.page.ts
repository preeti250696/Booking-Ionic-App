import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { BookingsService } from '../../../bookings/bookings.service';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { Places } from '../../place.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Places;
  private placeSub: Subscription;
  isBookable = false;
  isLoading = false;
  constructor(private placeService: PlacesService, private route: ActivatedRoute, private navCtrl: NavController, private modalCtrl: ModalController, private actionCtrl: ActionSheetController, private bookingService: BookingsService, private authService: AuthService, private loadingCtrl: LoadingController, private router: Router, private alertCtrl:AlertController) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        return;
      }
      this.isLoading = true;
      let fetcheduserId:string;
      this.authService.userId.pipe(take(1),switchMap(userId =>{
        if(!userId){
          throw new Error('Found no user');
        }
        fetcheduserId = userId;
        return this.placeService.getPlace(paramMap.get('placeId'));
      })).subscribe(place => {
        this.place = place;
        this.isBookable = this.place.userId !== fetcheduserId;
        this.isLoading = false;
      }, error => {
        this.alertCtrl.create({
          header: 'An error occured',
          message:'could not load place',
          buttons: [
            {
              text:'okay',
              handler: ()=>{
                this.router.navigateByUrl('/places/tabs/discover');
              }
            }
          ]
        }).then(alertEl=>{
           alertEl.present();
        })
      });
    })
  }
  onBookPlace() {
    this.actionCtrl.create({
      header: 'Choose an action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingController('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingController('random');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(actionEl => {
      actionEl.present();
    })

  }
  openBookingController(mode: 'select' | 'random') {
    console.log(mode);
    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: { selectedPlace: this.place, selectedMode: mode }
    }).then(modalEl => {
      modalEl.present();
      return modalEl.onDidDismiss();
    }).then(resultData => {
      console.log(resultData);
      if (resultData.role === 'confirm') {
        console.log('Booked');
        this.loadingCtrl.create({
          message: 'New Booking'
        }).then(loadingEl => {
          loadingEl.present();
          this.bookingService.addBooking(this.place.id, this.place.title, this.place.imageUrl, resultData.data.firstName, resultData.data.lastName, resultData.data.guestNumber, resultData.data.dateFrom, resultData.data.dateTo).subscribe(() => {
            loadingEl.dismiss();
          })
        })

      }
    });
  }
  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
