import {
  IonContent,
  IonPage,
  IonImg,
  IonInput,
  IonItem,
  IonIcon,
  IonButton,
  IonList,
  IonText,
  IonAlert,
  IonLoading,
  IonFooter,
  IonRouterContext,
} from "@ionic/react";
import "./Login.css";
import axios from "axios";
import { call } from "ionicons/icons";
// import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { useContext, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
// import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";
import { useHistory } from "react-router";
// import { firestore } from "../../services/firebase";
import getUser from "../../functions/getUser";

const Login: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<any>();
  const [result, setResult] = useState<any>();
  const [platform, setPlatform] = useState<any>(Capacitor.getPlatform());
  const [phoneNumber, setPhoneNumber] = useState("8169319446");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [isInputDisabled, setIsInputDisabled] = useState<boolean>(true);

  const phoneInputRef = useRef<HTMLIonInputElement>(null);

  const ionRouterContext = useContext(IonRouterContext);

  const generateOtp = () => {
    const otp = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
    return otp;
  };

  const handlePhoneNumberInput = () => {
    let input = phoneInputRef?.current?.value;
    console.log(input);
    if (input?.toString().length == 10) {
      const regex = /^[6-9]\d{9}$/;
      if (regex.test(input?.toString())) {
        localStorage.setItem("phoneNumber", input.toString());
        setIsInputDisabled(false);
      }
    } else {
      setIsInputDisabled(true);
    }
  };

  const sendOtp = () => {
    let phoneNumber = localStorage.getItem("phoneNumber");
    let otp = localStorage.getItem("otp");
    const url = `https://api.twilio.com/2010-04-01/Accounts/${
      import.meta.env.VITE_TWILIO_URL
    }`;
    const data = new URLSearchParams();
    data.append("To", `+91${phoneNumber}`);
    data.append("From", "+15642442806");
    data.append("Body", `Your verification code for CoDrive is: ${otp}`);

    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth: {
        username: import.meta.env.VITE_TWILIO_USERNAME,
        password: import.meta.env.VITE_TWILIO_AUTH_ID,
      },
    };

    axios
      .post(url, data, config)
      .then((response) => {
        console.log("Response:", response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleGetOtpClick = () => {
    localStorage.setItem("otp", generateOtp().toString());
    sendOtp();
    ionRouterContext.push("/otp", "forward");
  };

  useEffect(() => {
    console.log("login rendered");
    let user = JSON.parse(localStorage.getItem("user") as string);
    if (user) {
      ionRouterContext.push("/home", "forward", "replace");
    }
  }, []);

  return (
    <IonPage id="ion-page">
      <IonContent>
        <IonList
          id="ion-list"
          lines="none"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <IonItem lines="none">
            <IonImg
              id="carImage"
              alt=""
              src={"/assets/images/car.png"}
            ></IonImg>
          </IonItem>

          {/* <IonItem lines="none">
            <IonText style={{ margin: "auto" }}>
              Your{" "}
              <span style={{ textDecoration: "underline", color: "#30704c" }}>
                Eco-Friendly
              </span>{" "}
              Commute Awaits!
            </IonText>
          </IonItem> */}

          <IonItem lines="none" id="phoneNumberHolder">
            <IonIcon id="callIcon" icon={call} slot="start"></IonIcon>
            <IonText
              style={{ marginLeft: "-11px", marginRight: "6px" }}
              slot="start"
            >
              +91
            </IonText>
            <IonInput
              id="phoneNumberInput"
              placeholder="Phone Number"
              type="tel"
              ref={phoneInputRef}
              // Need to be resolved
              pattern="^[0-9]{10}$"
              inputmode="numeric"
              maxlength={10}
              onIonInput={handlePhoneNumberInput}
            ></IonInput>
          </IonItem>
          <IonButton
            size="default"
            id="otpButton"
            onClick={handleGetOtpClick}
            disabled={isInputDisabled}
          >
            Get OTP
          </IonButton>

          <IonText></IonText>
          <IonItem style={{ margin: "auto", "--background": "none" }}>
            <IonText style={{ margin: "auto" }}>Or</IonText>
          </IonItem>
          {platform === "web" || platform === "android" ? (
            <IonButton size="default" id="googleButton">
              <IonImg
                src={"/assets/images/google_logo.png"}
                id="googleLogo"
                slot="start"
              ></IonImg>
              Continue with Google
            </IonButton>
          ) : (
            <IonButton size="default" id="appleButton">
              <IonImg
                src={"/assets/images/apple_logo.png"}
                id="appleLogo"
                slot="start"
              ></IonImg>
              Continue with Apple
            </IonButton>
          )}
        </IonList>

        <IonAlert
          header="Login"
          message={message}
          isOpen={isOpen}
          buttons={[
            {
              text: "Cancel",
              handler: () => {
                setIsOpen(false);
              },
            },
          ]}
        ></IonAlert>
        <IonLoading isOpen={isLoading}></IonLoading>
      </IonContent>

      <IonFooter id="footer">
        <IonItem
          lines="none"
          id="footerTextHolder"
          style={{ "--background": "none" }}
        >
          <IonText id="footerText">
            By continuing you agree to <span>Terms and Conditions</span>
          </IonText>
        </IonItem>
      </IonFooter>
    </IonPage>
  );
};

export default Login;
