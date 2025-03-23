import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonPage,
  IonRouterContext,
  IonSkeletonText,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Profile.css";
import { useContext, useEffect, useState } from "react";
import { carSport, carSportOutline, carSportSharp } from "ionicons/icons";
const Profile: React.FC = () => {
  const [user, setUser] = useState<any>();
  const verifiedBadgeImg = "/assets/images/VerifiedBadge.svg";
  const personImg = "/assets/images/person.svg";
  const carImg = "/assets/images/car.svg";
  const ionRouterContext = useContext(IonRouterContext);
  const handleEditProfileClick = () => {
    ionRouterContext.push("/editprofile", "forward");
  };

  useEffect(() => {
    let user: any = localStorage.getItem("user");
    user = JSON.parse(user);
    setUser(user);
  }, []);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton></IonBackButton>
          </IonButtons>
          <IonTitle style={{ textAlign: "center" }}>Profile</IonTitle>
          <IonButtons slot="end">
            <div style={{ marginRight: "50px" }}></div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ paddingTop: "20px", paddingBottom: "20px" }}>
          {/* Profile Banner & Icon */}
          <div className="profile_profileBanner">
            <div className="profile_profileCircle">
              <IonImg
                className="profile_profilePic"
                src={user?.ProfileUrl}
              ></IonImg>
            </div>
            <div className="profile_profileNameHolder">
              <IonText className="profile_profileName">
                {user?.FirstName} {user?.LastName}
              </IonText>
              <div className="profile_verifiedBadgeHolder">
                <IonImg
                  className="profile_verifiedBadge"
                  src={verifiedBadgeImg}
                ></IonImg>
                <IonText>Verified</IonText>
              </div>
            </div>
          </div>

          {/* Bio & Ratings Card */}
          <div className="profile_bioRatingsHolder">
            {/* RatingsCard */}
            {/* <div className="profile_card profile_ratingsCard">
              <IonText className="profile_cardTitle">Ratings</IonText>
              <br />
              <p className="profile_ratings">
                <span>{user?.Ratings}</span> / 5
              </p>
            </div> */}
            {/* BioCard */}
            <div className="profile_card profile_bioCard">
              <IonText className="profile_cardTitle">Bio</IonText>
              <br />
              {!user?.hasOwnProperty("Bio") || user?.Bio == "" ? (
                <IonText style={{ color: "gray" }}>
                  You can set your bio in Edit Profile page.
                </IonText>
              ) : (
                <IonText>{user?.Bio}</IonText>
              )}
            </div>
          </div>

          {/* Vehicles */}
          <div className="profile_card profile_vehiclesCard">
            <div
              className="profile_cardHeader"
              style={{ marginBottom: "10px" }}
            >
              <IonText className="profile_cardTitle">My Vehicles</IonText>
              <IonButton
                className="profile_manageBtn"
                onClick={() =>
                  ionRouterContext.push("/managevehicles", "forward")
                }
              >
                Manage
              </IonButton>
            </div>
            {user?.hasOwnProperty("Vehicles") && user?.Vehicles?.length != 0 ? (
              <div className="profile_vehicleHolder">
                <div>
                  <div
                    style={{
                      backgroundColor: "#fbfbfb",
                      borderRadius: "50%",
                      height: "50px",
                      width: "50px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <IonIcon
                      icon={carSportOutline}
                      style={{
                        width: "25px",
                        height: "25px",
                      }}
                      // className="profile_carIcon"
                    ></IonIcon>
                  </div>
                  <IonText>{user?.Vehicles[0]?.VehicleName}</IonText>
                  {/* <IonText>Hello</IonText> */}
                </div>
                {/* <IonBadge>Primary</IonBadge> */}
                <div className="profile_seatingCapacityHolder">
                  <IonImg src={personImg}></IonImg>
                  <p>{user?.Vehicles[0]?.SeatingCapacity}</p>
                </div>
              </div>
            ) : (
              <IonText style={{ color: "gray" }}>
                No Vehicles. <br />
                Click on "Manage" to add.
              </IonText>
            )}
          </div>

          {/* Reviews */}
          <div className="profile_card profile_reviewsCard">
            <div className="profile_cardHeader">
              <IonText className="profile_cardTitle">Reviews</IonText>
              <IonButton className="profile_viewAllBtn" fill="clear">
                View All
              </IonButton>
            </div>
            {user?.hasOwnProperty("Reviews") && user?.Reviews?.length !== 0 ? (
              user?.Reviews.map((review: any) => (
                <>
                  <div className="profile_reviewHolder">
                    <div className="profile_reviewerIcon">
                      <IonImg src={review.Reviewer.ProfileUrl}></IonImg>
                    </div>
                    <div className="profile_reviewContentHolder">
                      <IonText className="profile_reviewerName">
                        {review.Reviewer.Name}
                      </IonText>
                      <IonText className="profile_review">
                        {review.Feedback} <span>({review.Ratings}/5)</span>
                      </IonText>
                    </div>
                  </div>
                </>
              ))
            ) : (
              <IonText style={{ color: "gray" }}>
                No Reviews. <br />
              </IonText>
            )}
          </div>
        </div>
      </IonContent>
      <IonFooter className="profileFooter">
        <IonButton
          className="editProfileBtn"
          expand="block"
          onClick={handleEditProfileClick}
        >
          Edit Profile
        </IonButton>
      </IonFooter>
    </IonPage>
  );
};

export default Profile;
