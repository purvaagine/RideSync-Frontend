import {
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonText,
  IonRouterContext,
  IonAlert,
  IonButton,
  IonImg,
  IonRippleEffect,
} from "@ionic/react";
import "./Join.css";
import {
  useJsApiLoader,
  GoogleMap,
  MarkerF,
  Polyline,
} from "@react-google-maps/api";
import { Geolocation } from "@capacitor/geolocation";
import { locationSharp } from "ionicons/icons";
import { useContext, useEffect, useRef, useState } from "react";

import Destination from "../Destination";

import pin from "/assets/images/pin.svg";
import startRide from "/assets/images/drive.png";
import scheduleRide from "/assets/images/calendar.png";

import getDirections from "../../functions/getDirections";
import getUser from "../../functions/getUser";

import LatLng from "../../types/LatLng";
import { useLocation } from "react-router";

const mapId = import.meta.env.VITE_APP_GOOGLE_MAPS_MAP_ID;
const apiKey = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;

const mapOptions = {
  disableDefaultUI: true,
  keyboardShortcuts: false,
  mapId: mapId,
  clickableIcons: false,
  gestureHandling: "greedy",
};

const polylineOptions = {
  strokeColor: "#000",
  strokeOpacity: 1,
  strokeWeight: 4,
};

const Join = (props: any) => {
  const [centerLatLng, setCenterLatLng] = useState<LatLng>();
  const [polylineCords, setPolylineCords] = useState<any>();
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [mapLibraries, setMapLibraries] = useState<any>(["places"]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>("");
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [isFirstCall, setIsFirstCall] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isSecondCall, setIsSecondCall] = useState<boolean>(false);
  const [height, setHeight] = useState<number>(60);
  const [isLocatingSource, setIsLocatingSource] = useState<boolean>(true);

  const sourceInputValue = useRef<any>();
  const destinationInputValue = useRef<any>();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSourceValid, setIsSourceValid] = useState<boolean>(false);
  const [isDestinationValid, setIsDestinationValid] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>();
  const [origin, setOrigin] = useState<any>({ lat: 19.0989, lng: 72.8515 });
  const [destination, setDestination] = useState({
    lat: 19.11867,
    lng: 72.84799,
  });

  const modal = useRef<HTMLIonModalElement>(null);
  const confirmModalRef = useRef<HTMLIonModalElement>(null);

  const ionRouterContext = useContext(IonRouterContext);

  let firstName = JSON.parse(localStorage.getItem("user") as string)?.FirstName;

  let debounceTimer: any;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: mapLibraries,
  });

  const mapContainerStyle = {
    width: "100%",
    height: "calc(" + height + "% - 70px)",
    transition: "height 0.5s ease",
  };

  useEffect(() => {
    if (props.selectedTab === "tab1") {
      setHeight(80);
    } else {
      setHeight(75);
    }
  }, [props.selectedTab]);

  const renderDirection = () => {
    let directions: any;
    const fetchDirection = async () => {
      let origin = localStorage.getItem("sourceLatLng");
      let destination = localStorage.getItem("destinationLatLng");
      if (!origin || !destination) {
        return;
      }
      origin = JSON.parse(origin);
      destination = JSON.parse(destination);
      directions = await getDirections(origin, destination);
      console.log("directions", directions);
      localStorage.setItem("polylineCoordinates", JSON.stringify(directions));
      props.handleJoinMapClick();
    };
    fetchDirection();
  };

  useEffect(() => {
    const getUserDetails = async () => {
      let userId = localStorage.getItem("userId") as string;
      let user = await getUser(userId);
    };
    getUserDetails();
    if (mapRef) {
      getCenterPlace(); // Only call when mapRef is ready
  }
  }, []);

  useEffect(() => {
    if (mapRef !== null) {
      setCurrentLocationAsSource();
    }
  }, [mapRef]);

  const handleOnLoad = (map: any) => {
    setMapRef(map);
  };

  const getCurrentLocation = async () => {
    let position: any;
    const getCurLoc = async () => {
      try {
        position = await Geolocation.getCurrentPosition();
      } catch (error) {
        console.error("Error getting current position:", error);
      }
    };
    await getCurLoc();
    return {
      lat: position?.coords?.latitude,
      lng: position?.coords?.longitude,
    };
  };

  const handleClick = (e: any) => {
    console.log(
      "Success: Clicked to: " + e.latLng.lat() + "," + e.latLng.lng()
    );
  };

  const handleMapCenterChanged = () => {
    if (!isReady) {
      setIsReady(true);
      return;
    }
    const newCenter = mapRef?.getCenter();
    let centerLatLng = {
      lat: newCenter?.lat(),
      lng: newCenter?.lng(),
    };
    if (isLocatingSource) {
      localStorage.setItem("sourceLatLng", JSON.stringify(centerLatLng));
    } else {
      localStorage.setItem("destinationLatLng", JSON.stringify(centerLatLng));
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      getCenterPlace();
      modal?.current?.present();
    }, 500);
  };

  const handleDestinationClick = () => {
    modal?.current?.present();
  };

  const setCurrentLocationAsSource = async () => {
    let currentLocation: any = await getCurrentLocation();
    console.log("curr loc", currentLocation);
    setOrigin(currentLocation);
    localStorage.setItem("sourceLatLng", JSON.stringify(currentLocation));
    setCenterLatLng(currentLocation);

    setIsSourceValid(true);
    let sourceInputTxt = document.getElementById(
      "sourceInputTxt"
    ) as HTMLInputElement;
    if (sourceInputTxt) {
      sourceInputTxt.blur();
    }
  };

  const getCenterPlace = () => {
    if (!mapRef) {
        console.error("Map reference is undefined. Ensure the map has loaded before calling this function.");
        return;
    }

    const center = mapRef.getCenter();
    if (!center) {
        console.error("Map center is undefined.");
        return;
    }

    const latLng = {
        lat: center.lat(),
        lng: center.lng(),
    };

    console.log("Geocoding request:", latLng);

    if (!latLng.lat || !latLng.lng) {
        console.error("Invalid coordinates for geocoding.");
        return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === "OK" && results?.length) {
            console.log("Geocoding result:", results[0]);

            if (isLocatingSource) {
                const sourceTxt = document.getElementById("sourceInputTxt") as HTMLInputElement;
                if (sourceTxt) {
                    sourceTxt.value = results[0].formatted_address;
                    setIsSourceValid(true);
                    localStorage.setItem("sourceInput", results[0].formatted_address);
                }
            } else {
                const destinationTxt = document.getElementById("destinationInputTxt") as HTMLInputElement;
                if (destinationTxt) {
                    destinationTxt.value = results[0].formatted_address;
                    setIsDestinationValid(true);
                    localStorage.setItem("destinationInput", results[0].formatted_address);
                }
            }
        } else {
            console.error("Geocoder failed due to:", status);
        }
    });
};


  useEffect(() => {
    console.log("home rendered");
    // let msg = localStorage.getItem("msg");
    // if (!msg) {
    //   setMsg("not set");
    //   setIsAlertOpen(true);
    //   return;
    // }
    // setMsg(msg);
    // setIsAlertOpen(true);
  }, []);

  const handleViewRideClick = () => {
    let rideId = props.isOnRide[1];
    console.log("id", rideId);
    ionRouterContext.push(`/ridedetails?rideId=${rideId}`);
  };

  useEffect(() => {
    localStorage.removeItem("requestedRides");
  }, [props.isOnRide]);

  return (
    <>
      <IonContent>
        <div style={mapContainerStyle}>
          {!isLoaded ? (
            <p style={{ textAlign: "center" }}>Loading...</p>
          ) : (
            <GoogleMap
              id="map"
              center={centerLatLng}
              onLoad={handleOnLoad}
              zoom={15}
              mapContainerStyle={{ height: "100%" }}
              onClick={(e) => handleClick(e)}
              onCenterChanged={handleMapCenterChanged}
              options={mapOptions}
            >
              <div className="locationPin">
                <div>
                  <IonText>
                    {isLocatingSource ? (
                      "Source"
                    ) : (
                      <>&nbsp;&nbsp;Drop&nbsp;&nbsp;</>
                    )}
                  </IonText>
                </div>
                <IonIcon icon={pin}></IonIcon>
              </div>

              {polylineCords && (
                <Polyline path={polylineCords} options={polylineOptions} />
              )}
            </GoogleMap>
          )}
        </div>
        {/* DestinationInput */}
        {props.selectedTab === "tab1" ? (
          <>
            <div
              style={{
                height: "70px",
                display: "flex",
              }}
            >
              <IonItem lines="none" id="destinationInputHolder">
                <IonIcon
                  slot="start"
                  icon={locationSharp}
                  style={{ marginRight: "10px", marginLeft: "10px" }}
                  color="black"
                ></IonIcon>
                <IonInput
                  readonly={true}
                  value={""}
                  placeholder="Enter Destination"
                  onClick={handleDestinationClick}
                ></IonInput>
              </IonItem>
            </div>
            <div
              className="welcomeContainer"
              style={{
                height: "20%",
                width: "90%",
                margin: "auto",
                padding: "10px 0",
              }}
            >
              <IonText style={{ fontSize: "20px", fontWeight: "600" }}>
                Welcome, <span style={{ color: "green" }}>{firstName} :)</span>
              </IonText>
              <br />
              <div style={{ margin: "10px" }}></div>
              <IonText style={{ color: "darkgray", lineHeight: "2" }}>
                Reach your destination by joining someone's ride or Create your
                own ride for the day!
              </IonText>
            </div>
          </>
        ) : (
          <div className="driveTabContainer">
            <IonText className="title">Select action</IonText>
            <div className="driveTab">
              <div
                className="createRideCard ion-activatable ripple-parent"
                onClick={handleDestinationClick}
              >
                <IonRippleEffect></IonRippleEffect>
                <IonImg src={startRide}></IonImg>
                <IonText>Drive Now</IonText>
              </div>
              <div
                className="scheduleRideCard ion-activatable ripple-parent"
                onClick={handleDestinationClick}
              >
                <IonRippleEffect></IonRippleEffect>
                <IonImg src={scheduleRide}></IonImg>
                <IonText>Schedule Ride</IonText>
              </div>
            </div>
          </div>
        )}

        <Destination
          setCurrentLocationAsSource={setCurrentLocationAsSource}
          sourceInputValue={sourceInputValue}
          // setSourceInputValue={setSourceInputValue}
          destinationInputValue={destinationInputValue}
          // setDestinationInputValue={setDestinationInputValue}
          origin={origin}
          setOrigin={setOrigin}
          destination={destination}
          setDestination={setDestination}
          isOpen={isModalOpen}
          modal={modal}
          confirmModal={confirmModalRef}
          renderDirection={renderDirection}
          setIsConfirmOpen={setIsConfirmOpen}
          isSourceValid={isSourceValid}
          isDestinationValid={isDestinationValid}
          setIsDestinationValid={setIsDestinationValid}
          setIsSourceValid={setIsSourceValid}
          selectedTab={props.selectedTab}
          setIsLocatingSource={setIsLocatingSource}
        />
        {props?.isOnRide && props?.isOnRide[0] && (
          <div className="modal-background">
            <div className="modal-content">
              <IonText>You are currently on a Ride!</IonText>
              <IonButton onClick={handleViewRideClick}>View Ride</IonButton>
              <IonText style={{ color: "darkgray" }}>
                You cannot Join or Create a new Ride
              </IonText>
            </div>
          </div>
        )}
      </IonContent>

      <IonAlert
        isOpen={true}
        header={"Alert"}
        onDidDismiss={() => {
          setIsOpen(false);
        }}
        message={msg}
        buttons={["OK"]}
      />

      <IonAlert
        isOpen={isAlertOpen}
        header={"Alert"}
        onDidDismiss={() => {
          setIsAlertOpen(false);
        }}
        message={msg}
        buttons={["OK"]}
      />
    </>
  );
};

export default Join;
