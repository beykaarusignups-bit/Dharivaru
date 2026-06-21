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
// STATE
// ----------------------

let postType = "Need Help";

const needBtn = document.getElementById("needBtn");
const helpBtn = document.getElementById("helpBtn");
const formTitle = document.getElementById("formTitle");

const form = document.getElementById("postForm");
const postsContainer = document.getElementById("postsContainer");

const description = document.getElementById("description");

// ----------------------
// TOGGLE
// ----------------------

needBtn.addEventListener("click", () => {
  postType = "Need Help";
  needBtn.classList.add("active");
  helpBtn.classList.remove("active");
  formTitle.textContent = "Tell us what you need 📚";
  description.placeholder = "Describe your problem...";
});

helpBtn.addEventListener("click", () => {
  postType = "Can Help";
  helpBtn.classList.add("active");
  needBtn.classList.remove("active");
  formTitle.textContent = "Tell us how you can help 🤝";
  description.placeholder = "Describe how you can help...";
});

// ----------------------
// CREATE POST
// ----------------------

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

  await addDoc(collection(db, "posts"), post);

  form.reset();
  loadPosts();
});

// ----------------------
// LOAD POSTS (CLEAN)
// ----------------------

async function loadPosts() {
  postsContainer.innerHTML = "<p>Loading...</p>";

  const snapshot = await getDocs(collection(db, "posts"));

  let posts = [];

  snapshot.forEach((docSnap) => {
    posts.push({ id: docSnap.id, ...docSnap.data() });
  });

  posts.sort((a, b) => b.createdAt - a.createdAt);

  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    const card = document.createElement("div");
    card.className = "feed-card";

    card.innerHTML = `
      <div class="badge ${post.type === "Need Help" ? "need" : "help"}">
        ${post.type}
      </div>

      <div class="title">${post.name}</div>

      <div class="meta">📚 ${post.subject}</div>

      <div class="text">${post.description}</div>

      <div class="meta">📞 ${post.contact || "No contact"}</div>

      <!-- VOTES -->
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
          ${(post.comments || [])
            .map((c) => `<div class="comment">💬 ${c}</div>`)
            .join("")}
        </div>

      </div>
    `;

    postsContainer.appendChild(card);
  });
}

loadPosts();

// ----------------------
// VOTING (REAL FIX)
// ----------------------

window.upvote = async (id) => {
  const ref = doc(db, "posts", id);
  await updateDoc(ref, {
    votes: increment(1)
  });
  loadPosts();
};

window.downvote = async (id) => {
  const ref = doc(db, "posts", id);
  await updateDoc(ref, {
    votes: increment(-1)
  });
  loadPosts();
};

// ----------------------
// COMMENTS (REAL FIX)
// ----------------------

window.addComment = async (id) => {
  const input = document.getElementById(`c-${id}`);
  const text = input.value.trim();

  if (!text) return;

  const snapshot = await getDocs(collection(db, "posts"));

  snapshot.forEach(async (docSnap) => {
    if (docSnap.id === id) {
      const data = docSnap.data();

      const updated = data.comments || [];
      updated.push(text);

      const ref = doc(db, "posts", id);

      await updateDoc(ref, {
        comments: updated
      });
    }
  });

  input.value = "";
  loadPosts();
};
