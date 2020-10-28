import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Bookings } from "./bookings.model";
import { take, tap, delay, switchMap, map } from 'rxjs/operators';
import { AuthService } from "../auth/auth.service";
import { HttpClient } from "@angular/common/http";

interface BookingData {
    bookedFrom: string,
    bookedTo: string,
    firstName: string,
    guestNumber: number,
    lastName: string,
    placeId: string,
    placeImage: string,
    placeTitle: string,
    userId: string
}

@Injectable({
    providedIn: 'root'
})
export class BookingsService {
    private _bookings = new BehaviorSubject<Bookings[]>([]);

    get bookings() {
        return this._bookings.asObservable();
    }
    constructor(private authService: AuthService, private http: HttpClient) {

    }
    addBooking(placeId: string, placeTitle: string, placeImage: string, firstName: string, lastName: string, guestNumber: number, bookedFrom: Date, bookedTo: Date) {
        let generatedId: string;
        let newBooking: Bookings;
       return this.authService.userId.pipe(take(1), switchMap(userId => {
            if (!userId) {
                throw new Error('No user id Found!');
            }
            newBooking = new Bookings(
                Math.random().toString(),
                placeId,
                userId,
                placeTitle,
                placeImage,
                firstName,
                lastName,
                guestNumber,
                bookedFrom,
                bookedTo
            )
            return this.http.post<{ name: string }>('https://booking-app-14d19.firebaseio.com/bookings.json', { ...newBooking, id: null });
        }),
            switchMap(resData => {
                generatedId = resData.name
                return this.bookings;
            }),
            take(1),
            tap(bookings => {
                newBooking.id = generatedId;
                this._bookings.next(bookings.concat(newBooking))
            })
        )

            .pipe(

            );
        // return this.bookings.pipe(take(1),delay(1000), tap(booking =>{
        //     this._bookings.next(booking.concat(newBooking))
        // }))
    }
    cancelBooking(bookingId: string) {
        return this.http.delete(`https://booking-app-14d19.firebaseio.com/bookings/${bookingId}.json`)
            .pipe(
                switchMap(() => {
                    return this.bookings;
                }),
                take(1),
                tap(bookings => {
                    this._bookings.next(bookings.filter(b => b.id !== bookingId));
                })
            )
        // return this.bookings.pipe(take(1),delay(1000),tap(booking =>{
        //     this._bookings.next(booking.filter(b => b.id !== bookingId));
        // }))
    }
    fetchBookings() {
        return this.authService.userId.pipe(switchMap(userId =>{
            return this.http.get<{ [key: string]: BookingData }>(`https://booking-app-14d19.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${userId}"`)
        }),
        map(resData => {
            console.log(resData);
            const booking = [];
            for (const key in resData) {
                if (resData.hasOwnProperty(key)) {
                    booking.push(new Bookings(key, resData[key].placeId, resData[key].userId, resData[key].placeTitle, resData[key].placeImage, resData[key].firstName, resData[key].lastName, resData[key].guestNumber, new Date(resData[key].bookedFrom), new Date(resData[key].bookedTo)))
                }
            }
            return booking;
        }),
            tap(booking => {
                console.log(booking)
                this._bookings.next(booking);
            })
        )
        
    }
}