import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCheckbox,
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
  IonMenuButton,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonSpinner,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/react";
import "./Sos.css";
import {
  addCircleOutline,
  closeOutline,
  navigateOutline,
} from "ionicons/icons";
import {
  Autocomplete,
  StandaloneSearchBox,
  LoadScript,
} from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const Tab: React.FC = () => {
  const messages = [
    "I am in danger. Please help me out.",
    "मैं संकट में हूं कृपया मेरी मदद करें",
  ];
  const [contacts, setContacts] = useState<number[]>(() => {
    let ec: any = localStorage.getItem("emergencyContacts");
    if (ec) {
      ec = JSON.parse(ec);
    }
    if (ec?.length > 0) {
      return ec;
    }
    return [];
  });

  const [isNumberValid, setIsNumberValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [selectedMsgIndex, setSelectedMsgIndex] = useState<number>(0);

  const emergencyContactInputRef = useRef<HTMLInputElement>(null);

  const handleNumberInput = () => {
    let number = emergencyContactInputRef?.current?.value;
    if (number?.length === 10) {
      setIsNumberValid(true);
    } else {
      setIsNumberValid(false);
    }
  };

  const handleAddContactClick = () => {
    let newNumber = emergencyContactInputRef?.current?.value;
    if (!newNumber) return;
    if (contacts.includes(parseInt(newNumber))) {
      setIsOpen(true);
      return;
    }
    let c = contacts;
    let newC = [...contacts, parseInt(newNumber)];
    localStorage.setItem("emergencyContacts", JSON.stringify(newC));
    setContacts(newC);
    if (emergencyContactInputRef?.current !== null) {
      emergencyContactInputRef.current.value = "";
    }
  };

  const handleRemoveNumberClick = (i: number) => {
    let newC: number[] = contacts.filter((number, index) => index !== i);
    setContacts(newC);
    localStorage.setItem("emergencyContacts", JSON.stringify(newC));
  };

  const handleMessageIndexChange = (e: any) => {
    setSelectedMsgIndex(e.detail.value);
    setMessage(messages[e.detail.value]);
  };

  const sendMessage = async (contactNumber: number, message: string) => {
    let myNumber = localStorage.getItem("phoneNumber");
    let msg = message + " message from +91 " + myNumber;
    const url = `https://api.twilio.com/2010-04-01/Accounts/${
      import.meta.env.VITE_TWILIO_URL
    }`;
    const data = new URLSearchParams();
    data.append("To", `+91${contactNumber}`);
    data.append("From", "+15642442806");
    data.append("Body", msg);

    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth: {
        username: import.meta.env.VITE_TWILIO_USERNAME,
        password: import.meta.env.VITE_TWILIO_AUTH_ID,
      },
    };

    await axios
      .post(url, data, config)
      .then((response) => {
        console.log("Response:", response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleSendAlertClick = async () => {
    setIsLoading(true);
    contacts.forEach(async (contact: number) => {
      await sendMessage(contact, message);
    });
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/"></IonBackButton>
            </IonButtons>
            <IonTitle style={{ textAlign: "center" }}>SOS</IonTitle>
            <div style={{ width: "50px" }} slot="end"></div>
          </IonToolbar>
        </IonHeader>
        <IonContent className="sosContent">
          <div style={{ height: "100%" }}>
            <IonGrid style={{ marginRight: "8px" }}>
              <IonRow className="sos_display">
                <IonCol>
                  <IonLabel className="sos_display">
                    SMS will be automatically send to these contacts whenever an
                    alert is triggered. Regular SMS charges will apply.
                  </IonLabel>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol className="ion-text-start">
                  <IonLabel className="sos_title">Message</IonLabel>
                </IonCol>
              </IonRow>
              <IonRadioGroup
                value={selectedMsgIndex}
                onIonChange={handleMessageIndexChange}
              >
                {messages.map((message: string, index: number) => (
                  <IonItem lines="none">
                    <IonRadio
                      slot="start"
                      color={"danger"}
                      value={index}
                    ></IonRadio>
                    <IonLabel style={{ marginLeft: "15px" }}>
                      {message}
                    </IonLabel>
                  </IonItem>
                ))}
              </IonRadioGroup>
              <IonRow>
                <IonCol>
                  <IonLabel className="sos_title">Contact</IonLabel>
                </IonCol>
              </IonRow>
            </IonGrid>
            {contacts.map((number: number, index: number) => (
              <IonItem lines="none">
                <IonCheckbox
                  style={{ marginLeft: "10px" }}
                  slot="start"
                  checked={true}
                  disabled={true}
                ></IonCheckbox>
                <IonLabel>+91 {number}</IonLabel>
                <IonButtons>
                  <IonButton
                    slot="end"
                    onClick={() => handleRemoveNumberClick(index)}
                  >
                    <IonIcon icon={closeOutline}></IonIcon>
                  </IonButton>
                </IonButtons>
              </IonItem>
            ))}

            {contacts && contacts.length < 3 && (
              <div
                className="contactAddHolder"
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "20px",
                  width: "95%",
                  borderRadius: "20px",
                  margin: "auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#e5e5e5",
                    borderRadius: "15px",
                    padding: "2px 25px",
                    marginBottom: "10px",
                  }}
                >
                  <IonText>+91</IonText>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Contact"
                    ref={emergencyContactInputRef}
                    onInput={handleNumberInput}
                    style={{
                      height: "50px",
                      border: "none",
                      outline: "none",
                      backgroundColor: "transparent",
                      width: "100%",
                      marginLeft: "15px",
                    }}
                  />
                </div>
                <IonButton
                  disabled={!isNumberValid}
                  onClick={handleAddContactClick}
                  style={{
                    width: "100%",
                    "--background": "transparent",
                    "--box-shadow": "none",
                    border: "2px darkgray dashed",
                    borderRadius: "15px",
                    color: "black",
                    "--border-radius": "15px",
                    height: "50px",
                  }}
                >
                  <IonIcon
                    icon={addCircleOutline}
                    style={{ marginRight: "10px" }}
                  ></IonIcon>
                  Add Contact
                </IonButton>
              </div>
            )}
            <IonButton
              className="sos_alert"
              disabled={isLoading}
              style={{ "--border-radius": "15px", height: "50px" }}
              color={"danger"}
              onClick={handleSendAlertClick}
            >
              {isLoading && (
                <IonSpinner style={{ marginRight: "15px" }}></IonSpinner>
              )}
              SEND ALERT
            </IonButton>
          </div>

          <IonToast
            isOpen={isOpen}
            message="Number is already added."
            onDidDismiss={() => setIsOpen(false)}
            duration={5000}
            buttons={[
              {
                text: "Dismiss",
                role: "cancel",
              },
            ]}
          ></IonToast>
        </IonContent>
      </IonPage>
    </>
  );
};

export default Tab;
