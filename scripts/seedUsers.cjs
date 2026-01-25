const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, Timestamp } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyDZtRV7ZgsgrhwnjntaNAf0dqBUEmYtQgE",
    authDomain: "preploner.firebaseapp.com",
    projectId: "preploner",
    storageBucket: "preploner.firebasestorage.app",
    messagingSenderId: "104475352938",
    appId: "1:104475352938:web:5e0a7376605bc5a0d08f13",
    measurementId: "G-KFK5JLGWEB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Demo users to seed
const demoUsers = [
    {
        uid: "demo-user-1",
        displayName: "Rahul Sharma",
        email: "rahul@demo.com",
        username: "rahul",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul",
    },
    {
        uid: "demo-user-2",
        displayName: "Priya Patel",
        email: "priya@demo.com",
        username: "priya",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    },
    {
        uid: "demo-user-3",
        displayName: "Amit Kumar",
        email: "amit@demo.com",
        username: "amit",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=amit",
    },
    {
        uid: "demo-user-4",
        displayName: "Sneha Gupta",
        email: "sneha@demo.com",
        username: "sneha",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=sneha",
    },
    {
        uid: "demo-user-5",
        displayName: "Vikram Singh",
        email: "vikram@demo.com",
        username: "vikram",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=vikram",
    },
];

async function seedUsers() {
    console.log("🌱 Seeding demo users to Firestore...\n");

    const now = Timestamp.now();

    for (const user of demoUsers) {
        try {
            await setDoc(doc(db, "users", user.uid), {
                ...user,
                createdAt: now,
                lastSeen: now,
            });
            console.log(`✅ Added: ${user.displayName} (${user.email})`);
        } catch (error) {
            console.error(`❌ Failed to add ${user.displayName}:`, error);
        }
    }

    console.log("\n🎉 Done! Demo users have been added to Firestore.");
    process.exit(0);
}

seedUsers();
