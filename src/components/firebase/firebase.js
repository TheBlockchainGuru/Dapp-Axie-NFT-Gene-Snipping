import firebase from 'firebase';


const firebaseConfig = {
  apiKey: "AIzaSyAKCG1o0NmFuECT_g8VY3iZZOS4muG_dVA",
  authDomain: "axie-gene-scan.firebaseapp.com",
  databaseURL: "https://axie-gene-scan-default-rtdb.firebaseio.com",
  projectId: "axie-gene-scan",
  storageBucket: "axie-gene-scan.appspot.com",
  messagingSenderId: "136093368420",
  appId: "1:136093368420:web:ffc1f661a2de263ad89f71",
  measurementId: "G-R9S4MJSEEL"
};


firebase.initializeApp(firebaseConfig);
firebase.analytics();

export default firebase;

export const database = firebase.database();
export const auth = firebase.auth();
export const storage = firebase.storage();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
