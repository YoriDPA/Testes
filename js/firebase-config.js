// Suas informações de configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCz_STWU26elAU8GPeoVHaenyzr0AnSk-s",
  authDomain: "snake-online-a889e.firebaseapp.com",
  projectId: "snake-online-a889e",
  storageBucket: "snake-online-a889e.appspot.com",
  messagingSenderId: "244515158570",
  appId: "1:244515158570:web:624e2faf21e7ebff21e153"
};

// Inicializa o Firebase
// A variável 'firebase' já existe porque nós a carregamos no index.html
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Usaremos o Firestore como nosso banco de dados em tempo real