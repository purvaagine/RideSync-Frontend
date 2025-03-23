import React, { useEffect, useRef, useState } from "react";
import "./ManageVehicles.css";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonIcon,
  IonText,
  IonButton,
  IonModal,
  IonFooter,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonToast,
} from "@ionic/react";
import {
  addCircleOutline,
  arrowBack,
  backspaceOutline,
  carSportOutline,
  personOutline,
  trashBinOutline,
} from "ionicons/icons";
import { firestore } from "../../services/firebase";
import firebase from "firebase/compat/app";
import getUser from "../../functions/getUser";

const ManageVehicles = () => {
  let user = JSON.parse(localStorage.getItem("user") as string);
  let userId = user?.Id;
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);

  const db = firestore;

  const [isNameValid, setIsNameValid] = useState<boolean>(false);
  const [isNumberValid, setIsNumberValid] = useState<boolean>(false);
  const [isFuelValid, setIsFuelValid] = useState<boolean>(false);
  const [selectedFuel, setSelectedFuel] = useState<string>("");
  const [isSeatingCapValid, setIsSeatingCapValid] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isAddVehicleLoading, setIsAddVehicleLoading] =
    useState<boolean>(false);
  const [isRemoveLoading, setIsRemoveLoading] = useState<boolean>(false);
  const [removingVehicle, setRemovingVehicle] = useState<string>("");
  const [vehiclesWillUpdate, setVehiclesWillUpdate] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const name = useRef<string>();
  const number = useRef<string>();
  const cap = useRef<number>();
  const fuel = useRef<string>();

  const handleVehicleNameInput = (e: any) => {
    name.current = e?.detail?.value;
    if (e?.detail?.value.toString().length > 3) {
      setIsNameValid(true);
    } else {
      setIsNameValid(false);
    }
  };

  const handleVehicleNumberInput = (e: any) => {
    number.current = e?.detail?.value;
    if (e?.detail?.value.toString().length > 5) {
      setIsNumberValid(true);
    } else {
      setIsNumberValid(false);
    }
  };

  const handleSeatingCapacityInput = (e: any) => {
    cap.current = parseInt(e?.detail?.value);
    if (parseInt(e?.detail?.value) > 1) {
      setIsSeatingCapValid(true);
    } else {
      setIsSeatingCapValid(false);
    }
  };

  const handleFuelTypeChange = (e: any) => {
    fuel.current = e?.detail?.value;
    setIsFuelValid(true);
  };

  useEffect(() => {
    if (isNameValid && isNumberValid && isSeatingCapValid && isFuelValid) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [isNameValid, isNumberValid, isSeatingCapValid, isFuelValid]);

  useEffect(() => {
    if (!vehicles || !Array.isArray(vehicles)) {
      console.error("Vehicles data is missing or not an array.");
      setFilteredVehicles([]);
      return;
    }
    let fv = vehicles.filter((vehicle: any) => vehicle?.IsRemoved !== true);
    setFilteredVehicles(fv);
  }, [vehicles]);

  const handleRemoveVehicleClick = async (vehicleId: string) => {
    setRemovingVehicle(vehicleId);
    setIsRemoveLoading(true);
    const vehicleRef = db.collection("Vehicles").doc(vehicleId);
    await vehicleRef.update({
      IsRemoved: true,
    });
    let user = await getUser(userId, false);
    console.log(user);
    updateVehicles();
    setMessage("Vehicle removed successfully!");
    setIsOpen(true);
    console.log("called");
    setTimeout(() => {
      setIsRemoveLoading(false);
    }, 2000);
  };

  const handleAddVehicleClick = async () => {
    setIsAddVehicleLoading(true);
    let vehicleDetails = {
      VehicleName: name.current,
      VehicleNumber: number.current,
      SeatingCapacity: cap.current,
      FuelType: fuel.current,
    };
    let vehicleId;
    try {
      const vehicleRef = await db.collection("Vehicles").add(vehicleDetails);
      vehicleId = vehicleRef.id;
      const userRef = db.collection("Users").doc(userId);
      await userRef.update({
        Vehicles: firebase.firestore.FieldValue.arrayUnion(
          db.doc(`Vehicles/${vehicleId}`)
        ),
      });
    } catch (error) {
      console.error("Error adding vehicle and reference:", error);
    }
    let user = await getUser(userId, false);
    updateVehicles();
    setMessage("Vehicle added successfully!");
    setIsOpen(true);
    setTimeout(() => {
      setIsAddVehicleLoading(false);
    }, 2000);
  };

  const updateVehicles = () => {
    let user = JSON.parse(localStorage.getItem("user") as string);
    if (!user || !Array.isArray(user.Vehicles)) {
      console.warn("No vehicles found in user data. Setting empty array.");
      setVehicles([]); // Ensures vehicles is always an array
      return;
    }
    setVehicles(user.Vehicles);
  };
  
  

  useEffect(() => {
    let user = JSON.parse(localStorage.getItem("user") as string);
    if (!user) return;
    let vehicles = user?.Vehicles;
    setVehicles(vehicles);
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/"></IonBackButton>
          </IonButtons>
          <IonTitle style={{ textAlign: "center" }}>Manage Vehicles</IonTitle>
          <div style={{ width: "50px" }} slot="end"></div>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div
          className="addVehicleContainer"
          style={{
            display: "flex",
            width: "90%",
            justifyContent: "center",
            margin: "auto",
            marginTop: "20px",
          }}
        ></div>

        <div
          className="addVehicleForm"
          style={{
            borderRadius: "15px",
            width: "90%",
            margin: "auto",
            padding: "10px 20px",
            backgroundColor: "#f5f5f5",
          }}
        >
          <IonList lines="none" className="vehicleFormList">
            <IonItem>
              <IonInput
                label="Vehicle Name"
                labelPlacement="stacked"
                clearInput={true}
                placeholder="eg. Tata Nexon"
                maxlength={20}
                onIonInput={handleVehicleNameInput}
              ></IonInput>
            </IonItem>
            <IonItem>
              <IonInput
                label="Vehicle Number"
                labelPlacement="stacked"
                clearInput={true}
                placeholder="XX00XX0000"
                onIonInput={handleVehicleNumberInput}
                maxlength={12}
              ></IonInput>
            </IonItem>
            <IonItem>
              <IonInput
                type="tel"
                label="Seating Capacity"
                labelPlacement="stacked"
                clearInput={true}
                placeholder="eg. 4"
                onIonInput={handleSeatingCapacityInput}
                maxlength={1}
              ></IonInput>
            </IonItem>
            <IonItem>
              <IonLabel>Fuel Type</IonLabel>
              <IonSelect
                placeholder="Select Type"
                value={selectedFuel}
                onIonChange={handleFuelTypeChange}
              >
                <IonSelectOption value={"Petrol"}>Petrol</IonSelectOption>
                <IonSelectOption value={"Diesel"}>Diesel</IonSelectOption>
                <IonSelectOption value={"Electric"}>Electric</IonSelectOption>
                <IonSelectOption value={"Other"}>Other</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonList>
          <IonButton
            id="open"
            disabled={!isFormValid || isAddVehicleLoading}
            //   onClick={handleAddContactClick}
            style={{
              width: "100%",
              "--background": "transparent",
              "--box-shadow": "none",
              border: "2px darkgray dashed",
              borderRadius: "15px",
              color: "black",
              "--border-radius": "15px",
              height: "50px",
              margin: "15px auto",
            }}
            onClick={handleAddVehicleClick}
          >
            {isAddVehicleLoading ? (
              <IonSpinner
                style={{ marginRight: "15px" }}
                color={"success"}
              ></IonSpinner>
            ) : (
              <IonIcon
                icon={addCircleOutline}
                style={{ marginRight: "10px" }}
              ></IonIcon>
            )}
            {isAddVehicleLoading ? "Adding Vehicle" : "Add Vehicle"}
          </IonButton>
        </div>
        {filteredVehicles &&
          filteredVehicles.map((vehicle: any, index: number) => (
            <div className="rideCard vehicleCard" key={index}>
              <div className="vehicleDetails">
                <div className="vehicleIcon">
                  <IonIcon
                    icon={carSportOutline}
                    style={{ color: "darkgray" }}
                  ></IonIcon>
                </div>
                <div className="vehicleName">
                  <IonText>{vehicle?.VehicleName}</IonText>
                  <br />
                  <IonText>Fuel Type: {vehicle?.FuelType}</IonText>
                </div>
              </div>
              <div className="dashedLine"></div>
              <div className="vehicleNumberHolder">
                <IonText>Vehicle Number: {vehicle?.VehicleNumber}</IonText>
              </div>
              <div className="dashedLine"></div>
              <div className="vehicleNumberHolder">
                <IonText>
                  Capacity: 1 Driver + {vehicle?.SeatingCapacity - 1} Co-Riders
                </IonText>
              </div>
              <IonButton
                disabled={isRemoveLoading && vehicle?.Id === removingVehicle}
                onClick={() => handleRemoveVehicleClick(vehicle?.Id)}
                color={"danger"}
                style={{
                  width: "100%",
                  "--box-shadow": "none",
                  borderRadius: "15px",
                  "--border-radius": "15px",
                  height: "50px",
                  marginTop: "15px",
                }}
              >
                {isRemoveLoading && removingVehicle === vehicle?.Id ? (
                  <IonSpinner style={{ marginRight: "15px" }}></IonSpinner>
                ) : (
                  <IonIcon
                    icon={trashBinOutline}
                    style={{ marginRight: "10px" }}
                  ></IonIcon>
                )}
                Remove Vehicle
              </IonButton>
            </div>
          ))}
      </IonContent>
      <IonModal>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton>
                <IonIcon icon={arrowBack}></IonIcon>
              </IonButton>
            </IonButtons>
            <IonTitle style={{ textAlign: "center" }}>Add Vehicle</IonTitle>
            <div style={{ width: "50px" }} slot="end"></div>
          </IonToolbar>
        </IonHeader>
        <IonContent></IonContent>
        <IonFooter className="profileFooter">
          <IonButton
            className="editProfileBtn"
            expand="block"
            //   onClick={handleEditProfileClick}
          >
            Add Vehicle
          </IonButton>
        </IonFooter>
      </IonModal>
      <IonToast
        isOpen={isOpen}
        message={message}
        onDidDismiss={() => setIsOpen(false)}
        duration={5000}
        buttons={[
          {
            text: "Dismiss",
            role: "cancel",
          },
        ]}
      ></IonToast>
    </IonPage>
  );
};

export default ManageVehicles;
