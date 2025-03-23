import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
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
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Wallet.css";
import { cashOutline, navigateOutline } from "ionicons/icons";
import {
  Autocomplete,
  StandaloneSearchBox,
  LoadScript,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { firestore } from "../../services/firebase";
import firebase from "firebase/compat/app";
import { getuid } from "process";
import getUser from "../../functions/getUser";
// import firebase from "firebase/compat/app";

const Wallet: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>();
  let userId = JSON.parse(localStorage.getItem("user") as string)?.Id;
  const [transactions, setTransactions] = useState<any[]>();
  const [balance, setBalance] = useState<number>(0);

  const fetchTransactions = async () => {
    console.log("loading");
    try {
      const userDocRef = firestore.collection("Users").doc(userId);
      const snapshot = await userDocRef
        .collection("Transactions")
        .orderBy("Time", "desc")
        .get();
      const transactionsData = snapshot.docs.map((doc: any) => doc.data());
      setTransactions(transactionsData);
      console.log(transactionsData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
    setIsLoading(false);
  };

  const updateBalance = () => {
    let balance = JSON.parse(localStorage.getItem("user") as string)?.Balance;
    setBalance(balance);
  };

  useEffect(() => {
    setIsLoading(true);
    fetchTransactions();
    updateBalance();
  }, []);

  const depositClick = async () => {
    setIsLoading(true);
    const userDocRef = firebase.firestore().collection("Users").doc(userId);
    await userDocRef.update({
      Balance: balance + 50,
    });

    const transactionRef = await userDocRef.collection("Transactions").add({
      Amount: 50,
      Type: "Deposit",
      Message: "Added to Wallet",
      Time: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await getUser(userId, false);
    updateBalance();
    fetchTransactions();
  };
  const withdrawClick = async () => {
    setIsLoading(true);
    const userDocRef = firebase.firestore().collection("Users").doc(userId);
    await userDocRef.update({
      Balance: balance - 50,
    });
    const transactionRef = await userDocRef.collection("Transactions").add({
      Amount: 50,
      Type: "Withdraw",
      Message: "Withdrawn to Bank",
      Time: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await getUser(userId, false);
    updateBalance();
    fetchTransactions();
  };
  return (
    <>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton></IonBackButton>
            </IonButtons>
            <IonTitle style={{ textAlign: "center", fontWeight: "bold" }}>
              Wallet
            </IonTitle>
            <IonButtons slot="end">
              <div style={{ width: "50px" }}></div>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          <div
            className="BalanceHolder"
            style={{
              margin: "auto",
              width: "90%",
              marginTop: "20px",
              borderRadius: "15px",
              backgroundColor: "#1d1d1d",
              color: "lightgray",
              padding: "20px 30px",
            }}
          >
            <IonText>Balance</IonText>
            <div style={{ margin: "7px" }}></div>
            <IonText style={{ fontSize: "24px", fontWeight: "600" }}>
              Rs. {balance}
            </IonText>
            <div className="walletButtons">
              <IonButton onClick={depositClick}>Deposit</IonButton>
              <IonButton onClick={withdrawClick}>Withdraw</IonButton>
            </div>
          </div>
          <div style={{ margin: "20px" }}></div>
          <IonText style={{ marginLeft: "25px" }}>My Transactions </IonText>

          {transactions &&
            transactions.length > 0 &&
            transactions.map((transaction: any, index: number) => (
              <div className="transactionCard" key={index}>
                <div className="cardTop">
                  <IonText style={{ color: "darkgray" }}>
                    {transaction?.Time?.toDate().toLocaleString()}
                  </IonText>
                </div>
                <div
                  className="cardHeader"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "17px",
                    margin: "8px 0",
                  }}
                >
                  <IonText style={{ fontWeight: "600" }}>
                    {transaction?.Message}
                  </IonText>
                  <div>
                    <IonText
                      style={{
                        fontWeight: "600",
                        color: `${
                          transaction?.Type === "Debit" ||
                          transaction?.Type === "Withdraw"
                            ? "red"
                            : "green"
                        }`,
                      }}
                    >
                      Rs.{" "}
                      {transaction?.Type === "Debit" ||
                      transaction?.Type === "Withdraw"
                        ? "-"
                        : "+"}{" "}
                      {transaction?.Amount}
                    </IonText>
                  </div>
                </div>
                <div className="cardContent">
                  <IonText style={{ color: "darkgray" }}>
                    Click to see details
                  </IonText>
                </div>
                <div className="cardFooter">
                  <IonText></IonText>
                </div>
              </div>
            ))}
        </IonContent>
      </IonPage>
      <IonLoading isOpen={isLoading}></IonLoading>
    </>
  );
};

export default Wallet;
