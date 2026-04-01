// ==========================================
// 1. YOUR FIREBASE CONFIGURATION
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyA93amAMYJvfSWsgx6d31Xi95-cyI8WiRg",
  authDomain: "lumina-studio-9069d.firebaseapp.com",
  projectId: "lumina-studio-9069d",
  storageBucket: "lumina-studio-9069d.firebasestorage.app",
  messagingSenderId: "351859749046",
  appId: "1:351859749046:web:b7cab0b9a40adcaa27b617"
};

// Initialize Firebase Database & Auth
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ==========================================
// 2. YOUR CLOUDINARY CONFIGURATION
// ==========================================
const myCloudName = "dqe5kg8pl"; 
const myUploadPreset = "VDS PHOTOGRAPHYa_preset"; 

// ==========================================
// 3. UI Elements & Login Logic
// ==========================================
const loginScreen = document.getElementById('login-screen');
const uploadScreen = document.getElementById('upload-screen');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginError = document.getElementById('login-error');
const uploadStatus = document.getElementById('upload-status');

// Handle Login State (Hides/Shows the right screen)
auth.onAuthStateChanged(user => {
    if (user) {
        loginScreen.classList.add('hidden');
        uploadScreen.classList.remove('hidden');
    } else {
        loginScreen.classList.remove('hidden');
        uploadScreen.classList.add('hidden');
    }
});

// Login Button Click
loginBtn.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            loginError.innerText = "Invalid credentials. Try again.";
            loginError.classList.remove('hidden');
        });
});

// Logout Button Click
logoutBtn.addEventListener('click', () => auth.signOut());

// ==========================================
// 4. Cloudinary Widget & Database Saving
// ==========================================
var myWidget = cloudinary.createUploadWidget({
    cloudName: myCloudName, 
    uploadPreset: myUploadPreset,
    sources: ['local', 'url', 'camera'],
    multiple: false
  }, async (error, result) => { 
    if (!error && result && result.event === "success") { 
        uploadStatus.innerText = "Saving to database...";
        uploadStatus.style.color = "#D4AF37"; // Gold

        // Get the secure image URL from Cloudinary
        const imageUrl = result.info.secure_url;
        
        // Get the category the user selected
        const category = document.getElementById('category').value;

        try {
            // Save both to Firebase Database
            await db.collection('photos').add({
                imageUrl: imageUrl,
                category: category,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            uploadStatus.innerText = "Success! Photo added to the live gallery.";
            uploadStatus.style.color = "#22c55e"; // Green

        } catch (dbError) {
            console.error(dbError);
            uploadStatus.innerText = "Error saving to database.";
            uploadStatus.style.color = "red";
        } finally {
            setTimeout(() => { uploadStatus.innerText = ""; }, 5000);
        }
    }
  }
);

// Open Cloudinary when the button is clicked
document.getElementById("upload_widget").addEventListener("click", function(){
    myWidget.open();
}, false);