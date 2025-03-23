import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonRouterContext,
  IonRow,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./CraftProfile.css";
import { camera, download, navigateOutline } from "ionicons/icons";
import {
  Autocomplete,
  StandaloneSearchBox,
  LoadScript,
} from "@react-google-maps/api";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { firestore, storage } from "../../services/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useLocation } from "react-router";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import getUser from "../../functions/getUser";

const CraftProfile: React.FC = () => {
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const lastNameInputRef = useRef<HTMLInputElement>(null);
  const genderRadioGroupRef = useRef<HTMLIonRadioGroupElement>(null);

  const [isGoBackAlertOpen, setIsGoBackAlertOpen] = useState<boolean>(false);

  const location: any = useLocation();

  const [croppedImageData, setCroppedImageData] = useState<string | null>(
    () => {
      if ((localStorage.getItem("isCropped") as string) == "true") {
        localStorage.setItem("isCropped", "false");
        return localStorage.getItem("croppedImage");
      } else {
        return null;
      }
    }
  );
  const params = new URLSearchParams(location.search);
  const imageData = params.get("isCropped");
  console.log();
  const [image, setImage] = useState<any>(null);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isGenderValid, setIsGenderValid] = useState<boolean>(false);
  const [isNameValid, setIsNameValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const ionRouterContext = useContext(IonRouterContext);

  const db = getFirestore();

  const storageRef = ref(
    storage,
    `/profileImages/${localStorage.getItem("phoneNumber")}.jpg`
  );
  const handleUploadClick = () => {
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.click();
    }
  };

  useEffect(() => {
    // This function will be called whenever the URL changes
    console.log(location.search);
    if (location.search == "?true") {
      setCroppedImageData(() => {
        return localStorage.getItem("croppedImage");
      });
    }
  }, [location]);

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        console.log(reader.result);
        setImage(reader.result);
        const imageData: string | null = reader.result as string;
        localStorage.setItem("imageData", imageData);
        ionRouterContext.push("/imagecropper", "forward");
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToFirebase = async () => {
    const response = await fetch(croppedImageData as string);
    const blob = await response.blob();
    let downloadUrl;
    await uploadBytes(storageRef, blob).then(async (snapshot) => {
      localStorage.removeItem("croppedImage");
      console.log("Uploaded a blob or file!", snapshot);
      downloadUrl = await getDownloadURL(snapshot.ref);
    });
    return downloadUrl;
  };

  const handleRemoveClick = () => {
    localStorage.removeItem("imageData");
    localStorage.removeItem("croppedImage");
    setCroppedImageData(null);
  };

  const handleUserCreation = async () => {
    setIsLoading(true);
    let userData: any = {
      FirstName: firstNameInputRef?.current?.value,
      LastName: lastNameInputRef?.current?.value,
      Gender: genderRadioGroupRef?.current?.value,
      PhoneNumber: parseInt(localStorage.getItem("phoneNumber") as string),
      History: [],
      Balance: 0,
    };
    let imageUrl = await uploadImageToFirebase();
    userData = {
      ...userData,
      ProfileUrl: imageUrl,
    };
    let userDocRef = await addDoc(collection(db, "Users"), userData);
    let id = userDocRef.id;
    localStorage.setItem("userId", id);
    let user = await getUser(id);
    console.log(user);
    setIsLoading(false);
    ionRouterContext.push("/home", "root");
  };

  const handleRadioChange = () => {
    let gender: string = genderRadioGroupRef?.current?.value;
    let validGenderArray: string[] = ["Male", "Female", "Other"];
    if (validGenderArray.includes(gender)) {
      setIsGenderValid(true);
    } else {
      setIsGenderValid(false);
    }
  };

  const handleNameInput = () => {
    let fName = firstNameInputRef?.current?.value as string;
    let lName = lastNameInputRef?.current?.value as string;
    if (fName?.length > 3 && lName?.length > 3) {
      setIsNameValid(true);
    } else {
      setIsNameValid(false);
    }
  };

  const handleBackClick = () => {
    setIsGoBackAlertOpen(true);
  };

  useEffect(() => {
    if (isGenderValid && isNameValid && croppedImageData) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
    console.log(isGenderValid, isNameValid);
  }, [isGenderValid, isNameValid, croppedImageData]);

  const handleConfirmBack = () => {
    ionRouterContext.back();
  };

  return (
    <>
      <IonPage>
        <IonContent className="craftProfileContent">
          <IonGrid>
            <IonRow style={{ height: "60px" }}>
              <IonCol>
                <IonButton className="back_button" onClick={handleBackClick}>
                  Back
                </IonButton>
              </IonCol>
            </IonRow>
            <IonRow className="ion-text-center">
              <IonCol>
                <IonLabel className="Name_font">Craft Your Profile</IonLabel>
              </IonCol>
            </IonRow>
            <IonRow className="ion-text-center">
              <IonCol style={{ padding: "0% 10% 0% 10%" }}>
                <IonLabel className="name_normalfont">
                  Introduce yourself with your Name and Profile Picture.
                </IonLabel>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "10px",
                }}
              >
                <div
                  className="name_profileCircle"
                  style={{ overflow: "hidden" }}
                >
                  {croppedImageData !== null ? (
                    <IonImg
                      style={{ objectFit: "cover" }}
                      src={croppedImageData}
                    ></IonImg>
                  ) : (
                    <IonImg src={camera} className="eP_camera"></IonImg>
                  )}
                  {/* eP_camera from Edit Profile.css */}
                </div>
              </IonCol>
            </IonRow>
            <IonRow className="ion-text-center">
              <IonCol>
                <input
                  type="file"
                  accept="image/*"
                  id="fileInput"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                {croppedImageData === null ? (
                  <IonButton
                    onClick={handleUploadClick}
                    className="name_upload"
                  >
                    Upload
                  </IonButton>
                ) : (
                  <IonButton
                    color={"danger"}
                    onClick={handleRemoveClick}
                    className="name_upload"
                  >
                    Remove
                  </IonButton>
                )}
              </IonCol>
            </IonRow>
            <IonRow style={{ padding: "10px" }}>
              <input
                ref={firstNameInputRef}
                placeholder="First Name"
                maxLength={17}
                type="text"
                onInput={handleNameInput}
                className="nameInput"
              ></input>
            </IonRow>
            <IonRow style={{ padding: "10px" }}>
              <input
                ref={lastNameInputRef}
                placeholder="Last Name"
                maxLength={17}
                type="text"
                onInput={handleNameInput}
                className="nameInput"
              ></input>
            </IonRow>
            <IonRow
              className="ion-align-items-stretch"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <IonText
                style={{
                  textAlign: "center",
                  width: "100%",
                  margin: "10px auto",
                }}
              >
                Select Gender
              </IonText>
              <IonRadioGroup
                ref={genderRadioGroupRef}
                onIonChange={handleRadioChange}
              >
                <div>
                  <IonList
                    lines={"none"}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <IonItem>
                      <IonRadio value={"Male"}></IonRadio>
                      <IonLabel style={{ marginLeft: "10px" }}>Male</IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonRadio value={"Female"}></IonRadio>
                      <IonLabel style={{ marginLeft: "10px" }}>Female</IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonRadio value={"Other"}></IonRadio>
                      <IonLabel style={{ marginLeft: "10px" }}>Other</IonLabel>
                    </IonItem>
                  </IonList>
                </div>
              </IonRadioGroup>
            </IonRow>
            <IonRow className="ion-text-center" style={{ marginTop: "15px" }}>
              <IonCol style={{ padding: "0% 10% 0% 10%" }}>
                <IonLabel
                  className="name_normalfont"
                  style={{ color: "#3f3f3f" }}
                >
                  These details are pubilicly visible to all users.
                </IonLabel>
              </IonCol>
            </IonRow>
            <IonRow style={{ marginTop: "10px" }}>
              <IonCol className="ion-text-center">
                <IonButton
                  disabled={!isFormValid || isLoading}
                  className="otp_submit"
                  onClick={handleUserCreation}
                >
                  {isLoading && (
                    <IonSpinner
                      name={"crescent"}
                      style={{ marginRight: "10px" }}
                    ></IonSpinner>
                  )}
                  Save
                </IonButton>
                {/* Save css from otp.css */}
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
      <IonAlert
        header={"Are you sure!"}
        message={"Want to go back?"}
        isOpen={isGoBackAlertOpen}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            handler: () => {
              setIsGoBackAlertOpen(false);
            },
          },
          {
            text: "Yes",
            handler: handleConfirmBack,
          },
        ]}
      ></IonAlert>
    </>
  );
};

export default CraftProfile;
