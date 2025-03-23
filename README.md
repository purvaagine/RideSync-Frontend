# 🚗 CoDrive - Car Pooling App 
A cross-platform (Android, iOS & Web) app that enables ride-sharing and connects drivers with riders commuting on similar routes, making commutes more efficient and eco-friendly.

This is a full-stack application developed using [Ionic React](https://ionicframework.com/), Flask, Firebase Firestore, Google Maps API, etc.

[CoDrive Back-End](https://github.com/257helloWorld/codrivebackend) is developed using Flask framework.

# Table of Contents
- [Features](#features)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Contact](#contact)
  
## Features
- User Authentication: Secure login and registration system.
- Profile Management: Users can manage their profiles and preferences.
- Ride Creation: Drivers can create rides with details such as date, time, and destination.
- Ride Search: Passengers can search for available rides based on their preferences.
- Booking System: Passengers can request to join a ride, and drivers can accept or reject requests.

## Installation
### Prerequisites
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
### Steps
1. Clone the repository
  ```
  git clone https://github.com/257helloworld/codrive.git
  cd codrive
  ```
2. Install dependencies
```
npm install
```
3. Set up environment variables:
Create a .env file in the root directory and add the following variables:
```
VITE_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_APP_GOOGLE_MAPS_MAP_ID=your_google_maps_id
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_BUCKET_URL=your_firebase_storage_bucket_url
```
4. Run the application
```
npm start
```

## Usage
- Register an account if you're a new user or log in if you already have an account.
- Create a profile with your personal details and preferences.
- Create a ride if you're a driver looking to share your ride.
- Search for rides if you're a passenger looking for a ride.
- Request to join a ride and wait for the driver's approval.

## Screenshots
<img style="width:300px;margin-top:15px;" src="https://github.com/257helloWorld/CoDrive/assets/110030634/c1d860f2-2ca0-4124-85c4-828eaef87804"></img>
<img style="width:300px;margin-top:15px;" src="https://github.com/257helloWorld/CoDrive/assets/110030634/1aebcf86-0009-44b6-8bec-87708d475565"></img>
<img style="width:300px;margin-top:15px;" src="https://github.com/257helloWorld/CoDrive/assets/110030634/1f0a79fd-63f9-4165-b20f-2a406954afd5"></img>
<img style="width:300px;margin-top:15px;" src="https://github.com/257helloWorld/CoDrive/assets/110030634/b65de696-f8bd-4156-8ba1-66fe653ae2d9"></img>
<img style="width:300px;margin-top:15px;" src="https://github.com/257helloWorld/CoDrive/assets/110030634/96a29f16-7ecc-4a5c-b60a-70b661eb9759"></img>
<img style="width:300px;margin-top:15px;" src="https://github.com/257helloWorld/CoDrive/assets/110030634/34c59ec4-ac17-4eb2-bdfd-f3285ba7f48b"></img>
<img style="width:300px;margin-top:15px;" src="https://github.com/257helloWorld/CoDrive/assets/110030634/e4f426c5-768f-4126-9ea1-d47941044d98"></img>
<img style="width:300px;margin-top:15px;" src="https://github.com/257helloWorld/CoDrive/assets/110030634/04fda802-24f4-4ab5-bfcb-2823c10cbe51"></img>
<img style="width:300px;margin-top:15px;" src="https://github.com/257helloWorld/CoDrive/assets/110030634/6e923a85-9755-4884-8580-c71daddc8abc"></img>
<img style="width:300px;margin-top:15px;" src="https://github.com/257helloWorld/CoDrive/assets/110030634/189d2b60-7857-428a-a112-ae4e8591f9eb"></img>

## Contact
If you have any questions or suggestions, please feel free to reach out to:

GitHub Issues: https://github.com/257helloworld/CoDrive/issues

***
Check out [back-end](https://github.com/257helloWorld/codrivebackend) repository for CoDrive application.
