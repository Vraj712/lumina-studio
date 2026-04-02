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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ==========================================
// 2. YOUR CLOUDINARY CONFIGURATION
// ==========================================
const myCloudName = "dqe5kg8pl"; 
const myUploadPreset = "lumina_preset"; 

// ==========================================
// 3. UI Elements & Login
// ==========================================
const loginScreen = document.getElementById('login-screen');
const uploadScreen = document.getElementById('upload-screen');
const adminGallery = document.getElementById('admin-gallery');
const destinationSelect = document.getElementById('destination');
const photoOptions = document.getElementById('photo-options');
const videoOptions = document.getElementById('video-options');

// UI Toggle for Destination
destinationSelect.addEventListener('change', (e) => {
    if(e.target.value === 'films') {
        photoOptions.classList.add('hidden');
        videoOptions.classList.remove('hidden');
    } else {
        photoOptions.classList.remove('hidden');
        videoOptions.classList.add('hidden');
    }
});

auth.onAuthStateChanged(user => {
    if (user) {
        loginScreen.classList.add('hidden');
        uploadScreen.classList.remove('hidden');
        loadAdminGallery(); 
    } else {
        loginScreen.classList.remove('hidden');
        uploadScreen.classList.add('hidden');
    }
});

document.getElementById('login-btn').addEventListener('click', () => {
    auth.signInWithEmailAndPassword(document.getElementById('email').value, document.getElementById('password').value)
        .catch(() => {
            const err = document.getElementById('login-error');
            err.innerText = "Invalid credentials. Try again.";
            err.classList.remove('hidden');
        });
});
document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());

// ==========================================
// 4. SMART UPLOAD LOGIC
// ==========================================
var myWidget = cloudinary.createUploadWidget({
    cloudName: myCloudName, 
    uploadPreset: myUploadPreset,
    sources: ['local', 'url'],
    multiple: false,
    clientAllowedFormats: ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'webm'] // Allow videos!
  }, async (error, result) => { 
    if (!error && result && result.event === "success") { 
        const status = document.getElementById('upload-status');
        status.innerText = "Saving to database...";
        status.style.color = "#D4AF37"; 

        const fileUrl = result.info.secure_url;
        const dest = destinationSelect.value;

        try {
            if (dest === 'portfolio') {
                // Save to Photos Database
                await db.collection('photos').add({
                    imageUrl: fileUrl,
                    category: document.getElementById('category').value,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else if (dest === 'films') {
                // Save to Films Database
                let vTitle = document.getElementById('video-title').value;
                if(!vTitle) vTitle = "Untitled Film";
                
                await db.collection('films').add({
                    videoUrl: fileUrl,
                    title: vTitle,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            status.innerText = "Success! Content added to live website.";
            status.style.color = "#22c55e"; 
            document.getElementById('video-title').value = ''; // clear input
            loadAdminGallery(); 

        } catch (dbError) {
            console.error(dbError);
            status.innerText = "Error saving to database.";
            status.style.color = "red";
        } finally {
            setTimeout(() => { status.innerText = ""; }, 5000);
        }
    }
  }
);

document.getElementById("upload_widget").addEventListener("click", () => myWidget.open(), false);

// ==========================================
// 5. MANAGE GALLERY (COMBINED GRID)
// ==========================================
async function loadAdminGallery() {
    if (!adminGallery) return;
    adminGallery.innerHTML = '<p class="text-gray-500 col-span-full">Loading studio content...</p>';

    try {
        let galleryHTML = '';

        // 1. Fetch Photos
        const photoSnap = await db.collection('photos').orderBy('createdAt', 'desc').get();
        photoSnap.forEach(doc => {
            const data = doc.data();
            galleryHTML += createCardHTML(doc.id, data.imageUrl, 'Photo: ' + data.category, 'photos');
        });

        // 2. Fetch Films
        const filmSnap = await db.collection('films').orderBy('createdAt', 'desc').get();
        filmSnap.forEach(doc => {
            const data = doc.data();
            // PRO TIP: Change .mp4 to .jpg so Cloudinary generates a fast video thumbnail!
            let thumbnailUrl = data.videoUrl.replace('.mp4', '.jpg').replace('.mov', '.jpg');
            galleryHTML += createCardHTML(doc.id, thumbnailUrl, 'Film: ' + data.title, 'films', true);
        });

        adminGallery.innerHTML = galleryHTML || '<p class="text-gray-500 col-span-full">No content uploaded yet.</p>';
    } catch (error) {
        console.error("Error loading admin gallery:", error);
        adminGallery.innerHTML = '<p class="text-red-500">Failed to load content.</p>';
    }
}

// Helper to create the UI cards
function createCardHTML(docId, imgUrl, label, collectionName, isVideo = false) {
    const videoIcon = isVideo ? '<i class="fa-solid fa-play absolute top-2 right-2 text-brand-gold bg-black/50 p-2 rounded-full"></i>' : '';
    return `
        <div class="relative group rounded-sm overflow-hidden border border-gray-700 bg-black aspect-square">
            <img src="${imgUrl}" class="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
            ${videoIcon}
            <div class="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center">
                <span class="text-brand-gold text-xs uppercase tracking-widest mb-2 border border-brand-gold/50 px-2 py-1 bg-black/80">${label}</span>
                <button onclick="deleteContent('${docId}', '${collectionName}')" class="bg-red-600/90 text-white font-bold uppercase tracking-widest text-xs px-4 py-2 hover:bg-red-600 transition-colors">
                    Delete
                </button>
            </div>
        </div>
    `;
}

// Global Delete Function
window.deleteContent = async function(docId, collectionName) {
    if (confirm(`Are you sure you want to permanently delete this from the ${collectionName} section?`)) {
        try {
            await db.collection(collectionName).doc(docId).delete();
            loadAdminGallery(); 
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Error deleting content.");
        }
    }
};