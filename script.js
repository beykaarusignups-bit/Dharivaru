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

/* ==========================================
   FIREBASE CONFIG
========================================== */

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "dharivaru-7507b.firebaseapp.com",
    projectId: "dharivaru-7507b",
    storageBucket: "dharivaru-7507b.firebasestorage.app",
    messagingSenderId: "877327082900",
    appId: "1:877327082900:web:f1f0c0cc1e96d40adb1b81"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ==========================================
   STATE
========================================== */

let postType = "Need Help";

const needBtn = document.getElementById("needBtn");
const helpBtn = document.getElementById("helpBtn");

const formTitle = document.getElementById("formTitle");
const form = document.getElementById("postForm");

const postsContainer = document.getElementById("postsContainer");
const description = document.getElementById("description");

/* ==========================================
   TOGGLE BUTTONS
========================================== */

needBtn.addEventListener("click", () => {

    postType = "Need Help";

    needBtn.classList.add("active");
    helpBtn.classList.remove("active");

    formTitle.textContent = "Tell us what you need 📚";

    description.placeholder =
        "Describe your question, assignment or problem...";
});

helpBtn.addEventListener("click", () => {

    postType = "Can Help";

    helpBtn.classList.add("active");
    needBtn.classList.remove("active");

    formTitle.textContent = "Tell us how you can help 🤝";

    description.placeholder =
        "Describe how you can help other students...";
});

/* ==========================================
   CREATE POST
========================================== */

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const post = {

        type: postType,

        name: document.getElementById("name").value.trim(),

        subject: document.getElementById("subject").value,

        description:
            document.getElementById("description").value.trim(),

        contact:
            document.getElementById("contact").value.trim(),

        createdAt: Date.now(),

        votes: 0,

        comments: []
    };

    try {

        await addDoc(
            collection(db, "posts"),
            post
        );

        form.reset();

        loadPosts();

    } catch (error) {

        console.error(error);

        alert("Failed to create post.");

    }

});

/* ==========================================
   LOAD POSTS
========================================== */

async function loadPosts() {

    postsContainer.innerHTML =
        "<p style='text-align:center'>Loading...</p>";

    try {

        const snapshot =
            await getDocs(collection(db, "posts"));

        let posts = [];

        snapshot.forEach((docSnap) => {

            posts.push({
                id: docSnap.id,
                ...docSnap.data()
            });

        });

        posts.sort(
            (a, b) => b.createdAt - a.createdAt
        );

        postsContainer.innerHTML = "";

        posts.forEach((post) => {

            const card =
                document.createElement("div");

            card.className = "feed-card";

            card.innerHTML = `

                <div class="badge ${
                    post.type === "Need Help"
                        ? "need"
                        : "help"
                }">

                    ${
                        post.type === "Need Help"
                            ? "🆘 Need Help"
                            : "🤝 Can Help"
                    }

                </div>

                <div class="title">

                    ${
                        post.type === "Need Help"
                            ? "Question"
                            : "Available To Help"
                    }

                </div>

                <div class="meta">

                    Posted by
                    <strong>${post.name}</strong>

                    •

                    ${post.subject}

                </div>

                <div class="text">

                    ${post.description}

                </div>

                <div class="meta" style="margin-top:10px">

                    📞 ${
                        post.contact
                            ? post.contact
                            : "No contact provided"
                    }

                </div>

                <!-- VOTES -->

                <div class="vote-section">

                    <button onclick="upvote('${post.id}')">
                        👍
                    </button>

                    <button onclick="downvote('${post.id}')">
                        👎
                    </button>

                    <span>
                        Votes:
                        ${post.votes || 0}
                    </span>

                </div>

                <!-- COMMENTS -->

                <div class="comment-section">

                    <input
                        id="c-${post.id}"
                        placeholder="Write comment..."
                    >

                    <button
                        onclick="addComment('${post.id}')">

                        Comment

                    </button>

                    <div>

                        ${(post.comments || [])
                            .map(
                                c => `
                                <div class="comment">
                                    💬 ${c}
                                </div>
                                `
                            )
                            .join("")}

                    </div>

                </div>

            `;

            postsContainer.appendChild(card);

        });

        if (posts.length === 0) {

            postsContainer.innerHTML = `

                <div class="card">

                    <h3>
                        No posts yet
                    </h3>

                    <p>
                        Be the first student
                        to ask for help.
                    </p>

                </div>

            `;

        }

    } catch (error) {

        console.error(error);

        postsContainer.innerHTML =
            "<p>Failed to load posts.</p>";

    }

}

/* ==========================================
   VOTING
========================================== */

window.upvote = async (id) => {

    try {

        const ref = doc(db, "posts", id);

        await updateDoc(ref, {

            votes: increment(1)

        });

        loadPosts();

    } catch (error) {

        console.error(error);

    }

};

window.downvote = async (id) => {

    try {

        const ref = doc(db, "posts", id);

        await updateDoc(ref, {

            votes: increment(-1)

        });

        loadPosts();

    } catch (error) {

        console.error(error);

    }

};

/* ==========================================
   COMMENTS
========================================== */

window.addComment = async (id) => {

    const input =
        document.getElementById(`c-${id}`);

    const text =
        input.value.trim();

    if (!text) return;

    try {

        const snapshot =
            await getDocs(collection(db, "posts"));

        snapshot.forEach(async (docSnap) => {

            if (docSnap.id === id) {

                const data =
                    docSnap.data();

                const comments =
                    data.comments || [];

                comments.push(text);

                const ref =
                    doc(db, "posts", id);

                await updateDoc(ref, {

                    comments: comments

                });

            }

        });

        input.value = "";

        loadPosts();

    } catch (error) {

        console.error(error);

    }

};

/* ==========================================
   INITIAL LOAD
========================================== */

loadPosts();
