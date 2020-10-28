import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Bookings } from './bookings.model';
import { BookingsService } from './bookings.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit , OnDestroy{
  loadedBookings: Bookings[];
  private bookingSub: Subscription;
  isLoading = false;
  constructor(private bookingService: BookingsService,private loadingCtrl:LoadingController) { }

  ngOnInit() {
    this.bookingSub = this.bookingService.bookings.subscribe(booking =>{
      this.loadedBookings = booking
    });
  }
  ionViewWillEnter(){
    this.isLoading = true;
    this.bookingService.fetchBookings().subscribe(()=>{
      this.isLoading = false;
    });
  }
  onCancelBooking(bookingId: string, selectedBooking: IonItemSliding){
    selectedBooking.close();
    this.loadingCtrl.create({
      message:'Deleting Booking!'
    }).then(loadingEl =>{
      loadingEl.present();
      this.bookingService.cancelBooking(bookingId).subscribe(()=>{
        loadingEl.dismiss();
      });
    })
    
  }
  ngOnDestroy(){
    this.bookingSub.unsubscribe();
  }
}
