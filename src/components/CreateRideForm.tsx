import {
  IonBadge,
  IonButton,
  IonDatetime,
  IonDatetimeButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonLifeCycleContext,
  IonList,
  IonLoading,
  IonModal,
  IonRadio,
  IonRadioGroup,
  IonRippleEffect,
  IonRouterContext,
  IonText,
} from "@ionic/react";
import React, { useContext, useEffect, useRef, useState } from "react";
import "./CreateRideForm.css";
import {
  addCircleOutline,
  removeCircleOutline,
  removeOutline,
} from "ionicons/icons";
import StartRideDetails from "../types/StartRideDetails";
import startRide from "../functions/startRide";
import { IonReactRouter } from "@ionic/react-router";
import { useLocation } from "react-router";

export function SelectVehicle(props: any) {
  let details: any = localStorage.getItem("createRideDetails");

  const location: any = useLocation();

  const [selectedVehicle, setSelectedVehicle] = useState<string>("0");
  console.log(selectedVehicle);
  const routerContext = useContext(IonRouterContext);
  const handleSelectedVehicleChange = (event: any) => {
    let index = event?.detail?.value;
    setSelectedVehicle(index);
  };
  const onVehicleBackClick = () => {};

  const onVehicleNextClick = () => {
    let createRideDetails = {
      ...details,
      vehicleIndex: selectedVehicle,
      vehicle: props.vehicles[parseInt(selectedVehicle)],
      vehicleId: props.vehicles[parseInt(selectedVehicle)]?.Id,
    };
    let data = JSON.stringify(createRideDetails);
    localStorage.setItem("createRideDetails", data);
    props.onNextClick();
  };
  console.log(props.vehicles, "vehicles");

  const onAddVehicleClick = () => {
    props.setVehiclesWillUpdate(true);
    routerContext.push("/managevehicles", "forward");
  };

  useEffect(() => {
    if (details) {
      details = JSON.parse(details);
    }
    let index = details?.vehicleIndex ? details?.vehicleIndex : 0;
    setSelectedVehicle(index.toString());
  }, []);

  useEffect(() => {
    props.updateVehicles();
  }, [location]);
  return (
    <div id="container" className="container visible">
      <IonText className="title">Select Vehicle</IonText>
      <div className="vehicleInfo">
        <IonRadioGroup
          value={selectedVehicle}
          onIonChange={handleSelectedVehicleChange}
        >
          {props.vehicles.map((vehicle: any, index: any) => (
            <IonItem lines="none" key={index}>
              <IonRadio slot="start" value={index.toString()}></IonRadio>
              <IonLabel>{vehicle?.VehicleName}</IonLabel>
              <IonBadge slot="end" className={vehicle?.FuelType}>
                {vehicle?.FuelType}
              </IonBadge>
            </IonItem>
          ))}
          <IonItem lines="none" onClick={onAddVehicleClick}>
            <IonIcon icon={addCircleOutline} slot="start"></IonIcon>
            <IonText>Add Vehicle</IonText>
          </IonItem>
        </IonRadioGroup>
      </div>
      <div className="buttonsHolder">
        <IonButton onClick={onVehicleBackClick}>Cancel</IonButton>
        <IonButton onClick={onVehicleNextClick}>Next</IonButton>
      </div>
    </div>
  );
}

export function SelectCoRiders(props: any) {
  let details: any = localStorage.getItem("createRideDetails");
  if (details) {
    details = JSON.parse(details);
  }
  const [vehicle, setVehicle] = useState<any>();
  const [noOfCoRiders, setNoOfCoRiders] = useState<number>(() => {
    if (
      details?.seatingCapacity > 0 &&
      details?.seatingCapacity < details?.vehicle?.SeatingCapacity
    ) {
      return details?.seatingCapacity;
    }
    return 1;
  });

  const onCoRidersBackClick = () => {
    props.onBackClick();
  };

  const onCoRidersNextClick = () => {
    let data: any = localStorage.getItem("createRideDetails");
    if (!data) return;
    data = JSON.parse(data);
    let newData = { ...data, seatingCapacity: noOfCoRiders };
    newData = JSON.stringify(newData);
    localStorage.setItem("createRideDetails", newData);
    props.onNextClick();
  };

  useEffect(() => {
    let data: any = localStorage.getItem("createRideDetails");
    if (!data) return;
    data = JSON.parse(data);
    setVehicle(data?.vehicle);
  }, []);

  const onReduceClick = () => {
    if (noOfCoRiders > 1) {
      setNoOfCoRiders(noOfCoRiders - 1);
    }
  };
  const onIncreaseClick = () => {
    console.log(vehicle);
    if (noOfCoRiders < vehicle?.SeatingCapacity - 1) {
      setNoOfCoRiders(noOfCoRiders + 1);
    }
  };
  return (
    <div id="container" className="container visible">
      <IonText className="title">Select No. of Co-Riders</IonText>
      <div className="coridersInfo">
        <div className="ion-activatable ripple-parent" onClick={onReduceClick}>
          <IonIcon icon={removeCircleOutline}></IonIcon>
          <IonRippleEffect></IonRippleEffect>
        </div>
        <IonText>{noOfCoRiders}</IonText>
        <div
          className="ion-activatable ripple-parent"
          onClick={onIncreaseClick}
        >
          <IonIcon icon={addCircleOutline}></IonIcon>
          <IonRippleEffect></IonRippleEffect>
        </div>
      </div>
      <div className="description">
        Co-Riders capacity of {vehicle?.VehicleName} is{" "}
        {vehicle?.SeatingCapacity - 1}
      </div>
      <div className="buttonsHolder">
        <IonButton onClick={onCoRidersBackClick}>Back</IonButton>
        <IonButton onClick={onCoRidersNextClick}>Next</IonButton>
      </div>
    </div>
  );
}

export function SelectSchedule(props: any) {
  let details: any = localStorage.getItem("createRideDetails");
  if (details) {
    details = JSON.parse(details);
  }
  const currentDate = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 3);
  
  // Convert local date to ISO format without timezone offset
  const toLocalISOString = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };
  
  const [selectedDateTime, setSelectedDateTime] = useState<string>(
    details?.schedule ? toLocalISOString(new Date(details.schedule)) : toLocalISOString(currentDate)
  );
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isNow, setIsNow] = useState<boolean>(true);
  localStorage.setItem("isNow", "false");

  const onScheduleBackClick = () => {
    props.onBackClick();
  };

  const onScheduleNextClick = () => {
    let data: any = localStorage.getItem("createRideDetails");
    if (!data) return;
    data = JSON.parse(data);
    let newData = {
      ...data,
      schedule: new Date(selectedDateTime),
      isNow: isNow,
    };
    newData = JSON.stringify(newData);
    localStorage.setItem("createRideDetails", newData);
    props.onNextClick();
  };

  
useEffect(() => {
  const intervalId = setInterval(() => {
    calculateTimeRemaining();
  }, 1000);
  return () => clearInterval(intervalId);
}, [selectedDateTime]);

const calculateTimeRemaining = () => {
  if (!selectedDateTime) return;

  const selectedDate = new Date(selectedDateTime);
  const currentTime = new Date();
  const timeDifference = selectedDate.getTime() - currentTime.getTime();

  if (timeDifference <= 0) {
    setTimeRemaining("Ride will start immediately");
    setIsNow(true);
    localStorage.setItem("isNow", "true");
    return;
  }

  setIsNow(false);
  localStorage.setItem("isNow", "false");

  const secondsRemaining = Math.floor(timeDifference / 1000);
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  setTimeRemaining(`Time to start: ${hours}:${minutes}:${seconds}`);
};

  return (
    <div id="container" className="container visible">
      <IonText className="title">Select Schedule</IonText>
      <div className="scheduleInfo">
        <div className="description">
          {timeRemaining? (
            <div>{timeRemaining}</div>
          ) : (
            <div>Ride will start immediately</div>
          )}
        </div>
        <IonDatetimeButton datetime="datetime"></IonDatetimeButton>
        <IonModal keepContentsMounted={true}>
          <IonDatetime
            id="datetime"
            min={toLocalISOString(currentDate)}
            max={toLocalISOString(maxDate)}
            value={selectedDateTime}
            onIonChange={(e: any) => setSelectedDateTime(e.detail.value)}
          ></IonDatetime>
        </IonModal>
      </div>
      <div className="buttonsHolder">
        <IonButton onClick={onScheduleBackClick}>Back</IonButton>
        <IonButton onClick={onScheduleNextClick}>Next</IonButton>
      </div>
    </div>
  );
}

export function ConfirmDetails(props: any) {
  let details: any = localStorage.getItem("createRideDetails");
  if (details) {
    details = JSON.parse(details);
  }
  let startTime = details?.schedule;
  let startTimeString = new Date(startTime).toLocaleString();
  let sourceInput = localStorage.getItem("sourceInput");
  let destinationInput = localStorage.getItem("destinationInput");
  let sourceLatLng: any = localStorage.getItem("sourceLatLng");
  sourceLatLng = JSON.parse(sourceLatLng);
  let destinationLatLng: any = localStorage.getItem("destinationLatLng");
  destinationLatLng = JSON.parse(destinationLatLng);
  let isNow: any = localStorage.getItem("isNow");
  isNow = JSON.parse(isNow);
  const [confirmDetails, setConfirmDetails] = useState<any>(details);
  console.log(sourceInput, sourceLatLng, destinationInput, destinationLatLng);

  const currentDate = new Date().toISOString();

  const ionRouterContext = useContext(IonRouterContext);

  const onConfirmBackClick = () => {
    props.onBackClick();
  };

  const onConfirmSubmitClick = () => {
    let user = JSON.parse(localStorage.getItem("user") as string);
    let userId = user?.Id;
    props.setIsConfirmLoading(true);
    let confirmDetails: StartRideDetails = {
      ...details,
      sourceInput: sourceInput,
      userId: userId,
      destinationInput: destinationInput,
      sourceLatLng: sourceLatLng,
      destinationLatLng: destinationLatLng,
      isNow: isNow,
      totalDistance: props.distance,
    };

    localStorage.setItem("createRideDetails", JSON.stringify(confirmDetails));
    const submitCreateRideForm = async () => {
      let response: any = await startRide(confirmDetails);
      console.log("response", response);
      let rideId = response?.document_id;
      props.setIsConfirmLoading(false);
      ionRouterContext.push(
        `/ridedetails?rideId=${rideId}`,
        "forward",
        "replace"
      );
    };
    submitCreateRideForm();
  };
  return (
    <div id="container" className="container visible">
      <IonText className="title">Confirm</IonText>
      <div className="confirmInfo">
        <IonList lines="none">
          <IonItem>
            <IonText slot="start">Source:</IonText>
            <IonText>{sourceInput}</IonText>
          </IonItem>
          <IonItem>
            <IonText slot="start">Drop: &nbsp;&nbsp;&nbsp;</IonText>
            <IonText>{destinationInput}</IonText>
          </IonItem>
          <IonItem>
            <IonText slot="start">Vehicle</IonText>
            <IonText>{confirmDetails?.vehicle?.VehicleName}</IonText>
          </IonItem>
          <IonItem>
            <IonText slot="start">Co-Riders</IonText>
            <IonText>{confirmDetails?.seatingCapacity}</IonText>
          </IonItem>
          <IonItem>
            <IonText slot="start">Start Time</IonText>
            <IonText>{startTimeString}</IonText>
          </IonItem>
        </IonList>
      </div>
      <div className="buttonsHolder">
        <IonButton onClick={onConfirmBackClick}>Back</IonButton>
        <IonButton
          style={{ "--background": "green" }}
          onClick={onConfirmSubmitClick}
        >
          Confirm
        </IonButton>
      </div>
    </div>
  );
}
