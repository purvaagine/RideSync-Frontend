import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonImg,
  IonMenuButton,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import ExploreContainer from "../../components/ExploreContainer";
import "./Drive.css";
import startRide from "/assets/images/drive.png";
import scheduleRide from "/assets/images/calendar.png";

import { navigateOutline } from "ionicons/icons";
import {
  Autocomplete,
  StandaloneSearchBox,
  LoadScript,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";

const Drive: React.FC = () => {
  return (
    <>
      <IonContent>
        {/* <IonButton routerLink="/profile">Hello</IonButton> */}
        <div className="driveCard" id="createNow">
          <div className="cardLeft">
            <IonText className="driveCardTitle">Create Ride</IonText>
            <p className="driveCardSubTitle">
              Begin Your Shared Ride Experience
            </p>
            <IonButton className="createNowBtn">Create Now</IonButton>
          </div>
          <div className="cardRight">
            <IonImg className="driveCardIcon" src={startRide}></IonImg>
          </div>
          {/* <p className="drive_createNow"> Create Now </p> */}
        </div>

        <div className="driveCard" id="scheduleRide">
          <div className="cardLeft">
            <IonText className="driveCardTitle">Schedule Ride</IonText>
            <p className="driveCardSubTitle">
              Set the date, Plan your next shared drive!
            </p>
            <IonButton className="scheduleBtn">Schedule</IonButton>
          </div>
          <div className="cardRight">
            <IonImg src={scheduleRide} className="driveCardIcon"></IonImg>
          </div>
        </div>
      </IonContent>
    </>
  );
};

export default Drive;
