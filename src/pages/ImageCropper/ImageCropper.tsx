import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonRouterContext,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { useLocation } from "react-router";
import "./ImageCropper.css";

import { storage } from "../../services/firebase";

const ImageCropper = () => {
  const [image, setImage] = useState<any>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropShape, setCropShape] = useState("rect");
  const [croppedImage, setCroppedImage] = useState<any>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImageData, setCroppedImageData] = useState<any>(null);

  const ionRouterContext = useContext(IonRouterContext);

  let imageData = localStorage.getItem("imageData") as string;

  const onCropChange = useCallback((crop: any) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: any) => {
    setZoom(zoom);
  }, []);

  const onShapeChange = useCallback((e: any) => {
    setCropShape(e.target.value);
  }, []);

  const onCropComplete = async (croppedArea: any, croppedAreaPixels: any) => {
    try {
      const croppedImageBlob = (await getCroppedImage(
        croppedAreaPixels
      )) as MediaSource;
      const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
      setCroppedImageData(croppedImageUrl);
    } catch (error) {
      console.error("Failed to crop image:", error);
    }
  };

  const getCroppedImage = async (croppedAreaPixels: any) => {
    // Assuming imageData is your original image data
    const image = new Image();
    image.src = imageData;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    if (!ctx) return;
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob for cropped image"));
          return;
        }
        resolve(blob);
      }, "image/jpeg"); // Change to 'image/png' if needed
    });
  };

  const handleBackClick = () => {
    ionRouterContext.push(`/craftprofile?${encodeURIComponent(false)}`, "back");
  };

  const handleDoneClick = () => {
    localStorage.setItem("croppedImage", croppedImageData);
    localStorage.setItem("isCropped", JSON.stringify(true));
    let isCropped = true;
    ionRouterContext.push(
      `/craftprofile?${encodeURIComponent(isCropped)}`,
      "back"
    );
  };

  useEffect(() => {
    console.log(croppedImageData);
  }, [croppedImageData]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton></IonBackButton>
          </IonButtons>
          <IonTitle>Crop Image</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Cropper
          image={imageData}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape={"rect"}
          onCropChange={onCropChange}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: {
              height: "50%",
              width: "100%",
              position: "relative",
            },
          }}
          onZoomChange={onZoomChange}
        />
        <div className="imageCropperButtons">
          <IonButton onClick={handleDoneClick}>Done</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ImageCropper;
