import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonLoading,
  IonModal,
  IonPage,
  IonRouterContext,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import { useContext, useEffect, useRef, useState } from "react";
import { Loader, LoaderOptions } from "google-maps";
import "./FindRide.css";
import {
  APIProvider,
  AdvancedMarker,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import {
  addCircleOutline,
  carSportOutline,
  codeSlashOutline,
  person,
  personCircleOutline,
  personOutline,
} from "ionicons/icons";
import searchRides from "../functions/searchRides";
import { firestore } from "../services/firebase";
import { Firestore, doc, getDoc } from "@firebase/firestore";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import JoinRideDetails from "../types/JoinRideDetails";
import joinRide from "../functions/joinRide";
import { request } from "http";
import axios from "axios";

const mapOptions = {
  disableDefaultUI: true,
  keyboardShortcuts: false,
  clickableIcons: false,
  gestureHandling: "greedy",
};

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
        travelMode: google.maps.TravelMode.DRIVING,
        // provideRouteAlternatives: true,
      })
      .then((response: any) => {
        console.log("renderer response", response);
        let dist = response?.routes[0]?.legs[0]?.distance?.text;
        props.setDistance(parseFloat(dist));
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

function FindRide(props: any) {
  const mapId = import.meta.env.VITE_APP_GOOGLE_MAPS_MAP_ID;
  const apiKey = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearchRidesLoading, setIsSearchRidesLoading] =
    useState<boolean>(false);
  const [polylineCords, setPolylineCords] = useState<any>();
  const [sourceLatLng, setSourceLatLng] = useState<any>();
  const [destinationLatLng, setDestinationLatLng] = useState<any>(
    localStorage.getItem("destinationLatLng")
  );
  const [rides, setRides] = useState<any[]>();
  const [isOnRide, setIsOnRide] = useState<boolean>(false);
  const [distance, setDistance] = useState<number>(2);
  const [selectedTab, setSelectedTab] = useState<string>("tab1");
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [requestedRides, setRequestedRides] = useState<string[]>([]);
  // let requestedRides = JSON.parse(
  //   localStorage.getItem("requestedRides") as string
  // );
  // if (requestedRides?.length > 0) {
  //   return requestedRides;
  // } else {
  //   return [];
  // }
  // });

  let user = JSON.parse(localStorage.getItem("user") as string);
  let userId = user?.Id;
  const [destinationInput, setDestinationInput] = useState<any>(
    localStorage.getItem("destinationInput")
  );
  const [sourceInput, setSourceInput] = useState<any>(
    localStorage.getItem("sourceInput")
  );
  const [balance, setBalance] = useState<number>(0);
  const [isMessageVisible, setIsMessageVisible] = useState<boolean>(false);
  const [center, setCenter] = useState<any>({
    lat: 19.0989,
    lng: 72.8515,
  });

  const [joinMapRef, setJoinMapRef] = useState<google.maps.Map>();

  const [mapHeight, setMapHeight] = useState<number>(60);
  const mapLibraries: any = ["places"];
  var bounds = new google.maps.LatLngBounds();

  const searchRidesModal = useRef<HTMLIonModalElement>(null);

  const ionRouterContext = useContext(IonRouterContext);

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
    src = JSON.parse(src);
    dest = JSON.parse(dest);
    setSourceLatLng(src);
    setDestinationLatLng(dest);
  }, [joinMapRef]);

  useEffect(() => {
    // setTimeout(() => {
    //   setMapHeight(60);
    // }, 500);
  }, []);

  const handleSearchClick = () => {
    setIsSearchRidesLoading(true);
    let rideIds: string[] = [];
    const fetchRides = async () => {
      let data = await searchRides(sourceLatLng, destinationLatLng);
      let visible: boolean = false;
      let requestedRides: string[] = [];
      if (data) {
        data?.map((ride: any) => {
          let cds = ride?.CoRiders;
          let isRequested: boolean = false;
          if (cds) {
            cds.map((corider: any) => {
              if (
                corider?.CoRider?.Id === userId &&
                corider?.Status === "Requested"
              ) {
                visible = true;
                isRequested = true;
              }
            });
            if (isRequested) {
              requestedRides.push(ride?.Id);
            }
            setIsMessageVisible(visible);
            setRequestedRides(requestedRides);
            localStorage.setItem(
              "requestedRides",
              JSON.stringify(requestedRides)
            );
          }
        });
      }
      console.log("requestedRides", requestedRides);
      console.log(data);
      setRides(data);
      setIsSearchRidesLoading(false);
      setMapHeight(30);
      setSelectedTab("tab2");
      searchRidesModal.current?.present();
    };
    fetchRides();
  };

  const handleRequestClick = (rideId: string) => {
    let details: JoinRideDetails = {
      rideId: rideId,
      userId: userId,
      pickup: sourceLatLng,
      drop: destinationLatLng,
      pickupInput: sourceInput,
      dropInput: destinationInput,
      amount: paymentAmount,
    };
    console.log(details);
    const letsJoinRide = async () => {
      if (requestedRides.includes(rideId)) {
        return;
      }
      let msg: any;
      try {
        msg = await joinRide(details);
        setIsMessageVisible(true);
      } catch (e) {
        return;
      }
      let newReqRides = [...requestedRides, rideId];
      localStorage.setItem("requestedRides", JSON.stringify(newReqRides));
      setRequestedRides(newReqRides);
      console.log(newReqRides);
      console.log(msg);
    };
    letsJoinRide();
  };

  const getPaymentAmount = (distance: number) => {
    let ratePerKm = 5;
    if (distance < 2) {
      return 25;
    }
    let chargeableDistance = distance - 2;
    return 25 + chargeableDistance * ratePerKm;
  };

  useEffect(() => {
    let paymentAmount = getPaymentAmount(distance);
    setPaymentAmount(paymentAmount);
  }, [distance]);

  useEffect(() => {
    let user = JSON.parse(localStorage.getItem("user") as string);
    let userId = user?.Id;
    const checkIsOnRide = async () => {
      let result = await axios.get(
        "https://ridesync-backend-9chk.onrender.com/get_is_on_ride",
        {
          params: {
            userId: userId,
          },
        }
      );
      if (result?.data[0] === true) {
        ionRouterContext.push(
          `/ridedetails?rideId=${result?.data[1]}`,
          "forward",
          "replace"
        );
      }
    };
    const unsubscribe = firestore
      .collection("Users")
      .doc(userId)
      .onSnapshot((snapshot: any) => {
        if (snapshot.exists) {
          checkIsOnRide();
        }
      });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton></IonBackButton>
            </IonButtons>
            <IonTitle style={{ textAlign: "center" }}>Find Ride</IonTitle>
            <IonButtons slot="end">
              <div
                style={{
                  width: "30px",
                }}
              ></div>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="findRideContent">
          <div
            className="mapContainerDiv"
            style={{
              height: mapHeight + "%",
              width: "100%",
              transition: "height 0.5s ease",
            }}
          >
            <APIProvider apiKey={apiKey}>
              <Map
                defaultCenter={center}
                defaultZoom={10}
                mapId={mapId}
                keyboardShortcuts={false}
                clickableIcons={false}
                disableDefaultUI={true}
                style={{
                  height: "100%",
                  width: "100%",
                  transition: "height 0.5s ease",
                }}
                styles={[{ stylers: [] }]}
              >
                <Directions
                  sourceLatLng={sourceLatLng}
                  destinationLatLng={destinationLatLng}
                  setDistance={setDistance}
                />
                <AdvancedMarker
                  className="advancedMarker"
                  position={sourceLatLng}
                >
                  <div className="infoWindow sourceInfoWindow">{"Start"}</div>
                  <div
                    className="outerCircle"
                    style={{ backgroundColor: "black" }}
                  >
                    <div className="innerCircle"></div>
                  </div>
                </AdvancedMarker>

                <AdvancedMarker
                  className="advancedMarker"
                  position={destinationLatLng}
                >
                  <div className="infoWindow destinationInfoWindow">
                    {`${destinationInput}`}
                  </div>
                  <div
                    className="outerCircle"
                    style={{ backgroundColor: "darkgreen" }}
                  >
                    <div className="innerCircle"></div>
                  </div>
                </AdvancedMarker>
              </Map>
            </APIProvider>
          </div>
          {selectedTab == "tab1" ? (
            <div className="findSearchModal">
              <div className="charges">
                <IonText className="label">You Pay</IonText>
                <IonText className="amount">₹ {paymentAmount}</IonText>
              </div>
              <div className="details">
                <p>Total Distance: {distance} Km</p>
              </div>
              <div className="balance">
                {paymentAmount < balance ? (
                  <>
                    <IonText>Wallet Balance</IonText>
                    <IonText>
                      <span className="amount" style={{ paddingRight: "15px" }}>
                        ₹ {balance}
                      </span>
                    </IonText>
                  </>
                ) : (
                  <>
                    <IonText>Wallet Balance: {balance}</IonText>
                    <IonButton
                      style={{
                        "--border-radius": "15px",
                        "--background": "white",
                        "--box-shadow": "nonw",
                        "--color": "black",
                      }}
                    >
                      <IonIcon
                        icon={addCircleOutline}
                        style={{ marginRight: "5px" }}
                      ></IonIcon>
                      Add
                    </IonButton>
                  </>
                )}
              </div>
              <div className="findBtnHolder">
                <IonButton
                  disabled={paymentAmount < balance ? false : true}
                  onClick={handleSearchClick}
                >
                  {paymentAmount < balance
                    ? "Search Rides"
                    : "Insufficient Balance"}
                </IonButton>
              </div>
            </div>
          ) : (
            <Rides
              rides={rides}
              requestedRides={requestedRides}
              handleRequestClick={handleRequestClick}
              paymentAmount={paymentAmount}
              balance={balance}
              userId={userId}
              isMessageVisible={isMessageVisible}
            />
          )}
        </IonContent>
      </IonPage>
      <IonLoading isOpen={isLoading}></IonLoading>

      <IonLoading isOpen={isSearchRidesLoading}></IonLoading>
    </>
  );
}

export default FindRide;

const Rides = (props: any) => {
  // const [isMessageVisible, setIsMessageVisibe] = useState<boolean>(false);

  // useEffect(() => {
  //   let requestedRides = props.requestedRides;
  //   let rides = props.rides;
  //   if (requestedRides?.length == 0) {
  //     setIsMessageVisibe(false);
  //   } else {
  //     rides?.forEach((ride: any) => {
  //       if (requestedRides.includes(ride?.Id)) {
  //         setIsMessageVisibe(true);
  //       } else {
  //         setIsMessageVisibe(false);
  //       }
  //     });
  //   }
  // }, [props.requestedRides]);

  // const isButtonDisabled = (ride: any) => {
  //   ride?.CoRiders?.map((corider: any) => {
  //     if (
  //       corider?.CoRider?.Id === props.userId &&
  //       corider?.Status === "Requested"
  //     ) {
  //       if (isMessageVisible === false) {
  //         setIsMessageVisibe(true);
  //       }
  //       return true;
  //     }
  //   });
  //   return false;
  // };

  const buttonText = (ride: any) => {
    ride?.CoRiders?.map((corider: any) => {
      if (
        corider?.CoRider?.Id === props.userId &&
        corider?.Status === "Requested"
      ) {
        return "Requested";
      }
    });
    return "Request";
  };

  return (
    <div className="ridesHolder searchRidesModalContent">
      <IonText className="searchRidesModalTitle">Rides</IonText>
      {props.isMessageVisible && (
        <div className="requestedMessage">
          <IonText>
            You have requested to join ride(s). You can wait or we will notify
            you when someone accepts your request.
          </IonText>
        </div>
      )}
      <div className="amountMessage">
        <IonText>
          Once you finish your ride, ₹ {props.paymentAmount} will get deducted
          from your wallet. Remaining balance will be ₹{" "}
          {props.balance - props.paymentAmount}
        </IonText>
      </div>
      {props.rides &&
        props.rides.length > 0 &&
        props.rides?.map((ride: any) => (
          <>
            <div className="rideCard" key={ride?.Id}>
              <div className="vehicleDetails">
                <div className="vehicleIcon">
                  <IonIcon
                    icon={carSportOutline}
                    style={{ color: "darkgray" }}
                  ></IonIcon>
                </div>
                <div className="vehicleName">
                  <IonText>{ride?.Vehicle?.VehicleName}</IonText>
                  <br />
                  <IonText>Fuel Type: {ride?.Vehicle?.FuelType}</IonText>
                </div>
                <div className="vehicleCapacity">
                  <IonIcon
                    icon={personOutline}
                    style={{ fill: "gray" }}
                  ></IonIcon>
                  <IonText>
                    {ride?.JoinedRiders} / {ride?.SeatingCapacity}
                  </IonText>
                </div>
              </div>
              <div className="dashedLine"></div>
              <div className="rideCardFooter">
                <div className="userDetails">
                  <div className="userProfileHolder">
                    <IonImg
                      className="userProfile"
                      src={ride?.Driver?.ProfileUrl}
                    ></IonImg>
                  </div>
                  <div className="userName">
                    <IonText>{ride?.Driver?.Name}</IonText>
                    <br />
                    <IonText>{ride?.Driver?.Gender}</IonText>
                  </div>
                </div>
                <div className="rideCardFooterButtonHolder">
                  <IonButton
                    disabled={
                      props?.requestedRides?.includes(ride?.Id) ? true : false
                    }
                    onClick={() => props.handleRequestClick(ride?.Id)}
                  >
                    {props?.requestedRides?.includes(ride?.Id)
                      ? "Requested"
                      : "Request"}
                  </IonButton>
                </div>
              </div>
            </div>
          </>
        ))}
    </div>
  );
};

// const fetchDocuments = async () => {
//         try {
//           const q = query(
//             collection(firestore, "Rides"),
//             where("__name__", "in", rideIds)
//           );
//           let a = collection(firestore, "Rides");

//           const unsubscribe = onSnapshot(q, (querySnapshot) => {
//             console.log(querySnapshot.docs);
//             const data = querySnapshot.docs.map((doc) => ({
//               id: doc.id,
//               ...doc.data(),
//             }));

//             console.log(data);
//           });

//           // Return unsubscribe function to detach the listener when component unmounts
//           return unsubscribe;
//         } catch (error) {
//           console.error("Error fetching documents:", error);
//         }
//       };
