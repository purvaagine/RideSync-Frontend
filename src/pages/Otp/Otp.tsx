import {
  IonAlert,
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
  IonLabel,
  IonLoading,
  IonMenuButton,
  IonPage,
  IonRouterContext,
  IonRow,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Otp.css";
import { navigateOutline } from "ionicons/icons";
import {
  Autocomplete,
  StandaloneSearchBox,
  LoadScript,
} from "@react-google-maps/api";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { firestore } from "../../services/firebase";
import getUser from "../../functions/getUser";

const otp = "/assets/images/otp.svg";

const Tab: React.FC = () => {
  const [seconds, setSeconds] = useState(60);
  const [isGoBackAlertOpen, setIsGoBackAlertOpen] = useState<boolean>(false);
  const [isOtpInvalid, setIsOtpInvalid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const ionRouterContext = useContext(IonRouterContext);

  const otpInputRef = useRef<HTMLInputElement>(null);
  const otpContentRef = useRef<HTMLIonContentElement>(null);

  let phoneNumber = localStorage.getItem("phoneNumber");

  const resendOtp = () => {
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

  useEffect(() => {
    if (seconds === 0) {
      return;
    }
    const timer = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds === 1) {
          clearInterval(timer);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);
    return () => clearInterval(timer); // Clean up the interval on component unmount
  }, [seconds]);

  const checkUserExists = async (phoneNumber: number) => {
    const usersRef = firestore.collection("Users");
    const querySnapshot = await usersRef
      .where("PhoneNumber", "==", phoneNumber)
      .get();

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      localStorage.setItem("userId", doc.id);
      let user = await getUser(doc.id);
      console.log({ exists: true, docId: doc.id });
      setTimeout(() => {
        ionRouterContext.push("/home", "root");
        setIsLoading(false);
      }, 2000);
    } else {
      console.log({ exists: false, docId: null });
      setTimeout(() => {
        ionRouterContext.push("/craftprofile", "forward");
        setIsLoading(false);
      }, 2000);
    }
  };

  // Format the timer to display in minutes and seconds
  const formatTime = (seconds: number): string => {
    return seconds === 1 ? `${seconds} second` : `${seconds} seconds`;
  };
  const handleResendClick = () => {
    resendOtp();
    setSeconds(60); // Reset the timer to 60 seconds
  };

  const handleBackClick = () => {
    setIsGoBackAlertOpen(true);
  };

  const handleConfirmBack = () => {
    ionRouterContext.back();
  };

  const handleOtpInput = () => {
    otpContentRef.current?.scrollToBottom(300);
    if (isOtpInvalid === true) {
      setTimeout(() => {
        setIsOtpInvalid(false);
      }, 1000);
    }
    if (otpInputRef.current?.value.toString().length === 5) {
      otpInputRef.current.blur();
      let otp = localStorage.getItem("otp");
      let inputOtp = otpInputRef?.current?.value;
      let validated = otp === inputOtp;
      setIsLoading(true);
      if (validated) {
        let phoneNumber = parseInt(
          localStorage.getItem("phoneNumber") as string
        );
        let userExists = checkUserExists(phoneNumber);
      } else {
        setIsLoading(false);
        setTimeout(() => {
          setIsOtpInvalid(true);
        }, 1000);
      }
    }
  };

  const handleOtpInputClick = () => {
    console.log("c");
  };
  return (
    <>
      <IonPage>
        <IonContent className="otpContent" ref={otpContentRef}>
          <IonGrid style={{ marginTop: "30px" }}>
            <IonRow>
              <IonCol>
                <IonButton className="otp_back" onClick={handleBackClick}>
                  Back
                </IonButton>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol className="ion-text-center">
                <IonLabel className="Name_font">OTP Verification</IonLabel>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol className="ion-text-center">
                <IonLabel style={{}}>
                  We've sent you an OTP on your number <br />
                  <span style={{ margin: "10px 0" }}>+91 {phoneNumber}</span>
                </IonLabel>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonImg src={otp} className="otp_img"></IonImg>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol className="otpInputHolder">
                <input
                  ref={otpInputRef}
                  type="tel"
                  placeholder="Enter OTP"
                  maxLength={5}
                  onClick={handleOtpInputClick}
                  className="otpInput"
                  onInput={handleOtpInput}
                ></input>
              </IonCol>
            </IonRow>
            {isOtpInvalid && (
              <IonRow>
                <IonText style={{ margin: "5px auto" }}>Invalid OTP</IonText>
              </IonRow>
            )}
            <IonRow>
              <IonCol className="ion-text-center resendHolder">
                {seconds === 0 ? (
                  <IonButton onClick={handleResendClick} className="otp_resend">
                    Resend
                  </IonButton>
                ) : (
                  <IonLabel>
                    <b>Resend</b> after {formatTime(seconds)}
                  </IonLabel>
                )}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol className="ion-text-center">
                <IonButton disabled={isLoading} className="otp_submit">
                  {" "}
                  {isLoading && (
                    <IonSpinner
                      name="crescent"
                      style={{ marginRight: "15px" }}
                    ></IonSpinner>
                  )}
                  Submit
                </IonButton>
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
      {/* <IonLoading isOpen={isLoading}></IonLoading> */}
    </>
  );
};

export default Tab;
