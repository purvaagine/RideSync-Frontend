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
  IonInput,
  IonMenuButton,
  IonPage,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import ExploreContainer from "../../components/ExploreContainer";
import "./EditProfile.css";
import camera from "/assets/images/camera.svg";
import { navigateOutline } from "ionicons/icons";
import {
  Autocomplete,
  StandaloneSearchBox,
  LoadScript,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";
import ReactCrop from "react-image-crop";

const EditProfile: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [crop, setCrop] = useState<any>({ aspect: 1 / 1 });
  const [croppedImage, setCroppedImage] = useState<any>(null);

  const onFileSelected = (event: any) => {
    const file = event.target.files[0];
    setSelectedImage(file);
  };

  const onCropComplete = (crop: any) => {
    // Handle crop complete event
  };

  const onCropChange = (crop: any) => {
    setCrop(crop);
  };

  const onCropImage = () => {
    if (selectedImage && crop.width && crop.height) {
      getCroppedImage();
    }
  };

  const getCroppedImage = () => {
    const image = new Image();
    image.src = URL.createObjectURL(selectedImage);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    image.onload = () => {
      canvas.width = crop.width;
      canvas.height = crop.height;
      if (!ctx) {
        return;
      }
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );
      const croppedImageUrl = canvas.toDataURL("image/jpeg");
      setCroppedImage(croppedImageUrl);
    };
  };

  return (
    <>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton></IonBackButton>
            </IonButtons>
            <IonTitle style={{ textAlign: "center" }}>Edit Profile</IonTitle>
            {/* <IonButtons slot="end">
              <div style={{ marginRight: "50px" }}></div>
            </IonButtons> */}
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {/* <ReactCrop
            // src={URL.createObjectURL(selectedImage)}
            crop={crop}
            // onImageLoaded={onCropComplete}
            onComplete={onCropComplete}
            onChange={onCropChange}
          /> */}

          <div className="editProfile_Photo">
            <div className="eP_photoBg">
              <IonImg src={camera} className="eP_camera"></IonImg>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              padding: "10px",
              marginLeft: "20px",
              marginRight: "20px",
              columnGap: "15px",
              gridTemplateColumns: "auto auto",
            }}
          >
            <p className="eP_Font">First Name</p>
            <p className="eP_Font">Last Name</p>
            <IonInput
              class="eP_Name"
              placeholder="First Name"
              maxlength={20}
            ></IonInput>
            <IonInput
              class="eP_Name"
              placeholder="Last Name"
              maxlength={20}
            ></IonInput>

            <p className="eP_Font" id="eP_colspan">
              Email Address
            </p>
            <IonInput
              class="eP_Name"
              id="eP_colspan"
              placeholder="example@abc.com"
              maxlength={50}
            ></IonInput>

            <p className="eP_Font" id="eP_colspan">
              Bio
            </p>
            <IonTextarea
              placeholder="Write about yourself"
              class="custom"
              id="eP_height"
              // helperText="Helper text"
              counter={true}
              maxlength={85}
            ></IonTextarea>
            {/* <p className="count">/85</p> */}
            <IonButton className="eP_Button" id="eP_colspan">
              Save
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    </>
  );
};

export default EditProfile;
