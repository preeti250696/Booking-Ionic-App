import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Places } from './place.model';

interface PlaceData {
  availableFrom: string,
  availableTo: string,
  description: string,
  imageUrl: string,
  price: number
  title: string,
  userId: string
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  //   [
  //     new Places(
  //      'p1',
  //      'Bankey Bihari Temple',
  //      'It is a holy place of god krishna',
  // '/assets/image1.jpg',
  //      700,
  //      new Date('2019-01-01'),
  //      new Date('2019-12-31'),
  //      'abc'
  //     ),
  //     new Places(
  //       'p2',
  //       'Shivji Temple',
  //       'It is the biggest temple of Barsana',
  //       '/assets/image2.jpg',
  //       500,
  //       new Date('2019-01-01'),
  //      new Date('2019-12-31'),
  //      'abc'
  //     ),
  //     new Places(
  //       'p3',
  //       'Radha Rani Temple',
  //       'It is the biggest temple of Barsana',
  //       '/assets/image3.jpg',
  //       500,
  //       new Date('2019-01-01'),
  //      new Date('2019-12-31'),
  //      'abc'
  //     )
  //   ]
  private _places = new BehaviorSubject<Places[]>([]);
  get places() {
    return this._places.asObservable();
  }
  constructor(private authService: AuthService, private http: HttpClient) { }
  fetchPlaces() {
    return this.http.get<{ [key: string]: PlaceData }>('https://booking-app-14d19.firebaseio.com/offered-places.json').pipe(map(resData => {
      const places = [];
      for (const key in resData) {
        if (resData.hasOwnProperty(key)) {
          places.push(new Places(key, resData[key].title, resData[key].description, resData[key].imageUrl, resData[key].price, new Date(resData[key].availableFrom), new Date(resData[key].availableTo), resData[key].userId))
        }
      }
      return places;
    }),
      tap(places => {
        this._places.next(places);
      })
    );
  }
  getPlace(id: string) {
    return this.http.get<PlaceData>(`https://booking-app-14d19.firebaseio.com/offered-places/${id}.json`)
      .pipe
      (map(placeData => {
        return new Places(id, placeData.title, placeData.description, placeData.imageUrl, placeData.price, new Date(placeData.availableFrom), new Date(placeData.availableTo), placeData.userId)
      }));
    // return this.places.pipe(
    //   take(1),
    //    map(places =>{
    //   return {...places.find(p => p.id == id)};
    // })
    // );

  }

  addPlace(title: string, description: string, price: number, availableFrom: Date, availableTo: Date) {
    let generatedId: string;
    let newPlace: Places;
    return this.authService.userId.pipe(take(1),switchMap (userId =>{
      if(!userId){
        throw new Error('could not found id');
      }
       newPlace = new Places(Math.random().toString(), title, description, '/assets/image3.jpg', price, availableFrom, availableTo, userId);
      return this.http.post<{ name: string }>('https://booking-app-14d19.firebaseio.com/offered-places.json', { ...newPlace, id: null })
    }),
    switchMap(resData => {
      generatedId = resData.name
      return this.places;
    }),
    take(1),
    tap(places => {
      newPlace.id = generatedId;
      this._places.next(places.concat(newPlace));
    })
    )
    
    // return this.places.pipe(take(1),delay(1000),tap(places =>{
    //     this._places.next(places.concat(newPlace));
    // }));
  }
  updatePlace(placeId: string, title: string, description: string) {
    let updatePlaces = [];
    return this.places.pipe(
      take(1),
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();

        } else {
          return of(places);
        }
      }), switchMap(places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatePlaces = [...places];
        const oldPlace = updatePlaces[updatedPlaceIndex];
        updatePlaces[updatedPlaceIndex] = new Places(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        );
        return this.http.put(`https://booking-app-14d19.firebaseio.com/offered-places/${placeId}.json`,
          { ...updatePlaces[updatedPlaceIndex], id: null }
        );
      }), tap(() => {
        this._places.next(updatePlaces);
      }))

    // return this.places.pipe(take(1),delay(1000),tap(places=>{
    //   const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
    //   const updatePlaces = [...places];
    //   const oldPlace = updatePlaces[updatedPlaceIndex];
    //   updatePlaces[updatedPlaceIndex] = new Places(
    //     oldPlace.id,
    //     title,
    //     description,
    //     oldPlace.imageUrl,
    //     oldPlace.price,
    //     oldPlace.availableFrom,
    //     oldPlace.availableTo,
    //     oldPlace.userId
    //     );
    //     this._places.next(updatePlaces);
    // }))

  }
}
