import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonImg,
  IonLabel,
  IonLoading,
  IonMenuButton,
  IonPage,
  IonRouterContext,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import ExploreContainer from "../../components/ExploreContainer";
import "./History.css";
import navigateGreen from "/assets/images/navigateGreen.svg";
import navigateGray from "/assets/images/navigateGray.svg";
import { navigateOutline } from "ionicons/icons";
import {
  Autocomplete,
  StandaloneSearchBox,
  LoadScript,
} from "@react-google-maps/api";
import { useContext, useEffect, useState } from "react";
import getHistory from "../../functions/getHistory";
import { Link } from "react-router-dom";

const History: React.FC = () => {
  const loopArray = [1, 2, 3, 4];
  const ionRouterContext = useContext(IonRouterContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [history, setHistory] = useState<any[]>();
  const [coRiderHistory, setCoRiderHistory] = useState<any[]>();
  const [driverHistory, setDriverHistory] = useState<any[]>();
  const [selectedSegment, setSelectedSegment] = useState<string>("driver");

  useEffect(() => {
    let user = JSON.parse(localStorage.getItem("user") as string);
    let userId = user?.Id;
    setIsLoading(true);
    const fetchHistory = async () => {
      let history = await getHistory(userId);
      localStorage.setItem("history", JSON.stringify(history));
      setHistory(history);
      setIsLoading(false);
      let coriderHistory: any[] = [];
      let driverHistory: any[] = [];
      history.map((ride: any) => {
        if (ride?.Driver?.Id === userId) {
          driverHistory.push(ride);
        } else {
          ride?.CoRiders?.map((corider: any) => {
            if (corider?.CoRider?.Id === userId) {
              let data = {
                ...corider,
                Id: ride?.Id,
              };
              coriderHistory.push(data);
            }
          });
        }
      });
      setDriverHistory(driverHistory.reverse());
      setCoRiderHistory(coriderHistory.reverse());
      console.log(driverHistory, coriderHistory);
    };
    fetchHistory();
  }, []);

  const handleRideInfoClick = (rideId: string) => {
    ionRouterContext.push(`/ridedetails?rideId=${rideId}`, "forward");
  };

  const handleOnSegmentChange = (e: any) => {
    console.log(e.detail.value);
    setSelectedSegment(e.detail.value);
  };

  useEffect(() => {
    console.log(selectedSegment);
  }, [selectedSegment]);

  return (
    <>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton></IonBackButton>
            </IonButtons>
            <IonTitle style={{ textAlign: "center" }}>Ride History</IonTitle>
            <IonButtons slot="end">
              <div style={{ marginRight: "50px" }}></div>
            </IonButtons>
          </IonToolbar>
          <IonToolbar>
            <IonSegment
              onIonChange={(e) => handleOnSegmentChange(e)}
              value={selectedSegment}
              mode="md"
            >
              <IonSegmentButton value="driver">
                <IonLabel>As Driver</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="corider">
                <IonLabel>As Co-Rider</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </IonToolbar>
        </IonHeader>
        {isLoading ? (
          <>
            <IonContent>
              <IonSkeletonText
                animated={true}
                style={{
                  height: "300px",
                  width: "90%",
                  margin: "auto",
                  "--border-radius": "20px",
                  marginTop: "20px",
                }}
              ></IonSkeletonText>
              <IonSkeletonText
                animated={true}
                style={{
                  height: "300px",
                  width: "90%",
                  margin: "auto",
                  "--border-radius": "20px",
                  marginTop: "20px",
                }}
              ></IonSkeletonText>
              <IonSkeletonText
                animated={true}
                style={{
                  height: "300px",
                  width: "90%",
                  margin: "auto",
                  "--border-radius": "20px",
                  marginTop: "20px",
                }}
              ></IonSkeletonText>
              <IonSkeletonText
                animated={true}
                style={{
                  height: "300px",
                  width: "90%",
                  margin: "auto",
                  "--border-radius": "20px",
                  marginTop: "20px",
                }}
              ></IonSkeletonText>
            </IonContent>
          </>
        ) : (
          <>
            {selectedSegment === "driver" ? (
              <IonContent>
                <>
                  {driverHistory &&
                    driverHistory.map((ride: any, index: number) => (
                      <div className="historyCard" key={index}>
                        <IonText className="dateTime">
                          {ride?.StartTime}
                        </IonText>
                        <div className="locationsContainer">
                          <div className="fromDiv">
                            <div style={{ display: "flex" }}>
                              <IonImg
                                src={navigateGray}
                                color={""}
                                className="navigateIcon"
                              ></IonImg>
                            </div>
                            <div>
                              <IonText>From</IonText>
                              <IonText className="cardLocation">
                                {ride?.Source[2]}
                              </IonText>
                            </div>
                          </div>
                          <div className="toDiv">
                            <div style={{ display: "flex" }}>
                              <IonImg
                                src={navigateGreen}
                                className="navigateIcon"
                              ></IonImg>
                            </div>
                            <div>
                              <IonText>To</IonText>
                              <IonText className="cardLocation">
                                {ride?.Destination[2]}
                              </IonText>
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            paddingBottom: "15px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              margin: "10px 0 10px 0",
                              backgroundColor: "#e4e4e4",
                              padding: "7px 20px",
                              borderRadius: "30px",
                            }}
                          >
                            <div
                              style={{
                                height: "12px",
                                width: "12px",
                                backgroundColor: "green",
                                borderRadius: "50%",
                                display: "flex",
                                marginRight: "10px",
                              }}
                            ></div>
                            <IonText>{ride?.Status}</IonText>
                          </div>
                        </div>
                        <IonButton
                          onClick={() => {
                            handleRideInfoClick(ride?.Id);
                          }}
                          className="viewDetailsBtn"
                        >
                          View Details
                        </IonButton>
                      </div>
                    ))}

                  <p style={{ paddingBottom: "30px" }}></p>
                </>
              </IonContent>
            ) : (
              <IonContent>
                {coRiderHistory &&
                  coRiderHistory.map((ride: any, index: number) => (
                    <div className="historyCard" key={index}>
                      <IonText className="dateTime">{ride?.PickupTime}</IonText>
                      <div className="locationsContainer">
                        <div className="fromDiv">
                          <div style={{ display: "flex" }}>
                            <IonImg
                              src={navigateGray}
                              color={""}
                              className="navigateIcon"
                            ></IonImg>
                          </div>
                          <div>
                            <IonText>From</IonText>
                            <IonText className="cardLocation">
                              {ride?.Pickup[2]}
                            </IonText>
                          </div>
                        </div>
                        <div className="toDiv">
                          <div style={{ display: "flex" }}>
                            <IonImg
                              src={navigateGreen}
                              className="navigateIcon"
                            ></IonImg>
                          </div>
                          <div>
                            <IonText>To</IonText>
                            <IonText className="cardLocation">
                              {ride?.Drop[2]}
                            </IonText>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          paddingBottom: "15px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            margin: "20px 0 10px 0",
                            backgroundColor: "#e4e4e4",
                            padding: "7px 20px",
                            borderRadius: "30px",
                          }}
                        >
                          <div
                            style={{
                              height: "12px",
                              width: "12px",
                              backgroundColor: "green",
                              borderRadius: "50%",
                              display: "flex",
                              marginRight: "10px",
                            }}
                          ></div>
                          <IonText>{ride?.Status}</IonText>
                        </div>
                      </div>
                      <IonButton
                        onClick={() => {
                          handleRideInfoClick(ride?.Id);
                        }}
                        className="viewDetailsBtn"
                      >
                        View Details
                      </IonButton>
                    </div>
                  ))}

                <p style={{ paddingBottom: "30px" }}></p>
              </IonContent>
            )}
          </>
        )}
      </IonPage>
      <IonLoading message={"Loading..."} isOpen={isOpen}></IonLoading>
    </>
  );
};

export default History;
