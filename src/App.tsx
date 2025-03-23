import { Redirect, Route } from "react-router-dom";
import {
  IonAlert,
  IonApp,
  IonRouterOutlet,
  IonText,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import "./App.css";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import History from "./pages/History/History";
import RideInfo from "./pages/RideInfo";
import EditProfile from "./pages/Profile/EditProfile";
import Destination from "./pages/Destination";
import FindRide from "./pages/FindRide";
import CreateRide from "./pages/Home/CreateRide";
import Otp from "./pages/Otp/Otp";
import Sos from "./pages/Sos/Sos";
import RideDetails from "./pages/RideDetails/RideDetails";
import Wallet from "./pages/Wallet/Wallet";

// import { Plugins } from "@capacitor/core";
// const { SplashScreen } = Plugins;

setupIonicReact();
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from "@capacitor/push-notifications";
import { useEffect, useState } from "react";
import Login from "./pages/Login/Login";
import CraftProfile from "./pages/CraftProfile/CraftProfile";
import ImageCropper from "./pages/ImageCropper/ImageCropper";
import ManageVehicles from "./pages/ManageVehicles/ManageVehicles";

const App: React.FC = () => {
  const [message, setMessage] = useState<string>("Not initialzed");

  console.log("Initializing HomePage");

  // useEffect(() => {
  //   SplashScreen.hide();
  // }, []);

  // PushNotifications.requestPermissions().then((result) => {
  //   if (result.receive === "granted") {
  //     // Register with Apple / Google to receive push via APNS/FCM
  //     PushNotifications.register();
  //   } else {
  //   }
  // });

  // PushNotifications.addListener("registration", (token: Token) => {
  //   alert("Push registration success, token: " + token.value);
  //   setMessage("success");
  //   localStorage.setItem("msg", "success");
  // });

  // PushNotifications.addListener("registrationError", (error: any) => {
  //   alert("Error on registration: " + JSON.stringify(error));
  //   setMessage("Error");
  //   localStorage.setItem("msg", "error");
  // });

  // PushNotifications.addListener(
  //   "pushNotificationReceived",
  //   (notification: PushNotificationSchema) => {
  //     alert("Push received: " + JSON.stringify(notification));
  //   }
  // );

  // PushNotifications.addListener(
  //   "pushNotificationActionPerformed",
  //   (notification: ActionPerformed) => {
  //     alert("Push action performed: " + JSON.stringify(notification));
  //   }
  // );
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/home" component={Home} />
          <Route path="/profile" component={Profile} />
          <Route path="/history" component={History} />
          <Route path="/rideinfo" component={RideInfo} />
          <Route path="/editprofile" component={EditProfile} />
          <Route path="/destination" component={Destination} />
          <Route path="/createride" component={CreateRide} />
          <Route path="/findride" component={FindRide} />
          <Route path="/otp" component={Otp} />
          <Route path="/sos" component={Sos} />
          <Route path="/ridedetails" component={RideDetails} />
          <Route path="/wallet" component={Wallet} />
          <Route path="/login" component={Login} />
          <Route path="/craftprofile" component={CraftProfile} />
          <Route path="/imagecropper" component={ImageCropper} />
          <Route path="/managevehicles" component={ManageVehicles} />

          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
