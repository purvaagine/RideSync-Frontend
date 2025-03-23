import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFabButton,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonLoading,
  IonPage,
  IonSkeletonText,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import { useEffect, useRef, useState } from "react";
import {
  APIProvider,
  AdvancedMarker,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import searchRides from "../../functions/searchRides";
import "./RideDetails.css";
import {
  alarmOutline,
  callOutline,
  carSportOutline,
  cashOutline,
  checkmarkCircle,
  checkmarkCircleOutline,
  checkmarkOutline,
  filter,
  informationCircleOutline,
  list,
  location,
  locationOutline,
  personOutline,
  resizeOutline,
  text,
} from "ionicons/icons";
import { convertToPixelCrop } from "react-image-crop";
import getRideDetails from "../../functions/getRideDetails";
import { firestore } from "../../services/firebase";
import LatLng from "../../types/LatLng";
import acceptRequest from "../../functions/Requests/acceptRequest";
import rejectRequest from "../../functions/Requests/rejectRequest";
import { useLocation } from "react-router";
import axios from "axios";

function Directions(props: any) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);

  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  const bounds = new google.maps.LatLngBounds();

  // Initialize directions service and renderer
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  // Use directions service
  useEffect(() => {
    if (!directionsService || !directionsRenderer) return;
    directionsRenderer.setOptions({
      polylineOptions: {
        strokeColor: "#000",
        strokeWeight: 4,
        strokeOpacity: 0.9,
      },
      suppressMarkers: true,
    });
    directionsService
      .route({
        origin: props.sourceLatLng,
        destination: props.destinationLatLng,
        waypoints: props.waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
        optimizeWaypoints: true,
      })
      .then((response: any) => {
        console.log("renderer response", response);
        props.setDistance(response?.routes[0]?.legs[0]?.distance?.text);
        directionsRenderer.setDirections(response);
        setRoutes(response.routes);
      });

    return () => directionsRenderer.setMap(null);
  }, [directionsService, directionsRenderer]);

  // Update direction route
  useEffect(() => {
    if (!directionsRenderer) return;
    directionsRenderer.setRouteIndex(routeIndex);
  }, [routeIndex, directionsRenderer]);

  if (!leg) return <></>; // This prevents the error

  return <div />; // This ensures it's a valid JSX component
}

function RideDetails(props: any) {
  const mapId = import.meta.env.VITE_APP_GOOGLE_MAPS_MAP_ID;
  const apiKey = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rideDetails, setRideDetails] = useState<any>();
  const [isSearchRidesLoading, setIsSearchRidesLoading] =
    useState<boolean>(false);
  const [polylineCords, setPolylineCords] = useState<any>();
  const [sourceLatLng, setSourceLatLng] = useState<LatLng>(() => {
    let sl = localStorage.getItem("sourceLatLng");
    if (!sl) return undefined;
    return JSON.parse(sl);
  });
  const [destinationLatLng, setDestinationLatLng] = useState<LatLng>(() => {
    let dl = localStorage.getItem("destinationLatLng");
    if (!dl) return undefined;
    return JSON.parse(dl);
  });
  const [rides, setRides] = useState<any[]>();
  const [message, setMessage] = useState<string>();
  const [header, setHeader] = useState<string>();
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [distance, setDistance] = useState<string>();
  const [destinationInput, setDestinationInput] = useState<any>(
    localStorage.getItem("destinationInput")
  );
  const [isDriverCompleteLoading, setIsDriverCompleteLoading] =
    useState<boolean>(false);
  const [balance, setBalance] = useState<number>();
  const [waypoints, setWaypoints] = useState<any>([]);
  const [colors, setColors] = useState<any>([
    "darkorange",
    "red",
    "lightcoral",
    "orangered",
    "royalblue",
    "cornflowerblue",
    "purple",
    "orange",
    "darkorange",
    "red",
    "lightcoral",
    "orangered",
    "royalblue",
    "cornflowerblue",
    "purple",
    "orange",
    "darkorange",
    "red",
    "lightcoral",
    "orangered",
    "royalblue",
    "cornflowerblue",
    "purple",
    "orange",
    "darkorange",
    "red",
    "lightcoral",
    "orangered",
    "royalblue",
    "cornflowerblue",
    "purple",
    "orange",
  ]);
  const [center, setCenter] = useState<any>({
    lat: 19.0989,
    lng: 72.8515,
  });

  let user = JSON.parse(localStorage.getItem("user") as string);
  let userId = user?.Id;

  const [role, setRole] = useState<string>("driver");
  const [isLoadingOpen, setIsLoadingOpen] = useState<boolean>(false);
  const [coriders, setCoRiders] = useState<any[]>([]);
  const [corider, setCorider] = useState<any>();
  const [requests, setRequests] = useState<any[]>([]);
  const [coridersJoined, setCoRidersJoined] = useState<any>(0);

  const [joinMapRef, setJoinMapRef] = useState<google.maps.Map>();
  const modal: any = useRef();
  const driverCardRef = useRef<HTMLDivElement>(null);

  const [mapHeight, setMapHeight] = useState<number>(60);
  const mapLibraries: any = ["places"];
  var bounds = new google.maps.LatLngBounds();

  const searchRidesModal = useRef<HTMLIonModalElement>(null);

  const pageLocation: any = useLocation();

  const params = new URLSearchParams(pageLocation.search);
  const rideId: string = params.get("rideId") as string;
  console.log(rideId);

  useEffect(() => {
    let user = localStorage.getItem("user");
    if (user) {
      let data = JSON.parse(user);
      let balance = data.Balance;
      setBalance(balance);
    }
    let src = localStorage.getItem("sourceLatLng");
    let dest = localStorage.getItem("destinationLatLng");
    if (!src || !dest) {
      return;
    }
    let sl: LatLng = JSON.parse(src) as LatLng;
    let dl: LatLng = JSON.parse(dest) as LatLng;
    setSourceLatLng(sl);
    setDestinationLatLng(dl);
  }, [joinMapRef]);

  useEffect(() => {
    setTimeout(() => {
      setMapHeight(30);
    }, 500);
  }, []);

  let lastY: any;
  const handleTouchStart = () => {
    modal.current.addEventListener("touchstart", function (event: any) {
      lastY = event.touches[0].clientY;
    });
  };

  // const handleDownDragging = () => {
  //   handleTouchStart();
  //   modal.current.addEventListener("touchmove", function (event: any) {
  //     const deltaY = event.touches[0].clientY - lastY;
  //     if (deltaY > 0) {
  //       setMapHeight(90);
  //       removeListeners();
  //       handleUpDragging();
  //       console.log("down");
  //     }
  //     lastY = event.touches[0].clientY;
  //   });
  // };

  const handleUpDragging = () => {
    handleTouchStart();
    modal.current.addEventListener("touchmove", function (event: any) {
      const deltaY = event.touches[0].clientY - lastY;
      if (deltaY < 0) {
        setMapHeight(30);
        removeListeners();
        // handleDownDragging();
        console.log("down");
      }
      lastY = event.touches[0].clientY;
    });
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchRideDetails = async () => {
      // let data = localStorage.getItem("rideDetails");

      console.log("isloading", true);
      let data = await getRideDetails(rideId);
      // if (!data) return;
      // data = JSON.parse(data);
      setRideDetails(data);
      console.log(data);
      setIsLoading(false);
      setIsLoadingOpen(false);
      console.log("isloading", false);
      // localStorage.setItem("rideDetails", JSON.stringify(data));
    };
    const unsubscribe = firestore
      .collection("Rides")
      .doc(rideId)
      .onSnapshot((snapshot) => {
        if (snapshot.exists) {
          fetchRideDetails();
        } else {
          setRideDetails(null);
        }
      });

    // Unsubscribe from the snapshot listener when component unmounts
    return () => unsubscribe();
  }, []);

  const handleMapResizeClick = () => {
    if (mapHeight == 30) {
      setMapHeight(90);
      // handleDownDragging();
    } else {
      setMapHeight(30);
      handleUpDragging();
    }
  };

  function removeListeners() {
    modal.current.removeEventListener("touchstart", handleTouchStart);
    modal.current.removeEventListener("touchmove", handleUpDragging);
    // modal.current.removeEventListener("touchmove", handleDownDragging);
  }

  const handleDriverCardClick = () => {
    if (showDetails == true) {
      setShowDetails(false);
    } else {
      setShowDetails(true);
    }
  };
  function checkRadio(radioId: string): void {
    let a: HTMLInputElement | null = document.getElementById(
      radioId
    ) as HTMLInputElement;
    if (a.checked == true) {
      a.checked = false;
    } else {
      a.checked = true;
    }
  }

  const handleAccpetClick = (coriderId: string) => {
    setIsLoadingOpen(true);
    const accept = async () => {
      let msg = await acceptRequest(rideId, coriderId);
    };
    accept();
  };
  const handleRejectClick = (coriderId: string) => {
    setIsLoadingOpen(true);
    const reject = async () => {
      let msg = await rejectRequest(rideId, coriderId);
    };
    reject();
  };

  useEffect(() => {
    console.log("rideDetails", rideDetails);
    if (rideDetails?.Driver?.Id === userId) {
      setRole("driver");
    } else {
      setRole("corider");
    }
    let cds = rideDetails?.CoRiders.filter(
      (ride: any) => ride.Status === "Joined"
    );
    let cdsCompleted = rideDetails?.CoRiders.filter(
      (ride: any) => ride.Status === "Completed"
    );
    if (cds) {
      cds.sort((a: any, b: any) => {
        if (a?.CoRider?.Id === userId) return -1;
        if (b?.CoRider?.Id === userId) return 1;
        return 0;
      });
    }
    if (cdsCompleted && cds) {
      cds = [...cds, ...cdsCompleted];
    }
    if (role == "corider") {
      const cd = rideDetails?.CoRiders.filter(
        (ride: any) => ride?.CoRider?.Id === userId
      );
      if (cd?.length > 0) {
        setCorider(cd[0]);
        console.log("corider", cd[0]);
      }
    }
    setCoRiders(cds);
    setCoRidersJoined(rideDetails?.JoinedRiders);
    // setCoRiders([]);
    setIsLoadingOpen(false);
    console.log("mapsurl", constructGoogleMapsURL());
  }, [rideDetails]);

  useEffect(() => {
    let wp: any = [];
    if (role == "driver") {
      if (coriders && coriders.length > 0) {
        coriders.map((corider: any) => {
          wp = [
            ...wp,
            { location: { lat: corider?.Pickup[0], lng: corider?.Pickup[1] } },
          ];
          wp = [
            ...wp,
            { location: { lat: corider?.Drop[0], lng: corider?.Drop[1] } },
          ];
        });
        setWaypoints(wp);
        setWaypoints((prevWp: any) => {
          return prevWp;
        });
      }
      const requests = rideDetails?.CoRiders.filter(
        (ride: any) => ride.Status === "Requested"
      );
      setRequests(requests);
    }
  }, [coriders]);

  const onRiderCompleteClick = async (coriderId: string, index: number) => {
    setIsLoadingOpen(true);
    let input = document.getElementById(`input${index}`) as HTMLInputElement;
    let code = parseInt(input.value);
    try {
      let data = await axios.get(
        "https://ridesync-backend-9chk.onrender.com/complete_corider_ride",
        {
          params: {
            rideId: rideId,
            coriderId: coriderId,
            completionCode: code,
          },
        }
      );
      console.log(data.data);
    } catch (e: any) {
      if (e.response.status === 500) {
        setIsLoadingOpen(false);
        setHeader("Error");
        setMessage(JSON.stringify(e));
        setIsAlertOpen(true);
      }
    }
  };

  const constructGoogleMapsURL = () => {
    const baseURL = "https://www.google.com/maps/dir/";
    let url = `${baseURL}${rideDetails?.Source[0]},${rideDetails?.Source[1]}/${rideDetails?.Destination[0]},${rideDetails?.Destination[1]}`;
    if (waypoints && waypoints.length > 0) {
      const encodedWaypoints = waypoints
        .map(
          (waypoint: any) =>
            `${waypoint?.location?.lat},${waypoint?.location?.lng}`
        )
        .join("/");
      url += `/${encodedWaypoints}`;
    }
    return url;
  };

  const handleCompleteDriverRideClick = async () => {
    setIsDriverCompleteLoading(true);
    try {
      let data = await axios.get(
        "https://ridesync-backend-9chk.onrender.com/complete_driver_ride",
        {
          params: {
            rideId: rideId,
          },
        }
      );
      console.log(data.data);
      setIsDriverCompleteLoading(false);
    } catch (e: any) {
      setIsDriverCompleteLoading(false);
      if (e.response.status === 500) {
        setIsLoadingOpen(false);
        setHeader("Error");
        setMessage(JSON.stringify(e));
        setIsAlertOpen(true);
      }
    }
  };

  return (
    <>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton></IonBackButton>
            </IonButtons>
            <IonTitle style={{ textAlign: "center" }}>Ride Details</IonTitle>
            <IonButtons slot="end">
              <div
                style={{
                  width: "30px",
                }}
              ></div>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="rideDetailsContent">
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={center}
              defaultZoom={10}
              mapId={mapId}
              keyboardShortcuts={false}
              clickableIcons={false}
              disableDefaultUI={true}
              style={{
                height: mapHeight + "%",
                width: "100%",
                transition: "height 0.5s ease-in-out",
                position: "relative",
              }}
              styles={[{ stylers: [] }]}
            >
              {rideDetails?.Source && role == "driver" && (
                <Directions
                  sourceLatLng={{
                    lat: rideDetails?.Source[0],
                    lng: rideDetails?.Source[1],
                  }}
                  destinationLatLng={{
                    lat: rideDetails?.Destination[0],
                    lng: rideDetails?.Destination[1],
                  }}
                  waypoints={waypoints}
                  setDistance={setDistance}
                />
              )}
              {rideDetails?.Source && role == "corider" && (
                <Directions
                  sourceLatLng={{
                    lat: corider?.Pickup[0],
                    lng: corider?.Pickup[1],
                  }}
                  destinationLatLng={{
                    lat: corider?.Drop[0],
                    lng: corider?.Drop[1],
                  }}
                  setDistance={setDistance}
                />
              )}
              {rideDetails && (
                <>
                  <AdvancedMarker
                    className="advancedMarker"
                    position={
                      role == "driver"
                        ? {
                            lat: rideDetails?.Source[0],
                            lng: rideDetails?.Source[1],
                          }
                        : { lat: corider?.Pickup[0], lng: corider?.Pickup[1] }
                    }
                  >
                    <div
                      className="outerCircle"
                      style={{ backgroundColor: "black" }}
                    >
                      <div className="innerCircle"></div>
                    </div>
                  </AdvancedMarker>

                  <AdvancedMarker
                    className="advancedMarker"
                    position={
                      role == "driver"
                        ? {
                            lat: rideDetails?.Destination[0],
                            lng: rideDetails?.Destination[1],
                          }
                        : { lat: corider?.Drop[0], lng: corider?.Drop[1] }
                    }
                  >
                    <div
                      className="outerCircle"
                      style={{ backgroundColor: "darkgreen" }}
                    >
                      <div className="innerCircle"></div>
                    </div>
                  </AdvancedMarker>
                </>
              )}

              {coriders &&
                role == "driver" &&
                coriders.length > 0 &&
                coriders.map((corider: any, index) => (
                  <>
                    <AdvancedMarker
                      className="advancedMarker"
                      position={{
                        lat: corider?.Pickup[0],
                        lng: corider?.Pickup[1],
                      }}
                    >
                      <div
                        className="infoWindow sourceInfoWindow coriderPickupWindow"
                        style={{ backgroundColor: `${colors[index]}` }}
                      >
                        {corider?.CoRider?.Name}
                      </div>
                      <div
                        className="outerCircle"
                        style={
                          role === "driver"
                            ? {
                                backgroundColor: "transparent",
                              }
                            : {
                                backgroundColor: `black`,
                              }
                        }
                      >
                        <div
                          className="innerCircle"
                          style={
                            role === "driver"
                              ? { backgroundColor: `${colors[index]}` }
                              : {}
                          }
                        ></div>
                      </div>
                    </AdvancedMarker>

                    <AdvancedMarker
                      className="advancedMarker"
                      position={{
                        lat: corider?.Drop[0],
                        lng: corider?.Drop[1],
                      }}
                    >
                      <div className="infowindow">
                        <div
                          className="profileHolder"
                          style={{ border: `2px solid ${colors[index]}` }}
                        >
                          <IonImg src={corider?.CoRider?.ProfileUrl}></IonImg>
                        </div>
                      </div>
                      <div
                        className="outerCircle"
                        style={{ backgroundColor: colors[index] }}
                      >
                        <div className="innerCircle"></div>
                      </div>
                    </AdvancedMarker>
                  </>
                ))}
              <IonFabButton
                color={"light"}
                style={{
                  position: "absolute",
                  bottom: "20px",
                  right: "20px",
                  width: "40px",
                  height: "40px",
                }}
                onClick={handleMapResizeClick}
              >
                <IonIcon icon={resizeOutline}></IonIcon>
              </IonFabButton>
            </Map>
          </APIProvider>

          {isLoading ? (
            <>
              <div className="detailsModal">
                <div className="groupTitle">
                  <IonSkeletonText animated={true}></IonSkeletonText>
                </div>
                <IonSkeletonText animated={true}></IonSkeletonText>
                <IonSkeletonText animated={true}></IonSkeletonText>
                <IonSkeletonText animated={true}></IonSkeletonText>
              </div>
            </>
          ) : (
            <>
              <div className="detailsModal" ref={modal}>
                <div className="groupTitle">
                  <IonText>Driver</IonText>
                </div>
                <div
                  className="driverCard"
                  ref={driverCardRef}
                  onClick={handleDriverCardClick}
                >
                  <div
                    className="driverCardHeader"
                    onClick={() => checkRadio("-1")}
                  >
                    <div className="userDetails">
                      <div className="userProfileHolder">
                        <IonImg
                          className="userProfile"
                          src={rideDetails?.Driver?.ProfileUrl}
                        ></IonImg>
                      </div>
                      <div className="userName">
                        <IonText>
                          {rideDetails?.Driver?.Name}{" "}
                          {role == "driver" && <span>(You)</span>}
                        </IonText>
                        <br />
                        <IonText>Tap to show details</IonText>
                      </div>
                      {role === "corider" && (
                        <IonButtons>
                          <IonButton
                            href={`tel:${rideDetails?.Driver?.PhoneNumber}`}
                          >
                            <IonIcon icon={callOutline}></IonIcon>
                          </IonButton>
                        </IonButtons>
                      )}
                    </div>
                  </div>

                  <input
                    type="radio"
                    unselectable={"on"}
                    id="-1"
                    name="card"
                  ></input>
                  <div className={`content`}>
                    <div className="dashedLine"></div>
                    <div className="vehicleDetails">
                      <div className="vehicleIcon">
                        <IonIcon
                          icon={carSportOutline}
                          style={{ color: "darkgray" }}
                        ></IonIcon>
                      </div>
                      <div className="vehicleName">
                        <IonText>{rideDetails?.Vehicle?.VehicleName}</IonText>
                        <br />
                        <IonText>
                          Fuel Type: {rideDetails?.Vehicle?.FuelType}
                        </IonText>
                      </div>
                    </div>
                    {role == "driver" && (
                      <>
                        <div className="dashedLine"></div>
                        <div className="locationsHolder">
                          <div className="source">
                            <div>
                              <IonIcon icon={location}></IonIcon>
                              <IonText>From</IonText>
                            </div>
                            <br />
                            <IonText>{rideDetails?.Source[2]}</IonText>
                          </div>
                          <div className="destination">
                            <div>
                              <IonIcon
                                icon={location}
                                style={{ color: "green" }}
                              ></IonIcon>
                              <IonText>To</IonText>
                            </div>
                            <br />
                            <IonText>{rideDetails?.Destination[2]}</IonText>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {rideDetails?.Status === "Started" ||
                rideDetails?.Status === "Completed" ? (
                  (rideDetails?.Status === "Started" &&
                    (coriders?.length > 0 || requests?.length > 0)) ||
                  rideDetails?.Status === "Completed" ? (
                    <>
                      <div className="groupTitle">
                        <IonText>
                          Co Riders ({coriders && coriders?.length})
                        </IonText>
                      </div>
                      {coriders &&
                        coriders.length > 0 &&
                        coriders.map((corider: any, index) => (
                          <>
                            <>
                              <div
                                className="driverCard"
                                ref={driverCardRef}
                                onClick={handleDriverCardClick}
                              >
                                <div
                                  className="driverCardHeader"
                                  key={index.toString()}
                                  onClick={() => checkRadio(index.toString())}
                                >
                                  <div className="userDetails">
                                    <div
                                      className="userProfileHolder"
                                      style={{
                                        border: `2px solid ${colors[index]}`,
                                      }}
                                    >
                                      <IonImg
                                        className="userProfile"
                                        src={corider?.CoRider?.ProfileUrl}
                                      ></IonImg>
                                    </div>
                                    <div className="userName">
                                      <IonText>
                                        {corider?.CoRider?.Name}{" "}
                                        {role == "corider" &&
                                          corider?.CoRider?.Id == userId && (
                                            <span>(You)</span>
                                          )}
                                      </IonText>
                                      <br />
                                      {role == "driver" && (
                                        <IonText>Tap to show details</IonText>
                                      )}
                                      {role == "corider" &&
                                        corider?.CoRider?.Id == userId && (
                                          <IonText>Tap to show details</IonText>
                                        )}
                                      {role == "corider" &&
                                        corider?.CoRider?.Id != userId && (
                                          <IonText>Riding with you.</IonText>
                                        )}
                                    </div>
                                    {role === "driver" && (
                                      <IonButtons>
                                        <IonButton
                                          href={`tel:${corider?.CoRider?.PhoneNumber}`}
                                        >
                                          <IonIcon icon={callOutline}></IonIcon>
                                        </IonButton>
                                      </IonButtons>
                                    )}
                                  </div>
                                </div>
                                {role == "driver" && (
                                  <div className="dashedLine"></div>
                                )}
                                {role == "corider" &&
                                  corider?.CoRider?.Id == userId && (
                                    <>
                                      <div className="dashedLine"></div>
                                    </>
                                  )}
                                <div className="amountHolder">
                                  {role == "driver" && (
                                    <>
                                      <IonText>
                                        {rideDetails?.Status === "Completed"
                                          ? "You Got"
                                          : "You Get"}
                                      </IonText>
                                      <div>
                                        <IonIcon
                                          icon={cashOutline}
                                          style={{
                                            marginRight: "5px",
                                            color: "darkgray",
                                          }}
                                        ></IonIcon>
                                        <IonText>Rs. {corider?.Amount}</IonText>
                                        {rideDetails?.Status ===
                                          "Completed" && (
                                          <IonIcon
                                            icon={checkmarkOutline}
                                            style={{
                                              color: "green",
                                              marginLeft: "5px",
                                            }}
                                          ></IonIcon>
                                        )}
                                      </div>
                                    </>
                                  )}{" "}
                                  {role == "corider" &&
                                    corider?.CoRider?.Id == userId && (
                                      <>
                                        <IonText>
                                          {corider?.Status === "Completed"
                                            ? "You Paid"
                                            : "You Pay"}
                                        </IonText>
                                        <IonText>Rs. {corider?.Amount}</IonText>
                                      </>
                                    )}
                                </div>
                                <input
                                  type="radio"
                                  unselectable="on"
                                  id={index.toString()}
                                  name="card"
                                ></input>
                                <div className={`content`}>
                                  {role != "driver" ? (
                                    corider?.CoRider?.Id == userId ? (
                                      <>
                                        <div className="dashedLine"></div>
                                        <div className="locationsHolder">
                                          <div className="source">
                                            <div>
                                              <IonIcon
                                                icon={location}
                                              ></IonIcon>
                                              <IonText>From</IonText>
                                            </div>
                                            <br />
                                            <IonText>
                                              {corider?.Pickup[2]}
                                            </IonText>
                                          </div>
                                          <div className="destination">
                                            <div>
                                              <IonIcon
                                                icon={location}
                                                style={{
                                                  color: `${colors[index]}`,
                                                }}
                                              ></IonIcon>
                                              <IonText>To</IonText>
                                            </div>
                                            <br />
                                            <IonText>
                                              {corider?.Drop[2]}
                                            </IonText>
                                          </div>
                                        </div>
                                      </>
                                    ) : (
                                      <></>
                                    )
                                  ) : (
                                    <>
                                      <div className="dashedLine"></div>
                                      <div className="locationsHolder">
                                        <div className="source">
                                          <div>
                                            <IonIcon icon={location}></IonIcon>
                                            <IonText>From</IonText>
                                          </div>
                                          <br />
                                          <IonText>
                                            {corider?.Pickup[2]}
                                          </IonText>
                                        </div>
                                        <div className="destination">
                                          <div>
                                            <IonIcon
                                              icon={location}
                                              style={{
                                                color: `${colors[index]}`,
                                              }}
                                            ></IonIcon>
                                            <IonText>To</IonText>
                                          </div>
                                          <br />
                                          <IonText>{corider?.Drop[2]}</IonText>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                                {role == "driver" && (
                                  <div className="dashedLine"></div>
                                )}
                                {role == "corider" &&
                                  corider?.CoRider?.Id == userId && (
                                    <>
                                      <div className="dashedLine"></div>
                                    </>
                                  )}
                                {((role == "corider" &&
                                  corider?.CoRider?.Id == userId) ||
                                  role == "driver") && (
                                  <div className="completeRideHolder">
                                    {corider?.Status === "Completed" ? (
                                      <>
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                          }}
                                        >
                                          <IonIcon
                                            icon={checkmarkCircle}
                                            style={{
                                              color: "green",
                                              marginRight: "7px",
                                            }}
                                          ></IonIcon>
                                          <IonText>
                                            This ride is completed.
                                          </IonText>
                                        </div>
                                        <div className="dashedLine"></div>
                                        <IonText>
                                          <IonIcon
                                            icon={alarmOutline}
                                            style={{
                                              marginRight: "5px",
                                              color: "darkgray",
                                            }}
                                          ></IonIcon>
                                          Drop Time: {corider?.DropTime}
                                        </IonText>
                                      </>
                                    ) : (
                                      <>
                                        {role == "driver" && (
                                          <>
                                            <IonText>
                                              Ask co-rider for ride completion
                                              code to complete this ride.
                                            </IonText>
                                            <div className="actionButtons">
                                              <input
                                                id={"input" + index}
                                                type="tel"
                                                placeholder="Code"
                                                maxLength={5}
                                              />
                                              <IonButton
                                                onClick={() =>
                                                  onRiderCompleteClick(
                                                    corider?.Id,
                                                    index
                                                  )
                                                }
                                              >
                                                Complete
                                              </IonButton>
                                            </div>
                                          </>
                                        )}
                                        {role == "corider" &&
                                          corider?.CoRider?.Id == userId && (
                                            <>
                                              <IonText>
                                                Your ride completion code is.
                                              </IonText>
                                              <IonText
                                                style={{
                                                  fontSize: "25px",
                                                  margin: "10px 0",
                                                }}
                                              >
                                                {corider?.CompletionCode}
                                              </IonText>
                                              <IonText
                                                style={{ color: "darkgray" }}
                                              >
                                                Share with the driver when you
                                                have reached your drop location.
                                              </IonText>
                                            </>
                                          )}
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </>
                          </>
                        ))}

                      {/* Requests Cards */}
                      {role == "driver" && requests?.length > 0 && (
                        <>
                          <div className="groupTitle">
                            <IonText>
                              Requests ({requests && requests?.length})
                            </IonText>
                          </div>
                          {requests &&
                            requests.length > 0 &&
                            requests?.map((request: any, index) => (
                              <>
                                <div
                                  className="driverCard"
                                  ref={driverCardRef}
                                  onClick={handleDriverCardClick}
                                >
                                  <div
                                    className="driverCardHeader"
                                    key={(coriders?.length + index).toString()}
                                    onClick={() =>
                                      checkRadio(
                                        (coriders?.length + index).toString()
                                      )
                                    }
                                  >
                                    <div className="userDetails">
                                      <div className="userProfileHolder">
                                        <IonImg
                                          className="userProfile"
                                          src={request?.CoRider?.ProfileUrl}
                                        ></IonImg>
                                      </div>
                                      <div className="userName">
                                        <IonText>
                                          {request?.CoRider?.Name}
                                        </IonText>
                                        <br />
                                        <IonText>Tap to show details</IonText>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="dashedLine"></div>
                                  <div className="amountHolder">
                                    <IonText>You get</IonText>
                                    <IonText>Rs. {request?.Amount}</IonText>
                                  </div>

                                  <input
                                    type="radio"
                                    unselectable="on"
                                    id={(coriders?.length + index).toString()}
                                    name="card"
                                  ></input>
                                  <div className={`content`}>
                                    <div className="dashedLine"></div>
                                    <div className="locationsHolder">
                                      <div className="source">
                                        <div>
                                          <IonIcon icon={location}></IonIcon>
                                          <IonText>From</IonText>
                                        </div>
                                        <br />
                                        <IonText>{request?.Pickup[2]}</IonText>
                                      </div>
                                      <div className="destination">
                                        <div>
                                          <IonIcon
                                            icon={location}
                                            style={{ color: "green" }}
                                          ></IonIcon>
                                          <IonText>To</IonText>
                                        </div>
                                        <br />
                                        <IonText>{request?.Drop[2]}</IonText>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="dashedLine"></div>
                                  <div className="requestAcceptHolder">
                                    <IonText>
                                      {request?.CoRider?.Name} has requested to
                                      join this ride.
                                    </IonText>
                                    <div className="actionButtons">
                                      <IonButton
                                        onClick={() =>
                                          handleRejectClick(request?.Id)
                                        }
                                      >
                                        Reject
                                      </IonButton>
                                      <IonButton
                                        onClick={() =>
                                          handleAccpetClick(request?.Id)
                                        }
                                      >
                                        Accept
                                      </IonButton>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ))}
                        </>
                      )}
                    </>
                  ) : (
                    <div className="infoHolder">
                      <IonText
                        style={{
                          display: "flex",
                          width: "90%",
                          margin: "auto",
                          textAlign: "center",
                          color: "darkgray",
                        }}
                      >
                        {rideDetails?.Status === "Started" &&
                          "You'll receive requests from co-riders. You can start heading towards your destination."}
                      </IonText>
                    </div>
                  )
                ) : (
                  <div className="infoHolder">
                    <IonText
                      style={{
                        display: "flex",
                        width: "70%",
                        margin: "auto",
                        textAlign: "center",
                        color: "darkgray",
                      }}
                    >
                      You'll receive requests once you start the ride.
                    </IonText>
                  </div>
                )}
              </div>
            </>
          )}
        </IonContent>
        {((role == "driver" && rideDetails?.Status === "Completed") ||
          (role == "corider" && corider?.Status === "Completed")) && (
          <IonFooter
            style={{
              backgroundColor: "green",
              padding: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <IonIcon icon={checkmarkCircleOutline}></IonIcon>
            <IonText style={{ marginLeft: "10px" }}>Completed</IonText>
          </IonFooter>
        )}
        {role === "driver" && rideDetails?.Status === "Started" && (
          <IonFooter
            style={{
              backgroundColor: "#f0f0f0",
              padding: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {" "}
            {coridersJoined === 0 ? (
              <IonButton
                disabled={isDriverCompleteLoading}
                style={{ ...buttonStyle }}
                onClick={handleCompleteDriverRideClick}
              >
                {isDriverCompleteLoading && (
                  <IonSpinner style={{ marginRight: "10px" }}></IonSpinner>
                )}
                Complete Ride
              </IonButton>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <IonText
                  style={{
                    color: "darkgray",
                    fontSize: "15px",
                  }}
                >
                  <IonIcon
                    icon={informationCircleOutline}
                    style={{ marginRight: "5px" }}
                  ></IonIcon>
                  You need to drop all co-riders to complete this ride.
                </IonText>
              </div>
            )}
          </IonFooter>
        )}
      </IonPage>
      <IonAlert
        message={message}
        header={header}
        isOpen={isAlertOpen}
        buttons={[{ text: "Ok", handler: () => setIsAlertOpen(false) }]}
      ></IonAlert>
      <IonLoading isOpen={isLoadingOpen}></IonLoading>
    </>
  );
}

const buttonStyle = {
  height: "45px",
  width: "90%",
  "--border-radius": "20px",
};
export default RideDetails;
