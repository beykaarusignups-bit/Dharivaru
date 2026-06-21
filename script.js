import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBM-JvInafEv_LRoVw-ruvV-qL8rxQ1Hho",
  authDomain: "dharivaru-7507b.firebaseapp.com",
  projectId: "dharivaru-7507b",
  storageBucket: "dharivaru-7507b.firebasestorage.app",
  messagingSenderId: "877327082900",
  appId: "1:877327082900:web:f1f0c0cc1e96d40adb1b81"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Default Post Type
let postType = "Need Help";

// Elements
const needBtn = document.getElementById("needBtn");
const helpBtn = document.getElementById("helpBtn");
const formTitle = document.getElementById("formTitle");

const form = document.getElementById("postForm");
const postsContainer = document.getElementById("postsContainer");

const description = document.getElementById("description");

// Toggle Buttons
needBtn.addEventListener("click", () => {

    postType = "Need Help";

    needBtn.classList.add("active");
    helpBtn.classList.remove("active");

    formTitle.textContent = "Tell us what you need 📚";
    description.placeholder = "Describe what you need help with";

});

helpBtn.addEventListener("click", () => {

    postType = "Can Help";

    helpBtn.classList.add("active");
    needBtn.classList.remove("active");

    formTitle.textContent = "Tell us how you can help 🤝";
    description.placeholder = "Describe how you can help";

});

// Submit Form
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const post = {
        type: postType,
        name: document.getElementById("name").value,
        subject: document.getElementById("subject").value,
        description: document.getElementById("description").value,
        contact: document.getElementById("contact").value,
        createdAt: Date.now()
    };

    try {

        await addDoc(collection(db, "posts"), post);

        alert("Post submitted successfully!");

        form.reset();

        loadPosts();

    } catch (error) {

        console.error("Error adding post:", error);

        alert("Failed to submit post.");

    }

});

// Load Posts
async function loadPosts() {

    postsContainer.innerHTML = "<p>Loading posts...</p>";

    try {

        const snapshot = await getDocs(collection(db, "posts"));

        let posts = [];

        snapshot.forEach((doc) => {

            posts.push(doc.data());

        });

        // Sort newest first
        posts.sort((a, b) => b.createdAt - a.createdAt);

        postsContainer.innerHTML = "";

        if (posts.length === 0) {

            postsContainer.innerHTML =
                "<p>No posts yet. Be the first to post!</p>";

            return;

        }

        posts.forEach(post => {

            const card = document.createElement("div");

            card.className =
                post.type === "Need Help"
                ? "post-card need-help"
                : "post-card can-help";

            card.innerHTML = `
                <div class="badge ${
                    post.type === "Need Help"
                    ? "red"
                    : "green"
                }">
                    ${post.type}
                </div>

                <h3>${post.name}</h3>

                <p><strong>Subject:</strong> ${post.subject}</p>

                <p>${post.description}</p>

                <p class="contact">
                    📞 ${post.contact || "No contact provided"}
                </p>
            `;

            postsContainer.appendChild(card);

        });

    } catch (error) {

        console.error("Error loading posts:", error);

        postsContainer.innerHTML =
            "<p>Failed to load posts.</p>";

    }

}

// Initial Load
loadPosts();
