import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  increment
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

// ----------------------
// LOAD POSTS (FIXED)
// ----------------------

async function loadPosts() {

    postsContainer.innerHTML = "<p>Loading posts...</p>";

    try {

        const snapshot = await getDocs(collection(db, "posts"));

        let posts = [];

        snapshot.forEach(docSnap => {
            posts.push({ id: docSnap.id, ...docSnap.data() });
        });

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
                <div class="badge ${post.type === "Need Help" ? "need" : "help"}">
                    ${post.type}
                </div>

                <div class="title">${post.name}</div>

                <div class="meta">Subject: ${post.subject}</div>

                <div class="text">${post.description}</div>

                <div class="meta">📞 ${post.contact || "No contact"}</div>

                <!-- VOTING -->
                <div class="vote-section">
                    <button onclick="upvote('${post.id}')">👍</button>
                    <button onclick="downvote('${post.id}')">👎</button>
                    <span>Votes: ${post.votes || 0}</span>
                </div>

                <!-- COMMENTS -->
                <div class="comment-section">

                    <input id="c-${post.id}" placeholder="Write comment...">

                    <button onclick="addComment('${post.id}')">Comment</button>

                    <div>
                        ${(post.comments || []).map(c => `
                            <div class="comment">💬 ${c}</div>
                        `).join("")}
                    </div>

                </div>
            `;

            postsContainer.appendChild(card);

        });

    } catch (err) {
        console.log(err);
        postsContainer.innerHTML = "<p>Failed to load posts.</p>";
    }
}

loadPosts();

// ----------------------
// VOTING (PROPER FIX)
// ----------------------

window.upvote = async (id) => {
    try {
        const ref = doc(db, "posts", id);
        await updateDoc(ref, {
            votes: increment(1)
        });
        loadPosts();
    } catch (err) {
        console.log(err);
    }
};

window.downvote = async (id) => {
    try {
        const ref = doc(db, "posts", id);
        await updateDoc(ref, {
            votes: increment(-1)
        });
        loadPosts();
    } catch (err) {
        console.log(err);
    }
};

// ----------------------
// COMMENTS (PROPER FIX)
// ----------------------

window.addComment = async (id) => {

    const input = document.getElementById(`c-${id}`);
    const comment = input.value.trim();

    if (!comment) return;

    try {

        const ref = doc(db, "posts", id);

        const snapshot = await getDocs(collection(db, "posts"));

        snapshot.forEach(async (docSnap) => {

            if (docSnap.id === id) {

                const data = docSnap.data();

                const updatedComments = data.comments || [];
                updatedComments.push(comment);

                await updateDoc(ref, {
                    comments: updatedComments
                });

            }

        });

        input.value = "";
        loadPosts();

    } catch (err) {
        console.log(err);
    }
};

// ----------------------
// RESOURCE SYSTEM (UNCHANGED BUT CLEAN)
// ----------------------

const resourceForm = document.getElementById("resourceForm");
const resourcesContainer = document.getElementById("resourcesContainer");

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
        console.log(err);
    }
});

async function loadResources() {

    try {

        const snapshot = await getDocs(collection(db, "resources"));

        let resources = [];

        snapshot.forEach(docSnap => {
            resources.push(docSnap.data());
        });

        resources.sort((a, b) => b.createdAt - a.createdAt);

        resourcesContainer.innerHTML = "";

        resources.forEach(res => {

            const card = document.createElement("div");
            card.className = "feed-card";

            card.innerHTML = `
                <div class="badge resource">Resource</div>

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
