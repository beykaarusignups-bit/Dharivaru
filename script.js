import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBM-JvInafEv_LRoVw-ruvV-qL8rxQ1Hho",
  authDomain: "dharivaru-7507b.firebaseapp.com",
  projectId: "dharivaru-7507b",
  storageBucket: "dharivaru-7507b.firebasestorage.app",
  messagingSenderId: "877327082900",
  appId: "1:877327082900:web:f1f0c0cc1e96d40adb1b81"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ----------------------
// POST SYSTEM
// ----------------------

let postType = "Need Help";

const needBtn = document.getElementById("needBtn");
const helpBtn = document.getElementById("helpBtn");
const formTitle = document.getElementById("formTitle");

const form = document.getElementById("postForm");
const postsContainer = document.getElementById("postsContainer");

const description = document.getElementById("description");

// Toggle
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

// Submit Post
form.addEventListener("submit", async (e) => {
    e.preventDefault();

   const post = {
    type: postType,
    name: document.getElementById("name").value,
    subject: document.getElementById("subject").value,
    description: document.getElementById("description").value,
    contact: document.getElementById("contact").value,
    createdAt: Date.now(),

    votes: 0,
    comments: []
};

    try {
        await addDoc(collection(db, "posts"), post);
        form.reset();
        loadPosts();
    } catch (err) {
        console.log("Post error:", err);
        alert("Failed to post");
    }
});

// Load Posts
async function loadPosts() {

    postsContainer.innerHTML = "<p>Loading posts...</p>";

    try {

        const snapshot = await getDocs(collection(db, "posts"));

        let posts = [];

        snapshot.forEach(doc => posts.push(doc.data()));

        posts.sort((a, b) => b.createdAt - a.createdAt);

        postsContainer.innerHTML = "";

        if (posts.length === 0) {
            postsContainer.innerHTML = "<p>No posts yet.</p>";
            return;
        }

        posts.forEach(post => {

            const card = document.createElement("div");

            card.className = "feed-card";

          card.innerHTML = `
    <div class="feed-card">

        <div class="badge ${post.type === "Need Help" ? "need" : "help"}">
            ${post.type}
        </div>

        <div class="title">${post.name}</div>

        <div class="meta">Subject: ${post.subject}</div>

        <div class="text">${post.description}</div>

        <div class="meta">📞 ${post.contact || "No contact"}</div>

        <!-- VOTING -->
        <div class="vote-section">
            <button onclick="upvote('${post.createdAt}')">👍</button>
            <button onclick="downvote('${post.createdAt}')">👎</button>
            <span id="vote-${post.createdAt}">
                👍 ${post.votes || 0}
            </span>
        </div>

        <!-- COMMENTS -->
        <div class="comment-section">

            <input id="c-${post.createdAt}" placeholder="Write comment...">

            <button onclick="addComment('${post.createdAt}')">
                Comment
            </button>

            <div id="comments-${post.createdAt}">
                ${(post.comments || []).map(c => `
                    <div class="comment">💬 ${c}</div>
                `).join("")}
            </div>

        </div>

    </div>
`;

    } catch (err) {
        console.log(err);
        postsContainer.innerHTML = "<p>Failed to load posts.</p>";
    }
}

loadPosts();


// ----------------------
// RESOURCE SYSTEM
// ----------------------

const resourceForm = document.getElementById("resourceForm");
const resourcesContainer = document.getElementById("resourcesContainer");

// Add Resource
resourceForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const resource = {
        title: document.getElementById("resTitle").value,
        subject: document.getElementById("resSubject").value,
        link: document.getElementById("resLink").value,
        description: document.getElementById("resDesc").value,
        createdAt: Date.now()
    };

    try {
        await addDoc(collection(db, "resources"), resource);
        resourceForm.reset();
        loadResources();
    } catch (err) {
        console.log("Resource error:", err);
    }
});

// Load Resources
async function loadResources() {

    try {

        const snapshot = await getDocs(collection(db, "resources"));

        let resources = [];

        snapshot.forEach(doc => resources.push(doc.data()));

        resources.sort((a, b) => b.createdAt - a.createdAt);

        resourcesContainer.innerHTML = "";

        resources.forEach(res => {

            const card = document.createElement("div");

            card.className = "feed-card";

            card.innerHTML = `
                <div class="badge resource">
                    Resource
                </div>

                <div class="title">📘 ${res.title}</div>

                <div class="meta">Subject: ${res.subject}</div>

                <div class="text">${res.description || "No description"}</div>

                <a class="link-btn" href="${res.link}" target="_blank">
                    Open Resource
                </a>
            `;

            resourcesContainer.appendChild(card);

        });

    } catch (err) {
        console.log(err);
        resourcesContainer.innerHTML = "<p>Failed to load resources.</p>";
    }
}

loadResources();

window.upvote = async (id) => {

    const snapshot = await getDocs(collection(db, "posts"));

    snapshot.forEach(async (docItem) => {

        const data = docItem.data();

        if (data.createdAt == id) {

            await addDoc(collection(db, "posts"), {
                ...data,
                votes: (data.votes || 0) + 1,
                createdAt: Date.now()
            });

        }

    });

    loadPosts();
};

window.downvote = async (id) => {

    const snapshot = await getDocs(collection(db, "posts"));

    snapshot.forEach(async (docItem) => {

        const data = docItem.data();

        if (data.createdAt == id) {

            await addDoc(collection(db, "posts"), {
                ...data,
                votes: (data.votes || 0) - 1,
                createdAt: Date.now()
            });

        }

    });

    loadPosts();
};

window.addComment = async (id) => {

    const input = document.getElementById(`c-${id}`);
    const comment = input.value;

    if (!comment) return;

    const snapshot = await getDocs(collection(db, "posts"));

    snapshot.forEach(async (docItem) => {

        const data = docItem.data();

        if (data.createdAt == id) {

            const updatedComments = data.comments || [];
            updatedComments.push(comment);

            await addDoc(collection(db, "posts"), {
                ...data,
                comments: updatedComments,
                createdAt: Date.now()
            });

        }

    });

    input.value = "";
    loadPosts();
};
